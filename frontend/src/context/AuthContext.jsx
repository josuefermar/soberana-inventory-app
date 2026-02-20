import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { login as authLogin } from '../features/auth/services/authService';

const AuthContext = createContext(null);

function parseJwtPayload(token) {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    const t = localStorage.getItem('token');
    return t ? parseJwtPayload(t) : null;
  });

  const login = useCallback(async (email, password) => {
    const data = await authLogin(email, password);
    const accessToken = data.access_token;
    localStorage.setItem('token', accessToken);
    setToken(accessToken);
    setUser(parseJwtPayload(accessToken));
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    const onLogout = () => logout();
    window.addEventListener('auth:logout', onLogout);
    return () => window.removeEventListener('auth:logout', onLogout);
  }, [logout]);

  const value = useMemo(
    () => ({
      login,
      logout,
      user,
      token,
      isAuthenticated: !!token,
    }),
    [login, logout, user, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
