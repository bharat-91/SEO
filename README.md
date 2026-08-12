# Zensor — Technical SEO Audit Tool

A full-stack tool that crawls a website's homepage and primary navigation, runs a
set of technical SEO checks against each page, and presents the results as a
readable audit report — no raw JSON required.

---

## Project Overview

Enter a URL, click **Run Audit**, and the backend:

1. Fetches the homepage
2. Detects the primary navigation menu
3. Crawls the internal pages linked from it
4. Analyzes every page for technical SEO issues (titles, meta descriptions, H1s,
   canonicals, noindex directives, HTTP status, page size)
5. Persists the results to MongoDB
6. Serves them to the frontend, which polls until the audit completes

The crawl is intentionally bounded: homepage + primary-nav links only. It does not
recursively crawl every link it finds — see [Crawling Strategy](#crawling-strategy)
for why.

## Features

- Start an audit from a single URL input, with client-side validation before any
  request is sent
- Async audit execution — the API responds immediately with an `audit_id`; the
  crawl runs in the background
- Live progress via polling, with automatic stop on completion or failure
- Audit overview: total pages, total issues, and a breakdown by issue category
- Page-level table with expandable rows showing full metrics and human-readable
  issue labels with severity indicators (🔴 critical / 🟠 warning / 🟢 healthy)
- Explicit "no issues detected" state — a clean audit doesn't look like an empty
  screen
- SSRF-conscious: rejects `file://`/non-HTTP protocols and private/loopback
  hostnames before ever making a request

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Backend | **Express.js** | Minimal, unopinionated — the crawler/analyzer is the interesting part of this project, not the web framework. NestJS was explicitly out of scope. |
| Backend | **TypeScript, strict mode** | Crawling untrusted HTML and juggling async page-fetch results is exactly where `any` silently hides bugs. |
| Database | **MongoDB + Mongoose** | Audit results are a natural document — one audit, one array of pages, read as a single unit. Mongoose gives that document a real schema instead of storing an unstructured blob. |
| Frontend | **React + TypeScript + Vite** | Fast dev loop, no framework opinions about routing/data-fetching that this small app doesn't need. Next.js (server rendering, file-based routing) was explicitly out of scope. |
| HTTP client | **Axios** | Timeout, max-response-size, and redirect-limit config all sit on one client instance, in both the crawler and the frontend API layer. |
| HTML parsing | **Cheerio** | Server-side jQuery-style DOM querying — no browser/JS execution needed since this audits static HTML, not rendered SPAs. |
| Validation | **Zod** | Schema validation for API requests and environment config, with the same library on both sides. |
| Concurrency | **p-limit** | Caps how many pages the crawler fetches in parallel per audit. |

## Architecture

```text
React (Vite)
  |
  | HTTP (axios)
  ↓
Express API  ──  POST /audit, GET /audit/:id
  |
  ↓
AuditService (fire-and-forget orchestration)
  |
  ├── Crawler        homepage → detect nav → fetch nav links (bounded, non-recursive)
  ├── SEO Analyzer    per-page rule checks → issues + metrics
  └── AuditRepository
          |
          ↓
       MongoDB (single `audits` collection, pages embedded)
```

Full rationale for every box above — including why pages are embedded rather than
a separate collection — lives in [`IMPLEMENTATION.md`](./IMPLEMENTATION.md).

## API Documentation

### `POST /audit`

Starts an audit. Returns immediately; the crawl runs asynchronously.

```http
POST /audit
Content-Type: application/json

{ "url": "https://example.com" }
```

**202 Accepted**
```json
{ "audit_id": "66b8c7a1f2e4d9a0c1234567", "status": "RUNNING" }
```

**400 Bad Request** — invalid URL, non-http(s) protocol, or a private/loopback
hostname:
```json
{ "error": { "code": "VALIDATION_ERROR", "message": "Request body validation failed" } }
```

### `GET /audit/:audit_id`

```http
GET /audit/66b8c7a1f2e4d9a0c1234567
```

**200 OK** (shape is identical whether `PENDING`, `RUNNING`, `COMPLETED`, or
`FAILED` — `summary`/`pages` are empty until completion, `error` is set only on
failure):

```json
{
  "audit_id": "66b8c7a1f2e4d9a0c1234567",
  "url": "https://example.com",
  "status": "COMPLETED",
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
      "url": "https://example.com/pricing",
      "statusCode": 200,
      "issues": ["TITLE_MISSING"],
      "metrics": {
        "titleLength": 0,
        "metaDescriptionLength": 120,
        "h1Count": 1,
        "canonical": "https://example.com/pricing",
        "noindex": false,
        "pageSizeKb": 84,
        "internalLinkCount": 12
      }
    }
  ],
  "createdAt": "2026-08-11T18:17:37.451Z",
  "updatedAt": "2026-08-11T18:17:38.662Z"
}
```

**404 Not Found** — `audit_id` doesn't exist (including malformed IDs):
```json
{ "error": { "code": "NOT_FOUND", "message": "Audit not found." } }
```

### `GET /health`

```json
{ "status": "ok" }
```

## Local Development

### Prerequisites

- Node.js 20+
- A MongoDB Atlas cluster (or any reachable MongoDB instance)

### Backend

```bash
cd backend
npm install
cp .env.example .env   # fill in MONGODB_URI — see below
npm run dev             # http://localhost:5000
```

```bash
npm run typecheck
npm test
npm run build
```

### Frontend

```bash
cd frontend
npm install
npm run dev              # http://localhost:5173
```

```bash
npm run typecheck
npm run build
```

The frontend expects the backend at `http://localhost:5000` by default (see
`VITE_API_URL` below) and Vite proxies `/api` to it in dev.

## Environment Variables

Backend (`backend/.env`, copy from `backend/.env.example`):

| Variable | Default | Notes |
|---|---|---|
| `PORT` | `5000` | |
| `NODE_ENV` | `development` | |
| `MONGODB_URI` | *(required, no default)* | Standard `mongodb://` or `mongodb+srv://` connection string. If your network can't resolve `mongodb+srv://` SRV DNS records (symptom: `querySrv ECONNREFUSED`), use Atlas's non-SRV "standard connection string" format instead — see the note in `IMPLEMENTATION.md`. |
| `FRONTEND_URL` | `http://localhost:5173` | Used for CORS. |
| `CRAWLER_TIMEOUT_MS` | `10000` | Per-request timeout. |
| `CRAWLER_MAX_RESPONSE_BYTES` | `5242880` (5 MB) | Per-request max response size. |
| `CRAWLER_CONCURRENCY` | `5` | Max parallel page fetches per audit. |
| `CRAWLER_MAX_NAV_LINKS` | `20` | Caps how many nav-discovered pages get crawled. |
| `LOG_LEVEL` | `info` | |

Frontend (`frontend/.env`, optional):

| Variable | Default |
|---|---|
| `VITE_API_URL` | `http://localhost:5000` |

Never commit a real `.env` file — both are already gitignored.

## Assumptions

- Target sites use semantic HTML (`<nav>`, `<header>`, proper `<title>`/`<h1>`
  tags) — this is a technical SEO crawler, not a headless-browser renderer for
  client-side-only SPAs.
- Only the homepage and pages linked from its primary navigation are crawled —
  see below.
- Nav link discovery is capped at 20 links (`CRAWLER_MAX_NAV_LINKS`) to keep any
  single audit bounded.

## Crawling Strategy

```text
Homepage
   ↓
Primary Navigation Links (detected, deduplicated, same-domain only)
   ↓
Analyze each page
```

Internal links found *on* the crawled pages are **counted** (`internalLinkCount`)
but never enqueued for further crawling. This is deliberate, not a limitation —
recursively following every discovered link would make crawl scope and duration
unbounded, which the assignment explicitly calls out as unwanted behavior.

## Navigation Detection

1. Collect all `<nav>` elements on the homepage.
2. If there's more than one, score each (in-`<header>` bonus, `aria-label`/`role`
   mentioning navigation, a sane link count, an in-`<footer>` penalty) and pick the
   highest-scoring one.
