# Task API

Baseline Node.js API service packaged with Docker and SQLite for persistent storage.

## Requirements

- Node.js 22+
- npm 10+
- Docker Engine with Compose plugin

## Local Development

```bash
npm install
npm run dev
```

The service listens on `http://localhost:3000`. A readiness probe is available at `GET /health` and returns `{ "status": "ok", "uptime": <number> }`.

Set `SQLITE_DB_FILE` if you need to override the default database location of `/app/data/database.sqlite`.

## Docker

Build and run the containerized service:

```bash
docker compose up --build
```

Mounts:

- `./src` → `/app/src`
- `./data` → `/app/data`

Stop the containers when you are done:

```bash
docker compose down
```

## API Endpoints

### Health Check

**GET** `/health`

Returns the health status of the service.

**Response:** `200 OK`
```json
{
  "status": "ok",
  "uptime": 123.456
}
```

### Tasks

#### Create Task

**POST** `/tasks`

Creates a new task.

**Request Body:**
```json
{
  "title": "Task title",
  "description": "Task description (optional)"
}
```

**Response:** `201 Created`
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

**Validation:**
- `title` is required and cannot be empty
- `description` is optional

#### List Tasks

**GET** `/tasks`

Lists all tasks, ordered by creation date (newest first).

**Query Parameters:**
- `search` (optional): Filter tasks by title or description

**Response:** `200 OK`
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

**PUT** `/tasks/:id`

Updates an existing task.

**Request Body:**
```json
{
  "title": "New title (optional)",
  "description": "New description (optional)"
}
```

**Response:** `200 OK`
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

**Validation:**
- At least one field (`title` or `description`) must be provided
- Returns `404 Not Found` if task does not exist

#### Toggle Task Completion

**PATCH** `/tasks/:id/complete`

Toggles the completion status of a task.

**Response:** `200 OK`
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

**Behavior:**
- If task is incomplete, marks it as complete (sets `completed_at` to current timestamp)
- If task is complete, marks it as incomplete (sets `completed_at` to `null`)
- Returns `404 Not Found` if task does not exist

#### Delete Task

**DELETE** `/tasks/:id`

Deletes a task.

**Response:** `204 No Content`

**Error:** `404 Not Found` if task does not exist
