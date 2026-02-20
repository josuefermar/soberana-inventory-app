# Patch Notes

- If a patch adds a feature or fix, add a one liner to the newest WIP.
- At the beginning of each line add one of the three tags to classify
  the note [feature], [bugfix], [config], [script].

## v0.0.9 (WIP)

- [feature] Frontend: AppLayout — Navbar + Sidebar + Outlet; private routes nested under layout; router refactor (paths /dashboard, /users, etc. as children of /)
- [feature] Frontend: Sidebar — icon nav (Dashboard, Admin Sessions, Create Session, Users, Measures, Feature Flags, Logout); role-based visibility; NavLink active state; SCSS module
- [feature] Frontend: Navbar restyle — SCSS module (Navbar.module.scss); white bar, Soberana green accent, brand "La Soberana"; logo button
- [feature] Frontend: design system — soberana-tokens.scss (colors, spacing, shadows, radius, font); soberana-global.scss; theme.js; Open Sans (index.html); title "La Soberana — Gestión de inventarios"
- [feature] Frontend: DashboardCard — new UI component (icon, title, description, action, accent green/grain); used in DashboardPage
- [feature] Frontend: DashboardPage redesign — card grid by role (ADMIN: users, create session, sessions, measures, feature flags, sync; WAREHOUSE_MANAGER: create session, register count; PROCESS_LEADER: view counts); prompt for sessionId; DashboardPage.module.scss
- [feature] Frontend: AppTable — Soberana style (light gray header, borders); AppTable.module.scss
- [feature] Frontend: AdminSessionsPage and RegisterCountPage — layout/styling with module SCSS
- [config] Frontend: sass dependency; main.jsx imports global styles

## v0.0.8

- [feature] Backend: feature flags use cases — ListFeatureFlagsUseCase, CreateFeatureFlagUseCase, UpdateFeatureFlagUseCase, ToggleFeatureFlagUseCase; repository get_all, get_by_id, update, toggle (key no longer used for update)
- [feature] Backend: GET /feature-flags/, POST /feature-flags/ (CreateFeatureFlagRequest), PUT /feature-flags/{id} (UpdateFeatureFlagRequest), PATCH /feature-flags/{id}/toggle (ADMIN)
- [feature] Frontend: Feature Flags admin — FeatureFlagsAdminPage (list, create, update, toggle); useFeatureFlags, featureFlagsService (getFlags, createFlag, updateFlag, toggleFlag); FeatureFlagFormModal; route /feature-flags (ADMIN); Dashboard link; i18n
- [feature] Frontend: Users — EditUserDialog (name, email, role, is_active); useUsers extended with edit, deactivate (confirm dialog), updateUser; usersService.updateUser; ROLE_LABELS and getRoleLabel in constants/roles; i18n for users edit/cancel/save/role/active

## v0.0.7

- [feature] Backend: measurement units — entity description→abbreviation; repository list_all, get_by_id, get_by_abbreviation, update; CreateMeasurementUnitUseCase, UpdateMeasurementUnitUseCase, ToggleMeasurementUnitUseCase; ListMeasurementUnitsUseCase(active_only)
- [feature] Backend: GET /measurement-units/?active_only, POST /measurement-units/, PUT /measurement-units/{id}, PATCH /measurement-units/{id}/toggle (ADMIN for write); response includes abbreviation, is_active
- [config] Backend: migration g01m2e3a4b5c6 — measurement_units add abbreviation, drop description, unique name/abbreviation; master_data_seeder uses name+abbreviation (e.g. UND, CJ, ARR)
- [feature] Frontend: Measures feature — MeasuresPage (list, create, update, toggle); useMeasuresPage, measuresService (getMeasures, createMeasure, updateMeasure, toggleMeasure); route /measures (ADMIN); Dashboard link; i18n (en/es)
- [feature] Frontend: inventory useMeasures and getMeasures use abbreviation and active_only; MeasureUnitItem type with abbreviation; ProductRow uses @mui/icons-material DeleteOutlined
- [config] Frontend: package.json + @mui/icons-material; docker-compose frontend command npm install && npm run dev; Dockerfile.dev comment
- [feature] Docs: PROJECT_STRUCTURE_AND_FLOW.md (root); BACKEND_STRUCTURE_AND_FLOW.md (backend); TechnicalTestDescription "La Soberana SAS"

## v0.0.6

- [feature] Backend: feature flags — entity, repository, FeatureFlagService (is_enabled, list_all, set_enabled); feature_flags table migration; seeder ENABLE_INVENTORY_DATE_RESTRICTION; GET /feature-flags, PATCH /feature-flags/{key} (ADMIN)
- [feature] Backend: CreateInventorySessionUseCase — session creation date restriction (first 3 days) gated by feature flag ENABLE_INVENTORY_DATE_RESTRICTION; use case depends on FeatureFlagService
- [feature] Backend: MeasurementUnitRepository list_active(); ListMeasurementUnitsUseCase; GET /measurement-units (ADMIN, WAREHOUSE_MANAGER)
- [feature] Backend: ProductResponse and list products API — include inventory_unit_id, packaging_unit_id, conversion_factor
- [feature] Frontend: Create Session — ProductCountTable and ProductRow (product autocomplete, measure unit select, quantity, delete); useInventorySessionProducts, useMeasures, useProductsAutocomplete; useCreateSession refactor; CreateSessionPage uses new table and measures
- [feature] Frontend: i18n — keys for create-session product/unit/quantity/actions labels (en/es)
- [config] Backend: migrations — add feature_flags table (f16a0b8d5e6g)

