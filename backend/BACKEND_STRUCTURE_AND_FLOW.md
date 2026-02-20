# Backend — Estructura y flujo (La Soberana API)

Este documento describe la arquitectura, la estructura de carpetas y el flujo de datos del backend de La Soberana.

---

## 1. Arquitectura general

El backend sigue una **arquitectura en capas** (Clean Architecture / Hexagonal), separando:

- **Dominio**: entidades y reglas de negocio.
- **Aplicación**: casos de uso (orquestación).
- **Infraestructura**: persistencia, seguridad, logging.
- **Presentación**: API HTTP (FastAPI), rutas, dependencias y manejo de errores.

La **inyección de dependencias** se hace en las rutas: se instancian repositorios concretos y se pasan a los casos de uso, lo que permite cambiar implementaciones (por ejemplo, base de datos) sin tocar el dominio ni los casos de uso.

El **punto de entrada** (`main.py`) usa un **lifespan** de FastAPI: (1) si `AUTO_SEED_MASTER_DATA=true`, se ejecuta `seed_master_data_if_empty()` para poblar almacenes, unidades de medida y productos cuando las tablas están vacías; (2) si `AUTO_SYNC_USERS=true`, se ejecuta `seed_users_if_empty()` para poblar usuarios desde una API externa cuando la base está vacía; (3) siempre se ejecuta `ensure_default_admin_exists()` para garantizar un usuario administrador por defecto.

---

## 2. Estructura de carpetas

```
backend/
├── app/
│   ├── main.py                    # Punto de entrada FastAPI; lifespan (seed opcional)
│   │
│   ├── domain/                    # Capa de dominio
│   │   ├── entities/              # Entidades de negocio (dataclasses)
│   │   │   ├── user.py
│   │   │   ├── user_role.py
│   │   │   ├── inventory_session.py
│   │   │   ├── inventory_count.py
│   │   │   ├── warehouse.py
│   │   │   ├── warehouse_status.py
│   │   │   ├── product.py
│   │   │   └── measurement_unit.py
│   │   ├── repositories/         # Contratos (interfaces abstractas)
│   │   │   ├── user_repository.py
│   │   │   ├── inventory_session_repository.py
│   │   │   ├── inventory_count_repository.py
│   │   │   ├── product_repository.py
│   │   │   ├── measurement_unit_repository.py
│   │   │   └── warehouse_repository.py
│   │   ├── services/             # Servicios de dominio (lógica pura)
│   │   │   └── unit_conversion_service.py
│   │   └── exceptions/
│   │       └── business_exceptions.py  # DomainException, BusinessRuleViolation, NotFoundException
│   │
│   ├── application/               # Capa de aplicación (casos de uso)
│   │   ├── use_cases/
│   │   │   ├── auth/
│   │   │   │   └── login_use_case.py
│   │   │   ├── user_managment/
│   │   │   │   ├── create_user_case.py
│   │   │   │   ├── list_users_case.py
│   │   │   │   └── update_user_case.py
│   │   │   ├── inventory/
│   │   │   │   ├── list_inventory_counts_use_case.py
│   │   │   │   └── register_inventory_count_use_case.py
│   │   │   └── create_inventory_session_use_case.py
│   │   └── sync_users_from_api.py
│   │
│   ├── infrastructure/            # Capa de infraestructura
│   │   ├── database/
│   │   │   └── database.py       # Engine, SessionLocal, Base, GUID
│   │   ├── models/               # Modelos SQLAlchemy (ORM)
│   │   │   ├── user_model.py
│   │   │   ├── warehouse_model.py
│   │   │   ├── inventory_session_model.py
│   │   │   ├── product_model.py
│   │   │   ├── measurement_unit_model.py
│   │   │   ├── inventory_count_model.py
│   │   │   └── associations.py
│   │   ├── repositories/         # Implementaciones de repositorios
│   │   │   ├── user_repository_impl.py
│   │   │   ├── inventory_session_repository_impl.py
│   │   │   ├── inventory_count_repository_impl.py
│   │   │   ├── product_repository_impl.py
│   │   │   ├── measurement_unit_repository_impl.py
│   │   │   └── warehouse_repository_impl.py
│   │   ├── seeders/              # Carga inicial / sincronización
│   │   │   ├── master_data_seeder.py  # seed_master_data_if_empty (almacenes, productos, unidades)
│   │   │   └── user_seeder.py    # seed_users_if_empty (API externa); ensure_default_admin_exists
│   │   ├── external/             # Clientes HTTP / APIs externas
│   │   │   └── random_user_client.py
│   │   ├── security/
│   │   │   ├── jwt_service.py
│   │   │   └── password_hasher.py
│   │   └── logging/
│   │       └── logger.py
│   │
│   └── presentation/              # Capa de presentación (HTTP)
│       ├── routes/
│       │   ├── auth_routes.py
│       │   ├── user_managment_routes.py
│       │   └── inventory_session_routes.py
│       ├── dependencies/
│       │   ├── database.py       # get_db
│       │   ├── auth_dependencies.py  # get_current_user (JWT)
│       │   ├── role_dependencies.py  # require_roles
│       │   └── warehouse_dependencies.py  # require_warehouse_access
│       ├── schemas/              # DTOs Pydantic (request/response)
│       │   ├── inventory_session_schema.py
│       │   └── inventory_count_schema.py
│       ├── middleware/
│       │   └── logging_middleware.py
│       └── exception_handlers.py
│
├── migrations/                    # Migraciones Alembic
│   ├── env.py
│   └── versions/
│
└── tests/
    ├── test_health.py
    ├── test_auth_validation.py
    └── unit/
        └── test_unit_conversion_service.py
```

