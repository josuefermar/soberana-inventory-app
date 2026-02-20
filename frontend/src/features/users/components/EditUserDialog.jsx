import { useState, useEffect } from 'react';
import { FormControlLabel, Switch } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { AppDialog, AppButton, AppTextField } from '../../../components/ui';
import { AppSelect } from '../../../components/ui/Select';
import { WarehouseAutocomplete } from '../../warehouses/components';
import { ROLE_OPTIONS, getRoleLabel } from '../../../constants';

/**
 * Dialog to edit an existing user. Handles form state and submit; API is called via onSave from parent hook.
 * Supports warehouses (multi-select) and optional new password (not shown; leave blank to keep current).
 * @param {Object} props
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 * @param {import('../services/types').User | null} props.user
 * @param {(userId: string, payload: import('../services/types').UpdateUserPayload) => Promise<void>} props.onSave
 * @param {Array<{ id: string; label: string }>} [props.warehouseOptions] - Options for warehouse multi-select
 */
export function EditUserDialog({ open, onClose, user, onSave, warehouseOptions = [] }) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [warehouses, setWarehouses] = useState([]);
  const [newPassword, setNewPassword] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && user) {
      setName(user.name ?? '');
      setEmail(user.email ?? '');
      setRole(user.role ?? '');
      setWarehouses(
        Array.isArray(user.warehouses)
          ? user.warehouses.map((w) => (typeof w === 'object' && w?.id != null ? w.id : w))
          : []
      );
      setNewPassword('');
      setIsActive(user.is_active ?? true);
      setSubmitting(false);
    }
  }, [open, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    try {
      const payload = {
        name,
        email,
        role,
        is_active: isActive,
        warehouses,
      };
      if (newPassword.trim() !== '') {
        payload.password = newPassword.trim();
      }
      await onSave(user.id, payload);
      onClose();
    } catch (_) {
      // Snackbar handled by hook
    } finally {
      setSubmitting(false);
    }
  };

  const roleOptions = ROLE_OPTIONS.map((r) => ({
    value: r,
    label: getRoleLabel(r),
  }));

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      title={t('users.editUser')}
      actions={
        <>
          <AppButton onClick={onClose} color="inherit">
            {t('users.cancel')}
          </AppButton>
          <AppButton
            type="submit"
            form="edit-user-form"
            disabled={submitting || !name.trim() || !email.trim()}
          >
            {submitting ? t('common.saving') : t('users.save')}
          </AppButton>
        </>
      }
    >
      <form id="edit-user-form" onSubmit={handleSubmit}>
        <AppTextField
          label={t('users.name')}
          value={name}
          onChange={(e) => setName(e.target.value)}
          margin="dense"
          fullWidth
          required
        />
        <AppTextField
          label={t('users.email')}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          margin="dense"
          fullWidth
          required
        />
        <AppSelect
          label={t('users.role')}
          value={role}
          onChange={(e) => setRole(e.target.value)}
          margin="dense"
          options={roleOptions}
        />
        <WarehouseAutocomplete
          label={t('users.warehouses')}
          placeholder={t('users.warehousesPlaceholder')}
          options={warehouseOptions}
          valueIds={warehouses}
          onChange={(ids) => setWarehouses(Array.isArray(ids) ? ids : [])}
          margin="dense"
          multiple
        />
        <AppTextField
          label={t('users.newPassword')}
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          margin="dense"
          fullWidth
          placeholder={t('users.newPasswordPlaceholder')}
          autoComplete="new-password"
        />
        <FormControlLabel
          control={
            <Switch
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              color="primary"
            />
          }
          label={isActive ? t('users.active') : t('users.inactive')}
          sx={{ mt: 1 }}
        />
      </form>
    </AppDialog>
  );
}
