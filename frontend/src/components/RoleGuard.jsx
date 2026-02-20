import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function RoleGuard({ children, allowedRoles }) {
  const { user } = useAuth();
  const role = user?.role;

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
