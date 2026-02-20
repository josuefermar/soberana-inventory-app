import { Box, Typography, Chip, Tooltip } from '@mui/material';
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
import { ROLE_OPTIONS, getRoleLabel } from '../../../constants';
import { WarehouseAutocomplete } from '../../warehouses/components';
import { EditUserDialog } from '../components';
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
    { id: 'actions', label: t('users.actions') },
  ];
}

export function UsersPage() {
  const { t } = useTranslation();
  const {
    users,
    loading,
    createOpen,
    setCreateOpen,
    editOpen,
    closeEdit,
    editingUser,
    form,
    setForm,
    loadUsers,
    handleCreate,
    handleUpdate,
    handleToggle,
    openEdit,
    confirmDeactivateOpen,
    userToDeactivate,
    closeConfirmDeactivate,
    confirmDeactivate,
    currentUserId,
    snack,
    closeSnack,
  } = useUsers();
  const USER_COLUMNS = useUserColumns();

  const roleOptions = ROLE_OPTIONS.map((r) => ({ value: r, label: getRoleLabel(r) }));

  const tableRows = users.map((u) => {
    const isSelf = currentUserId != null && u.id === currentUserId;
    return {
      id: u.id,
      email: u.email,
      name: u.name,
      identification: u.identification ?? '',
      role: getRoleLabel(u.role),
      warehouses: Array.isArray(u.warehouses)
        ? u.warehouses.map((w) => (typeof w === 'object' && w?.name != null ? w.name : w)).join(', ')
        : '',
      is_active: (
        <Chip
          label={u.is_active ? t('users.yes') : t('users.no')}
          size="small"
          color={u.is_active ? 'success' : 'default'}
          variant="outlined"
        />
      ),
      actions: (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title={isSelf ? t('users.cannotEditSelf') : ''}>
            <span>
              <AppButton
                size="small"
                variant="outlined"
                onClick={() => openEdit(u)}
                disabled={isSelf}
              >
                {t('users.edit')}
              </AppButton>
            </span>
          </Tooltip>
          <Tooltip title={isSelf ? t('users.cannotEditSelf') : ''}>
            <span>
              <AppButton
                size="small"
                variant="outlined"
                color="secondary"
                onClick={() => handleToggle(u)}
                disabled={isSelf}
              >
                {u.is_active ? t('users.deactivate') : t('users.activate')}
              </AppButton>
            </span>
          </Tooltip>
        </Box>
      ),
    };
  });

  return (
    <PageContainer maxWidth="lg">
      <Typography variant="h5" gutterBottom>
        {t('users.title')}
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <AppButton onClick={loadUsers} disabled={loading}>
          {t('users.refresh')}
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
            options={roleOptions}
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

      <EditUserDialog
        open={editOpen}
        onClose={closeEdit}
        user={editingUser}
        onSave={handleUpdate}
        warehouseOptions={form.warehouseOptions ?? []}
      />

      <AppDialog
        open={confirmDeactivateOpen}
        onClose={closeConfirmDeactivate}
        title={t('users.confirmDeactivateTitle')}
        actions={
          <>
            <AppButton onClick={closeConfirmDeactivate} color="inherit">
              {t('users.cancel')}
            </AppButton>
            <AppButton onClick={confirmDeactivate} color="warning">
              {t('users.deactivate')}
            </AppButton>
          </>
        }
      >
        {userToDeactivate && (
          <Typography>
            {t('users.confirmDeactivateMessage', {
              name: userToDeactivate.name || userToDeactivate.email,
            })}
          </Typography>
        )}
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
