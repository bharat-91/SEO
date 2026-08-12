# Zensor Solutions — Technical SEO Audit Tool

## Master Implementation Prompt

You are acting as a **Senior Full-Stack Engineer and Technical Lead** responsible for building a production-quality take-home assignment.

I need you to build the complete application described below.

Do not treat this as a tutorial or a toy project. Treat it as a **real production-ready MVP** that will be reviewed by experienced developers.

The project should prioritize:

1. Correctness
2. Clean architecture
3. Maintainability
4. Good API design
5. Reliable crawling
6. Clear separation of concerns
7. Good UX
8. Sensible error handling
9. Testability
10. Practical engineering decisions

Do NOT over-engineer the project beyond what is reasonable for a 6–8 hour take-home assignment.

---

# 1. Assignment

Build a full-stack **Technical SEO Audit Tool**.

The workflow is:

```text
Enter Website URL
       ↓
Start Audit
       ↓
Backend starts navigation-based crawl
       ↓
Discover relevant internal pages
       ↓
Analyze SEO properties
       ↓
Persist audit + page results
       ↓
Frontend displays audit progress/result
       ↓
User explores page-level SEO issues
```

The application should allow a user to:

* Enter a website URL
* Start an SEO audit
* Crawl the homepage
* Detect the site's primary navigation
* Crawl internal links found in the primary navigation
* Deduplicate URLs
* Only crawl same-domain URLs
* Analyze every crawled page
* Persist the audit results
* View summary metrics
* View page-level issues
* Expand individual pages to inspect detailed metrics

---

# 2. REQUIRED TECH STACK

Use exactly the following core stack unless there is a very strong technical reason not to.

## Backend

* Node.js
* TypeScript
* Express.js
* MongoDB
* Mongoose

Do NOT use NestJS.

## Frontend

* React
* TypeScript
* Vite

Do NOT use Next.js.

## HTTP

Use a clean API client abstraction.

Axios or native fetch are both acceptable.

## Validation

Use a proper schema validation library such as Zod where appropriate.

## Crawling / HTML parsing

Choose appropriate mature libraries for:

* HTTP requests
* HTML parsing
* URL normalization
* HTML inspection

For example, libraries such as:

* Cheerio
* Axios / native fetch
* `p-limit` or equivalent if concurrency control is required

Choose libraries based on reliability and simplicity.

## Database

MongoDB with Mongoose.

Use proper schemas/models.

Do not store everything as an unstructured MongoDB document if a clean schema makes the system easier to maintain.

---

# 3. IMPORTANT DEVELOPMENT STRATEGY

Do NOT attempt to generate the entire project blindly in one step.

First analyze the requirements and divide the project into sensible implementation phases.

A reasonable structure would be something similar to:

### Phase 0 — Architecture & Planning

Define:

* project structure
* backend architecture
* frontend architecture
* database models
* crawling strategy
* API contracts
* SEO analysis strategy
* error handling strategy
* state management approach
* testing strategy

Do not start coding until the architecture is clear.

---

### Phase 1 — Backend Foundation

Implement:

* Express application
* TypeScript configuration
* environment configuration
* MongoDB connection
* application bootstrap
* centralized error handling
* request validation
* logging
* API structure
* health endpoint
* basic project configuration

---

### Phase 2 — SEO Crawler Engine

Implement the core crawling engine.

Requirements:

* Start from homepage
* Fetch homepage HTML
* Identify primary/main navigation
* Extract internal links from primary navigation
* Normalize URLs
* Deduplicate URLs
* Restrict crawling to the same domain
* Avoid duplicate requests
* Handle redirects
* Handle HTTP errors
* Handle invalid URLs
* Handle pages that cannot be fetched
* Prevent crawler from becoming stuck
* Respect a sensible concurrency limit
* Avoid infinite crawling

The crawler should be designed as a reusable service rather than being tightly coupled to Express controllers.

---

### Phase 3 — SEO Analyzer

For every crawled page calculate:

### Title

Check:

* exists
* length between 30–65 characters

Issues should distinguish between:

* missing title
* title too short
* title too long

### Meta Description

Check:

* exists
* length between 70–160 characters

Issues:

* missing description
* description too short
* description too long

### H1

Check:

* exactly one H1

Issues:

* missing H1
* multiple H1s

### Canonical

Check:

* canonical tag exists

Issue:

* canonical missing

### Noindex

Detect:

* `<meta name="robots">`
* relevant noindex directives

Issue:

* noindex detected

### HTTP status

