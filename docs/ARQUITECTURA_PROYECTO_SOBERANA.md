# La Soberana – Technical Architecture & Onboarding

This document describes the **La Soberana** project as a software architect would: architecture, structure, auth, data model, business logic, frontend, backend, integrations, testing, deployment, and recommendations.

**Project documentation:** The repository keeps only three markdown files: [Readme.md](../Readme.md) (overview and run instructions), this file (technical architecture), and [PatchNotes.md](../PatchNotes.md) (release notes).

---

## 1. Architecture Overview

### Type of architecture

- **Monolith**: Single deployable backend and single frontend SPA. No microservices.
- **Backend**: **Clean Architecture** (domain-centric, use cases, infrastructure at the edges).
- **Frontend**: **Feature-first** (features own pages, hooks, services, components).

### Organization of frontend and backend

| Layer        | Location        | Role |
|-------------|------------------|------|
| **Backend** | `backend/`       | FastAPI app, Clean Architecture (domain, application, infrastructure, presentation). |
| **Frontend**| `frontend/`      | React + Vite SPA, feature-based modules, shared components and services. |

### Patterns used

- **Backend**
  - **Clean Architecture**: Domain (entities, repository contracts, domain services) → Application (use cases) → Infrastructure (DB, JWT, external APIs) → Presentation (routes, schemas, dependencies).
  - **Repository**: Abstract interfaces in `domain/repositories/`, implementations in `infrastructure/repositories/`.
  - **Use case per action**: One class per operation (e.g. `CreateInventorySessionUseCase`, `RegisterInventoryCountUseCase`).
  - **Dependency injection**: Repositories and services are instantiated in routes and passed into use cases (no DI container).
- **Frontend**
  - **Feature modules**: `features/auth`, `features/users`, `features/inventory`, `features/warehouses`, `features/products`, `features/measures`, `features/featureFlags`.
  - **Context for auth**: `AuthContext` holds token and user (from JWT), provides `login`/`logout`/`isAuthenticated`.
  - **Route guards**: `PrivateRoute` (auth), `RoleGuard` (role-based access) wrap routes.

---

## 2. Code Structure

### Backend (`backend/app/`)

```
app/
├── domain/                    # No framework/ORM dependencies
│   ├── entities/              # Pure data structures (User, InventorySession, InventoryCount, Product, etc.)
│   ├── repositories/          # Abstract interfaces (e.g. InventorySessionRepository)
│   ├── services/              # Domain services (e.g. UnitConversionService)
│   └── exceptions/            # BusinessRuleViolation, NotFoundException
├── application/               # Use cases + application services
│   ├── use_cases/             # login, create_inventory_session, register_inventory_count, list_*, etc.
│   └── services/              # FeatureFlagService (application-level)
├── infrastructure/            # DB, external world
│   ├── database/              # SQLAlchemy Base, session
│   ├── models/                # SQLAlchemy models (UserModel, InventorySessionModel, …)
│   ├── repositories/         # Repository implementations
│   ├── security/              # JWT, password hashing
│   ├── external/              # RandomUserClient (randomuser.me)
│   ├── mock/                  # Mock user fetcher (Faker)
│   ├── seeders/               # Master data, default admin, feature flags
│   └── logging/
└── presentation/              # HTTP layer
    ├── routes/                # auth, inventory_session, user_managment, warehouse, product, measurement_unit, feature_flag, mock
    ├── schemas/               # Pydantic request/response
    ├── dependencies/         # get_db, get_current_user, require_roles, assert_warehouse_access
    ├── exception_handlers.py  # BusinessRuleViolation → 400, NotFoundException → 404
    └── middleware/            # Logging
```

### Frontend (`frontend/src/`)

