import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { getErrorMessage } from '../../../utils/errorHandling';

/**
 * Login form state and submit handler. Pages use this + UI only.
 * @returns {{ handleSubmit: (e: React.FormEvent) => Promise<void>; loading: boolean; error: string; setEmail: (v: string) => void; setPassword: (v: string) => void; email: string; password: string }}
 */
export function useLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setError('');
      setLoading(true);
      try {
        await login(email, password);
        navigate('/dashboard');
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    },
    [email, password, login, navigate]
  );

  return {
    email,
    setEmail,
    password,
    setPassword,
    error,
    loading,
    handleSubmit,
  };
}
