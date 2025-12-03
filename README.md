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