```
src/
├── app/                 # Router, providers
├── components/          # Shared UI and layout (guards, Navbar, Sidebar, Table, DashboardCard, etc.)
├── context/             # AuthContext
├── features/            # Feature modules
│   ├── auth/            # Login, Dashboard (pages, services)
│   ├── users/           # UsersPage, EditUserDialog, useUsers, usersService
│   ├── inventory/      # AdminSessionsPage, CreateSessionPage, RegisterCountPage, ViewCountsPage, hooks, services
│   ├── warehouses/      # WarehouseAutocomplete, warehousesService
│   ├── products/        # Product autocomplete, services
│   ├── measures/        # MeasuresPage (measurement units)
│   └── featureFlags/    # FeatureFlagsAdminPage, useFeatureFlags
├── services/            # apiClient.js (Axios + JWT + 401 logout)
├── constants/           # ROLES, ROLE_OPTIONS, ROLE_LABELS
├── i18n/                # en.json, es.json, react-i18next
├── theme/               # SCSS tokens, global styles
└── main.jsx
```

### Main domains / modules

- **Auth**: Login, JWT, current user.
- **Users**: CRUD, sync from API (mock or randomuser.me), role and warehouse assignment.
- **Warehouses**: List, filter by role (ADMIN sees all; WAREHOUSE_MANAGER by assignment).
- **Inventory sessions**: Create (with auto count_number 1–3), list with filters, close (ADMIN), add products (as 0-quantity counts).
- **Inventory counts**: Register one count per (session, product); list counts for a session.
- **Products**: List active products for autocomplete and session-product association.
- **Measurement units**: CRUD, used by products and counts.
- **Feature flags**: CRUD; e.g. restrict session creation to first 3 days of month.

### Data flow (high level)

1. **Request**: Frontend → Axios (apiClient) with `Authorization: Bearer <token>` → FastAPI route.
2. **Auth**: `get_current_user` (JWT) → optional `require_roles([...])` → optional `assert_warehouse_access` when resource is warehouse-scoped.
3. **Handler**: Route builds repositories and use case, calls `use_case.execute(...)`.
4. **Use case**: Uses only domain entities and repository interfaces; enforces business rules; returns entity or raises domain exceptions.
5. **Response**: Exception handlers map `BusinessRuleViolation` → 400, `NotFoundException` → 404; otherwise Pydantic schemas to JSON.
6. **Frontend**: Stores token in `localStorage`; on 401, apiClient clears token and dispatches `auth:logout`; AuthContext updates and redirects to login.

---

## 3. Authentication and Roles

### Roles

Defined in backend `app/domain/entities/user_role.py` and frontend `src/constants/roles.js`:

| Role               | Value             | Purpose |
|--------------------|-------------------|--------|
| **ADMIN**          | `ADMIN`           | Full access: users, measures, feature flags, all warehouses, create/close sessions, register counts, view counts. |
| **WAREHOUSE_MANAGER** | `WAREHOUSE_MANAGER` | Create sessions and register counts only for assigned warehouses; list sessions for those warehouses. |
| **PROCESS_LEADER** | `PROCESS_LEADER`  | View-only: list sessions and view counts (no create/close, no register count). |

### Where permissions are enforced

- **Backend**
  - **Route level**: `require_roles([UserRole.ADMIN, ...])` on each route (FastAPI `Depends`). Example from `inventory_session_routes.py`:

    ```python
    current_user = Depends(require_roles([UserRole.ADMIN, UserRole.WAREHOUSE_MANAGER]))
    ```

  - **Resource level**: For warehouse-scoped operations (e.g. add products to a session), after loading the session, `assert_warehouse_access(current_user, session.warehouse_id)` is called. ADMIN bypasses; WAREHOUSE_MANAGER must have that warehouse in `current_user["warehouses"]`.
  - **Use case level**: Use cases receive `user_warehouse_ids` and `is_admin` and enforce rules (e.g. “user can only create sessions for assigned warehouses”, “user cannot register count for a warehouse they don’t have”).

- **Frontend**
  - **Route protection**: `PrivateRoute` redirects unauthenticated users to `/login`. `RoleGuard` redirects to `/dashboard` if `user.role` is not in `allowedRoles` for that route (see `router.jsx`).