Record:

* HTTP status code

Flag non-2xx pages as appropriate.

### Page size

Calculate response size.

Flag:

* page larger than 2 MB

### Internal links

Calculate:

* number of internal links present on the page

---

# 4. ISSUE CODES

Use consistent machine-readable issue codes.

For example:

```text
TITLE_MISSING
TITLE_TOO_SHORT
TITLE_TOO_LONG

META_DESCRIPTION_MISSING
META_DESCRIPTION_TOO_SHORT
META_DESCRIPTION_TOO_LONG

H1_MISSING
H1_MULTIPLE

CANONICAL_MISSING

NOINDEX

NON_200

PAGE_SIZE_TOO_LARGE
```

Do not scatter arbitrary strings throughout the application.

Create a centralized issue definition/type system where practical.

Each issue should also have enough metadata for the frontend to determine severity and display a human-readable label.

---

# 5. PAGE RESULT MODEL

Each crawled page should retain information similar to:

```json
{
  "url": "https://example.com/pricing",
  "status_code": 200,
  "issues": [
    "TITLE_MISSING",
    "META_DESCRIPTION_TOO_SHORT"
  ],
  "metrics": {
    "title_length": 0,
    "meta_description_length": 45,
    "h1_count": 2,
    "page_size_kb": 840,
    "internal_link_count": 12
  }
}
```

You may improve this structure if there is a strong architectural reason.

Do not introduce unnecessary complexity.

---

# 6. AUDIT DATABASE MODEL

Design a sensible MongoDB schema.

At minimum an audit should contain:

```text
audit_id
url
status
created_at
updated_at
summary
pages
```

Consider whether page results should be embedded or stored separately.

Make the decision based on:

* expected document size
* MongoDB document limits
* querying needs
* simplicity
* take-home scope

Explain the decision in `IMPLEMENTATION.md`.

Audit status should support something like:

```text
PENDING
RUNNING
COMPLETED
FAILED
```

---

# 7. REQUIRED BACKEND API

## Start Audit

```http
POST /audit
```

Request:

```json
{
  "url": "https://example.com"
}
```

Behavior:

1. Validate URL
2. Create audit record
3. Start audit processing
4. Do not block the HTTP request until the entire crawl completes
5. Return the audit ID immediately

Example:

```json
{
  "audit_id": "abc123",
  "status": "RUNNING"
}
```

The audit execution should happen asynchronously.

Do NOT make the POST request wait for the entire crawl.

For this take-home, a background/in-process job architecture is acceptable.

Do not introduce Redis/BullMQ unless genuinely necessary.

---

## Fetch Audit

```http
GET /audit/:audit_id
```

Return the audit status and, when completed, the results.

Example:

```json
{
  "audit_id": "abc123",
  "url": "https://example.com",
  "status": "COMPLETED",
  "summary": {
    "total_pages": 5,
    "missing_titles": 1,
    "multiple_h1": 2,
    "noindex_pages": 0,
    "non_200_pages": 1
  },
  "pages": [
    {
      "url": "https://example.com/pricing",
      "status_code": 200,
      "issues": [
        "TITLE_MISSING",
        "META_DESCRIPTION_TOO_SHORT"
      ],
      "metrics": {
        "title_length": 0,
        "meta_description_length": 45,
        "h1_count": 2,
        "page_size_kb": 840,
        "internal_link_count": 12
      }
    }
  ]
}
```

You may add useful fields if they improve the product.

---

# 8. FRONTEND REQUIREMENTS

Build a clean React + TypeScript interface.

Do not spend excessive time on visual decoration.

The UI should feel like a real SaaS product.

---

# SCREEN 1 — START AUDIT

Include:

* application title
* short explanation
* URL input
* validation
* Start Audit CTA
* loading state
* error state

Example:

```text
Technical SEO Audit

Analyze your website's technical SEO health.

[ https://example.com                 ]

             [ Run Audit ]
```

Validation should happen before sending invalid requests.

---

# SCREEN 2 — AUDIT OVERVIEW

Show:

* Audit URL
* Audit status
* Total pages crawled
* Total issues
* Missing titles
* Meta description issues
* H1 issues
* Canonical issues
* Noindex pages
* Non-200 pages
* Pages >2MB

Use clear metric cards.

Do not overwhelm the user.

---

# SCREEN 3 — PAGE LEVEL BREAKDOWN

Create a table/list containing:

* Page URL
* HTTP status
* issue count
* severity
* important metrics

Rows should be expandable.

Expanded row should show:

