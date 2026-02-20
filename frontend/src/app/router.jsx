import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '../components/layout';
import { PrivateRoute, RoleGuard } from '../components/guards';
import { LoginPage, DashboardPage } from '../features/auth/pages';
import { UsersPage } from '../features/users/pages';
import {
  AdminSessionsPage,
  CreateSessionPage,
  RegisterCountPage,
  ViewCountsPage,
} from '../features/inventory/pages';
import { MeasuresPage } from '../features/measures/pages';
import { FeatureFlagsAdminPage } from '../features/featureFlags/pages';

/**
 * Application router. Layout (Navbar + Sidebar) wraps private routes; login is full-screen.
 */
export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <AppLayout />
          </PrivateRoute>
        }
      >
        <Route path="dashboard" element={<DashboardPage />} />
        <Route
          path="users"
          element={
            <RoleGuard allowedRoles={['ADMIN']}>
              <UsersPage />
            </RoleGuard>
          }
        />
        <Route
          path="measures"
          element={
            <RoleGuard allowedRoles={['ADMIN']}>
              <MeasuresPage />
            </RoleGuard>
          }
        />
        <Route
          path="feature-flags"
          element={
            <RoleGuard allowedRoles={['ADMIN']}>
              <FeatureFlagsAdminPage />
            </RoleGuard>
          }
        />
        <Route
          path="admin-sessions"
          element={
            <RoleGuard allowedRoles={['ADMIN']}>
              <AdminSessionsPage />
            </RoleGuard>
          }
        />
        <Route
          path="create-session"
          element={
            <RoleGuard allowedRoles={['ADMIN', 'WAREHOUSE_MANAGER']}>
              <CreateSessionPage />
            </RoleGuard>
          }
        />
        <Route
          path="register-count/:sessionId"
          element={
            <RoleGuard allowedRoles={['ADMIN', 'WAREHOUSE_MANAGER']}>
              <RegisterCountPage />
            </RoleGuard>
          }
        />
        <Route
          path="view-counts/:sessionId"
          element={
            <RoleGuard allowedRoles={['ADMIN', 'PROCESS_LEADER']}>
              <ViewCountsPage />
            </RoleGuard>
          }
        />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