### Middleware, guards, policies

- **Backend**
  - **Middleware**: CORS, `LoggingMiddleware`. No auth middleware; auth is per-route via `get_current_user` and `require_roles`.
  - **Dependencies**: `get_current_user` (JWT validation), `require_roles(allowed_roles)`, `assert_warehouse_access(current_user, warehouse_id)` (used when warehouse is known at runtime).

- **Frontend**
  - **Guards**: `PrivateRoute` (auth), `RoleGuard` (role). No policy objects; role list is passed as prop: `<RoleGuard allowedRoles={['ADMIN', 'WAREHOUSE_MANAGER']}>`.

### JWT payload

Created in `LoginUseCase` and decoded in `get_current_user`:

- `sub`: user id (string)
- `role`: `user.role.value` (ADMIN, WAREHOUSE_MANAGER, PROCESS_LEADER)
- `warehouses`: list of warehouse id strings the user is assigned to

Frontend stores the token in `localStorage` and parses it in `AuthContext` to get `user` (including `role`) for guards and UI.

---

## 4. Data Model

### Main entities (domain)

- **User**: id, identification, name, email, role (UserRole), hashed_password, warehouses (list of UUID), is_active, last_login, created_at, updated_at.
- **InventorySession**: id, warehouse_id, month, count_number (1–3 per warehouse per month), created_by, created_at, closed_at.
- **InventoryCount**: id, session_id, product_id, measure_unit_id, quantity_packages, quantity_units, created_at, updated_at. One row per (session, product) (unique constraint).
- **Product**: id, code, description, inventory_unit, packaging_unit, conversion_factor, is_active, created_at, updated_at.
- **Warehouse**: id, code, description, is_active, status, status_description, created_at, updated_at.
- **MeasurementUnit**: id, name, abbreviation, is_active, etc.

### Relationships

- **User ↔ Warehouse**: Many-to-many via `user_warehouses` (user_id, warehouse_id). Cascade delete on the association table.
- **InventorySession**: Belongs to **Warehouse** and **User** (created_by). Has many **InventoryCount**.
- **InventoryCount**: Belongs to **InventorySession** and **Product**; has **MeasurementUnit** (measure_unit_id). Unique (session_id, product_id).
- **Product**: References two **MeasurementUnit** (inventory_unit_id, packaging_unit_id).

### Inventories, warehouses, counts, users (summary)

- **Warehouses**: Stored in `warehouses`; users are assigned via `user_warehouses`. Only active warehouses are listed for session creation and filters.
- **Inventory sessions**: One per (warehouse, month, count_number). count_number is 1, 2, or 3 (max 3 sessions per warehouse per month). Sessions can be open or closed (closed_at set by close action).
- **Counts**: Stored only in `inventory_counts`. Adding a product to a session creates a row with quantity 0; registering a count creates or (if the design allowed it later) could update that row. Currently the use case **registers** a new count and the repository checks `exists_by_session_and_product` and raises if already counted (one count per product per session).
- **Users**: Stored in `users`; passwords hashed; roles and warehouse assignments drive JWT and backend/frontend permissions.

---

## 5. Business Logic

### How an inventory count is “registered”

1. **Endpoint**: `POST /inventory-sessions/{session_id}/counts` with body `{ product_id, packaging_quantity, measure_unit_id? }`.
2. **Use case**: `RegisterInventoryCountUseCase.execute(session_id, product_id, packaging_quantity, user_warehouse_ids, is_admin, measure_unit_id)`:
   - Load session; if not found → `NotFoundException`; if `closed_at` set → `BusinessRuleViolation`.
   - If not admin, check `session.warehouse_id in user_warehouse_ids`; otherwise → `BusinessRuleViolation`.
   - Load product; if not found → `NotFoundException`.
   - If a count already exists for (session_id, product_id) → `BusinessRuleViolation` (“already been counted”).
   - Unit: use `measure_unit_id` if provided, else product’s `packaging_unit`. Total units = `packaging_quantity * int(product.conversion_factor)` via `UnitConversionService.calculate_total_units`.
   - Create domain `InventoryCount` and save via repository.

