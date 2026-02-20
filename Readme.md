# La Soberana – Monthly Inventory Count System

Fullstack application for monthly inventory counts per warehouse. Backend: FastAPI + SQLAlchemy + Alembic (Clean Architecture). Frontend: React + Vite, feature-first, with i18n and role-based access.

---

## Architecture Overview

### Backend (Clean Architecture)

- **Domain**: Entities, repository contracts (abstract), business exceptions. No framework or ORM.
- **Application**: Use cases only. Orchestrate repositories and enforce business rules.
- **Infrastructure**: SQLAlchemy models, repository implementations, security (JWT, password hashing), external clients.
- **Presentation**: FastAPI routes, Pydantic schemas, dependencies (auth, roles, DB). No business logic in routes.

### Frontend (Feature-first)

- **features/auth**, **features/users**, **features/inventory**, **features/warehouses**, **features/products**: Each with `pages/`, `hooks/`, `services/` (and `components/` where needed).
- **components/**: Shared UI (buttons, inputs, table, guards, layout).
- **services/apiClient.js**: Central Axios client with JWT and error handling.
- **Guards**: `PrivateRoute`, `RoleGuard` for ADMIN, WAREHOUSE_MANAGER, PROCESS_LEADER.

---

## Main Features

### 1. Automatic count number (inventory session)

- **Rule**: Maximum 3 inventory sessions per warehouse per month; count number is **1**, **2**, or **3**.
- **Behaviour**: The backend **computes** `count_number` when creating a session: it looks at existing sessions for that warehouse and month and sets `count_number = last_count_number + 1`. The frontend does **not** send `count_number`.
- **Validation**: If 3 sessions already exist for that month/warehouse, the API returns a business rule error (400).

### 2. i18n (Internationalization)

- **Stack**: `react-i18next` + `i18next`.
- **Location**: `frontend/src/i18n/` (`index.js`, `en.json`, `es.json`).
- **Usage**: All UI strings go through `useTranslation()` and keys (e.g. `login.title`, `users.createUser`, `inventorySessions.title`). No hardcoded user-facing text.
- **Persistence**: Selected language is stored in `localStorage` (`la-soberana-lang`) and restored on load.
- **Selector**: Language switcher (EN/ES) in the navbar when the user is logged in.

### 3. Admin dashboard – Inventory sessions

- **Endpoint**: `GET /inventory-sessions/` (ADMIN only). Optional query params: `warehouse_id`, `month` (YYYY-MM), `status` (open | closed).
- **Response**: List of sessions with warehouse description, month, count number, created_at, closed_at, and **products count** (number of count records).
- **Frontend**: `AdminSessionsPage` at `/admin-sessions` (RoleGuard ADMIN). Table with filters (warehouse, month, status), no manual UUID input.

### 4. Warehouses list and autocomplete

- **Endpoint**: `GET /warehouses/` (ADMIN, WAREHOUSE_MANAGER). Returns `id`, `code`, `description`, `status`.
- **Frontend**: `warehousesService.getWarehouses()`. Warehouse autocomplete used in:
  - Create User (multi-select warehouses).
  - Create Inventory Session (single warehouse).
  - Admin Sessions filter (single warehouse).

### 5. Session–product association (via inventory_counts only – Option A)

- **Single source of truth**: `inventory_counts` is both the association (session + product) and the count (quantity_packages, quantity_units). There is **no** separate `inventory_session_products` table. UniqueConstraint(session_id, product_id) on `inventory_counts` prevents duplicate product per session.
- **Endpoints**:
  - `POST /inventory-sessions/{id}/products` – body `{ "product_ids": [UUID, ...] }`. Creates 0-quantity count rows for each product (skips if already present). Only ADMIN or WAREHOUSE_MANAGER.
  - `GET /inventory-sessions/{id}/products` – list of product summaries (product_id, code, description) **derived from** rows in `inventory_counts` for that session. Same roles.
- **Frontend**: After creating a session, the user can add products via a multi-select autocomplete; the backend stores them as 0-quantity counts. Registering a real count later updates the same row (one count per product per session).

### 6. Products list

- **Endpoint**: `GET /products/` (ADMIN, WAREHOUSE_MANAGER). Returns active products (`id`, `code`, `description`) for autocomplete and session-product association.

---

## Inventory model: Option A (single source of truth)

**Diagnóstico**: Existía `inventory_session_products` (solo session_id, product_id) y `inventory_counts` (session_id, product_id, quantities). La asociación sesión–producto quedaba duplicada y el conteo real solo en counts, generando inconsistencia.

**Opción elegida: A.** Eliminar `inventory_session_products` y usar solo `inventory_counts` como tabla de relación + conteo.

- **Por qué A y no B**: (A) Una sola tabla: una fila por (sesión, producto) con cantidades; UniqueConstraint evita duplicados; trazabilidad con created_at/updated_at. (B) Mantener una tabla intermedia y que counts referencie `session_product_id` añade complejidad sin beneficio: seguiríamos teniendo que escribir en dos sitios y el “valor” de la entidad agregada no aporta frente a tener solo counts.
- **Validaciones**: No duplicar producto por sesión (UniqueConstraint en counts); sesión no cerrada para añadir productos; conteo automático y flujo existentes se mantienen.

---

## Migrations (Alembic)

- **e05f9b7c3d4f**: Option A – remove `inventory_session_products`. Data migrated into `inventory_counts` (0 quantity where needed); table dropped. Downgrade recreates the table (empty).
- **inventory_counts** has UniqueConstraint(session_id, product_id); no separate association table.
- Run: `alembic upgrade head` (from backend root).

---

## Testing

- **Auto count**: `tests/unit/test_create_inventory_session_use_case.py` – first/second/third session get count 1/2/3; fourth raises.
- **Session products (Option A)**: `tests/unit/test_add_products_to_session_use_case.py` – add via 0-quantity counts; no duplicate; session not found / closed session / product not found raise.
- **Warehouses**: `tests/test_warehouses_endpoint.py` – 401 without token; 200 with ADMIN or WAREHOUSE_MANAGER token.

Run: `pytest tests/ -v`

---

## Running the app

- **Backend**: From `backend/`, install deps, set `.env` (e.g. `DATABASE_URL`), run `alembic upgrade head`, then `uvicorn app.main:app`.
- **Frontend**: From `frontend/`, `npm install`, `npm run dev`. Set `VITE_API_URL` if the API is not on the default URL.

---

## Summary of changes (no architecture reduction)

1. **i18n**: react-i18next, en/es, language selector in navbar, all copy via `t()`.
2. **GET /warehouses/**: List use case, repository `list_all`, route, frontend service + warehouse autocomplete in Create User and Create Session (and admin sessions filter).
3. **Automatic count_number**: Removed from request DTO and UI; use case computes it; max 3 per month with clear error.
4. **GET /inventory-sessions/**: Filters, list use case, session list with warehouse and products count; AdminSessionsPage with table and filters.
5. **inventory_session_products**: New table, entity, repository, migrations, POST/GET session products; frontend product multi-select after session create.
6. **GET /products/**: List products for autocomplete and session-product association.
7. **UX**: Warehouse and product autocompletes everywhere; loading and error handling in forms; no manual UUID typing for warehouse/product.
8. **Tests**: Auto count, session products (no duplicate, not found), warehouses endpoint.
9. **README**: Architecture and feature description as above.
