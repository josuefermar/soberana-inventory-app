# Local database setup

Quick reference for running the backend against a local database.

## Default: SQLite (no install)

- **URL**: `sqlite:///./soberana.db`
- **File**: `soberana.db` is created in `backend/` when the app or Alembic runs.
- No `DATABASE_URL` needed; app and Alembic use this by default.

## Optional: PostgreSQL

**Postgres con Docker dev (desde la raíz del repo):** puerto **5432**.

1. Levantar: `docker compose up -d db` (o `docker compose -f docker-compose.dev.yml up -d db`).
2. En `backend/.env`:
   ```env
   DATABASE_URL=postgresql+psycopg2://postgres:postgres@localhost:5432/postgres
   ```
3. Migraciones desde `backend/`: `PYTHONPATH=. python -m alembic upgrade head`

**Postgres instalado en la máquina:** usa puerto 5432 (o el que tengas) y tu usuario/DB en la URL.

## Alembic (from `backend/`)

Set Python path so `app` is found, then run Alembic:

**Bash (Git Bash / WSL):**
```bash
cd backend
export PYTHONPATH=.
python -m alembic upgrade head
python -m alembic revision --autogenerate -m "your message"
```

**PowerShell:**
```powershell
cd backend
$env:PYTHONPATH = "."
python -m alembic upgrade head
python -m alembic revision --autogenerate -m "your message"
```

**One-off (any shell):**
```bash
cd backend
PYTHONPATH=. python -m alembic upgrade head
```

## Run the app

From repo root or `backend/`:

```bash
cd backend
uvicorn app.main:app --reload
```

Uses `DATABASE_URL` from `.env` if set, otherwise SQLite at `./soberana.db`.
