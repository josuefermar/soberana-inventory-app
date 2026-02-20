import { useCallback, useEffect, useState } from 'react';
import { getErrorMessage } from '../../../utils/errorHandling';
import { getUsers, syncUsers, createUser } from '../services/usersService';

const INITIAL_FORM = {
  identification: '',
  name: '',
  email: '',
  role: 'WAREHOUSE_MANAGER',
  password: '',
  warehouses: '',
};

/**
 * Users list, sync, create dialog. Centralizes API and snackbar.
 * @returns {{
 *   users: Array;
 *   loading: boolean;
 *   syncLoading: boolean;
 *   createOpen: boolean;
 *   setCreateOpen: (v: boolean) => void;
 *   form: typeof INITIAL_FORM;
 *   setForm: React.Dispatch<React.SetStateAction<typeof INITIAL_FORM>>;
 *   loadUsers: () => Promise<void>;
 *   handleSync: () => Promise<void>;
 *   handleCreate: (e: React.FormEvent) => Promise<void>;
 *   snack: { open: boolean; message: string; severity: string };
 *   closeSnack: () => void;
 * }}
 */
export function useUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [snack, setSnack] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const closeSnack = useCallback(() => {
    setSnack((s) => ({ ...s, open: false }));
  }, []);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      setSnack({ open: true, message: getErrorMessage(err), severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleSync = useCallback(async () => {
    setSyncLoading(true);
    try {
      const data = await syncUsers();
      setSnack({
        open: true,
        message: `Synced. Users created: ${data?.users_created ?? 0}`,
        severity: 'success',
      });
      loadUsers();
    } catch (err) {
      setSnack({
        open: true,
        message: getErrorMessage(err),
        severity: 'error',
      });
    } finally {
      setSyncLoading(false);
    }
  }, [loadUsers]);

  const handleCreate = useCallback(
    async (e) => {
      e.preventDefault();
      try {
        await createUser({
          ...form,
          warehouses: form.warehouses
            ? form.warehouses
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean)
            : [],
        });
        setSnack({ open: true, message: 'User created', severity: 'success' });
        setCreateOpen(false);
        setForm(INITIAL_FORM);
        loadUsers();
      } catch (err) {
        setSnack({
          open: true,
          message: getErrorMessage(err),
          severity: 'error',
        });
      }
    },
    [form, loadUsers]
  );

  return {
    users,
    loading,
    syncLoading,
    createOpen,
    setCreateOpen,
    form,
    setForm,
    loadUsers,
    handleSync,
    handleCreate,
    snack,
    closeSnack,
  };
}
