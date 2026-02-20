import { Box, Typography } from '@mui/material';
import { PageContainer } from '../../../components/layout';
import {
  AppButton,
  AppDialog,
  AppSnackbar,
  AppTable,
  AppTextField,
} from '../../../components/ui';
import { AppSelect } from '../../../components/ui/Select';
import { ROLE_OPTIONS } from '../../../constants';
import { useUsers } from '../hooks';

const USER_COLUMNS = [
  { id: 'email', label: 'Email' },
  { id: 'name', label: 'Name' },
  { id: 'identification', label: 'Identification' },
  { id: 'role', label: 'Role' },
  { id: 'warehouses', label: 'Warehouses' },
  { id: 'is_active', label: 'Active' },
];

export function UsersPage() {
  const {
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
  } = useUsers();

  const tableRows = users.map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    identification: u.identification ?? '',
    role: u.role,
    warehouses: Array.isArray(u.warehouses) ? u.warehouses.join(', ') : '',
    is_active: u.is_active ? 'Yes' : 'No',
  }));

  return (
    <PageContainer maxWidth="lg">
      <Typography variant="h5" gutterBottom>
        Users
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <AppButton onClick={loadUsers} disabled={loading}>
          Refresh
        </AppButton>
        <AppButton
          variant="outlined"
          color="secondary"
          onClick={handleSync}
          disabled={syncLoading}
        >
          {syncLoading ? 'Syncing...' : 'Sync Users'}
        </AppButton>
        <AppButton onClick={() => setCreateOpen(true)}>Create User</AppButton>
      </Box>
      <AppTable columns={USER_COLUMNS} rows={tableRows} />

      <AppDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create User"
        actions={
          <>
            <AppButton onClick={() => setCreateOpen(false)} color="inherit">
              Cancel
            </AppButton>
            <AppButton type="submit" form="create-user-form">
              Create
            </AppButton>
          </>
        }
      >
        <form id="create-user-form" onSubmit={handleCreate}>
          <AppTextField
            label="Identification"
            value={form.identification}
            onChange={(e) =>
              setForm((f) => ({ ...f, identification: e.target.value }))
            }
            margin="dense"
            required
          />
          <AppTextField
            label="Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            margin="dense"
            required
          />
          <AppTextField
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            margin="dense"
            required
          />
          <AppSelect
            label="Role"
            value={form.role}
            onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
            margin="dense"
            options={ROLE_OPTIONS.map((r) => ({ value: r, label: r }))}
          />
          <AppTextField
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) =>
              setForm((f) => ({ ...f, password: e.target.value }))
            }
            margin="dense"
            required
          />
          <AppTextField
            label="Warehouses (comma-separated UUIDs)"
            value={form.warehouses}
            onChange={(e) =>
              setForm((f) => ({ ...f, warehouses: e.target.value }))
            }
            margin="dense"
          />
        </form>
      </AppDialog>

      <AppSnackbar
        open={snack.open}
        message={snack.message}
        severity={snack.severity}
        onClose={closeSnack}
      />
    </PageContainer>
  );
}