---

## 3. Rutas existentes

| Método | Ruta | Descripción | Autenticación |
|--------|------|-------------|---------------|
| `GET` | `/health` | Health check de la API | No |
| `POST` | `/auth/login` | Login (email + password); devuelve JWT | No |
| `POST` | `/users/sync` | Sincronizar usuarios desde API externa (ej. 100 usuarios) | Bearer JWT — rol **ADMIN** |
| `GET` | `/users/` | Listar todos los usuarios | Bearer JWT — rol **ADMIN** |
| `POST` | `/users/` | Crear usuario | Bearer JWT — rol **ADMIN** |
| `PUT` | `/users/{user_id}` | Actualizar usuario | Bearer JWT — rol **ADMIN** |
| `POST` | `/inventory-sessions/` | Crear sesión de inventario | Bearer JWT — rol **ADMIN** o **WAREHOUSE_MANAGER** |
| `POST` | `/inventory-sessions/{session_id}/counts` | Registrar conteo de inventario (producto + cantidad en paquetes) | Bearer JWT — rol **WAREHOUSE_MANAGER** |
| `GET` | `/inventory-sessions/{session_id}/counts` | Listar conteos de una sesión de inventario | Bearer JWT — rol **ADMIN** o **PROCESS_LEADER** |

- Las rutas bajo `/users/` y `/inventory-sessions/` requieren header `Authorization: Bearer <token>`.
- El token se obtiene con `POST /auth/login` (body: `email`, `password`).
- Roles de dominio: **ADMIN**, **WAREHOUSE_MANAGER**, **PROCESS_LEADER**.
- La dependencia `require_warehouse_access(warehouse_id)` restringe acceso por almacén (admin tiene acceso a todos).
- La documentación interactiva (Swagger) está en `/docs` y la OpenAPI en `/openapi.json`.

---

## 4. Flujo de una petición HTTP

### 4.1 Entrada

1. **HTTP Request** → FastAPI recibe la petición.
2. **LoggingMiddleware** → Asigna un `request_id`, mide tiempo y registra la petición; en caso de error, registra la excepción.
3. **Router** → La ruta correspondiente (por ejemplo `/auth/login`, `/users/`, `/inventory-sessions/`) maneja la petición.

### 4.2 Dependencias (inyección)

- **`get_db()`**: Crea una sesión SQLAlchemy, la inyecta en la ruta y la cierra al terminar (patrón `yield`).
- **`get_current_user`**: En rutas protegidas, valida el token JWT (Bearer) y devuelve el payload (sub, role, warehouses).
- **`require_roles([...])`**: Depende de `get_current_user` y comprueba que el `role` del usuario esté en la lista permitida; si no, responde 403.
- **`require_warehouse_access(warehouse_id)`**: Comprueba que el usuario sea ADMIN o que el `warehouse_id` esté en sus almacenes permitidos; si no, responde 403.

### 4.3 En el endpoint (ejemplo: crear usuario)

1. **Request body** → Se valida con Pydantic (p. ej. `CreateUserRequest`).
2. **Construcción de dependencias**:
   - `repository = UserRepositoryImpl(db)` — implementación concreta del contrato de dominio.
   - `use_case = CreateUserUseCase(repository)` — caso de uso que recibe el repositorio.
