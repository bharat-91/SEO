# Technical SEO Audit Tool — Implementation Documentation

**Version**: Phase 12  
**Last Updated**: 2026-08-12  
**Status**: Backend fully functional and manually verified end-to-end. Frontend screens, states, and accessibility built and reviewed, typechecked and building clean — but not yet browser-tested by a human. Phases 13–14 remaining.

---

## Architecture Overview

The Technical SEO Audit Tool is a full-stack SaaS application comprising:
- **Backend**: Express.js + TypeScript with MongoDB persistence
- **Frontend**: React + TypeScript with Vite bundler
- **Integration**: Async HTTP API with long-polling from frontend

The backend executes audits asynchronously (crawl → analyze → persist), while the frontend handles UI state, polling, and result visualization.

```
React Frontend (Port 5173)
       ↓ HTTP
  Express API (Port 5000)
       ├── Crawler Service
       ├── SEO Analyzer Service
       └── Audit Repository
              ↓
       MongoDB Atlas
```

---

## Project Structure

```
seo-audit-tool/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── index.ts              Environment, validation (Zod)
│   │   ├── models/
│   │   │   └── audit.ts              Mongoose Audit schema
│   │   ├── repositories/
│   │   │   └── auditRepository.ts     DB access layer
│   │   ├── crawler/
│   │   │   ├── index.ts              Main crawler orchestration
│   │   │   ├── fetcher.ts            HTTP fetch wrapper
│   │   │   ├── urlNormalizer.ts      URL canonicalization
│   │   │   ├── navigationDetector.ts Navigation extraction heuristic
│   │   │   └── domainFilter.ts       Same-domain enforcement
│   │   ├── analyzer/
│   │   │   ├── index.ts              Main analyzer orchestration
│   │   │   ├── issues.ts             Issue definitions registry
│   │   │   ├── rules/
│   │   │   │   ├── title.ts
│   │   │   │   ├── metaDescription.ts
│   │   │   │   ├── h1.ts
│   │   │   │   ├── canonical.ts
│   │   │   │   ├── noindex.ts
│   │   │   │   ├── httpStatus.ts
│   │   │   │   └── pageSize.ts
│   │   │   └── pageMetricsCalculator.ts
│   │   ├── services/
│   │   │   └── auditService.ts       Orchestrates crawler + analyzer + repo
│   │   ├── controllers/
│   │   │   └── auditController.ts    HTTP handlers
│   │   ├── routes/
│   │   │   └── index.ts              Route definitions
│   │   ├── middleware/
│   │   │   ├── errorHandler.ts       Centralized error handling
│   │   │   ├── validation.ts         Request validation
│   │   │   └── logging.ts            Request logging
│   │   ├── utils/
│   │   │   ├── logger.ts             Winston or console wrapper
│   │   │   ├── httpClient.ts         Axios wrapper
│   │   │   └── errors.ts             Error classes
│   │   ├── types/
│   │   │   ├── audit.ts              Shared type definitions
│   │   │   ├── page.ts
│   │   │   └── crawler.ts
│   │   ├── app.ts                    Express app setup
│   │   └── server.ts                 Server entry point
│   ├── tests/
│   │   ├── unit/
│   │   │   ├── crawler/
│   │   │   │   ├── urlNormalizer.test.ts
│   │   │   │   ├── navigationDetector.test.ts
│   │   │   │   └── domainFilter.test.ts
│   │   │   ├── analyzer/
│   │   │   │   ├── title.test.ts
│   │   │   │   ├── metaDescription.test.ts
│   │   │   │   ├── h1.test.ts
│   │   │   │   └── ... (rule tests)
│   │   │   └── api/
│   │   │       └── audit.test.ts
│   │   └── fixtures/
│   │       ├── html/                 Static HTML for nav/parsing tests
│   │       └── data/                 Fixtures for analyzer tests
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts                (Vitest config)
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── client.ts             Axios instance + config
│   │   │   └── endpoints.ts          Typed API functions
│   │   ├── components/
│   │   │   ├── MetricCard.tsx        Generic card for metrics
│   │   │   ├── IssueBadge.tsx        Issue severity indicator
│   │   │   ├── Table.tsx             Generic table for pages
│   │   │   ├── LoadingSpinner.tsx
│   │   │   └── ErrorAlert.tsx
│   │   ├── features/audit/
│   │   │   ├── StartAuditForm.tsx    URL input + submit
│   │   │   ├── AuditOverview.tsx     Summary metrics
│   │   │   └── PageBreakdown.tsx     Table + expandable rows
│   │   ├── hooks/
│   │   │   ├── useAudit.ts           Start audit + poll status
│   │   │   └── useAuditPolling.ts    Polling logic
│   │   ├── pages/
│   │   │   ├── StartPage.tsx         Entry point
│   │   │   └── AuditResultsPage.tsx  Results view
│   │   ├── types/
│   │   │   ├── audit.ts              Match backend contract
│   │   │   └── api.ts
│   │   ├── utils/
│   │   │   ├── formatters.ts         URL, numbers, dates
│   │   │   └── validators.ts         URL validation
│   │   ├── constants/
│   │   │   ├── issue.ts              Issue codes + labels
│   │   │   └── ui.ts                 Magic numbers, timeouts
│   │   ├── App.tsx                   Route wrapper
│   │   ├── main.tsx                  Vite entry
│   │   └── App.css
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── index.html
├── README.md
├── IMPLEMENTATION.md                 (this file)
├── .gitignore
└── .env.example
```