3. If there are none, fall back to `<header>` elements whose `class`/`id` matches
   `nav`/`menu`, or any `[role="navigation"]` element.
4. If nothing is found, the audit proceeds with just the homepage — this is
   logged, not treated as an error.

Full heuristic detail is in `IMPLEMENTATION.md`.

## SEO Rules

| Check | Issue codes | Severity |
|---|---|---|
| Title (30–65 chars) | `TITLE_MISSING`, `TITLE_TOO_SHORT`, `TITLE_TOO_LONG` | critical / warning / warning |
| Meta description (70–160 chars) | `META_DESCRIPTION_MISSING`, `META_DESCRIPTION_TOO_SHORT`, `META_DESCRIPTION_TOO_LONG` | all warning |
| H1 (exactly one) | `H1_MISSING`, `H1_MULTIPLE` | both critical |
| Canonical tag present | `CANONICAL_MISSING` | warning |
| Robots noindex | `NOINDEX` | critical |
| HTTP status | `NON_200` | critical |
| Page size ≤ 2 MB | `PAGE_SIZE_TOO_LARGE` | warning |

All issue codes, messages, categories, and severities are centralized in
`backend/src/analyzer/issues.ts` — nothing is a scattered string literal.

## Known Limitations

- An in-flight audit is abandoned (stuck at `RUNNING`) if the server process
  restarts — there's no persistent job queue, by design (Redis/BullMQ were
  explicitly out of scope for this assignment).
- No progress reporting mid-crawl — the frontend polls but only sees the final
  result, not "page 3 of 8 analyzed."
- Client-rendered navigation (React/Vue SPA menus built by JS) is invisible to
  the crawler, since it parses static HTML only.
- The SSRF guard is hostname-string matching, not DNS-resolution-based — good
  enough for this assignment's scope, not a substitute for a production-grade
  egress policy.

## Future Improvements

- Per-page crawl progress persisted incrementally instead of only at completion
- Optional headless-browser rendering for SPA navigation detection
- Configurable crawl depth / custom nav selector override
- Exportable audit reports (PDF/CSV)

---

Docker support will be added in a separate phase, per the assignment's scope.
