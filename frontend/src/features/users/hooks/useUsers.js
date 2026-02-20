import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../context/AuthContext';
import { getErrorMessage } from '../../../utils/errorHandling';
import { getWarehouses } from '../../warehouses/services';
import { getUsers, syncUsers, createUser, updateUser } from '../services/usersService';

const INITIAL_FORM = {
  identification: '',
  name: '',
  email: '',
  role: 'WAREHOUSE_MANAGER',
  password: '',
  warehouses: [],
};

/**
 * Users list, sync, create, edit, toggle. Centralizes API and snackbar.
 * @returns {{
 *   users: Array;
 *   loading: boolean;
 *   syncLoading: boolean;
 *   createOpen: boolean;
 *   setCreateOpen: (v: boolean) => void;
 *   editOpen: boolean;
 *   setEditOpen: (v: boolean) => void;
 *   editingUser: import('../services/types').User | null;
 *   openEdit: (u: import('../services/types').User) => void;
 *   closeEdit: () => void;
 *   form: typeof INITIAL_FORM & { warehouseOptions?: Array<{ id: string; label: string }> };
 *   setForm: React.Dispatch<React.SetStateAction<typeof INITIAL_FORM>>;
 *   loadUsers: () => Promise<void>;
 *   handleSync: () => Promise<void>;
 *   handleCreate: (e: React.FormEvent) => Promise<void>;
 *   handleUpdate: (userId: string, payload: import('../services/types').UpdateUserPayload) => Promise<void>;
 *   handleToggle: (user: import('../services/types').User) => Promise<void>;
 *   confirmDeactivateOpen: boolean;
 *   userToDeactivate: import('../services/types').User | null;
 *   requestDeactivate: (user: import('../services/types').User) => void;
 *   closeConfirmDeactivate: () => void;
 *   confirmDeactivate: () => Promise<void>;
 *   currentUserId: string | undefined;
 *   snack: { open: boolean; message: string; severity: string };
 *   closeSnack: () => void;
 * }}
 */
export function useUsers() {
  const { t } = useTranslation();
  const { user: currentUser } = useAuth();
  const currentUserId = currentUser?.sub;

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [confirmDeactivateOpen, setConfirmDeactivateOpen] = useState(false);
  const [userToDeactivate, setUserToDeactivate] = useState(null);
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

  const [warehouseOptions, setWarehouseOptions] = useState([]);
  const loadWarehouses = useCallback(async () => {
    try {
      const list = await getWarehouses();
      setWarehouseOptions(
        list.map((w) => ({ id: w.id, label: w.description || w.code }))
      );
    } catch (_) {
      setWarehouseOptions([]);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    loadWarehouses();
  }, [loadWarehouses]);

  const handleSync = useCallback(async () => {
    setSyncLoading(true);
    try {
      const data = await syncUsers();
      setSnack({
        open: true,
        message: t('users.synced', { count: data?.users_created ?? 0 }),
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
  }, [loadUsers, t]);

  const handleCreate = useCallback(
    async (e) => {
      e.preventDefault();
      try {
        await createUser({
          identification: form.identification,
          name: form.name,
          email: form.email,
          role: form.role,
          password: form.password,
          warehouses: Array.isArray(form.warehouses) ? form.warehouses : [],
        });
        setSnack({ open: true, message: t('users.userCreated'), severity: 'success' });
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
    [form, loadUsers, t]
  );

  const openEdit = useCallback((u) => {
    setEditingUser(u);
    setEditOpen(true);
  }, []);

  const closeEdit = useCallback(() => {
    setEditOpen(false);
    setEditingUser(null);
  }, []);

  const handleUpdate = useCallback(
    async (userId, payload) => {
      try {
        await updateUser(userId, payload);
        setSnack({ open: true, message: t('users.userUpdated'), severity: 'success' });
        closeEdit();
        loadUsers();
      } catch (err) {
        setSnack({
          open: true,
          message: getErrorMessage(err),
          severity: 'error',
        });
        throw err;
      }
    },
    [closeEdit, loadUsers, t]
  );

  const requestDeactivate = useCallback((user) => {
    setUserToDeactivate(user);
    setConfirmDeactivateOpen(true);
  }, []);

  const closeConfirmDeactivate = useCallback(() => {
    setConfirmDeactivateOpen(false);
    setUserToDeactivate(null);
  }, []);

  const confirmDeactivate = useCallback(async () => {
    if (!userToDeactivate) return;
    try {
      await updateUser(userToDeactivate.id, {
        is_active: !userToDeactivate.is_active,
      });
      setSnack({
        open: true,
        message: userToDeactivate.is_active
          ? t('users.userDeactivated')
          : t('users.userActivated'),
        severity: 'success',
      });
      closeConfirmDeactivate();
      loadUsers();
    } catch (err) {
      setSnack({
        open: true,
        message: getErrorMessage(err),
        severity: 'error',
      });
    }
  }, [userToDeactivate, closeConfirmDeactivate, loadUsers, t]);

  const handleToggle = useCallback(
    (user) => {
      if (user.is_active) {
        requestDeactivate(user);
      } else {
        updateUser(user.id, { is_active: true })
          .then(() => {
            setSnack({ open: true, message: t('users.userActivated'), severity: 'success' });
            loadUsers();
          })
          .catch((err) => {
            setSnack({
              open: true,
              message: getErrorMessage(err),
              severity: 'error',
            });
          });
      }
    },
    [loadUsers, requestDeactivate, t]
  );

  const formWithOptions = { ...form, warehouseOptions };

  return {
    users,
    loading,
    syncLoading,
    createOpen,
    setCreateOpen,
    editOpen,
    setEditOpen,
    editingUser,
    openEdit,
    closeEdit,
    form: formWithOptions,
    setForm,
    loadUsers,
    handleSync,
    handleCreate,
    handleUpdate,
    handleToggle,
    confirmDeactivateOpen,
    userToDeactivate,
    requestDeactivate,
    closeConfirmDeactivate,
    confirmDeactivate,
    currentUserId,
    snack,
    closeSnack,
  };
}