So “register” is **create once** per (session, product). There is no update-count or “recount” endpoint in the analyzed code; the “max 3” rule refers to **sessions per month** (count_number 1–3), not to three recounts of the same product.

### Important validations

- **Sessions**
  - Max 3 sessions per warehouse per month; count_number auto 1, 2, or 3.
  - Optional feature flag: session creation only on days 1–3 of the month.
  - Only open sessions can receive new products or new counts; only ADMIN can close.
- **Counts**
  - Session must be open; user must have warehouse access (or be ADMIN).
  - One count per product per session (unique constraint + use case check).
- **Products in session**
  - Add products creates 0-quantity count rows; no duplicate product per session; session must be open.

### “Reconteos” (max 3)

- In this codebase, **max 3** applies to **inventory sessions per warehouse per month** (count_number 1, 2, 3), not to “recounts” of the same product.
- If “reconteos” is meant as “up to 3 edits or recounts per product,” that logic is **not** present: the current design allows a single count per (session, product) and raises if you try to register again.

### Unit conversion

- **UnitConversionService** (domain): `calculate_total_units(packaging_quantity, factor) = packaging_quantity * factor`. Used when registering a count: `quantity_units = factor * packaging_quantity` (factor from product’s conversion_factor).

---

## 6. Frontend

### UI organization

- **Layout**: `AppLayout` (Navbar + Sidebar) wraps all private routes. Login is full-screen without layout.
- **Features**: Each feature has `pages/`, `hooks/`, `services/` (and `components/` when needed). Shared components live under `components/` (e.g. Table, DashboardCard, MonthPicker, WarehouseAutocomplete).
- **i18n**: All user-facing strings via `useTranslation()` and keys in `en.json` / `es.json`; language in `localStorage` (`la-soberana-lang`).

### State management

- **No Redux**. Global state is minimal: **AuthContext** (token, user, login, logout, isAuthenticated). Server state is handled with **hooks** that call API services (e.g. `useUsers`, `useAdminSessions`, `useCreateSession`); components use loading/error/data from those hooks.

### Route protection by role

- **PrivateRoute**: Renders children only if `isAuthenticated`; otherwise redirects to `/login`.
- **RoleGuard**: Renders children only if `user?.role` is in `allowedRoles`; otherwise redirects to `/dashboard`.
- Example from `router.jsx`:

  - `/users`, `/measures`, `/feature-flags`: `RoleGuard` with `['ADMIN']`.
  - `/admin-sessions`: `['ADMIN', 'PROCESS_LEADER', 'WAREHOUSE_MANAGER']`.
  - `/create-session`, `/register-count/:sessionId`: `['ADMIN', 'WAREHOUSE_MANAGER']`.
  - `/view-counts/:sessionId`: `['ADMIN', 'PROCESS_LEADER']`.

---

## 7. Backend

### Framework

- **FastAPI**. Entry point: `app.main:app`. CORS, lifespan (seed master data, default admin, feature flags), exception handlers for `BusinessRuleViolation` (400) and `NotFoundException` (404), logging middleware.

### Endpoint structure

- **Auth**: `POST /auth/login` (email, password → JWT).
- **Users**: `GET/POST /users`, `GET/PUT /users/{id}`, `POST /users/sync-from-api` (body with `results` from randomuser.me or mock).
- **Warehouses**: `GET /warehouses/`.
- **Inventory sessions**: `GET/POST /inventory-sessions/`, `PUT /inventory-sessions/{id}/close`, `POST/GET /inventory-sessions/{id}/products`, `POST/GET /inventory-sessions/{id}/counts`.
- **Products**: `GET /products/`.
- **Measurement units**: CRUD under a measurement_unit prefix.
- **Feature flags**: CRUD.
- **Health**: `GET /health`.