---

## Database Design

### Collection: `audits`

**Document Shape:**

```typescript
{
  _id: ObjectId,
  url: string,                              // normalized input URL
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED',
  error?: string,                           // populated if status === 'FAILED'
  
  summary: {
    totalPages: number,
    totalIssues: number,
    missingTitles: number,
    metaDescriptionIssues: number,         // too short + too long
    h1Issues: number,                      // missing + multiple
    canonicalIssues: number,                // missing
    noindexPages: number,
    non200Pages: number,
    pagesOverSizeLimit: number
  },
  
  pages: [
    {
      url: string,
      statusCode: number,                   // HTTP status (null if fetch failed)
      fetchError?: string,                  // timeout, DNS, SSL, etc.
      
      issues: string[],                     // issue codes: ['TITLE_MISSING', 'H1_MULTIPLE']
      
      metrics: {
        titleLength: number,                // char count, 0 if missing
        metaDescriptionLength: number,      // char count, 0 if missing
        h1Count: number,                    // count of h1 tags
        canonical: string | null,           // href value of canonical tag
        noindex: boolean,                   // true if noindex detected
        pageSizeKb: number,                 // response size in KB
        internalLinkCount: number           // count of same-domain <a> hrefs
      }
    }
  ],
  
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `{ status: 1 }` — for quick "in-progress" queries if needed
- `{ createdAt: -1 }` — for listing recent audits in future features

**Rationale for Embedding Pages:**
- Crawl scope is bounded: homepage + primary-nav links only (max ~20–30 pages).
- Well under MongoDB's 16MB document limit (typically 100–200 KB per audit).
- No cross-audit page queries needed per spec API contracts.
- Simpler queries, no `$lookup` joins, atomicity guarantees.
- Trade-off: not suitable for a large-scale crawl tool, but perfect for take-home scope.

---

## API Contracts

### 1. Health Check

**Endpoint:** `GET /health`

**Response (200):**
```json
{
  "status": "ok"
}
```

### 2. Start Audit

**Endpoint:** `POST /audit`

**Request Body:**
```json
{
  "url": "https://example.com"
}
```

**Validation:**
- `url` is required, must be a non-empty string
- Must be a valid HTTP or HTTPS URL (no `file://`, `ftp://`, etc.)
- Hostname cannot be a private/loopback address (`localhost`, `127.*`, `10.*`, `172.16-31.*`, `192.168.*`, `169.254.*`, `::1`)

**Response (202 Accepted):**
```json
{
  "audit_id": "66b8c7a1f2e4d9a0c1234567",
  "status": "RUNNING"
}
```

**Error Responses:**
- **400 Bad Request**: Invalid URL format, empty string, private/loopback hostname
  ```json
  {
    "error": {
      "code": "INVALID_URL",
      "message": "Please provide a valid HTTP or HTTPS URL."
    }
  }
  ```
- **500 Internal Server Error**: Database write failure (rare)

**Behavior:**
1. Validates and normalizes the input URL.
2. Creates a new Audit document with status `PENDING`.
3. Immediately returns 202 with `audit_id` and status `RUNNING`.
4. Asynchronously calls `auditService.run(auditId)` without awaiting (fire-and-forget).
5. Any audit errors are caught, logged, and persisted as status `FAILED` with an error message.

### 3. Fetch Audit

**Endpoint:** `GET /audit/:audit_id`

**URL Parameters:**
- `audit_id`: MongoDB ObjectId (24-hex-char string)

**Response (200):**
```json
{
  "audit_id": "66b8c7a1f2e4d9a0c1234567",
  "url": "https://example.com",
  "status": "COMPLETED",
  "error": null,
  
  "summary": {
    "totalPages": 5,
    "totalIssues": 3,
    "missingTitles": 1,
    "metaDescriptionIssues": 1,
    "h1Issues": 0,
    "canonicalIssues": 1,
    "noindexPages": 0,
    "non200Pages": 0,
    "pagesOverSizeLimit": 0
  },
  
  "pages": [
    {
      "url": "https://example.com/",
      "statusCode": 200,
      "fetchError": null,
      "issues": ["CANONICAL_MISSING"],
      "metrics": {
        "titleLength": 42,
        "metaDescriptionLength": 120,
        "h1Count": 1,
        "canonical": null,
        "noindex": false,
        "pageSizeKb": 245,
        "internalLinkCount": 8
      }
    }
  ],
  
  "createdAt": "2026-08-11T15:30:00Z",
  "updatedAt": "2026-08-11T15:32:15Z"
}
```

**In-Progress Response (200):**
```json
{
  "audit_id": "66b8c7a1f2e4d9a0c1234567",
  "url": "https://example.com",
  "status": "RUNNING",
  "pages": [],
  "summary": null,
  "createdAt": "...",
  "updatedAt": "..."
}
```

