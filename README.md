<h1 align="center">🚀 Task API</h1>
<p align="center">
  A lean Node.js API for task management — containerized with Docker, backed by SQLite, fully tested, and featuring bulk CSV import.
</p>

<p align="center">
  <a href="https://nodejs.org/"><img alt="Node.js" src="https://img.shields.io/badge/Node.js-22%2B-3C873A?logo=node.js&logoColor=white"></a>
  <a href="https://www.npmjs.com/"><img alt="npm" src="https://img.shields.io/badge/npm-10%2B-CB0000?logo=npm&logoColor=white"></a>
  <a href="https://www.docker.com/"><img alt="Docker Compose" src="https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white"></a>
  <a href="https://www.sqlite.org/"><img alt="SQLite" src="https://img.shields.io/badge/SQLite-Embedded-003B57?logo=sqlite&logoColor=white"></a>
  <img alt="Tests" src="https://img.shields.io/badge/Tests-33%20passing-34D058?logo=jest&logoColor=white">
</p>

---

## ✨ Highlights

- ⚡ Fast and minimal Node.js API (CommonJS)
- 🗄️ Lightweight persistence with SQLite
- 🐳 Reproducible environment via Docker Compose
- 📥 Bulk import of tasks via CSV upload (multipart/form-data)
- ✅ 33 tests (unit + integration) with Jest + Supertest
- 🧱 Clean structure and clear validation rules

---

## 🗂️ Project Structure

```text
.
├─ src/
│  ├─ controllers/
│  │  └─ tasksController.js    # Task CRUD, toggle completion, CSV import
│  ├─ middlewares/
│  │  └─ upload.js             # Multer config (5MB limit, CSV validation)
│  └─ routes/
│     └─ tasks.js              # Routes for /tasks and /tasks/import
│  ├─ controllers/
│  │  └─ tasksController.js    # Task CRUD, toggle completion, CSV import
│  ├─ middlewares/
│  │  └─ upload.js             # Multer config (5MB limit, CSV validation)
│  └─ routes/
│     └─ tasks.js              # Routes for /tasks and /tasks/import
├─ tests/
│  ├─ unit/
│  │  └─ tasksController.spec.js
│  └─ integration/
│     └─ tasks.integration.spec.js
├─ docker-compose.yml
├─ Dockerfile
├─ postman_collection.json
├─ sample-tasks.csv
├─ postman_collection.json
├─ sample-tasks.csv
└─ README.md
```

---

## ⚙️ Getting Started

### Prerequisites
- Node.js 22+
- npm 10+
- Docker Engine with Compose plugin

### Run locally (without Docker)

```bash
npm install
npm run dev
# Service available at http://localhost:3000
```

Tip:
- Customize DB path via `SQLITE_DB_FILE` (default: `/app/data/database.sqlite`)

### Run with Docker

```bash
docker compose up --build
# Shut down:
docker compose down
```

Mounted volumes:
- `./src` → `/app/src`
- `./data` → `/app/data`

---

## 🔐 Environment Variables

```env
# SQLite file path (inside the container)
SQLITE_DB_FILE=/app/data/database.sqlite
# Server port
PORT=3000
```

---

## 📚 API Reference

Base URL: `http://localhost:3000`

### Endpoints Overview

| Method | Path                       | Purpose                             |
|-------:|----------------------------|-------------------------------------|
| POST   | /tasks                     | Create a new task                   |
| GET    | /tasks                     | List all tasks                      |
| GET    | /tasks?search=term         | Filter tasks by title/description   |
| PUT    | /tasks/:id                 | Update title and/or description     |
| PATCH  | /tasks/:id/complete        | Toggle completion                   |
| DELETE | /tasks/:id                 | Delete a task                       |
| POST   | /tasks/import              | Bulk import via CSV upload          |

---

### Create Task
Request
```json
{
  "title": "Task title",
  "description": "Task description (optional)"
}
```

Response 201
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

Validations
- `title` is required and non-empty (trimmed)
- `description` is optional

---

### List Tasks
Query
- `search` (optional) — filters by title/description

Response 200
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

---

### Update Task
Request
```json
{
  "title": "New title (optional)",
  "description": "New description (optional)"
}
```

Response 200
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

Validations
- Provide at least one field (`title` or `description`)
- 404 Not Found if task does not exist

---

### Toggle Completion
Response 200 (example completed)
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

Behavior
- If incomplete → marks as complete (`completed_at` = current timestamp)
- If complete → toggles back to incomplete (`completed_at` = `null`)
- 404 Not Found if task does not exist

---

### Delete Task
- Response: 204 No Content
- 404 Not Found if task does not exist

---

### Import Tasks from CSV
Format
- `multipart/form-data` with field name `file`
- CSV columns: `title`, `description`
- Header row required
- Maximum file size: 5MB
- Supported mimetypes: `text/csv`, `application/csv`

Response 200 (example)
```json
{
  "imported": 10,
  "totalLines": 12,
  "failed": 2,
  "errors": [
    { "line": 5, "error": "title is required" },
    { "line": 8, "error": "title is required" }
    { "line": 5, "error": "title is required" },
    { "line": 8, "error": "title is required" }
  ]
}
```

Example CSV (`sample-tasks.csv`)
```csv
title,description
Learn Node.js,Study fundamentals and best practices
Build REST API,Create a task management API
Write tests,Add unit and integration tests
Deploy to Docker,Containerize the application
```

Curl
```bash
curl -X POST http://localhost:3000/tasks/import \
  -F "file=@sample-tasks.csv"
  -F "file=@sample-tasks.csv"
```

Behavior
- Each valid row creates a task
- Rows with missing or empty title are skipped and reported in errors
- Processing continues even if individual rows fail
- Returns statistics: imported count, total lines, failed count, and per-line errors

---

## 🧪 Testing

33 tests (unit + integration) using Jest and Supertest. Tests run sequentially to avoid SQLite concurrency issues.

- Unit: `tests/unit/tasksController.spec.js`
- Integration: `tests/integration/tasks.integration.spec.js`

Run locally (isolated DB)
```bash
SQLITE_DB_FILE=/tmp/test-database.sqlite NODE_ENV=test npm test
```

Run with Docker
```bash
docker compose run --rm \
  -e NODE_ENV=test \
  -e SQLITE_DB_FILE=/tmp/test-database.sqlite \
  api npm test
```

Note
- Tests execute sequentially (`jest --runInBand` / `maxWorkers: 1`)

---

## 📮 Postman Collection

Import `postman_collection.json` into Postman to quickly test:
- CRUD operations
- CSV import (multipart/form-data)

Pro tip: In “Create Task”, set a collection variable for `taskId` and reuse it in Update/Toggle/Delete:
```js
pm.collectionVariables.set("taskId", pm.response.json().id);
```

---

## 🛠️ Useful Commands

```bash
# Dev (hot reload)
npm run dev

# Test (sequential; isolated DB recommended)
SQLITE_DB_FILE=/tmp/test-database.sqlite NODE_ENV=test npm test
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a branch: `feat/my-feature`
3. Commit: `feat: objective description`
4. Open a PR with context and evidence

---

## 💡 License

This project is licensed under the MIT License.

---

<p align="center">
  <a href="https://www.linkedin.com/in/pedrosolozabal/">
    <img src="https://img.shields.io/badge/Pedro%20Solozabal-LinkedIn-blue?logo=linkedin&logoColor=white&style=for-the-badge" alt="Pedro Solozabal on LinkedIn">
  </a>
</p>
