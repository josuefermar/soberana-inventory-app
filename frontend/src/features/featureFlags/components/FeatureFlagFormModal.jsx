import { useState, useEffect } from 'react';
import { Switch, FormControlLabel } from '@mui/material';
import { AppDialog, AppButton, AppTextField } from '../../../components/ui';

/**
 * Modal to create or edit a feature flag. Key is read-only when editing.
 * @param {Object} props
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 * @param {('create'|'edit')} props.mode
 * @param {{ id: string; key: string; description: string|null; enabled: boolean }|null} [props.flag] - For edit mode
 * @param {(payload: { key: string; description: string|null; enabled: boolean }) => Promise<void>} props.onCreate
 * @param {(id: string, payload: { description: string|null; enabled: boolean }) => Promise<void>} props.onUpdate
 */
export function FeatureFlagFormModal({
  open,
  onClose,
  mode,
  flag = null,
  onCreate,
  onUpdate,
}) {
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const [enabled, setEnabled] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isEdit = mode === 'edit';

  useEffect(() => {
    if (open) {
      if (isEdit && flag) {
        setKey(flag.key);
        setDescription(flag.description ?? '');
        setEnabled(flag.enabled);
      } else {
        setKey('');
        setDescription('');
        setEnabled(false);
      }
      setSubmitting(false);
    }
  }, [open, isEdit, flag]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isEdit && flag) {
      setSubmitting(true);
      try {
        await onUpdate(flag.id, {
          description: description.trim() || null,
          enabled,
        });
        onClose();
      } catch (_) {
        // Snackbar handled in hook
      } finally {
        setSubmitting(false);
      }
    } else {
      const k = key.trim();
      if (!k) return;
      setSubmitting(true);
      try {
        await onCreate({
          key: k,
          description: description.trim() || null,
          enabled,
        });
        onClose();
      } catch (_) {
        // Snackbar handled in hook
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit feature flag' : 'Create feature flag'}
      actions={
        <>
          <AppButton onClick={onClose} color="inherit">
            Cancel
          </AppButton>
          <AppButton
            type="submit"
            form="feature-flag-form"
            disabled={submitting || (!isEdit && !key.trim())}
          >
            {submitting ? 'Saving...' : isEdit ? 'Save' : 'Create'}
          </AppButton>
        </>
      }
    >
      <form id="feature-flag-form" onSubmit={handleSubmit}>
        <AppTextField
          label="Key"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          margin="dense"
          fullWidth
          required={!isEdit}
          disabled={isEdit}
          helperText={isEdit ? 'Key cannot be changed after creation.' : undefined}
        />
        <AppTextField
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          margin="dense"
          fullWidth
          multiline
          minRows={2}
        />
        <FormControlLabel
          control={
            <Switch
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              color="primary"
            />
          }
          label={enabled ? 'Enabled' : 'Disabled'}
          sx={{ mt: 1 }}
        />
      </form>
    </AppDialog>
  );
}
