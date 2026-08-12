# FINAL DOCKERIZATION TASK
# Zensor Solutions — Technical SEO Audit Tool

You are continuing work on an existing full-stack Technical SEO Audit application.

The frontend and backend are already implemented and the source code is already available in the repository.

Your ONLY task in this phase is to productionize and containerize the existing application.

Do NOT rewrite the existing application unnecessarily.

Do NOT change working business logic unless a Docker-related configuration change requires it.

Do NOT introduce new application features.

The final result must satisfy the assignment requirement:

"Full project runnable with:

docker compose up

Should start:
- Backend API
- Frontend UI
- Database (if used)
- No manual setup expected."

==================================================
1. EXISTING TECHNOLOGY STACK
==================================================

Backend:
- Node.js
- TypeScript
- Express.js
- MongoDB
- Mongoose

Frontend:
- React
- TypeScript
- Vite

Database:
- MongoDB

The repository already contains the working frontend and backend.

Before modifying anything, inspect the actual repository and work with the existing structure.

==================================================
2. IMPORTANT DATABASE DECISION
==================================================

The application currently uses a MongoDB connection string, potentially MongoDB Atlas.

For LOCAL NON-DOCKER DEVELOPMENT, do not unnecessarily remove or break the existing MongoDB configuration.

For DOCKER, the preferred architecture is:

                    Docker Compose
                         |
          ┌──────────────┼──────────────┐
          ↓              ↓              ↓
      frontend        backend        mongodb
       React          Express        MongoDB
                        |
                        ↓
                    mongodb:27017

The Dockerized backend MUST connect to the MongoDB Docker service.

Example:

MONGODB_URI=mongodb://mongodb:27017/seo-audit

Do NOT use:

MONGODB_URI=mongodb://localhost:27017/seo-audit

inside the backend container.

Do NOT require the evaluator to provide MongoDB Atlas credentials.

Do NOT commit any real MongoDB Atlas credentials.

The Docker environment should be self-contained.

==================================================
3. PHASED EXECUTION
==================================================

Do not implement everything blindly in one step.

Work through the following phases.

PHASE 1 — INSPECT

PHASE 2 — DOCKER ARCHITECTURE

PHASE 3 — BACKEND CONTAINER

PHASE 4 — FRONTEND CONTAINER

PHASE 5 — MONGODB CONTAINER

PHASE 6 — DOCKER COMPOSE

PHASE 7 — ENVIRONMENT + NETWORKING

PHASE 8 — HEALTH CHECKS + STARTUP RELIABILITY

PHASE 9 — SECURITY + IMAGE OPTIMIZATION

PHASE 10 — FULL INTEGRATION TEST

PHASE 11 — DOCUMENTATION

After each phase:

1. Implement the phase.
2. Inspect your changes.
3. Run relevant validation.
4. Fix problems.
5. Update IMPLEMENTATION.md.
6. Report what was done.

Do not skip validation.

You may combine very small dependent phases if necessary, but do not proceed through the entire project without validation.

==================================================
4. PHASE 1 — INSPECT EXISTING PROJECT
==================================================

Before changing files, inspect:

- repository structure
- backend/package.json
- frontend/package.json
- backend source structure
- frontend source structure
- TypeScript configuration
- existing scripts
- backend port
- frontend port
- MongoDB connection implementation
- existing environment variables
- existing API base URL
- CORS configuration
- existing health endpoint
- existing README.md
- existing IMPLEMENTATION.md
- existing .gitignore

Determine the actual commands used by the project.

For example:

Backend:
- dependency installation
- development command
- build command
- production start command

Frontend:
- dependency installation
- development command
- build command
- production serving strategy

Do NOT assume these commands.

Read package.json and use the actual scripts.

At the end of Phase 1 provide:

- current architecture
- current runtime requirements
- Docker-specific issues
- files that need to be created
- files that need to be modified
- proposed Docker architecture

Then continue only when the architecture is clear.

==================================================
5. PHASE 2 — FINAL DOCKER ARCHITECTURE
==================================================

Use Docker Compose.

Services:

frontend
backend
mongodb

Architecture:

Browser
   |
   | HTTP
   ↓
Frontend container
   |
   | Browser API requests
   ↓
Backend container
   |
   | MongoDB protocol
   ↓
MongoDB container

Important:

The browser and Docker containers have different networking contexts.

Do NOT configure the browser to call:

http://backend:5000

because "backend" is a Docker-internal hostname and is not necessarily resolvable by the user's browser.

The frontend's browser-side API URL should use a host-accessible address such as:

http://localhost:5000

or an equivalent configuration.

Backend → MongoDB SHOULD use:

mongodb://mongodb:27017/seo-audit

because "mongodb" is the Docker Compose service hostname.

==================================================
6. PHASE 3 — BACKEND DOCKERFILE
==================================================

Create:

backend/Dockerfile

Use a multi-stage production-oriented Docker build where appropriate.

Requirements:

- install dependencies
- build TypeScript
- run compiled production code
- do not run development server
- do not copy host node_modules
- do not copy .env files
- minimize final image size
- use a non-root user if practical
- expose the actual backend port
- use the existing production start script

