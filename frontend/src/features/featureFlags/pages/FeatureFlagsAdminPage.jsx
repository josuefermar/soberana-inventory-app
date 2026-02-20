import { useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { PageContainer } from '../../../components/layout';
import {
  AppButton,
  AppTable,
  AppSnackbar,
  AppLoader,
} from '../../../components/ui';
import { Switch } from '@mui/material';
import { useFeatureFlags } from '../hooks/useFeatureFlags';
import { FeatureFlagFormModal } from '../components/FeatureFlagFormModal';
import { useState, useCallback } from 'react';

const COLUMNS = [
  { id: 'key', label: 'Key' },
  { id: 'description', label: 'Description' },
  { id: 'enabled', label: 'Enabled' },
  { id: 'actions', label: 'Actions' },
];

export function FeatureFlagsAdminPage() {
  const {
    flags,
    loading,
    fetchFlags,
    toggleFlag,
    createFlag,
    updateFlag,
    snack,
    closeSnack,
  } = useFeatureFlags();

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingFlag, setEditingFlag] = useState(null);

  useEffect(() => {
    fetchFlags();
  }, [fetchFlags]);

  const openEdit = useCallback((flag) => {
    setEditingFlag(flag);
    setEditOpen(true);
  }, []);

  const closeEdit = useCallback(() => {
    setEditOpen(false);
    setEditingFlag(null);
  }, []);

  const tableRows = flags.map((f) => ({
    id: f.id,
    key: f.key,
    description: f.description ?? '—',
    enabled: (
      <Switch
        checked={f.enabled}
        onChange={() => toggleFlag(f.id)}
        color="primary"
        size="small"
      />
    ),
    actions: (
      <AppButton size="small" variant="outlined" onClick={() => openEdit(f)}>
        Edit
      </AppButton>
    ),
  }));

  return (
    <PageContainer maxWidth="lg">
      <Typography variant="h5" gutterBottom>
        Feature Flags
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <AppButton onClick={fetchFlags} disabled={loading}>
          Refresh
        </AppButton>
        <AppButton onClick={() => setCreateOpen(true)}>Create flag</AppButton>
      </Box>

      {loading ? (
        <AppLoader message="Loading feature flags..." />
      ) : (
        <AppTable columns={COLUMNS} rows={tableRows} />
      )}

      <FeatureFlagFormModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        mode="create"
        onCreate={createFlag}
        onUpdate={updateFlag}
      />
      <FeatureFlagFormModal
        open={editOpen}
        onClose={closeEdit}
        mode="edit"
        flag={editingFlag}
        onCreate={createFlag}
        onUpdate={updateFlag}
      />

      <AppSnackbar
        open={snack.open}
        message={snack.message}
        severity={snack.severity}
        onClose={closeSnack}
      />
    </PageContainer>
  );
}