**Failed Response (200):**
```json
{
  "audit_id": "66b8c7a1f2e4d9a0c1234567",
  "url": "https://example.com",
  "status": "FAILED",
  "error": "Failed to fetch homepage: Connection timeout",
  "pages": [],
  "summary": null,
  "createdAt": "...",
  "updatedAt": "..."
}
```

**Error Responses:**
- **404 Not Found**: Invalid or non-existent `audit_id`
  ```json
  {
    "error": {
      "code": "AUDIT_NOT_FOUND",
      "message": "Audit not found."
    }
  }
  ```

---

## Crawling Strategy

### Scope Definition
The crawler operates on a **bounded, non-recursive** model:
- **Always crawled**: Homepage URL (derived from input URL)
- **Conditionally crawled**: Internal links extracted from primary navigation on the homepage only
- **Never crawled**: Pages discovered via links on analyzed pages (internal links are counted, not enqueued)
- **Always rejected**: External domains, `#` fragments, `mailto:`, `tel:`, `javascript:` links

### Crawl Algorithm

1. **Validate & Normalize Input URL**
   - Parse as WHATWG `URL`
   - Reject non-`http://` / `https://` protocols
   - Reject private/loopback hostnames (see below)
   - Resolve to absolute URL (e.g., `example.com` → `https://example.com/`)

2. **Fetch Homepage**
   - HTTP GET with axios
   - Timeout: `CRAWLER_TIMEOUT_MS` (default 10000 ms)
   - Max response size: `CRAWLER_MAX_RESPONSE_BYTES` (default 5 MB)
   - Follow redirects: up to 5 hops
   - On failure: create page result with `fetchError`, do NOT abort audit
   - Record HTTP status code regardless of 2xx/3xx/4xx/5xx

3. **Detect Navigation**
   - Parse homepage HTML with Cheerio
   - Run `navigationDetector.detectNavigation(html)` (see below)
   - Extract candidate `<a href>` values from detected nav element
   - Drop invalid/relative links, fragment-only links, `mailto:`, `tel:`, `javascript:`

4. **Normalize & Deduplicate URLs**
   - Call `urlNormalizer.normalize(href, baseUrl)` on each candidate
   - Deduplicate via Set of normalized strings
   - Filter to same registrable domain (use `tldjs` or similar)
   - Cap at `CRAWLER_MAX_NAV_LINKS` (default 20 links)
   - Result: `urlsToFetch[]`

5. **Concurrent Crawl**
   - Build crawl queue: `[homepage, ...urlsToFetch]`
   - Use `p-limit(CRAWLER_CONCURRENCY)` (default 5) to control parallelism
   - For each URL:
     - Fetch with same timeout/size limits as step 2
     - Parse as HTML on success
     - Produce `PageResult` object (url, statusCode, metrics, fetchError)
   - Never throw on individual page failure; accumulate results
   - If homepage fetch fails, log as FAILED, do NOT analyze remaining pages

6. **Analyze Each Page**
   - Call `analyzer.analyzePage(html, pageUrl, statusCode)` on successful fetches
   - Returns: `{ issues: string[], metrics: {...} }`
   - For failed fetches, record `fetchError`, zero metrics
   - Count internal links on every page (needed for metrics)

7. **Aggregate Summary**
   - Loop through all `PageResult[]`
   - Count distinct issue codes across all pages
   - Tally specific issues (missing titles, h1 issues, etc.)
   - Calculate `summary` object

8. **Persist & Complete**
   - Update audit document: set `status = 'COMPLETED'`, `pages`, `summary`, `updatedAt`
   - Log audit completion with page count, issue count

### Private/Loopback Hostname Rejection

Check the parsed URL's hostname against:
- `localhost`
- `127.*` (IPv4 loopback)
- `10.*`, `172.16.*` to `172.31.*`, `192.168.*` (RFC 1918 private)
- `169.254.*` (link-local)
- `::1` (IPv6 loopback)
- `fc00::` / `fe80::` (IPv6 private / link-local)

**Security Note:** This is a best-effort SSRF guard. A sophisticated attacker could still bypass via DNS rebinding. For production, add a DNS validation step (resolve → check IP) if needed. For take-home scope, hostname-string checks are sufficient.

### Configuration

**Environment Variables:**
```env
CRAWLER_TIMEOUT_MS=10000          # Request timeout
CRAWLER_MAX_RESPONSE_BYTES=5242880  # 5 MB
CRAWLER_CONCURRENCY=5              # Max parallel requests
CRAWLER_MAX_NAV_LINKS=20           # Cap on discovered nav links
```

---

## Navigation Detection

The crawler must identify the website's primary navigation menu to extract links for further analysis. This is heuristic-based, not ML-powered.

### Algorithm

1. **Collect all `<nav>` elements** from the homepage HTML.

2. **If exactly one `<nav>` found:**
   - Use it as the primary navigation container.

