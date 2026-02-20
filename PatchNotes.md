# Patch Notes

- If a patch adds a feature or fix, add a one liner to the newest WIP.
- At the beginning of each line add one of the three tags to classify
  the note [feature], [bugfix], [config], [script].

## v0.0.2 (WIP)
- [bugfix] Remove deprecated noImplicitUseStrict from frontend tsconfig.json
- [feature] Added models and entities in backend
- [feature] Backend: role system with ADMIN, WAREHOUSE_MANAGER, PROCESS_LEADER and RequireRoles(list[UserRole]) RBAC
- [feature] Backend: user CRUD — GET /users, POST /users, PUT /users/{user_id} (ADMIN only)
- [feature] Backend: user sync from Random User API (SyncUsersFromCorporateAPIUseCase), user seeder, AUTO_SYNC_USERS startup hook, POST /users/sync (ADMIN only)
- [feature] Backend: domain UnitConversionService and unit test (5 boxes × factor 12 = 60)
- [feature] Backend: POST /inventory-sessions/ to create inventory session (ADMIN or WAREHOUSE_MANAGER)
- [feature] Backend: POST /inventory-sessions/{session_id}/counts (WAREHOUSE_MANAGER, warehouse-scoped) and GET .../counts (ADMIN, PROCESS_LEADER)
- [feature] Backend: Product and InventoryCount repositories (domain + infrastructure), clean hexagonal boundaries
- [feature] Backend: structured logging for seeder, sync endpoint, inventory count creation, and access denied events
- [config] CI: backend-ci — concurrency cancel-in-progress, working-directory backend, verify app loads step, simplified pip/pytest
- [config] CI: frontend-ci — concurrency cancel-in-progress, working-directory frontend, simplified npm steps
- [config] CI: docker-ci — concurrency cancel-in-progress, explicit Dockerfile paths for backend/frontend, workflow in trigger paths
- [bugfix] Backend: type-safe exception handlers in main.py (cast to ExceptionHandler for add_exception_handler)
- [feature] Backend: inventory sessions only creatable in first 3 days of month (CreateInventorySessionUseCase business rule)
- [feature] Backend: ADMIN can register inventory counts for any warehouse; warehouse check bypass when is_admin, clearer access-denied message
- [feature] Backend: MeasurementUnitRepository (domain + impl) with count, get_by_name, save; ProductRepository extended with count/save; WarehouseRepository (domain + impl) with count/save
- [feature] Backend: master data seeder — warehouses (Cereté, Central, Valledupar, Maicao) and products P001–P015 when tables empty; AUTO_SEED_MASTER_DATA startup hook in main.py
- [feature] Backend: POST /inventory-sessions/{id}/counts allowed for ADMIN and WAREHOUSE_MANAGER; is_admin passed to RegisterInventoryCountUseCase

## v0.0.1 

- [feature] Initialize backend with FastAPI health check and test
- [feature] Initialize frontend
- [feature] Add docker compose for full enviroment
- [feature] Initialize CI/CD with github actions