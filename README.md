# Task API

A Node.js API for task management, containerized with Docker and backed by SQLite storage.
Focus areas: CRUD operations, mark task as complete, and bulk import via CSV upload.

[![Node.js](https://img.shields.io/badge/Node.js-22+-3C873A?logo=node.js&logoColor=white)](https://nodejs.org/)
[![npm](https://img.shields.io/badge/npm-10+-CB0000?logo=npm&logoColor=white)](https://www.npmjs.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![SQLite](https://img.shields.io/badge/SQLite-Embedded-003B57?logo=sqlite&logoColor=white)](https://www.sqlite.org/)

---

## ✨ Highlights

- Lean, fast Node.js API (CommonJS)
- Lightweight persistence using SQLite
- Reproducible environment via Docker Compose
- Bulk task import through CSV file upload
- Health and observability: `/health` endpoint
- Clean structure, ready for testing
- Jest + Supertest test suite covering validations and all `/tasks` endpoints

---

## 📁 Project Structure

```text
.
├─ src/
│  ├─ server.js         # HTTP entrypoint (starts app.listen)
│  ├─ app.js            # Express app (imported by server)
│  ├─ routes/           # Route definitions
│  ├─ controllers/      # Business orchestration
│  ├─ repositories/     # Database access (SQLite)
│  └─ database/
│     ├─ db.js          # SQLite connection + schema bootstrap
│     └─ init.sql       # Schema
├─ tests/
│  ├─ unit/
│  │  └─ tasksController.spec.js
│  └─ integration/
│     └─ tasks.integration.spec.js
├─ jest.config.cjs      # Jest config (Node, sequential)
├─ docker-compose.yml
├─ Dockerfile
└─ README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 22+
- npm 10+
- Docker Engine with Compose plugin

### Local environment (without Docker)

```bash
npm install
npm run dev
# Service available at http://localhost:3000
```

- Readiness probe: `GET /health` → `{ "status": "ok", "uptime": <number> }`
- Set `SQLITE_DB_FILE` to change the database path (default: `/app/data/database.sqlite`)

### Run with Docker

```bash
docker compose up --build
# Shut down:
docker compose down
```

Volumes:
- `./src` → `/app/src`
- `./data` → `/app/data`

---

## 🔒 Environment Variables

```env
# SQLite file path (inside the container)
SQLITE_DB_FILE=/app/data/database.sqlite
# Server port
PORT=3000
```

---

## 📚 API

Base URL: `http://localhost:3000`

### Health Check
- GET `/health`
- 200 OK
```json
{ "status": "ok", "uptime": 123.456 }
```

### Tasks

#### Create Task
- POST `/tasks`
- Body:
```json
{
  "title": "Task title",
  "description": "Task description (optional)"
}
```
- 201 Created:
```json
{
  "id": "uuid",
  "title": "Task title",
  "description": "Task description",
  "completed_at": null,
  "created_at": "2025-12-03 23:00:00",
  "updated_at": "2025-12-03 23:00:00"
}
```
Validations:
- `title` is required and non-empty
- `description` is optional

#### List Tasks
- GET `/tasks`
- Query:
  - `search` (optional) — filters by title/description
- 200 OK:
```json
[
  {
    "id": "uuid",
    "title": "Task title",
    "description": "Task description",
    "completed_at": null,
    "created_at": "2025-12-03 23:00:00",
    "updated_at": "2025-12-03 23:00:00"
  }
]
```

#### Update Task
- PUT `/tasks/:id`
- Body:
```json
{
  "title": "New title (optional)",
  "description": "New description (optional)"
}
```
- 200 OK:
```json
{
  "id": "uuid",
  "title": "New title",
  "description": "New description",
  "completed_at": null,
  "created_at": "2025-12-03 23:00:00",
  "updated_at": "2025-12-03 23:01:00"
}
```
Validations:
- Provide at least one field (`title` or `description`)
- 404 Not Found if task does not exist

#### Toggle Completion
- PATCH `/tasks/:id/complete`
- 200 OK (example completed):
```json
{
  "id": "uuid",
  "title": "Task title",
  "description": "Task description",
  "completed_at": "2025-12-03 23:02:00",
  "created_at": "2025-12-03 23:00:00",
  "updated_at": "2025-12-03 23:02:00"
}
```
Behavior:
- If incomplete → marks as complete (`completed_at` = current timestamp)
- If complete → toggles back to incomplete (`completed_at` = `null`)
- 404 Not Found if task does not exist

#### Delete Task
- DELETE `/tasks/:id`
- 204 No Content
- 404 Not Found if task does not exist

---

## 🧪 Testing

The project includes 30 tests (unit + integration) using Jest and Supertest. Tests run sequentially to avoid SQLite concurrency issues.

- Frameworks:
  - Jest (unit and integration)
  - Supertest (HTTP integration)

- Test files:
  - Unit: `tests/unit/tasksController.spec.js`
    - Validates title requirement (trim, non-empty)
    - Validates update body must contain `title` or `description`
    - Simulates `completed_at` toggle behavior
  - Integration: `tests/integration/tasks.integration.spec.js`
    - Covers endpoints: POST, GET (with `?search`), PUT, PATCH `/complete`, DELETE
    - Error cases: 400 (invalid body), 404 (not found)

- How tests work:
  - If `src/app.js` exports the Express app, Supertest uses it directly.
  - If not, tests fallback to `http://localhost:3000`. In this case, start the dev server before running tests.

### Run tests locally (recommended: isolated DB)

Use an isolated SQLite file via env var to ensure clean state per run:

```bash
SQLITE_DB_FILE=/tmp/test-database.sqlite NODE_ENV=test npm test
```

This sets the database file to `/tmp/test-database.sqlite` only for the test process. No repo files are created.

### Run tests with Docker Compose (optional)

```bash
docker compose run --rm \
  -e NODE_ENV=test \
  -e SQLITE_DB_FILE=/tmp/test-database.sqlite \
  api npm test
```

### Notes

- Tests execute sequentially (`jest --runInBand` / `maxWorkers: 1`) to avoid sqlite contention.
- If an intermittent failure appears due to sqlite locks, ensure the isolated DB path is used and re-run.

---

## 📦 CSV Import

- Dedicated endpoint (e.g., `POST /tasks/import`) for `.csv` file upload
- Processes tasks in batch with resilience
- Validates structure and per-row data
- Produces success/error report

> Note: This is part of the challenge scope; adjust names/routes according to your implementation.

---

## 🛠️ Useful Commands

```bash
# Lint
npm run lint

# Format
npm run format

# Dev (hot reload)
npm run dev

# Test (sequential; isolated DB recommended)
SQLITE_DB_FILE=/tmp/test-database.sqlite NODE_ENV=test npm test
```

---

## 🗺️ Roadmap

- [ ] Integration and contract tests (extended coverage, CI)
- [ ] Rate limiting and configurable CORS
- [ ] Observability (structured logs, Prometheus metrics)
- [ ] OpenAPI/Swagger documentation
- [ ] Optional authentication (tokens, roles)

---

## 🤝 Contributing

1. Fork the repository
2. Create a branch: `feat/my-feature`
3. Commit: `feat: objective description`
4. Open a PR with context and evidence

---

## 🔗 Extras

- Languages: 98.6% JavaScript · 1.4% Dockerfile
- Repository description: “Node.js API with Docker to manage tasks. Features: CRUD operations, mark tasks as complete, and bulk import via CSV file upload.
