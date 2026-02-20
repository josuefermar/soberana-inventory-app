import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
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
import { WarehouseAutocomplete } from '../../warehouses/components';
import { useUsers } from '../hooks';

function useUserColumns() {
  const { t } = useTranslation();
  return [
    { id: 'email', label: t('users.email') },
    { id: 'name', label: t('users.name') },
    { id: 'identification', label: t('users.identification') },
    { id: 'role', label: t('users.role') },
    { id: 'warehouses', label: t('users.warehouses') },
    { id: 'is_active', label: t('users.active') },
  ];
}

export function UsersPage() {
  const { t } = useTranslation();
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
  const USER_COLUMNS = useUserColumns();

  const tableRows = users.map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    identification: u.identification ?? '',
    role: u.role,
    warehouses: Array.isArray(u.warehouses) ? u.warehouses.join(', ') : '',
    is_active: u.is_active ? t('users.yes') : t('users.no'),
  }));

  return (
    <PageContainer maxWidth="lg">
      <Typography variant="h5" gutterBottom>
        {t('users.title')}
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <AppButton onClick={loadUsers} disabled={loading}>
          {t('users.refresh')}
        </AppButton>
        <AppButton
          variant="outlined"
          color="secondary"
          onClick={handleSync}
          disabled={syncLoading}
        >
          {syncLoading ? t('users.syncing') : t('users.syncUsers')}
        </AppButton>
        <AppButton onClick={() => setCreateOpen(true)}>{t('users.createUser')}</AppButton>
      </Box>
      <AppTable columns={USER_COLUMNS} rows={tableRows} />

      <AppDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title={t('users.createUser')}
        actions={
          <>
            <AppButton onClick={() => setCreateOpen(false)} color="inherit">
              {t('users.cancel')}
            </AppButton>
            <AppButton type="submit" form="create-user-form">
              {t('users.create')}
            </AppButton>
          </>
        }
      >
        <form id="create-user-form" onSubmit={handleCreate}>
          <AppTextField
            label={t('users.identification')}
            value={form.identification}
            onChange={(e) =>
              setForm((f) => ({ ...f, identification: e.target.value }))
            }
            margin="dense"
            required
          />
          <AppTextField
            label={t('users.name')}
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            margin="dense"
            required
          />
          <AppTextField
            label={t('users.email')}
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            margin="dense"
            required
          />
          <AppSelect
            label={t('users.role')}
            value={form.role}
            onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
            margin="dense"
            options={ROLE_OPTIONS.map((r) => ({ value: r, label: r }))}
          />
          <AppTextField
            label={t('users.password')}
            type="password"
            value={form.password}
            onChange={(e) =>
              setForm((f) => ({ ...f, password: e.target.value }))
            }
            margin="dense"
            required
          />
          <WarehouseAutocomplete
            label={t('users.warehouses')}
            placeholder={t('users.warehousesPlaceholder')}
            options={form.warehouseOptions ?? []}
            valueIds={form.warehouses}
            onChange={(ids) => setForm((f) => ({ ...f, warehouses: ids }))}
            margin="dense"
            multiple
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