Do NOT invent a production command without checking package.json.

If the existing backend has a build problem, fix only what is necessary for a correct production build.

The Docker runtime image should contain only what it needs.

==================================================
7. PHASE 4 — FRONTEND DOCKERFILE
==================================================

Create:

frontend/Dockerfile

Use a multi-stage build.

Stage 1:
- install dependencies
- build React/Vite application

Stage 2:
- serve production static assets using Nginx or another lightweight production server

Do NOT use:

npm run dev

as the production container command.

If using Nginx:

Create an appropriate nginx configuration.

Ensure SPA routing works correctly.

For example, routes should fall back to index.html where required.

The final image should not contain unnecessary development dependencies.

==================================================
8. PHASE 5 — MONGODB CONTAINER
==================================================

Use an official MongoDB Docker image.

The MongoDB service should:

- use a named Docker volume
- persist data
- be available to the backend
- not need to be exposed publicly unless necessary

Example conceptual configuration:

mongodb:
  image: mongo
  volumes:
    - mongodb_data:/data/db

Use a sensible database name.

The backend should connect using the service name:

mongodb://mongodb:27017/seo-audit

Do not hard-code credentials unnecessarily.

Do not put MongoDB Atlas credentials anywhere in the Docker configuration.

==================================================
9. PHASE 6 — DOCKER COMPOSE
==================================================

Create:

docker-compose.yml

The primary evaluator command must be:

docker compose up --build

This must start:

1. MongoDB
2. Backend
3. Frontend

Use a shared Docker network.

Expose:

Frontend:
localhost:<frontend-port>

Backend:
localhost:<backend-port>

MongoDB:
prefer internal-only access unless host access is genuinely required.

Use environment variables rather than hard-coded configuration wherever practical.

Example conceptual configuration:

services:

  mongodb:
    image: mongo
    volumes:
      - mongodb_data:/data/db

  backend:
    build:
      context: ./backend
    environment:
      MONGODB_URI: mongodb://mongodb:27017/seo-audit
    depends_on:
      mongodb:
        condition: service_healthy

  frontend:
    build:
      context: ./frontend
    depends_on:
      backend:
        condition: service_started

volumes:
  mongodb_data:

Adjust this according to the actual application.

Do not blindly copy this example.

==================================================
10. PHASE 7 — ENVIRONMENT CONFIGURATION
==================================================

Create or update:

.env.example

Document all required variables.

Separate:

LOCAL DEVELOPMENT VARIABLES

from:

DOCKER VARIABLES

The evaluator should not need a real Atlas connection string.

For example:

Docker backend:

MONGODB_URI=mongodb://mongodb:27017/seo-audit

Frontend browser:

VITE_API_URL=http://localhost:5000

Use the actual ports discovered from the project.

IMPORTANT:

Vite environment variables are compiled into the frontend.

Therefore:

- never put secrets in VITE_* variables
- never put MongoDB credentials in VITE_* variables
- never expose backend secrets to the browser

==================================================
11. PHASE 8 — CORS + NETWORKING
==================================================

Inspect the current backend CORS configuration.

Ensure the Dockerized frontend can call the backend.

Use the correct frontend origin.

For example:

FRONTEND_URL=http://localhost:5173

Do not blindly use:

origin: "*"

unless the existing architecture genuinely requires it.

The configuration should work when the evaluator opens the frontend from their browser.

==================================================
12. PHASE 9 — HEALTH CHECKS
==================================================

If the backend does not already have:

GET /health

add it.

Example response:

{
  "status": "ok"
}

Do not expose secrets or internal infrastructure details.

Add a MongoDB healthcheck in Docker Compose where appropriate.

Do not assume:

depends_on:
  - mongodb

means MongoDB is actually ready to accept connections.

The backend should start reliably even when MongoDB takes a few seconds to initialize.

==================================================
13. PHASE 10 — DOCKERIGNORE
==================================================

Create:

backend/.dockerignore
frontend/.dockerignore

At minimum exclude:

node_modules
dist
build
coverage
.env
.env.*
.git
*.log

Do not copy local dependencies into Docker.

Do not copy secrets.

==================================================
14. PHASE 11 — SECURITY
==================================================

Review Docker configuration for:

- secrets
- credentials
- MongoDB Atlas URI
- API keys
- unnecessary exposed ports
- running containers as root
- unnecessary files
- unnecessary services

Do not commit:

.env

Do not expose MongoDB to the public internet unnecessarily.

Do not place credentials inside:

Dockerfile
docker-compose.yml
frontend source
Vite variables
README

Only `.env.example` may contain placeholders.

==================================================
15. PHASE 12 — PRODUCTION IMAGE OPTIMIZATION
==================================================

Use multi-stage builds where appropriate.

Backend final image should not contain:

- unnecessary source files
- development dependencies
- local node_modules
- .env files

Frontend final image should contain only:

- built static assets
- web server configuration
- required runtime files

Do not obsess over image size.

Prefer correctness and maintainability over extreme optimization.

==================================================
16. PHASE 13 — FULL DOCKER TEST
==================================================

