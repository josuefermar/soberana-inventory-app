import { Navigate, Route, Routes } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { PrivateRoute } from './components/PrivateRoute';
import { RoleGuard } from './components/RoleGuard';
import { AuthProvider } from './context/AuthContext';
import { CreateSession } from './pages/CreateSession';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { RegisterCount } from './pages/RegisterCount';
import { Users } from './pages/Users';
import { ViewCounts } from './pages/ViewCounts';

function App() {
  return (
    <AuthProvider>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/users"
          element={
            <PrivateRoute>
              <RoleGuard allowedRoles={['ADMIN']}>
                <Users />
              </RoleGuard>
            </PrivateRoute>
          }
        />
        <Route
          path="/create-session"
          element={
            <PrivateRoute>
              <RoleGuard allowedRoles={['ADMIN', 'WAREHOUSE_MANAGER']}>
                <CreateSession />
              </RoleGuard>
            </PrivateRoute>
          }
        />
        <Route
          path="/register-count/:sessionId"
          element={
            <PrivateRoute>
              <RoleGuard allowedRoles={['ADMIN', 'WAREHOUSE_MANAGER']}>
                <RegisterCount />
              </RoleGuard>
            </PrivateRoute>
          }
        />
        <Route
          path="/view-counts/:sessionId"
          element={
            <PrivateRoute>
              <RoleGuard allowedRoles={['ADMIN', 'PROCESS_LEADER']}>
                <ViewCounts />
              </RoleGuard>
            </PrivateRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
