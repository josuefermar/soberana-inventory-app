# Frontend — Structure and flow (La Soberana)

Enterprise-grade architecture: feature-first, SOLID, smart/dumb components, error boundary, centralized error handling.

---

## 1. Folder structure

```
frontend/src/
├── main.jsx                 # Mounts App (app/App.jsx)
├── app/
│   ├── App.jsx              # Error boundary > AppProviders > AppRouter
│   ├── AppProviders.jsx     # ThemeProvider, CssBaseline, BrowserRouter, AuthProvider
│   └── router.jsx           # Navbar + Routes + guards (composition only)
├── components/
│   ├── Navbar.jsx
│   ├── ui/                  # Dumb: pure presentational
│   │   ├── Button/          # AppButton
│   │   ├── Input/           # AppTextField
│   │   ├── Select/          # AppSelect
│   │   ├── Dialog/          # AppDialog
│   │   ├── Snackbar/        # AppSnackbar
│   │   ├── Table/           # AppTable
│   │   ├── Loader/          # AppLoader
│   │   ├── Card/            # AppCard
│   │   └── index.js
│   ├── layout/
│   │   ├── PageContainer/
│   │   ├── Section/
│   │   ├── FormContainer/
│   │   └── index.js
│   ├── feedback/
│   │   ├── ErrorFallback.jsx    # Fallback UI (message + Retry)
│   │   ├── AppErrorBoundary.jsx # Catches render errors, logs, shows fallback
│   │   └── index.js
│   └── guards/
│       ├── PrivateRoute.jsx
│       ├── RoleGuard.jsx
│       └── index.js
├── context/
│   └── AuthContext.jsx     # Auth state; uses features/auth/services
├── features/
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/           # useLogin
│   │   ├── services/        # authService (login)
│   │   └── pages/           # LoginPage, DashboardPage
│   ├── users/
│   │   ├── components/
│   │   ├── hooks/           # useUsers
│   │   ├── services/        # usersService: getUsers, syncUsers, createUser; types.js
│   │   └── pages/           # UsersPage
│   └── inventory/
│       ├── components/
│       ├── hooks/           # useCreateSession, useRegisterCount, useViewCounts
│       ├── services/        # inventoryService: createSession, registerCount, getCounts; types.js
│       └── pages/            # CreateSessionPage, RegisterCountPage, ViewCountsPage
├── services/
│   └── apiClient.js        # Axios instance, interceptors, getErrorMessage
├── hooks/
│   ├── useSnackbar.js
│   ├── useAsync.js         # Standardized async: loading, error, execute, reset
│   └── index.js
├── utils/
│   ├── errorHandling.js    # Re-exports getErrorMessage from services/apiClient
│   ├── dateFormat.js
│   └── index.js
├── constants/
│   ├── roles.js
│   └── index.js
└── theme/
    └── theme.js
```

---

## 2. SRP (Single Responsibility)

| Layer | Responsibility |
|-------|----------------|
| **Pages** | Composition only. No API calls, no heavy logic. Orchestrate hooks + UI. |
| **Hooks** | Business logic. Loading, error, success. Call services. Return clean state. |
| **Services** | API communication only. Pure async functions. No UI, no navigation. |
| **UI components** | Pure presentational. Props only. No business logic, no API. |

---

## 3. Smart vs dumb

- **Smart:** Feature pages, custom hooks, context providers (AuthProvider), router.
- **Dumb:** AppButton, AppTextField, AppDialog, AppTable, AppSnackbar, layout wrappers, ErrorFallback.

---

## 4. Error boundary layer

- **AppErrorBoundary:** Class component. Catches rendering errors. Logs with `console.error`. Renders fallback (default: ErrorFallback).
- **ErrorFallback:** Shows “Something went wrong”, error message, and **Retry** button (calls `resetErrorBoundary`).
- **Usage:** Entire app wrapped in `AppErrorBoundary` in `app/App.jsx`. Optional: wrap individual feature routes for finer-grained recovery.
- **useAsync:** Centralized async handling. Returns `{ data, error, loading, execute, reset, setError }`. Uses `getErrorMessage` for `error`. Used e.g. in `useViewCounts`.

---

## 5. Design system (components/ui)

All UI components are dumb: no API, no business logic; configurable via props.

| Component | Purpose |
|-----------|---------|
| AppButton | MUI Button, default variant/color. |
| AppTextField | TextField with error/helperText. |
| AppSelect | Select with `options` array. |
| AppDialog | Dialog with title, content, actions. |
| AppSnackbar | Snackbar + Alert. |
| AppTable | Table with styled header; columns + rows. |
| AppLoader | CircularProgress + message. |
| AppCard | Themed Card. |

---

## 6. Layout (components/layout)

PageContainer, Section, FormContainer.

---

## 7. Guards (components/guards)

- **PrivateRoute:** Redirect to `/login` if not authenticated.
- **RoleGuard:** Redirect to `/dashboard` if role not in `allowedRoles`.

Behaviour and role-based access unchanged.

---

## 8. Features (services + hooks + pages)

- **Auth:** `authService.login()`; `useLogin()`; `LoginPage`, `DashboardPage`.
- **Users:** `usersService`: `getUsers`, `syncUsers`, `createUser`; `useUsers()`; `UsersPage`. Types in `services/types.js`.
- **Inventory:** `inventoryService`: `createSession`, `registerCount`, `getCounts`; `useCreateSession`, `useRegisterCount`, `useViewCounts` (uses `useAsync`); `CreateSessionPage`, `RegisterCountPage`, `ViewCountsPage`. Types in `services/types.js`.

Pages do not call axios or apiClient; they use hooks, which call services. (Backend exposes `PUT /users/{user_id}` for update; frontend does not yet implement update user.)

---

## 9. Flow (unchanged)

- **Auth:** AuthContext from `localStorage`; login via `authService`; 401 → `auth:logout`.
- **Routes:** Public `/login`; private routes with PrivateRoute + RoleGuard.
- **Navigation:** Role-based dashboard; guards unchanged.

---

## 10. Technologies

- React 18, Vite, MUI v5, react-router-dom v6, axios.
- API client and error formatting in `services/apiClient.js`.
- `utils/errorHandling.js` re-exports `getErrorMessage` for use in hooks/utils.
- TypeScript-ready: JSDoc in services/hooks; clear boundaries for migration.
