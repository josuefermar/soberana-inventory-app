# La Soberana — Project structure and flow

This document describes the architecture, folder structure, and data flow of the full La Soberana project (backend API + frontend).

---

## 1. General architecture

The project is a **full-stack application**:

- **Backend**: FastAPI (Python), layered architecture (domain, application, infrastructure, presentation). REST API with JWT auth and role-based access.
- **Frontend**: React (Vite), feature-first, with shared UI components, guards, and a single API client that talks to the backend.

Communication is **REST over HTTP**: the frontend uses an Axios-based `apiClient` with interceptors (e.g. Bearer token, 401 → logout). CORS is configured in the backend for the frontend origin(s).

---

## 2. Folder structure (whole project)

```
Soberana/
├── backend/                      # FastAPI API (see backend/BACKEND_STRUCTURE_AND_FLOW.md)
│   ├── app/
│   │   ├── main.py               # Entry point; lifespan (seed/sync); CORS; routers
│   │   ├── domain/               # Entities, repository contracts, domain services, exceptions
│   │   ├── application/          # Use cases (auth, user management, inventory, sync)
│   │   ├── infrastructure/       # DB, ORM models, repository impls, seeders, security, logging
│   │   └── presentation/         # Routes, dependencies, schemas, middleware, exception handlers
│   ├── migrations/               # Alembic
│   └── tests/
│
├── frontend/                     # React SPA (see frontend/FRONTEND_STRUCTURE_AND_FLOW.md)
│   └── src/
│       ├── main.jsx              # Mounts App
│       ├── app/                  # App.jsx (error boundary > providers > router), AppProviders, router
│       ├── components/            # Navbar; ui/; layout/; feedback/; guards/
│       ├── context/              # AuthContext
│       ├── features/             # auth, users, inventory (each: components, hooks, services, pages)
│       ├── services/             # apiClient (Axios + interceptors)
│       ├── hooks/                # useSnackbar, useAsync
│       ├── utils/                # errorHandling, dateFormat
│       ├── constants/            # roles
│       └── theme/
│
├── docker-compose.yml            # Production / base
├── docker-compose.dev.yml        # Development
├── docker-compose.prod.yml       # Production override
├── PatchNotes.md
├── TechnicalTestDescription.md
├── PROJECT_STRUCTURE_AND_FLOW.md # This file
├── backend/BACKEND_STRUCTURE_AND_FLOW.md
└── frontend/FRONTEND_STRUCTURE_AND_FLOW.md
```

---

## 3. Backend API routes (summary)

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| `GET` | `/health` | Health check | No |
| `POST` | `/auth/login` | Login; returns JWT | No |
| `POST` | `/users/sync` | Sync users from external API | ADMIN |
| `GET` | `/users/` | List users | ADMIN |
| `POST` | `/users/` | Create user | ADMIN |
| `PUT` | `/users/{user_id}` | Update user | ADMIN |
| `POST` | `/inventory-sessions/` | Create inventory session | ADMIN, WAREHOUSE_MANAGER |
| `POST` | `/inventory-sessions/{session_id}/counts` | Register inventory count | ADMIN, WAREHOUSE_MANAGER |
| `GET` | `/inventory-sessions/{session_id}/counts` | List counts for session | ADMIN, PROCESS_LEADER |

Protected routes use `Authorization: Bearer <token>`. Roles: **ADMIN**, **WAREHOUSE_MANAGER**, **PROCESS_LEADER**. API docs: `/docs`, OpenAPI: `/openapi.json`.

---

## 4. Frontend routes (summary)

| Path | Description | Guards |
|------|-------------|--------|
| `/login` | Login page | Public |
| `/dashboard` | Dashboard (role-based content) | Private |
| `/users` | User management (list, sync, create) | Private, ADMIN |
| `/create-session` | Create inventory session | Private, ADMIN, WAREHOUSE_MANAGER |
| `/register-count/:sessionId` | Register count for a session | Private, ADMIN, WAREHOUSE_MANAGER |
| `/view-counts/:sessionId` | View counts for a session | Private, ADMIN, PROCESS_LEADER |
| `/` | Redirect to `/dashboard` | — |
| `*` | Redirect to `/dashboard` | — |