3. **If multiple `<nav>` elements found:**
   - Score each element:
     - `+10` if it's the only `<nav>` directly inside `<header>`
     - `+5` if `aria-label` or `role="navigation"` contains "nav" (case-insensitive)
     - `+3` if link count is in the "good" range (2–25 links)
     - `-5` if it's a footer nav (is inside `<footer>`)
   - Pick the highest-scoring `<nav>`. Ties → first in document order.

4. **If zero `<nav>` elements found, fall back:**
   - Look for elements inside `<header>` with `class` or `id` matching `/nav|menu/i` (case-insensitive regex).
   - If still nothing: look for any element with `[role="navigation"]` in the document.
   - If still nothing: **no navigation detected** — audit only the homepage, log this as a warning, continue.

5. **Extract links from the chosen container:**
   - Collect all `<a>` elements where `href` attribute exists and is non-empty
   - Drop links with:
     - `href` starting with `#` only (fragments)
     - `href` starting with `mailto:` or `tel:` or `javascript:`
   - Collect remaining `href` values as strings
   - Result: `candidateUrls[]`

### Example: Multi-Nav Scoring

```
<header>
  <nav>                          <!-- Score: 10 (only nav in header) -->
    <a href="/about">...</a>
    ...
  </nav>
</header>

<main>
  <nav>                          <!-- Score: 0 -->
    ...
  </nav>
</main>

<footer>
  <nav>                          <!-- Score: -5 (footer nav) -->
    ...
  </nav>
</footer>
```
→ Use the `<header>` nav (score 10).

### Assumptions & Documentation

- **Semantic HTML**: Assumes proper use of `<nav>`, `<header>`, `<footer>` tags.
- **English-centric class/id naming**: Looks for `nav`/`menu` keywords in class names; non-Latin languages may not match.
- **No JavaScript**: Cheerio parses static HTML only; client-side navigation (React router, SPA menus rendered by JS) won't be detected.
- **Single primary nav**: The heuristic picks one primary menu; secondary/footer navs are skipped.

These assumptions are documented in `README.md` and `IMPLEMENTATION.md` (this file).

---

## URL Normalization

URLs must be canonicalized consistently to avoid duplicate crawls and to match same-domain filtering.

### Rules

1. **Parse the URL** using WHATWG `URL` constructor.
   - If parsing fails, the URL is invalid and skipped.

2. **Normalize protocol and hostname:**
   - Convert protocol to lowercase (`HTTP` → `http`, `HTTPS` → `https`)
   - Convert hostname to lowercase (`Example.COM` → `example.com`)

3. **Remove default ports:**
   - If port is 80 and protocol is `http`, omit the port.
   - If port is 443 and protocol is `https`, omit the port.

4. **Normalize path:**
   - Strip the trailing `/` from the path if it's not the root path.
   - Examples:
     - `/page/` → `/page`
     - `/` → `/` (unchanged)

5. **Strip hash fragment:**
   - Drop `#...` entirely.
   - Examples:
     - `/page#section` → `/page`
     - `/page#top` → `/page`

6. **Keep query string as-is:**
   - Do NOT strip or reorder query parameters.
   - `?a=1&b=2` and `?b=2&a=1` are treated as different (not normalized).
   - Rationale: nav links rarely use query strings; if they do, they're likely meaningful (locale, filter state, etc.).

7. **Resolve relative URLs:**
   - When extracting a link from an HTML page, resolve it against the page's base URL.
   - Example: on `https://example.com/products/page1`, a `<a href="../about">` resolves to `https://example.com/about`.

### Examples

```
https://example.com
https://example.com/
https://example.com:443

 → all normalize to: https://example.com

https://example.com/page/
https://example.com/page

 → both normalize to: https://example.com/page

https://example.com/page#section
https://example.com/page

 → both normalize to: https://example.com/page (fragment stripped)

https://example.com/page?id=1
https://example.com/page

 → different (query kept)
```

### Implementation

**File:** `backend/src/crawler/urlNormalizer.ts`

```typescript
export function normalize(urlString: string, baseUrl?: string): string {
  // Handle relative URLs if baseUrl provided
  const absolute = baseUrl ? new URL(urlString, baseUrl).href : urlString;
  
  const url = new URL(absolute);
  
  // Lowercase protocol, hostname
  url.protocol = url.protocol.toLowerCase();
  url.hostname = url.hostname.toLowerCase();
  
  // Remove default ports
  if ((url.protocol === 'http:' && url.port === '80') ||
      (url.protocol === 'https:' && url.port === '443')) {
    url.port = '';
  }
  
  // Strip hash
  url.hash = '';
  
  // Strip trailing slash (except root)
  if (url.pathname !== '/' && url.pathname.endsWith('/')) {
    url.pathname = url.pathname.slice(0, -1);
  }
  
  return url.toString();
}

export function areSameNormalizedUrl(urlA: string, urlB: string): boolean {
  try {
    return normalize(urlA) === normalize(urlB);
  } catch {
    return false;
  }
}
```

---

## SEO Analysis Rules

Every crawled page is analyzed for SEO issues. Each rule produces zero or more issue codes + raw metrics.

### Issue Registry

**File:** `backend/src/analyzer/issues.ts`

