Dockerize the existing Zensor Technical SEO Audit project.

The project already has:
- Backend: Node.js + TypeScript + Express
- Frontend: React + TypeScript + Vite
- Database: MongoDB/Mongoose
- Existing frontend and backend functionality is working.

Your job is ONLY to containerize the existing application. Do not rewrite or refactor working business logic unnecessarily.

## Goal

The evaluator must be able to clone the repository and run:

docker compose up --build

and get the complete application running with:
1. React frontend
2. Express backend
3. MongoDB database

No Node.js, npm, or MongoDB installation should be required on the evaluator's machine.

## Architecture

Use Docker Compose with three services:

frontend
backend
mongodb

Architecture:

Browser → Frontend → Backend → MongoDB

Inside Docker, backend must connect to:

mongodb://mongodb:27017/seo-audit

Do NOT use localhost for the backend → MongoDB connection inside Docker.

The existing MongoDB Atlas configuration may remain available for normal local development, but Docker must use the MongoDB container so the evaluator does not need Atlas credentials.

## Before coding

First inspect the existing repository and determine:

- backend/frontend structure
- package.json scripts
- backend port
- frontend port
- MongoDB configuration
- API URL configuration
- CORS configuration
- existing environment variables
- existing build/start commands

Do not assume these values.

## Backend

Create:

backend/Dockerfile

Use a production-oriented multi-stage build where appropriate.

Requirements:
- install dependencies
- build TypeScript
- run the production build
- do not run the development server
- do not copy host node_modules
- do not copy .env
- use the existing production scripts
- expose the correct backend port

## Frontend

Create:

frontend/Dockerfile

Use a multi-stage build:

1. Install dependencies and build the Vite application.
2. Serve the production build using Nginx or another lightweight production server.

Do NOT use the Vite development server as the production container.

If Nginx is used, configure SPA fallback correctly.

## MongoDB

Use an official MongoDB Docker image.

Requirements:
- persistent named volume
- backend can access it through the Docker network
- MongoDB does not need to be publicly exposed

## Docker Compose

Create:

docker-compose.yml

It must start:

- mongodb
- backend
- frontend

Use environment variables for configuration.

Use a MongoDB healthcheck where appropriate so the backend does not start before MongoDB is ready.

Use the actual ports discovered from the existing project.

## Environment

Create/update:

.env.example

Never commit the real MongoDB connection string or any secrets.

Important:

The browser cannot resolve Docker's internal hostname "backend".

Therefore, frontend browser API configuration should use a host-accessible URL such as:

http://localhost:<backend-port>

while backend → MongoDB should use:

mongodb://mongodb:27017/seo-audit

Keep these networking contexts separate.

## CORS

Inspect the existing CORS configuration and make sure the Dockerized frontend can communicate with the backend.

Do not blindly use origin "*".

Use environment configuration where appropriate.

## Health

If the project does not already have one, add:

GET /health

returning something simple such as:

{
  "status": "ok"
}

Do not expose sensitive information.

## Dockerignore

Create:

backend/.dockerignore
frontend/.dockerignore

Exclude at minimum:

node_modules
dist
build
coverage
.env
.git
*.log

## Security

Make sure:
- no secrets are inside Dockerfiles
- no real MongoDB credentials are committed
- no .env files are copied into images
- MongoDB is not unnecessarily exposed
- runtime images do not contain unnecessary development dependencies

## Validation

After implementation, actually test:

docker compose build

docker compose up --build

Verify:

- MongoDB starts
- backend starts
- frontend starts
- backend connects to MongoDB
- frontend loads
- frontend can call backend
- /health works
- POST /audit works
- GET /audit/:audit_id works
- audit results are persisted
- existing SEO functionality still works

Then test persistence:

docker compose down
docker compose up

Verify MongoDB data remains because of the named volume.

Also perform a clean Docker build without relying on local node_modules or local build output.

## Documentation

Update README.md with:

- Docker prerequisites
- docker compose up --build
- frontend URL
- backend URL
- how to stop the application
- MongoDB persistence explanation
- environment variable instructions

Update IMPLEMENTATION.md with a concise section covering:

- Docker architecture
- networking
- MongoDB strategy
- environment configuration
- production builds
- health checks
- trade-offs

## Important

Do not change the crawler, SEO analyzer, audit logic, API contracts, or frontend functionality unless a Docker-specific change requires it.

Do not add unnecessary technologies such as Redis, Kubernetes, queues, or microservices.

Keep this production-ready but appropriate for a take-home assignment.

Work in phases:

Phase 1: Inspect existing project and report Docker plan.
Phase 2: Implement Dockerfiles and Compose.
Phase 3: Validate the complete stack.
Phase 4: Update documentation.

After each phase, report:
- what changed
- files changed
- validation performed
- problems found/fixed
- remaining concerns

Start with Phase 1 and inspect the repository before modifying anything.