```text
Title length
Meta description length
H1 count
Canonical
Noindex
Page size
Internal links
Detected issues
```

Issues should have clear labels and severity indicators.

For example:

```text
🔴 Critical
🟠 Warning
🟢 Healthy
```

The exact visual implementation is your choice.

---

# 9. FRONTEND ARCHITECTURE

Keep API communication separate from UI components.

Prefer a structure similar to:

```text
src/
├── api/
├── components/
├── features/
│   └── audit/
├── hooks/
├── pages/
├── types/
├── utils/
├── constants/
└── App.tsx
```

You may adjust this structure if you have a better architecture.

Avoid putting API calls directly inside large UI components.

Create reusable components where appropriate.

---

# 10. STATE MANAGEMENT

Do not introduce Redux unless necessary.

The application is small enough that:

* React state
* custom hooks
* API abstraction

should be sufficient.

Create a clean audit flow.

For example:

```text
Start Audit
    ↓
audit_id
    ↓
poll GET /audit/:id
    ↓
RUNNING
    ↓
COMPLETED
    ↓
render results
```

Use sensible polling intervals.

Stop polling when:

* audit completes
* audit fails
* component unmounts

Avoid unnecessary requests.

---

# 11. LOADING / ERROR / EMPTY STATES

These are important.

Handle:

### Start audit

* invalid URL
* API failure
* server unavailable

### Audit running

Show:

```text
Audit in progress...
Crawling website and analyzing pages.
```

Do not freeze the interface.

### Audit failed

Display a useful error message.

### Audit completed with zero issues

Do not show an empty-looking screen.

Clearly communicate:

```text
No technical SEO issues detected.
```

### No pages

Handle gracefully.

---

# 12. URL NORMALIZATION

Implement proper URL normalization.

Consider:

* trailing slash
* hash fragments
* relative URLs
* absolute URLs
* query strings
* protocol
* hostname casing
* duplicate URLs

For example:

```text
https://example.com
https://example.com/
https://example.com/#section
```

should not accidentally become multiple crawl targets.

Document the exact normalization assumptions.

---

# 13. NAVIGATION DETECTION

This is one of the most important assignment requirements.

The crawler should:

1. Fetch homepage
2. Inspect HTML
3. Attempt to identify the primary navigation
4. Extract links from it
5. Crawl those internal pages

Prefer semantic HTML:

```html
<nav>
```

If multiple navigation elements exist, use a sensible heuristic.

You may consider:

* `<header>`
* `<nav>`
* navigation-like class names
* aria labels
* link density

But do NOT attempt to build an AI-powered navigation classifier.

This is a technical SEO crawler, not an AI research project.

Document assumptions clearly.

For example:

```text
Primary navigation is detected using semantic <nav> elements first.
If unavailable, the crawler falls back to navigation-like elements within
the page header.
Only same-origin HTTP(S) links are considered.
```

The exact approach is yours, but document it.

---

# 14. CRAWLER SAFETY

The crawler must NOT:

* crawl the entire internet
* follow external domains
* endlessly follow query variations
* recursively crawl every discovered page
* create infinite loops
* make uncontrolled parallel requests

The intended crawl scope is:

```text
Homepage
   ↓
Primary Navigation Links
   ↓
Analyze those pages
```

Do not expand recursively into every internal link found on those pages unless the requirements clearly justify it.

Internal links found on analyzed pages should be counted, not automatically crawled.

This distinction is important.

---

# 15. HTTP / NETWORK EDGE CASES

Handle:

* timeout
* DNS failure
* connection failure
* redirects
* 404
* 500
* malformed HTML
* empty HTML
* SSL problems where appropriate
* non-HTML responses
* very large responses

Do not allow one failed page to crash the entire audit.

One page failure should be represented as page-level audit data.

---

# 16. PERFORMANCE

Implement reasonable protections:

* concurrency limit
* request timeout
* maximum response size
* deduplication
* no unnecessary duplicate requests

Do not optimize prematurely.

The objective is a reliable take-home implementation, not a distributed crawler platform.

---

# 17. SECURITY

Implement sensible baseline security:

* validate all incoming data
* do not trust arbitrary URLs
* prevent obvious SSRF-style abuse where practical
* restrict crawler protocols to HTTP/HTTPS
* do not allow file:// or other dangerous protocols
* avoid exposing stack traces in production responses
* configure CORS appropriately
* use environment variables for configuration
* do not commit secrets

If you implement URL restrictions for private/local network addresses, document them.

---