```typescript
export const ISSUE_DEFINITIONS = {
  // Title issues
  TITLE_MISSING: {
    code: 'TITLE_MISSING',
    message: 'Page is missing a title tag.',
    category: 'title',
    severity: 'critical'
  },
  TITLE_TOO_SHORT: {
    code: 'TITLE_TOO_SHORT',
    message: 'Title is shorter than 30 characters.',
    category: 'title',
    severity: 'warning'
  },
  TITLE_TOO_LONG: {
    code: 'TITLE_TOO_LONG',
    message: 'Title is longer than 65 characters.',
    category: 'title',
    severity: 'warning'
  },

  // Meta description issues
  META_DESCRIPTION_MISSING: {
    code: 'META_DESCRIPTION_MISSING',
    message: 'Page is missing a meta description tag.',
    category: 'meta_description',
    severity: 'warning'
  },
  META_DESCRIPTION_TOO_SHORT: {
    code: 'META_DESCRIPTION_TOO_SHORT',
    message: 'Meta description is shorter than 70 characters.',
    category: 'meta_description',
    severity: 'warning'
  },
  META_DESCRIPTION_TOO_LONG: {
    code: 'META_DESCRIPTION_TOO_LONG',
    message: 'Meta description is longer than 160 characters.',
    category: 'meta_description',
    severity: 'warning'
  },

  // H1 issues
  H1_MISSING: {
    code: 'H1_MISSING',
    message: 'Page has no H1 tag.',
    category: 'h1',
    severity: 'critical'
  },
  H1_MULTIPLE: {
    code: 'H1_MULTIPLE',
    message: 'Page has multiple H1 tags.',
    category: 'h1',
    severity: 'critical'
  },

  // Canonical issues
  CANONICAL_MISSING: {
    code: 'CANONICAL_MISSING',
    message: 'Page is missing a canonical tag.',
    category: 'canonical',
    severity: 'warning'
  },

  // Noindex
  NOINDEX: {
    code: 'NOINDEX',
    message: 'Page has noindex robots directive.',
    category: 'robots',
    severity: 'critical'
  },

  // HTTP status
  NON_200: {
    code: 'NON_200',
    message: 'Page returned a non-2xx HTTP status code.',
    category: 'http_status',
    severity: 'critical'
  },

  // Page size
  PAGE_SIZE_TOO_LARGE: {
    code: 'PAGE_SIZE_TOO_LARGE',
    message: 'Page is larger than 2 MB.',
    category: 'page_size',
    severity: 'warning'
  }
};
```

### Analysis Rules

**File:** `backend/src/analyzer/rules/` (one file per rule)

Each rule function takes parsed HTML + other page data, returns `{ issues: string[], metrics: {...} }`.

#### Title Rule

```typescript
export function checkTitle(dom: CheerioAPI): { issues: string[], metric: number } {
  const title = dom('title').text().trim();
  const length = title.length;
  const issues: string[] = [];

  if (length === 0) {
    issues.push('TITLE_MISSING');
  } else if (length < 30) {
    issues.push('TITLE_TOO_SHORT');
  } else if (length > 65) {
    issues.push('TITLE_TOO_LONG');
  }

  return { issues, metric: length };
}
```

#### Meta Description Rule

```typescript
export function checkMetaDescription(dom: CheerioAPI): { issues: string[], metric: number } {
  const desc = dom('meta[name="description"]').attr('content') || '';
  const length = desc.length;
  const issues: string[] = [];

  if (length === 0) {
    issues.push('META_DESCRIPTION_MISSING');
  } else if (length < 70) {
    issues.push('META_DESCRIPTION_TOO_SHORT');
  } else if (length > 160) {
    issues.push('META_DESCRIPTION_TOO_LONG');
  }

  return { issues, metric: length };
}
```

#### H1 Rule

```typescript
export function checkH1(dom: CheerioAPI): { issues: string[], metric: number } {
  const h1Count = dom('h1').length;
  const issues: string[] = [];

  if (h1Count === 0) {
    issues.push('H1_MISSING');
  } else if (h1Count > 1) {
    issues.push('H1_MULTIPLE');
  }

  return { issues, metric: h1Count };
}
```

#### Canonical Rule

```typescript
export function checkCanonical(dom: CheerioAPI): { issues: string[], metric: string | null } {
  const canonical = dom('link[rel="canonical"]').attr('href') || null;
  const issues: string[] = [];

  if (!canonical) {
    issues.push('CANONICAL_MISSING');
  }

  return { issues, metric: canonical };
}
```

#### Noindex Rule

```typescript
export function checkNoindex(dom: CheerioAPI): { issues: string[], metric: boolean } {
  const robotsMeta = dom('meta[name="robots"]').attr('content') || '';
  const xRobotsTag = dom('meta[name="x-robots-tag"]').attr('content') || '';
  const combined = (robotsMeta + ' ' + xRobotsTag).toLowerCase();
  const isNoindex = combined.includes('noindex');
  const issues: string[] = [];

  if (isNoindex) {
    issues.push('NOINDEX');
  }

  return { issues, metric: isNoindex };
}
```