3. **Ejecución** → `use_case.execute(...)` con los datos del request.
4. **Respuesta** → El caso de uso devuelve una entidad de dominio; la ruta la convierte a un DTO (p. ej. `UserResponse.from_user(user)`) y FastAPI lo serializa a JSON.

### 4.4 Salida y errores

- **Excepciones de dominio**:
  - `BusinessRuleViolation` → manejada por `business_rule_exception_handler` → **400 Bad Request**.
  - `NotFoundException` → manejada por `not_found_exception_handler` → **404 Not Found**.
- **Autenticación/autorización**:
  - Sin token o token inválido → `get_current_user` lanza **401 Unauthorized**.
  - Rol no permitido → `require_roles` lanza **403 Forbidden**.
- La respuesta incluye el header **X-Request-ID** (si el middleware está activo).

---

## 5. Flujo por capas (ejemplo: Login)

```
[Cliente]
    │
    ▼
[FastAPI]  main.py
    │
    ▼
[Auth Routes]  auth_routes.py
    │  • Recibe LoginRequest (email, password)
    │  • get_db() → Session
    │
    ▼
[LoginUseCase]  login_use_case.py
    │  • repository.get_by_email(email) → User | None
    │  • PasswordHasher.verify_password(...)
    │  • JWTService.create_access_token(...)
    │  • Lanza BusinessRuleViolation si credenciales inválidas
    │
    ▼
[UserRepository]  (contrato en domain, implementación en infrastructure)
    │  • UserRepositoryImpl(db) → UserModel → User (entidad)
    │
    ▼
[Respuesta]  TokenResponse(access_token=...)
```

El dominio no conoce FastAPI ni SQLAlchemy; los casos de uso solo dependen de los contratos (repositorios) y de servicios como `PasswordHasher` y `JWTService`, que viven en infraestructura pero se usan desde la aplicación.

---

## 6. Flujo por capas (ejemplo: Crear sesión de inventario)

```
[Cliente]
    │
    ▼
[FastAPI]  main.py
    │
    ▼
[Inventory Session Routes]  inventory_session_routes.py
    │  • require_roles([ADMIN, WAREHOUSE_MANAGER])
    │  • get_db() → Session
    │  • CreateInventorySessionRequest (warehouse_id, month, count_number, created_by)
    │
    ▼
[CreateInventorySessionUseCase]  create_inventory_session_use_case.py
    │  • Valida count_number in [1,2,3]
    │  • repository.list_by_warehouse(warehouse_id)
    │  • Reglas: máx. 3 sesiones por mes, count_number único por mes
    │  • Crea entidad InventorySession
    │  • repository.save(new_session)
    │
    ▼
[InventorySessionRepositoryImpl]  inventory_session_repository_impl.py
    │  • Convierte InventorySession → InventorySessionModel
    │  • db.add / commit / refresh
    │  • Convierte model → InventorySession (domain)
    │
    ▼
[Respuesta]  InventorySessionResponse (Pydantic)
```

**Otros flujos:**

- **POST /users/sync**: `SyncUsersFromCorporateAPIUseCase` recibe el repositorio de usuarios y un fetcher (p. ej. `RandomUserClient.fetch_users`); crea hasta N usuarios que no existan por email y devuelve la cantidad creada.
- **POST /inventory-sessions/{session_id}/counts**: `RegisterInventoryCountUseCase` valida la sesión, que el usuario tenga acceso al almacén de la sesión, obtiene el producto y su unidad de medida, usa `UnitConversionService` para pasar cantidad en paquetes a unidades, y persiste un `InventoryCount`.
- **GET /inventory-sessions/{session_id}/counts**: `ListInventoryCountsUseCase` lista los conteos de la sesión; la ruta enriquece cada conteo con datos del producto (ProductRepository) para el DTO.

---

## 7. Dominio

- **Entidades**: Objetos de negocio inmutables o con identidad (p. ej. `User`, `InventorySession`, `InventoryCount`, `Product`). Son dataclasses con tipos claros (UUID, datetime, enums como `UserRole`).
- **Repositorios**: Interfaces abstractas (ABC) que definen cómo se persisten y consultan las entidades (`UserRepository`, `InventorySessionRepository`, `InventoryCountRepository`, `ProductRepository`, `MeasurementUnitRepository`, `WarehouseRepository`). El dominio no conoce SQL ni ORM.
- **Servicios de dominio**: Lógica de negocio pura sin I/O (p. ej. `UnitConversionService` para conversión de unidades de medida).
- **Excepciones**: `DomainException`, `BusinessRuleViolation`, `NotFoundException`. Los casos de uso las lanzan; la capa de presentación las traduce a códigos HTTP.