Perform a clean test.

First:

docker compose down -v

Then:

docker compose build --no-cache

Then:

docker compose up

Verify:

[ ] MongoDB starts
[ ] Backend starts
[ ] Frontend starts
[ ] Backend connects to MongoDB
[ ] Frontend loads in browser
[ ] Frontend can reach backend
[ ] GET /health works
[ ] POST /audit works
[ ] Audit executes
[ ] Audit status can be retrieved
[ ] Results are persisted
[ ] Frontend displays real audit results
[ ] Existing loading state works
[ ] Existing error state works
[ ] Existing page breakdown works

Do not consider Docker complete until the actual SEO audit workflow works end-to-end.

==================================================
17. DATABASE PERSISTENCE TEST
==================================================

Test:

docker compose down

Then:

docker compose up

Verify MongoDB data remains available because of the named volume.

Do NOT use:

docker compose down -v

when testing persistence because that intentionally removes the volume.

Use:

docker compose down

then:

docker compose up

and verify the data remains.

==================================================
18. CLEAN MACHINE SIMULATION
==================================================

The final test must prove that the application does not depend on local:

- node_modules
- Node.js
- npm packages
- MongoDB
- build output

Docker should install/build everything it requires.

The evaluator should only need:

Docker
Docker Compose

and the repository.

==================================================
19. README UPDATE
==================================================

Update README.md.

Add:

# Docker Setup

## Prerequisites

Only Docker / Docker Compose.

## Run the Application

docker compose up --build

## Access the Application

Frontend:
http://localhost:<actual-port>

Backend:
http://localhost:<actual-port>

Health:
http://localhost:<actual-port>/health

## Stop

docker compose down

## Rebuild

docker compose up --build

## MongoDB

Explain that MongoDB runs inside Docker and data is persisted using a named volume.

## Environment Variables

Explain `.env.example`.

Make the README understandable to an evaluator who has never seen this project.

==================================================
20. IMPLEMENTATION.MD UPDATE
==================================================

Update IMPLEMENTATION.md with a Docker section containing:

# Docker Architecture

# Container Structure

# Docker Networking

# MongoDB Strategy

# Environment Configuration

# Frontend Runtime Strategy

# Backend Runtime Strategy

# Health Checks

# Persistence

# Security

# Production Build

# Trade-offs

# Known Limitations

Document the actual implementation.

Do not write generic Docker theory.

==================================================
21. DO NOT BREAK LOCAL DEVELOPMENT
==================================================

If the project currently supports local development using MongoDB Atlas, preserve that capability where practical.

The desired setup should be:

LOCAL:

Frontend
   ↓
Backend
   ↓
MongoDB Atlas

DOCKER:

Frontend container / browser
   ↓
Backend container
   ↓
MongoDB container

Use environment configuration to switch between these environments.

Do not hard-code Docker-specific values into application code.

==================================================
22. DO NOT MODIFY SEO LOGIC
==================================================

The following existing functionality must remain unchanged unless absolutely necessary:

- crawler
- navigation detection
- URL normalization
- SEO analyzer
- issue detection
- audit persistence
- audit APIs
- frontend audit flow
- page-level results

Dockerization is an infrastructure task.

Do not use this phase as an opportunity to refactor unrelated application code.

==================================================
23. FINAL DEFINITION OF DONE
==================================================

The Docker phase is complete only when ALL of these are true:

[ ] docker-compose.yml exists

[ ] backend/Dockerfile exists

[ ] frontend/Dockerfile exists

[ ] frontend production build works

[ ] backend production build works

[ ] MongoDB runs in Docker

[ ] MongoDB has persistent named volume

[ ] Backend connects to Docker MongoDB

[ ] Frontend is accessible from browser

[ ] Backend API is accessible

[ ] Frontend communicates with backend

[ ] /health works

[ ] POST /audit works

[ ] GET /audit/:audit_id works

[ ] SEO audit completes successfully

[ ] Results persist

[ ] Existing application behavior remains intact

[ ] No real secrets are committed

[ ] .dockerignore files exist

[ ] .env.example exists

[ ] README has complete Docker instructions

[ ] IMPLEMENTATION.md documents Docker decisions

[ ] Clean Docker build succeeds

[ ] docker compose up --build works from a clean checkout

[ ] No manual Node.js setup required

[ ] No manual MongoDB setup required

[ ] No MongoDB Atlas credentials required for Docker

==================================================
24. FINAL REPORT
==================================================

After completing all phases, provide:

## Docker Implementation Summary

## Files Created

## Files Modified

## Container Architecture

## Ports

## Environment Variables

## MongoDB Strategy

## Validation Performed

## Problems Found

## Problems Fixed

## Known Limitations

## Exact Command Used To Run The Application

The final expected command should be:

docker compose up --build

Do not claim success unless the command was actually validated.

==================================================
START NOW
==================================================

Start with PHASE 1 — INSPECT.

Inspect the existing repository first.

Do not immediately generate Dockerfiles.

Do not immediately modify application code.

First understand the existing implementation and report the proposed Docker architecture.

Then proceed methodically through the phases, validating each step.