#### HTTP Status Rule

```typescript
export function checkHttpStatus(statusCode: number): { issues: string[], metric: number } {
  const issues: string[] = [];

  if (statusCode < 200 || statusCode >= 300) {
    issues.push('NON_200');
  }

  return { issues, metric: statusCode };
}
```

#### Page Size Rule

```typescript
export function checkPageSize(sizeBytes: number): { issues: string[], metric: number } {
  const sizeKb = Math.ceil(sizeBytes / 1024);
  const issues: string[] = [];

  if (sizeKb > 2048) {  // 2 MB
    issues.push('PAGE_SIZE_TOO_LARGE');
  }

  return { issues, metric: sizeKb };
}
```

#### Internal Links Rule

```typescript
export function countInternalLinks(dom: CheerioAPI, pageUrl: string, domainFilter: DomainFilter): { issues: string[], metric: number } {
  let count = 0;
  dom('a').each((_, el) => {
    const href = dom(el).attr('href');
    if (href && domainFilter.isSameDomain(href, pageUrl)) {
      count++;
    }
  });
  return { issues: [], metric: count };
}
```

### Analyzer Orchestration

**File:** `backend/src/analyzer/index.ts`

```typescript
export async function analyzePage(
  html: string,
  pageUrl: string,
  statusCode: number,
  responseSize: number
): Promise<{ issues: string[], metrics: PageMetrics }> {
  const dom = cheerio.load(html);
  const issues = new Set<string>();
  
  const titleResult = checkTitle(dom);
  issues.add(...titleResult.issues);
  
  const descResult = checkMetaDescription(dom);
  issues.add(...descResult.issues);
  
  const h1Result = checkH1(dom);
  issues.add(...h1Result.issues);
  
  const canonicalResult = checkCanonical(dom);
  issues.add(...canonicalResult.issues);
  
  const noindexResult = checkNoindex(dom);
  issues.add(...noindexResult.issues);
  
  const statusResult = checkHttpStatus(statusCode);
  issues.add(...statusResult.issues);
  
  const sizeResult = checkPageSize(responseSize);
  issues.add(...sizeResult.issues);
  
  const linksResult = countInternalLinks(dom, pageUrl, domainFilter);
  
  return {
    issues: Array.from(issues),
    metrics: {
      titleLength: titleResult.metric,
      metaDescriptionLength: descResult.metric,
      h1Count: h1Result.metric,
      canonical: canonicalResult.metric,
      noindex: noindexResult.metric,
      pageSizeKb: sizeResult.metric,
      internalLinkCount: linksResult.metric
    }
  };
}
```

---

## Async Audit Execution

The audit must complete asynchronously without blocking the `POST /audit` response.

### Lifecycle

1. **Request arrives:** `POST /audit { url: "..." }`
2. **Validate URL:** Reject if invalid (400 response, audit never created).
3. **Create audit doc:** Insert into MongoDB with `status = PENDING`.
4. **Return 202:** Immediately send response with `audit_id` and `status = RUNNING`.
5. **Fire-and-forget:** Call `auditService.run(auditId)` with no `await`.
6. **Service executes:** In the background (same process), the service:
   - Fetches the audit doc from DB
   - Sets status to `RUNNING`, persists
   - Executes crawl + analyze pipeline
   - Catches any errors (wrapped in try/catch)
   - Sets status to `COMPLETED` or `FAILED`
   - Persists final results

### Error Handling in Async Context

Any error during `auditService.run()` is:
1. Caught by the outer try/catch
2. Logged (with full stack trace)
3. Persisted as `status = FAILED` with a user-friendly `error` message
4. **Never** thrown back to the HTTP handler (request already responded with 202)

Example:
```typescript
void (async () => {
  try {
    await auditService.run(auditId);
  } catch (error) {
    logger.error('Audit run failed', { auditId, error });
    // Error already persisted as FAILED by the service
  }
})();
```

### Polling from Frontend

The frontend polls `GET /audit/:id` at intervals (e.g., every 1 second) until:
- `status === 'COMPLETED'` → render results
- `status === 'FAILED'` → render error message
- User unmounts component → stop polling

### Limitations (Documented)

- **In-process only:** If the server restarts, any in-flight audit is abandoned (stuck at RUNNING).
  - Acceptable for take-home; production would use a persistent job queue (BullMQ, RabbitMQ, etc.).
- **Single-threaded crawl:** Not parallelized across multiple servers.
  - Acceptable for take-home scope.
- **No progress tracking:** Frontend cannot see how many pages have been crawled yet.
  - Could be added later by storing `pages` as they're added, not just at the end.

---

## Security Considerations

### Input Validation

- **URL validation:** Only `http://` and `https://` protocols allowed.
- **Hostname filtering:** Reject private/loopback addresses (basic SSRF guard).
- **Request body:** Zod schema validation on all POST bodies.
- **URL parameters:** ObjectId validation for `audit_id`.

### Error Handling

- **No stack traces in API responses:** Development mode may log verbosely; production responses never expose internals.
- **Generic error messages:** User-facing errors don't leak system details.
- **Logging:** Errors are logged server-side for debugging; never returned verbatim to the client.