PrivateRoute redirects unauthenticated users to `/login`. RoleGuard redirects unauthorized roles to `/dashboard`.

---

## 5. End-to-end request flow

1. **User action** in the browser (e.g. submit login, open users page).
2. **Frontend**: Page/hook calls a feature service (e.g. `authService.login`, `usersService.getUsers`).
3. **apiClient**: Axios instance adds `Authorization: Bearer <token>` when present; on 401, AuthContext logs out.
4. **HTTP request** to backend (e.g. `POST /auth/login`, `GET /users/`).
5. **Backend**: CORS → LoggingMiddleware (request_id) → Router → Dependencies (`get_db`, `get_current_user`, `require_roles`) → Use case → Repository → DB.
6. **Response**: JSON (and status). Frontend receives it; hook updates state; UI re-renders.
7. **Errors**: Backend returns 400/404 for business/not-found; frontend uses `getErrorMessage` and shows snackbar or fallback.

---

## 6. Backend layers (summary)

| Layer | Responsibility |
|-------|----------------|
| **Domain** | Entities (User, InventorySession, etc.), repository contracts, domain services (e.g. UnitConversionService), exceptions (BusinessRuleViolation, NotFoundException). |
| **Application** | Use cases: Login, SyncUsers, CreateUser, ListUsers, UpdateUser, CreateInventorySession, RegisterInventoryCount, ListInventoryCounts. |
| **Infrastructure** | DB (SQLAlchemy), ORM models, repository implementations, seeders (master data, users, default admin), JWT + password hashing, logging, external API client. |
| **Presentation** | FastAPI routes, Pydantic schemas, dependencies (get_db, get_current_user, require_roles, require_warehouse_access), exception handlers, logging middleware. |

Startup lifespan: optional `AUTO_SEED_MASTER_DATA`, optional `AUTO_SYNC_USERS`, and always `ensure_default_admin_exists()`.

---

## 7. Frontend layers (summary)

| Layer | Responsibility |
|-------|----------------|
| **App** | Error boundary, providers (theme, router, auth), router (Navbar + routes + guards). |
| **Pages** | Composition only; use hooks and UI components. |
| **Hooks** | Business logic, loading/error state; call feature services. |
| **Services** | API calls only (auth, users, inventory); no UI. |
| **UI / layout** | Dumb components (AppButton, AppTable, PageContainer, etc.). |
| **Guards** | PrivateRoute (auth), RoleGuard (role-based redirect). |
| **Context** | AuthContext (user, login, logout); uses auth service. |

Single shared entry to the API: `services/apiClient.js` (Axios + interceptors + `getErrorMessage`).

---

## 8. Technologies

| Area | Stack |
|------|--------|
| **Backend** | Python, FastAPI, SQLAlchemy, Alembic, Pydantic, JWT, bcrypt (or similar), dotenv. |
| **Frontend** | React 18, Vite, MUI v5, react-router-dom v6, Axios. |
| **DevOps** | Docker, docker-compose (dev/prod). |

---

## 9. Data flow summary

| Direction | What flows |
|-----------|------------|
| **User → Frontend** | Clicks, form input. |
| **Frontend → API** | HTTP requests with optional Bearer token; body/query validated by backend Pydantic. |
| **API → Backend** | Routes → dependencies (db, user) → use cases → repositories → DB. |
| **Backend → API** | Entities / values from use cases → Pydantic DTOs → JSON response. |
| **API → Frontend** | JSON; apiClient parses; hooks set state; UI updates. |
| **Errors** | Backend: 400 (business), 404 (not found), 401 (unauthorized), 403 (forbidden). Frontend: `getErrorMessage`, snackbar or ErrorFallback. |

---

## 10. Related documentation

- **Backend (detailed)**: `backend/BACKEND_STRUCTURE_AND_FLOW.md` — layers, folder tree, all routes, HTTP flow, domain/application/infrastructure/presentation.
- **Frontend (detailed)**: `frontend/FRONTEND_STRUCTURE_AND_FLOW.md` — folder structure, SRP, smart/dumb, error boundary, design system, guards, features, technologies.