Roles and warehouse access are enforced per route and, where needed, with `assert_warehouse_access` after resolving the resource.

### Layers

- **Presentation**: Routes, Pydantic schemas, dependencies (DB, auth, roles, warehouse). No business logic in routes.
- **Application**: Use cases and application services (e.g. FeatureFlagService). Orchestrate repositories and domain services.
- **Domain**: Entities, repository interfaces, domain services (UnitConversionService), exceptions.
- **Infrastructure**: SQLAlchemy models and repositories, JWT, password hashing, external clients, seeders.

### Validation and security

- **Validation**: Pydantic on request bodies; use cases validate business rules and raise domain exceptions.
- **Security**: JWT (Bearer) for auth; password hashing (e.g. bcrypt) in login/creation; CORS configured via env; `SECRET_KEY` and `ALGORITHM` from env. No rate limiting or CSRF documented in the analyzed code.

---

## 8. External Integrations

### User sync API

- **Purpose**: Populate users from an external source (e.g. randomuser.me or mock).
- **Backend**: `SyncUsersFromCorporateAPIUseCase` receives an `api_fetcher(limit)` callable. The presentation layer (or seeder) injects either:
  - **RandomUserClient** (httpx to randomuser.me), or
  - **Mock**: `corporate_users_faker.fetch_users` (Faker).
- **Config**: `USER_SYNC_MODE` (mock | external), `AUTO_SYNC_USERS` (e.g. at startup). Sync can also be triggered via `POST /users/sync-from-api` with a body containing `results` (e.g. from frontend-fetched API).
- **Behaviour**: Maps API results to domain User (no duplicate email); creates only new users. Synced users get random role (WAREHOUSE_MANAGER or PROCESS_LEADER), no ADMIN.

### How the API is consumed

- Backend: `RandomUserClient` (or mock) is called from seeder or from the sync endpoint; the use case only sees “fetch N users” and a list of raw dicts. Frontend can call randomuser.me and send `results` in the body to `POST /users/sync-from-api` (subject to `MAX_RESULTS_PER_SYNC`).

---

## 9. Testing and Quality

### Tests (backend)

- **Location**: `backend/tests/`. Unit tests in `tests/unit/`.
- **Examples**:
  - `test_create_inventory_session_use_case.py`: Auto count_number 1/2/3, max 3 per month raises.
  - `test_add_products_to_session_use_case.py`: Add products as 0-quantity counts, no duplicate, session not found/closed/product not found raise.
  - `test_unit_conversion_service.py`: Unit conversion.
  - `test_warehouses_endpoint.py`: 401 without token; 200 with ADMIN or WAREHOUSE_MANAGER.
  - `test_auth_validation.py`, `test_health.py`.
- **Run**: `pytest tests/ -v` (from `backend/`). CI runs with Postgres service and env (e.g. `DATABASE_URL`, `SECRET_KEY`).

### Coverage

- No coverage report or threshold was found in the repo; coverage is not documented here.

### Critical validations covered by tests

- Session creation: count_number assignment and max 3 per month.
- Session products: add products, no duplicate, session state and product existence.
- Warehouses endpoint: auth and role.
- Unit conversion: formula.

---

## 10. Deployment

### Docker

- **Development**: `docker-compose.dev.yml`. Services: `db` (Postgres 15, port 5433), `backend` (build `./backend`, migrations + uvicorn with reload), `frontend` (Vite dev). Env: `AUTO_SEED_MASTER_DATA`, `AUTO_SYNC_USERS`, `USER_SYNC_MODE`. Default admin created on backend start.
- **Backend image**: `backend/Dockerfile` (Python 3.11-slim, `alembic upgrade head && uvicorn app.main:app`). No production compose was inspected.

### CI/CD

