# La Soberana – Sistema de Conteo Mensual de Inventarios

Aplicación web fullstack para la **gestión mensual de conteo de inventarios** por bodega. Incluye autenticación JWT, acceso por roles (ADMIN, WAREHOUSE_MANAGER, PROCESS_LEADER), sesiones de inventario (máximo 3 por bodega y mes), registro de conteos con conversión automática de unidades, gestión de usuarios y bodegas, unidades de medida, feature flags y sincronización de usuarios desde API externa.

---

## Índice

1. [Descripción del proyecto](#1-descripción-del-proyecto)
2. [Arquitectura general](#2-arquitectura-general)
3. [Estructura del proyecto](#3-estructura-del-proyecto)
4. [Modelo de datos resumido](#4-modelo-de-datos-resumido)
5. [Variables de entorno](#5-variables-de-entorno)
6. [Ejecución local](#6-ejecución-local)
7. [Ejecución con Docker](#7-ejecución-con-docker)
8. [Testing](#8-testing)
9. [CI/CD](#9-cicd)
10. [Decisiones técnicas](#10-decisiones-técnicas)

---

## 1. Descripción del proyecto

**La Soberana** es un monolito formado por:

- **Backend**: FastAPI con **arquitectura hexagonal** (Clean Architecture), diseño centrado en el dominio, casos de uso e infraestructura en los bordes.
- **Frontend**: SPA en React (Vite) con organización **feature-first**, i18n (EN/ES) y guards de rutas por rol.
- **Base de datos**: PostgreSQL 15.
- **Orquestación**: Docker y docker-compose para desarrollo; GitHub Actions para CI/CD.

### Capacidades principales

| Área | Funcionalidad |
|------|----------------|
| **Auth** | JWT (Bearer), login, usuario actual; el token incluye `role` y `warehouses`. |
| **Roles** | **ADMIN** (acceso total), **WAREHOUSE_MANAGER** (bodegas asignadas), **PROCESS_LEADER** (solo lectura). |
| **Sesiones de inventario** | Crear sesión (count_number 1–3 automático), máximo 3 por bodega y mes; cerrar (ADMIN); añadir productos (conteos a 0). |
| **Conteos** | Un registro por (sesión, producto); conversión automática de unidades (paquetes × factor = unidades). |
| **Usuarios** | CRUD; sincronización desde API externa (p. ej. randomuser.me o mock). |
| **Bodegas** | Listado; filtro por rol (ADMIN: todas; WAREHOUSE_MANAGER: asignadas). |
| **Unidades de medida** | CRUD; usadas por productos y conteos. |
| **Feature flags** | CRUD; p. ej. restringir creación de sesiones a los 3 primeros días del mes. |

---

## 2. Arquitectura general

### Backend (Clean Architecture / Hexagonal)

| Capa | Ubicación | Responsabilidad |
|------|-----------|-----------------|
| **Domain** | `app/domain/` | Entidades, interfaces de repositorios, servicios de dominio (p. ej. `UnitConversionService`), excepciones. Sin framework ni ORM. |
| **Application** | `app/application/` | Casos de uso (uno por acción), servicios de aplicación (p. ej. `FeatureFlagService`). Orquestan repositorios y aplican reglas de negocio. |
| **Infrastructure** | `app/infrastructure/` | Modelos SQLAlchemy, implementaciones de repositorios, sesión de BD, JWT, hash de contraseñas, clientes externos (p. ej. RandomUser), seeders. |
| **Presentation** | `app/presentation/` | Rutas FastAPI, esquemas Pydantic, dependencias (`get_db`, `get_current_user`, `require_roles`, `assert_warehouse_access`), manejadores de excepciones, middleware. |

**Patrones**: Repository (interfaces en dominio, implementaciones en infraestructura), inyección de dependencias a nivel de ruta (sin contenedor DI), un caso de uso por operación.

### Frontend (Feature-first)

| Área | Ubicación | Responsabilidad |
|------|-----------|-----------------|
| **Features** | `src/features/` | `auth`, `users`, `inventory`, `warehouses`, `products`, `measures`, `featureFlags`. Cada uno con `pages/`, `hooks/`, `services/` y opcionalmente `components/`. |
| **Compartido** | `src/components/`, `src/context/`, `src/services/` | Layout, guards (`PrivateRoute`, `RoleGuard`), `AuthContext`, `apiClient` (Axios + JWT + logout en 401). |
| **App** | `src/app/` | Router, providers. |

**Estado**: Sin Redux; estado global en `AuthContext` (token, usuario, login, logout). Estado del servidor mediante hooks de cada feature que llaman a los servicios de la API.

---

## 3. Estructura del proyecto

```
Soberana/
├── backend/
│   ├── app/
│   │   ├── domain/           # Entidades, interfaces de repositorios, servicios de dominio, excepciones
│   │   ├── application/      # Casos de uso, servicios de aplicación
│   │   ├── infrastructure/   # BD, modelos, repositorios, seguridad, externos, seeders
│   │   └── presentation/     # Rutas, schemas, dependencias, exception_handlers, middleware
│   ├── migrations/           # Alembic
│   ├── tests/                # pytest (unit + integration)
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── app/              # Router, providers
│   │   ├── components/       # UI compartida, guards, layout
│   │   ├── context/          # AuthContext
│   │   ├── features/         # auth, users, inventory, warehouses, products, measures, featureFlags
│   │   ├── services/         # apiClient
│   │   ├── constants/       # ROLES, etc.
│   │   ├── i18n/             # en.json, es.json
│   │   └── theme/            # SCSS, estilos globales
│   ├── package.json
│   ├── Dockerfile
│   └── Dockerfile.dev
├── .github/workflows/        # backend-ci, frontend-ci, docker-ci
├── docker-compose.dev.yml    # db, backend, frontend (dev con hot reload)
└── docs/                     # ARQUITECTURA_PROYECTO_SOBERANA.md, etc.
```

---

## 4. Modelo de datos resumido

| Entidad | Atributos principales | Notas |
|--------|------------------------|--------|
| **User** | id, identification, name, email, role, hashed_password, warehouses (M2M), is_active, last_login | Roles: ADMIN, WAREHOUSE_MANAGER, PROCESS_LEADER. |
| **Warehouse** | id, code, description, is_active, status, status_description | Usuarios asignados vía `user_warehouses`. |
| **InventorySession** | id, warehouse_id, month, count_number (1–3), created_by, created_at, closed_at | Máximo 3 sesiones por bodega y mes. |
| **InventoryCount** | id, session_id, product_id, measure_unit_id, quantity_packages, quantity_units | Una fila por (sesión, producto); único (session_id, product_id). |
| **Product** | id, code, description, inventory_unit_id, packaging_unit_id, conversion_factor, is_active | Unidades y conversión usadas en el registro de conteos. |
| **MeasurementUnit** | id, name, abbreviation, is_active | Referenciada por productos y conteos. |
| **FeatureFlag** | id, name, enabled, etc. | Usada para reglas (p. ej. fechas de creación de sesiones). |

**Relaciones**: User ↔ Warehouse (M2M); InventorySession → Warehouse, User (created_by); InventorySession → InventoryCount (1:N); InventoryCount → Product, MeasurementUnit; Product → MeasurementUnit (inventory_unit, packaging_unit).

---

## 5. Variables de entorno

### Backend

| Variable | Descripción | Por defecto / ejemplo |
|----------|-------------|------------------------|
| `DATABASE_URL` | URL de conexión PostgreSQL | `postgresql://postgres:postgres@localhost:5432/postgres` |
| `SECRET_KEY` | Clave para firma JWT | **Debe configurarse en producción** (no usar valor por defecto en prod). |
| `ALGORITHM` | Algoritmo JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | TTL del token | `60` |
| `CORS_ORIGINS` | Orígenes permitidos (separados por coma) | `http://localhost:5173,http://127.0.0.1:5173` |
| `AUTO_SEED_MASTER_DATA` | Sembrar datos maestros al arrancar | `true` / `false` |
| `AUTO_SYNC_USERS` | Sincronizar usuarios desde API al arrancar | `true` / `false` |
| `USER_SYNC_MODE` | Origen de sincronización de usuarios | `mock` o `external` |
| `RANDOM_USER_API_URL` | URL base de la API externa de usuarios | p. ej. `https://randomuser.me/api/` |

### Frontend

| Variable | Descripción | Por defecto |
|----------|-------------|-------------|
| `VITE_API_URL` | URL base de la API del backend | `http://localhost:8000` |
| `VITE_RANDOM_USER_API_URL` | (Opcional) API de usuarios aleatorios para sincronización desde el navegador | — |

---

## 6. Ejecución local

### Requisitos previos

- Python 3.11, Node 20, PostgreSQL 15 (o usar solo Docker para la BD).
- Backend: crear `.env` en `backend/` con al menos `DATABASE_URL` y `SECRET_KEY`.

### Backend

```bash
cd backend
pip install -r requirements.txt
# Configurar .env: DATABASE_URL, SECRET_KEY, etc.
alembic upgrade head
uvicorn app.main:app --reload
```

API: `http://localhost:8000`. Documentación: `http://localhost:8000/docs`.

### Frontend

```bash
cd frontend
npm install
# Opcional: .env con VITE_API_URL si la API no está en http://localhost:8000
npm run dev
```

Aplicación: `http://localhost:5173`.

### Admin por defecto (con seed)

Si `AUTO_SEED_MASTER_DATA` está activado (p. ej. en Docker), se crea un usuario admin por defecto al arrancar (ver seeders del backend). Usar esas credenciales para iniciar sesión.

---

## 7. Ejecución con Docker

Stack de desarrollo con hot reload (código montado como volúmenes):

```bash
docker compose -f docker-compose.dev.yml up --build
```

| Servicio | Puerto | Notas |
|----------|--------|--------|
| **db** | 5433 (host) | PostgreSQL 15; healthcheck antes de arrancar el backend. |
| **backend** | 8000 | Ejecuta `alembic upgrade head` y luego `uvicorn --reload`. Env: `AUTO_SEED_MASTER_DATA`, `AUTO_SYNC_USERS`, `USER_SYNC_MODE`. |
| **frontend** | 5173 | Servidor de desarrollo Vite; `npm install && npm run dev`. |

- Datos de BD: volumen `postgres_data_dev`.
- El backend usa `DATABASE_URL=postgresql://postgres:postgres@db:5432/postgres` dentro de la red.
- El admin por defecto se crea en el primer arranque del backend cuando el seed está activado.

Imágenes tipo producción (sin compose por defecto): `backend/Dockerfile` (Python 3.11-slim, migraciones + uvicorn); `frontend/Dockerfile` (build Node + nginx).

---

## 8. Testing

### Backend

- **Runner**: `pytest`.
- **Ubicación**: `backend/tests/` (unitarios en `tests/unit/`).
- **Ejecución** (desde `backend/`):

  ```bash
  python -m pytest tests/ -v --tb=short
  ```

- **Requisitos**: `DATABASE_URL` y `SECRET_KEY` (en CI se usa el servicio Postgres y el env del workflow). En CI usar `AUTO_SYNC_USERS=false` y `AUTO_SEED_MASTER_DATA=false`.
- **Cobertura**: Creación de sesiones (count_number automático, máximo 3 por mes), añadir productos a sesión (conteos a 0, sin duplicados, validaciones), conversión de unidades, endpoint de bodegas (401 sin token, 200 con rol válido), validación de auth, health.

### Frontend

- **CI**: Type check (`tsc --noEmit`), lint (si existe el script), build (`npm run build`). No hay suite de tests de frontend en el repo por defecto; se puede añadir p. ej. Vitest + React Testing Library si se requiere.

---

## 9. CI/CD

Workflows de GitHub Actions (se disparan en push/PR a `main`, `master` o `develop`):

| Workflow | Paths | Propósito |
|----------|--------|-----------|
| **Backend CI** | `backend/**`, archivo del workflow | Python 3.11, servicio Postgres 15, instalar deps, migraciones, verificar carga de la app, ejecutar `pytest tests/ -v --tb=short`. |
| **Frontend CI** | `frontend/**`, archivo del workflow | Node 20, `npm ci`, type check, lint (si existe), build. |
| **Docker CI** | Dockerfiles de backend/frontend, compose, archivo del workflow | Construir imágenes de backend y frontend (sin push). Valida que las imágenes se construyan. |

- Env de Backend CI: `DATABASE_URL`, `SECRET_KEY`, `AUTO_SYNC_USERS`, `AUTO_SEED_MASTER_DATA`.
- Para despliegue (p. ej. push a registro), añadir secrets del repositorio y ampliar los workflows o añadir jobs de deploy.

---

## 10. Decisiones técnicas

| Decisión | Justificación |
|----------|----------------|
| **Clean Architecture (backend)** | Mantiene el dominio y las reglas de negocio independientes del framework y la BD; los casos de uso son testeables con mocks; la infraestructura es intercambiable (p. ej. otra BD o otro auth). |
| **Feature-first (frontend)** | Alinea la estructura con las capacidades del producto; cada feature tiene sus páginas, hooks y servicios; lo compartido en `components/` y `services/`; más fácil escalar y incorporar desarrolladores. |
| **JWT en cabecera Authorization** | Auth sin estado; el frontend guarda el token (p. ej. en localStorage) y envía `Authorization: Bearer <token>`. En producción conviene valorar tokens de corta vida, refresh o cookies httpOnly para reducir impacto de XSS. |
| **Roles en JWT + lista de bodegas** | Backend y frontend aplican permisos sin peticiones extra; la lista de bodegas en el token permite comprobaciones a nivel de recurso (p. ej. `assert_warehouse_access`). |
| **Una sola tabla sesión–producto y conteo** | `inventory_counts` es la única fuente de verdad: una fila por (sesión, producto) con cantidades; restricción única evita duplicados; no hay tabla de asociación aparte. |
| **Máximo 3 sesiones por bodega y mes** | Regla de negocio: count_number 1–3 asignado automáticamente; la cuarta sesión devuelve 400; implementado en el caso de uso y cubierto por tests. |
| **Conversión de unidades en el dominio** | `UnitConversionService` en dominio; el registro de conteo usa el factor de conversión del producto (p. ej. paquetes × factor = unidades); la lógica queda en un solo lugar. |
| **Feature flags** | Flags a nivel de aplicación (p. ej. restringir creación de sesiones a los 3 primeros días del mes) permiten cambiar comportamiento sin desplegar código; CRUD para admins. |
| **Sincronización de usuarios desde API externa** | Integración opcional (p. ej. randomuser.me o mock) para poblar usuarios; el caso de uso de sync es inyectable (el fetcher se pasa desde presentación/seeder); no se duplican emails. |
| **PostgreSQL** | Modelo relacional, UUIDs, restricciones (p. ej. único sesión+producto), migraciones con Alembic; encaja con inventarios y relaciones usuario/bodega. |
| **Docker Compose para dev** | Un solo comando para levantar BD + backend + frontend con hot reload; mismo stack que el CI para los tests del backend. |

---

## Referencia rápida

| Área | Stack / convención |
|------|--------------------|
| Backend | FastAPI, Clean Architecture, SQLAlchemy, Alembic, JWT (python-jose), bcrypt |
| Frontend | React 18, Vite, React Router, MUI, Axios, react-i18next (EN/ES) |
| BD | PostgreSQL 15 |
| Auth | JWT Bearer; roles: ADMIN, WAREHOUSE_MANAGER, PROCESS_LEADER |
| Sesiones | Máx. 3 por bodega y mes; count_number 1–3 asignado automáticamente |
| Conteos | Uno por (sesión, producto); unidades = paquetes × conversion_factor |

Para onboarding técnico detallado y flujo de datos, ver [docs/ARQUITECTURA_PROYECTO_SOBERANA.md](docs/ARQUITECTURA_PROYECTO_SOBERANA.md). Para historial de versiones, ver [PatchNotes.md](PatchNotes.md).