# 18. LOGGING

Use structured and useful logging.

Logs should make it possible to understand:

```text
Audit started
Homepage fetched
Navigation detected
N pages discovered
Page analyzed
Audit completed
Audit failed
```

Do not flood logs with unnecessary HTML or massive payloads.

---

# 19. TESTING

Include meaningful tests for critical backend logic.

Prioritize:

### URL normalization

Examples:

```text
https://example.com
https://example.com/
https://example.com/#pricing
```

### Navigation extraction

Given HTML, verify correct links are detected.

### Same-domain filtering

Verify external links are excluded.

### SEO checks

Test:

* missing title
* short title
* valid title
* long title
* missing meta description
* short meta description
* valid description
* missing H1
* multiple H1
* valid H1
* missing canonical
* noindex
* large page
* internal links

### API validation

Test invalid audit URLs.

Do not try to achieve meaningless 100% coverage.

Test the business logic that matters.

---

# 20. ENVIRONMENT CONFIGURATION

Use environment variables.

Example:

```env
PORT=5000
MONGODB_URI=mongodb://mongodb:27017/seo-audit
FRONTEND_URL=http://localhost:5173
CRAWLER_TIMEOUT_MS=10000
CRAWLER_CONCURRENCY=5
```

Do not hard-code infrastructure configuration.

Create `.env.example`.

Never commit real secrets.

---

# 21. ERROR RESPONSE FORMAT

Use a consistent API error format.

For example:

```json
{
  "error": {
    "code": "INVALID_URL",
    "message": "Please provide a valid HTTP or HTTPS URL."
  }
}
```

Use appropriate HTTP status codes.

---

# 22. CODE QUALITY

Follow these principles:

* TypeScript strict mode
* meaningful naming
* small focused functions
* separation of concerns
* dependency injection where useful
* no giant controller functions
* no business logic inside React presentation components
* no duplicated SEO rules
* centralized constants
* reusable types
* clear interfaces

Avoid:

* unnecessary abstractions
* unnecessary design patterns
* over-engineering
* huge files
* magic numbers
* duplicated logic
* `any` unless absolutely unavoidable

---

# 23. PROJECT STRUCTURE

Use a monorepo-style structure:

```text
seo-audit-tool/
│
├── backend/
│   ├── src/
│   ├── tests/
│   ├── package.json
│   ├── tsconfig.json
│   └── ...
│
├── frontend/
│   ├── src/
│   ├── package.json
│   ├── tsconfig.json
│   └── ...
│
├── README.md
├── IMPLEMENTATION.md
├── .gitignore
└── .env.example
```

Docker files will be added separately later.

---

# 24. IMPLEMENTATION.md

Create and continuously maintain:

```text
IMPLEMENTATION.md
```

This is extremely important.

It should document the actual implementation decisions made during development.

Include sections such as:

# Architecture

# Project Structure

# Backend Architecture

# Frontend Architecture

# Database Design

# API Contracts

# Crawling Strategy

# Navigation Detection

# URL Normalization

# SEO Analysis Rules

# Async Audit Execution

# Error Handling

# Security Considerations

# Performance Considerations

# Testing Strategy

# Assumptions

# Trade-offs

# Known Limitations

# Future Improvements

Do not write generic textbook content.

Document the decisions that were actually made in this project.

Update this file as implementation progresses.

---

# 25. README.md

Create a professional README containing:

## Project Overview

## Features

## Tech Stack

Explain why:

* Express
* React
* MongoDB
* TypeScript

were selected.

## Architecture

Include a simple architecture diagram in Markdown.

For example:

```text
React
  |
  | HTTP
  ↓
Express API
  |
  ↓
Audit Service
  |
  ├── Crawler
  ├── SEO Analyzer
  └── Persistence
          |
          ↓
       MongoDB
```

## API Documentation

Document:

```text
POST /audit
GET /audit/:audit_id
```

## Local Development

Explain how to run backend and frontend locally.

## Environment Variables

## Assumptions

## Navigation Detection

## SEO Rules

## Known Limitations

## Future Improvements

Docker instructions will be added later in a separate phase.

---

# 26. IMPORTANT PRODUCT THINKING

Do not simply satisfy the API requirements.

Think about the person using this product.

The user should quickly understand:

1. What was audited?
2. How many pages were checked?
3. Is the website healthy?
4. What are the biggest issues?
5. Which pages have problems?
6. What specifically is wrong with each page?

The interface should make the data understandable without requiring the user to inspect raw JSON.

---

