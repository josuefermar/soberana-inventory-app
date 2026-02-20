# Postgres local (Docker)

Solo levanta Postgres. El backend corre en tu máquina y se conecta a esta base.

## 1. Levantar Postgres

Desde esta carpeta:

```bash
cd db_local
docker compose up -d
```

Postgres queda en **localhost:5433** (puerto 5433 para no chocar con otro Postgres en 5432).

## 2. Conectar el backend y ejecutar migraciones

En `backend/.env` define:

```env
DATABASE_URL=postgresql+psycopg2://postgres:postgres@localhost:5433/postgres
```

Desde `backend/` ejecuta las migraciones:

```bash
cd backend
PYTHONPATH=. python -m alembic upgrade head
```

Para crear nuevas migraciones después de cambiar modelos:

```bash
PYTHONPATH=. python -m alembic revision --autogenerate -m "descripcion"
PYTHONPATH=. python -m alembic upgrade head
```

## 3. Arrancar el backend (en tu máquina)

```bash
cd backend
uvicorn app.main:app --reload
```

El backend usará el Postgres del compose gracias a `DATABASE_URL` en `.env`.