### External Requests

- **Timeout enforcement:** Every HTTP request times out after `CRAWLER_TIMEOUT_MS` to prevent hanging.
- **Max response size:** Limit to `CRAWLER_MAX_RESPONSE_BYTES` to prevent memory exhaustion.
- **Redirect limits:** Follow up to 5 redirects, then stop.
- **Same-domain filtering:** Only crawl links on the submitted domain (not external sites).

### Database

- **MongoDB Atlas:** Cloud-hosted, TLS encryption, IP whitelist in use.
- **No SQL injection:** Mongoose prevents direct query injection; all inputs are parameterized.
- **Connection string:** Stored in environment variables, never committed.

### Frontend

- **No sensitive data:** Frontend never handles auth tokens or secrets (not in scope for this tool).
- **CORS:** Backend configured to allow frontend origin only (set in `config`).
- **No third-party trackers:** Logging and analytics not in scope.

---

## Performance Considerations

### Crawling

- **Concurrency limit:** `CRAWLER_CONCURRENCY` (default 5) prevents overwhelming target server and local resources.
- **Request timeout:** `CRAWLER_TIMEOUT_MS` (default 10 seconds) prevents hangs.
- **Max response size:** `CRAWLER_MAX_RESPONSE_BYTES` (default 5 MB) prevents memory exhaustion on large files.
- **Max nav links:** `CRAWLER_MAX_NAV_LINKS` (default 20) bounds the crawl scope.

### Database

- **Indexes:** Queries on `status` and `createdAt` indexed for fast filtering.
- **Embedded pages:** No joins/lookups; single document read returns complete audit.

### Frontend

- **Polling interval:** Default 1 second; can be increased if latency is acceptable.
- **Component memoization:** Use React.memo on expensive components (not over-optimized for take-home scope).

### Not Optimized (Acceptable)

- **Compression:** gzip not explicitly enabled (Express can add if needed).
- **Caching:** HTTP caching headers not set (audits are rarely requested twice).
- **CDN:** No CDN for static assets (not in scope).

---

## Testing Strategy

### Unit Tests (Vitest)

**Coverage priorities:** Business logic, not UI or HTTP specifics.

#### 1. URL Normalization

Test cases:
- Trailing slash removal
- Hash fragment removal
- Default port removal
- Lowercase hostname
- Query string preservation
- Relative URL resolution
- Invalid URL handling (throw or skip)

File: `backend/tests/unit/crawler/urlNormalizer.test.ts`

#### 2. Navigation Detection