- **GitHub Actions**:
  - **Backend CI**: On push/PR to main/master/develop when `backend/**` or workflow file changes. Runs pytest with Postgres service; env: `DATABASE_URL`, `AUTO_SYNC_USERS`, `SECRET_KEY`.
  - **Frontend CI**: Likely lint/build (see `.github/workflows/frontend-ci.yml`).
  - **Docker CI**: See `.github/workflows/docker-ci.yml`.

### Important environment variables

- **Backend**: `DATABASE_URL`, `SECRET_KEY`, `ALGORITHM`, `ACCESS_TOKEN_EXPIRE_MINUTES`, `CORS_ORIGINS`, `AUTO_SEED_MASTER_DATA`, `AUTO_SYNC_USERS`, `USER_SYNC_MODE`.
- **Frontend**: `VITE_API_URL` (default `http://localhost:8000`). Optional: e.g. `VITE_RANDOM_USER_API_URL` for user sync.

---

## 11. Issues and Recommendations

### Code smells / inconsistencies

- **CreateInventorySessionUseCase tests**: Unit tests inject only the session repository; the use case also requires `FeatureFlagService`. Calling `is_enabled(...)` will fail in tests unless the test is updated to pass a mock `FeatureFlagService` (or the use case is refactored to make the flag optional in tests).
- **Typo in route tag**: `user_managment_routes` (management is misspelled); consider renaming to `user_management_routes` for consistency.
- **Exception handler import**: `exception_handlers.py` uses `status` from Starlette; ensure it is imported (e.g. `from starlette import status`) so `status.HTTP_400_BAD_REQUEST` and `status.HTTP_404_NOT_FOUND` resolve.

### Technical risks

- **JWT in localStorage**: Subject to XSS; token theft can impersonate the user. Consider short-lived tokens and refresh flow or httpOnly cookies for production.
- **SECRET_KEY default**: Default `"change-me-in-production"` in code is dangerous if env is not set in production.
- **No rate limiting**: Login and API are not rate-limited in the analyzed code; consider adding for production.

### Technical debt

- **No update count flow**: Only “register” count (create) exists; no “recount” or “update count” endpoint. If business requires editing or multiple recounts per product, the model and use cases need to be extended.
- **Clarify “reconteos”**: If the business rule “max 3 reconteos” means something other than “max 3 sessions per month,” it should be documented and implemented explicitly.
- **Frontend tests**: No frontend tests were found; adding at least smoke or critical-path tests would improve confidence.

### Recommendations

1. **Tests**: Add a mock `FeatureFlagService` to `CreateInventorySessionUseCase` unit tests so they pass and the date-restriction branch is testable.
2. **Auth**: Harden production auth (httpOnly cookie or refresh tokens, no default SECRET_KEY, rate limiting on login).
3. **Documentation**: Document “reconteos” vs “sessions per month” in README or domain docs; add OpenAPI descriptions for key endpoints.
4. **Naming**: Rename `user_managment_*` to `user_management_*` and fix route tags.
5. **Coverage**: Add pytest-cov and a minimum coverage threshold in CI.
6. **Frontend**: Add a minimal test suite (e.g. Vitest + React Testing Library) for login and at least one guarded route.

---

## Quick reference

| Area           | Technology / pattern |
|----------------|----------------------|
| Backend        | FastAPI, Clean Architecture, SQLAlchemy, Alembic, JWT |
| Frontend       | React, Vite, react-i18next, Axios, React Router |
| DB             | PostgreSQL 15 |
| Auth           | JWT (Bearer), role in payload, warehouse list in payload |
| Roles          | ADMIN, WAREHOUSE_MANAGER, PROCESS_LEADER |
| Sessions       | Max 3 per warehouse per month (count_number 1–3) |
| Counts         | One per (session, product); unit conversion: packages × factor = units |

---

*Document generated for onboarding and technical review. For run instructions and feature details, see the main [Readme.md](../Readme.md). See also [PatchNotes.md](../PatchNotes.md) for release notes.*