---

## 8. Aplicación (casos de uso)

- Cada caso de uso tiene un método `execute(...)` que recibe los parámetros necesarios y opcionalmente repositorios/servicios inyectados.
- Orquesta llamadas a repositorios y servicios (JWT, hashing, conversión de unidades), aplica reglas de negocio y devuelve entidades o valores simples (p. ej. un token).
- No conoce HTTP ni detalles de base de datos; solo entidades, repositorios y excepciones de dominio.
- Casos de uso destacados: **SyncUsersFromCorporateAPIUseCase** (sincroniza usuarios desde API externa), **RegisterInventoryCountUseCase** (registra conteo por producto en una sesión), **ListInventoryCountsUseCase** (lista conteos de una sesión).

---

## 9. Infraestructura

- **Database**: `engine`, `SessionLocal`, `Base`; tipo `GUID` para UUIDs portables.
- **Models**: Clases SQLAlchemy que mapean tablas (UserModel, InventorySessionModel, InventoryCountModel, ProductModel, etc.) y asociaciones (p. ej. user–warehouses).
- **Repositories**: Clases que implementan los contratos del dominio (`UserRepositoryImpl`, `InventorySessionRepositoryImpl`, `InventoryCountRepositoryImpl`, `ProductRepositoryImpl`, `MeasurementUnitRepositoryImpl`, `WarehouseRepositoryImpl`); convierten entre modelos ORM y entidades de dominio (`_to_domain`, y al guardar, dominio → modelo).
- **Seeders**: Carga inicial o sincronización al arranque; `master_data_seeder.seed_master_data_if_empty()` (si `AUTO_SEED_MASTER_DATA=true`) crea almacenes, unidades de medida y productos cuando las tablas están vacías; `user_seeder.seed_users_if_empty()` usa la API externa si la BD está vacía y `AUTO_SYNC_USERS=true`; `ensure_default_admin_exists()` se ejecuta siempre para garantizar un admin por defecto.
- **External**: Clientes de APIs externas (p. ej. `RandomUserClient` para obtener usuarios de prueba).
- **Security**: `JWTService` (crear/decodificar tokens), `PasswordHasher` (hash y verificación).
- **Logging**: Logger central usado por el middleware y por rutas/casos de uso (p. ej. eventos `sync_users_executed`, `inventory_count_created`).

---

## 10. Presentación

- **Routes**: Definen los endpoints, leen el body/query, inyectan `get_db`, `get_current_user`, `require_roles` (y opcionalmente `require_warehouse_access`), instancian repositorios y casos de uso, y devuelven DTOs Pydantic.
- **Dependencies**: `get_db`, `get_current_user`, `require_roles`, `require_warehouse_access` — encapsulan acceso a BD y autorización por rol y por almacén.
- **Schemas**: Request/response en Pydantic (`inventory_session_schema`, `inventory_count_schema` con `CreateInventoryCountRequest`, `InventoryCountResponse`, `ProductSummary`, etc.). Los DTOs de usuarios (`CreateUserRequest`, `UpdateUserRequest`, `UserResponse`, `SyncUsersResponse`) están definidos en `user_managment_routes.py`.
- **Exception handlers**: Convierten `BusinessRuleViolation` y `NotFoundException` en respuestas JSON con 400 y 404.
- **Middleware**: Logging y `X-Request-ID` para trazabilidad.

---

## 11. Resumen del flujo de datos

| Dirección        | Qué fluye |
|------------------|-----------|
| Request → App    | Body/query validados por Pydantic; Session y usuario inyectados por FastAPI. |
| Routes → Use case| Parámetros primitivos o DTOs; repositorios inyectados como dependencias. |
| Use case → Repo  | Entidades de dominio (crear, actualizar, criterios de búsqueda). |
| Repo → DB        | Modelos ORM y SQL. |
| Repo → Use case  | Entidades de dominio (o `None`). |
| Use case → Routes| Entidades o valores (token, etc.). |
| Routes → Client  | DTOs Pydantic serializados a JSON y códigos HTTP. |

El backend queda organizado en capas claras: **dominio** (entidades, contratos, excepciones), **aplicación** (casos de uso), **infraestructura** (persistencia, seguridad, logging) y **presentación** (API HTTP y middleware). La documentación de la API se genera automáticamente con FastAPI (Swagger/OpenAPI) en `/docs`.