## v0.0.5

- [feature] Backend: inventory session creation — count_number auto-assigned (1..3), month normalized to first-day UTC; CreateInventorySessionUseCase no longer accepts count_number
- [feature] Backend: AddProductsToSessionUseCase — add products to session via 0-quantity counts; inventory_counts as single source of truth (UniqueConstraint session_id+product_id)
- [feature] Backend: ListInventorySessionsUseCase — list sessions with filters (warehouse_id, month, status open/closed), summary includes warehouse_description and products_count
- [feature] Backend: ListSessionProductsFromCountsUseCase — list session products derived from inventory_counts; ListProductsUseCase (list_active); ListWarehousesUseCase (list_all)
- [feature] Backend: RegisterInventoryCountUseCase — block counts on closed session; block duplicate product count in same session (business rule + exists_by_session_and_product)
- [feature] Backend: repositories — InventoryCountRepository exists_by_session_and_product, count_by_session; InventorySessionRepository list_filtered; ProductRepository list_active; WarehouseRepository get_by_id, list_all
- [feature] Backend: GET /inventory-sessions/ (ADMIN, filter by warehouse_id, month, status), POST /inventory-sessions/{id}/products, GET /inventory-sessions/{id}/products; GET /products/, GET /warehouses/ (ADMIN, WAREHOUSE_MANAGER)
- [config] Backend: migrations — add inventory_session_products table, add unique session+product on inventory_counts, migration to remove session_products and use counts
- [feature] Frontend: i18n — react-i18next with en/es; LanguageSelector component; Dashboard, Login, and inventory copy use translations
- [feature] Frontend: Admin Sessions — useAdminSessions, AdminSessionsPage (list sessions with warehouse/month/status filters); route and Navbar link
- [feature] Frontend: Create Session — useCreateSession/CreateSessionPage no count_number; session products via add/list session products API; ProductAutocomplete, WarehouseAutocomplete; products and warehouses services (GET /products, GET /warehouses)
- [feature] Frontend: FRONTEND_STRUCTURE_AND_FLOW.md — doc for app structure, router, guards, features, and conventions
- [config] Frontend: Dockerfile.dev tweak; package.json + react-i18next (or i18n deps)
- [feature] Backend: unit tests for AddProductsToSessionUseCase and CreateInventorySessionUseCase; test_warehouses_endpoint; UNIT_TEST_SUGGESTIONS_INVENTORY.md

## v0.0.4

- [feature] Backend: CORS middleware — allow frontend origins via CORS_ORIGINS (default localhost:5173), credentials, all methods/headers
- [config] docker-compose.dev.yml: Postgres host port 5433 (was 5432) to avoid conflict with local Postgres
- [config] db_local/: remove README and docker-compose; backend/db_local.md updated for running DB via docker-compose dev
- [feature] Frontend: feature-based structure — app/ (App, AppProviders, router), features/auth (useLogin, LoginPage, DashboardPage, authService), features/inventory (useCreateSession, useRegisterCount, useViewCounts; CreateSessionPage, RegisterCountPage, ViewCountsPage; inventoryService), features/users (useUsers, UsersPage, usersService)
- [feature] Frontend: shared UI components — Button, Card, Dialog, Input, Loader, Select, Snackbar, Table under components/ui/
- [feature] Frontend: layout components — FormContainer, PageContainer, Section under components/layout/
- [feature] Frontend: feedback components — AppErrorBoundary, ErrorFallback under components/feedback/
- [feature] Frontend: guards moved to components/guards/ (PrivateRoute, RoleGuard)
- [feature] Frontend: shared hooks useAsync, useSnackbar; constants/roles; theme (theme.js); utils dateFormat, errorHandling
- [config] Frontend: apiClient moved from api/ to services/; main entry uses AppProviders; old pages/ removed in favor of features/*/pages

## v0.0.3

- [feature] Backend: WarehouseRepository list_active() (domain + impl) for active warehouses
- [feature] Backend: default admin user (admin@admin.com) ensured on startup via ensure_default_admin_exists; user seeder creates admin with hashed password and all active warehouses when missing
- [feature] Backend: API title/description set to "La Soberana API"; startup logging for migrations, master data seed, users sync, and default admin ensured
- [config] CI: backend-ci — add develop branch, env (DATABASE_URL, AUTO_SYNC_USERS, SECRET_KEY) for verify step and tests; assert app title "La Soberana API"
- [config] CI: frontend-ci — add develop branch; remove lint step; typecheck with tsconfig.app.json
- [config] CI: docker-ci — add develop branch
- [config] docker-compose.dev.yml and docker-compose.prod.yml added; docker-compose.yml updated; frontend Dockerfile.dev, .env.example, .npmrc
- [feature] Frontend: React app with AuthContext, PrivateRoute, RoleGuard, Navbar; pages Login, Dashboard, Users (ADMIN), CreateSession, RegisterCount, ViewCounts; apiClient with Bearer token and error handling; logo La Soberana
- [config] Frontend: migrate Vite config from TypeScript to JavaScript (vite.config.js); index.html and package.json updates

## v0.0.2
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