Test cases:
- Single `<nav>` present
- Multiple `<nav>` (scoring)
- Zero `<nav>` (fallback to header)
- No navigation at all
- Nav with mixed link types (href, mailto, #, javascript:)

Fixtures: Static HTML files in `backend/tests/fixtures/html/`

File: `backend/tests/unit/crawler/navigationDetector.test.ts`

#### 3. Domain Filtering

Test cases:
- Same-domain links (relative, absolute, subdomains)
- External domains (filtered out)
- Port variations (same domain, different ports)
- Registrable domain handling (TLD correctly parsed)

File: `backend/tests/unit/crawler/domainFilter.test.ts`

#### 4. SEO Rules

For each rule (title, meta description, h1, canonical, noindex, status, size):

Test cases:
- Missing/empty
- Valid/optimal
- Too short
- Too long
- Edge cases (whitespace, special chars)

Example: `backend/tests/unit/analyzer/title.test.ts`

```typescript
import { checkTitle } from '../../../src/analyzer/rules/title';
import * as cheerio from 'cheerio';

describe('Title Rule', () => {
  it('detects missing title', () => {
    const html = '<html><head></head><body></body></html>';
    const dom = cheerio.load(html);
    const result = checkTitle(dom);
    expect(result.issues).toContain('TITLE_MISSING');
  });

  it('detects title too short', () => {
    const html = '<html><head><title>Hi</title></head></html>';
    const dom = cheerio.load(html);
    const result = checkTitle(dom);
    expect(result.issues).toContain('TITLE_TOO_SHORT');
  });

  it('allows valid title (30-65 chars)', () => {
    const html = '<html><head><title>This is a valid title for SEO</title></head></html>';
    const dom = cheerio.load(html);
    const result = checkTitle(dom);
    expect(result.issues).toHaveLength(0);
  });

  it('detects title too long', () => {
    const html = `<html><head><title>${'A'.repeat(70)}</title></head></html>`;
    const dom = cheerio.load(html);
    const result = checkTitle(dom);
    expect(result.issues).toContain('TITLE_TOO_LONG');
  });
});
```

#### 5. API Validation

Test cases:
- Valid URL → 202 + audit_id
- Invalid URL → 400 + error code
- Missing URL → 400
- Non-http protocol → 400
- Private hostname → 400

File: `backend/tests/unit/api/audit.test.ts` (using supertest)

```typescript
import request from 'supertest';
import app from '../../../src/app';

describe('POST /audit', () => {
  it('returns 202 for valid URL', async () => {
    const res = await request(app)
      .post('/audit')
      .send({ url: 'https://example.com' });
    
    expect(res.status).toBe(202);
    expect(res.body).toHaveProperty('audit_id');
    expect(res.body.status).toBe('RUNNING');
  });

  it('returns 400 for invalid URL', async () => {
    const res = await request(app)
      .post('/audit')
      .send({ url: 'not-a-url' });
    
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_URL');
  });

  it('returns 400 for file:// protocol', async () => {
    const res = await request(app)
      .post('/audit')
      .send({ url: 'file:///etc/passwd' });
    
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_URL');
  });

  it('returns 400 for localhost', async () => {
    const res = await request(app)
      .post('/audit')
      .send({ url: 'http://localhost:8000' });
    
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_URL');
  });
});
```

### Integration Tests (Minimal, if time permits)

- Mock MongoDB with in-memory Mongo (or skip for take-home)
- Test full `POST /audit` → `GET /audit/:id` flow with mocked crawler
- Verify audit persistence and status transitions

### Test Execution

```bash
npm test                  # Run all tests
npm test -- --coverage   # Generate coverage report
npm test -- --watch      # Watch mode during development
```

---

## Assumptions

1. **Semantic HTML:** Websites use proper semantic tags (`<nav>`, `<header>`, `<h1>`, `<title>`, etc.).
2. **English-centric:** Navigation detection uses English keywords (`nav`, `menu`); non-Latin sites may not be detected correctly.
3. **Static HTML:** Only pre-rendered HTML is analyzed; client-side SPA navigation is not detected.
4. **Single primary nav:** The heuristic selects one primary navigation element; secondary menus (social, footer, etc.) are ignored.
5. **No authentication:** Crawled websites do not require login. Public sites only.
6. **Reasonable page sizes:** Pages are typically < 5 MB; very large sites (video-heavy, etc.) may be skipped.
7. **DNS resolves:** The input hostname resolves to a public IP; no DNS-rebinding attacks are mitigated.
8. **Request/response times:** Typical pages respond within 10 seconds; slow sites may timeout.

---

## Trade-offs

| Decision | Chosen | Alternative | Rationale |
|----------|--------|-------------|-----------|
| Crawl depth | Nav links only | Recursive crawl all links | Bounded scope, predictable crawl time, simpler to reason about |
| Page storage | Embedded in Audit | Separate collection | Small crawl size (< 30 pages), simpler queries, atomic updates |
| Async execution | In-process | Job queue (BullMQ) | Take-home scope, minimal complexity, acceptable restart limitation |
| Navigation detection | Heuristic | ML classifier | No external dependencies, predictable behavior, fast |
| Styling | Plain CSS | Tailwind/UI lib | Keep scope focused, fewer dependencies, faster build |
| Frontend state | React hooks | Redux/Zustand | App is small, context/hooks sufficient, avoid over-engineering |
| URL normalization | WHATWG URL API | Regex parsing | Standards-based, handles edge cases, fewer bugs |

---

## Known Limitations

1. **Server restart loses in-flight audits:** Audits are not persisted as they progress; a restart leaves them stuck at RUNNING.
   - Mitigation: Add audit timeout + auto-fail after X minutes (future improvement).

2. **No progress updates:** Frontend polls but sees only the final result, not intermediate progress (e.g., "page 2 of 10 analyzed").
   - Mitigation: Store pages as they're added, not just at the end (future improvement).

3. **Client-side nav not detected:** SPA navigation rendered by JavaScript is invisible to the crawler.
   - Mitigation: Use headless browser (Playwright/Puppeteer) instead of Cheerio (scope expansion).

4. **English-only nav keywords:** Non-English sites may not have navigation detected if class names use different languages.
   - Mitigation: Allow custom nav selectors in audit request (future feature).

5. **No recursive crawl:** Only navbar links are analyzed; pages discovered via those pages are not crawled.
   - This is intentional (per spec section 14); not a bug.

6. **Basic SSRF guard:** Hostname checks only; DNS rebinding still possible.
   - Acceptable for take-home; production should add DNS validation.

7. **No link extraction from footer/footer-like sections:** Only primary nav is used.
   - Intentional per spec; some websites hide content in footer only.

---

## Future Improvements

1. **Audit progress tracking:** Store crawl progress in the audit doc so frontend can show "Analyzing page 5 of 12".
2. **Audit timeout + auto-fail:** If audit doesn't complete within X minutes, mark as failed.
3. **Headless browser crawling:** Use Playwright to render SPA sites and detect client-side navigation.
4. **Custom nav selectors:** Allow users to specify custom CSS selectors for nav detection.
5. **Recursive crawl option:** Add a flag to recursively crawl all internal links (with depth limits).
6. **Report generation:** Export audit results as PDF/CSV.
7. **Scheduled audits:** Allow users to schedule recurring audits (e.g., weekly) and track trends.
8. **API authentication:** Restrict `/audit` endpoint to authenticated users (API keys or OAuth).
9. **Parallel processing:** Distribute crawl across multiple servers/workers.
10. **Caching:** Cache previous audit results to speed up subsequent checks.
