import { Navigate, Route, Routes } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { PrivateRoute, RoleGuard } from '../components/guards';
import { LoginPage, DashboardPage } from '../features/auth/pages';
import { UsersPage } from '../features/users/pages';
import {
  AdminSessionsPage,
  CreateSessionPage,
  RegisterCountPage,
  ViewCountsPage,
} from '../features/inventory/pages';

/**
 * Application router. Composition only: Navbar + Routes.
 * Guards and role checks unchanged.
 */
export function AppRouter() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/users"
          element={
            <PrivateRoute>
              <RoleGuard allowedRoles={['ADMIN']}>
                <UsersPage />
              </RoleGuard>
            </PrivateRoute>
          }
        />
        <Route
          path="/admin-sessions"
          element={
            <PrivateRoute>
              <RoleGuard allowedRoles={['ADMIN']}>
                <AdminSessionsPage />
              </RoleGuard>
            </PrivateRoute>
          }
        />
        <Route
          path="/create-session"
          element={
            <PrivateRoute>
              <RoleGuard allowedRoles={['ADMIN', 'WAREHOUSE_MANAGER']}>
                <CreateSessionPage />
              </RoleGuard>
            </PrivateRoute>
          }
        />
        <Route
          path="/register-count/:sessionId"
          element={
            <PrivateRoute>
              <RoleGuard allowedRoles={['ADMIN', 'WAREHOUSE_MANAGER']}>
                <RegisterCountPage />
              </RoleGuard>
            </PrivateRoute>
          }
        />
        <Route
          path="/view-counts/:sessionId"
          element={
            <PrivateRoute>
              <RoleGuard allowedRoles={['ADMIN', 'PROCESS_LEADER']}>
                <ViewCountsPage />
              </RoleGuard>
            </PrivateRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
}