# 27. DESIGN DIRECTION

Use a clean professional SaaS interface.

You may use a lightweight UI library if it improves development speed, but do not spend the majority of the assignment building a design system.

Prioritize:

* spacing
* typography
* hierarchy
* readable tables
* clear issue labels
* responsive layout
* accessible controls

Avoid unnecessary animations.

---

# 28. PHASE EXECUTION RULE

This is extremely important.

Do not implement everything at once.

Work through the project phase by phase.

For every phase:

### Step 1

Explain briefly what you are going to implement.

### Step 2

Implement it.

### Step 3

Review the implementation for:

* bugs
* type errors
* architectural problems
* missing requirements
* edge cases

### Step 4

Run appropriate tests/build/type checks.

### Step 5

Fix issues found during validation.

### Step 6

Update `IMPLEMENTATION.md`.

### Step 7

Give me a concise phase completion report containing:

```text
Phase:
Implemented:
Files changed:
Validation performed:
Issues found:
Issues fixed:
Remaining concerns:
```

Then STOP.

Wait for me to explicitly tell you to continue to the next phase.

Do not automatically continue through all phases.

---

# 29. PHASE ORDER

Use this implementation order unless your architectural analysis shows a better sequence:

```text
Phase 0 — Architecture & Planning

Phase 1 — Backend Foundation

Phase 2 — Database Models & Repository Layer

Phase 3 — Crawler Engine

Phase 4 — SEO Analysis Engine

Phase 5 — Audit Service & APIs

Phase 6 — Backend Tests & Hardening

Phase 7 — React Frontend Foundation

Phase 8 — Audit Start Flow

Phase 9 — Audit Overview

Phase 10 — Page-Level Breakdown

Phase 11 — Frontend Error/Loading/Empty States

Phase 12 — Frontend Polish & Accessibility

Phase 13 — End-to-End Validation

Phase 14 — README + Final Documentation

```

Docker is intentionally NOT part of this prompt.

We will handle Docker separately after the application itself is stable.

---

# 30. IMPORTANT: DO NOT FAKE FUNCTIONALITY

Do not create mock audit data merely to make the UI look complete.

The frontend must eventually consume the real backend API.

Do not hard-code:

```text
missing_titles: 3
multiple_h1: 2
```

etc.

Those values must come from the actual crawler and analyzer.

---

# 31. IMPORTANT: DO NOT OVER-SCOPE

Do NOT add:

* authentication
* user accounts
* teams
* billing
* Redis
* queues
* Kubernetes
* microservices
* AI-generated SEO recommendations
* Google Search Console
* Lighthouse
* external SEO APIs

unless explicitly required later.

The goal is a strong, focused technical SEO audit MVP.

---

# 32. DEFINITION OF DONE

The application is considered complete only when:

* Backend runs successfully
* Frontend runs successfully
* MongoDB persistence works
* `POST /audit` works
* `GET /audit/:audit_id` works
* Audit executes asynchronously
* Homepage is crawled
* Primary navigation is detected
* Internal navigation URLs are deduplicated
* External URLs are ignored
* SEO checks work
* Results persist in MongoDB
* Frontend consumes real API results
* Loading states work
* Error states work
* Empty/success states work
* Page-level issues are understandable
* Tests cover critical logic
* TypeScript checks pass
* Production build passes
* README exists
* IMPLEMENTATION.md exists
* No obvious secrets are committed
* Code is clean enough for a senior-engineer code review

Docker will be validated separately afterward.

---

# 33. START NOW

First, do ONLY **Phase 0 — Architecture & Planning**.

Before writing implementation code:

1. Analyze the requirements.
2. Identify ambiguities.
3. Propose the final architecture.
4. Propose the MongoDB schema.
5. Propose the backend folder structure.
6. Propose the frontend folder structure.
7. Define the API contracts.
8. Define the crawler algorithm.
9. Define navigation detection logic.
10. Define URL normalization rules.
11. Define SEO issue rules and severity.
12. Define the asynchronous audit lifecycle.
13. Identify important edge cases.
14. Define the testing strategy.
15. Define the phase plan.
16. Create `IMPLEMENTATION.md`.
17. Record the architectural decisions there.

Do NOT implement Phase 1 yet.

After completing Phase 0, stop and wait for my approval.

Remember:

**Production-quality code, but take-home-project scope.**

**Correctness over visual polish.**

**Simple architecture over unnecessary complexity.**

**Real crawler + real database + real API + real React UI.**

**No fake/mock final functionality.**
