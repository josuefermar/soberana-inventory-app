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
import { useMeasuresPage } from '../hooks';

function useMeasuresColumns() {
  const { t } = useTranslation();
  return [
    { id: 'name', label: t('measures.name') },
    { id: 'abbreviation', label: t('measures.abbreviation') },
    { id: 'status', label: t('measures.status') },
    { id: 'actions', label: t('measures.actions') },
  ];
}

export function MeasuresPage() {
  const { t } = useTranslation();
  const {
    measures,
    loading,
    createOpen,
    setCreateOpen,
    editOpen,
    setEditOpen,
    form,
    setForm,
    loadMeasures,
    handleCreate,
    openEdit,
    handleUpdate,
    handleToggle,
    snack,
    closeSnack,
    resetForm,
  } = useMeasuresPage();
  const columns = useMeasuresColumns();

  const tableRows = measures.map((m) => ({
    id: m.id,
    name: m.name,
    abbreviation: m.abbreviation,
    status: m.is_active ? t('measures.active') : t('measures.inactive'),
    actions: (
      <Box sx={{ display: 'flex', gap: 1 }}>
        <AppButton size="small" variant="outlined" onClick={() => openEdit(m)}>
          {t('measures.edit')}
        </AppButton>
        <AppButton
          size="small"
          variant="outlined"
          color="secondary"
          onClick={() => handleToggle(m.id)}
        >
          {m.is_active ? t('measures.deactivate') : t('measures.activate')}
        </AppButton>
      </Box>
    ),
  }));

  return (
    <PageContainer maxWidth="lg">
      <Typography variant="h5" gutterBottom>
        {t('measures.title')}
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <AppButton onClick={loadMeasures} disabled={loading}>
          {t('measures.refresh')}
        </AppButton>
        <AppButton onClick={() => setCreateOpen(true)}>{t('measures.create')}</AppButton>
      </Box>
      <AppTable columns={columns} rows={tableRows} />

      <AppDialog
        open={createOpen}
        onClose={() => { setCreateOpen(false); resetForm(); }}
        title={t('measures.create')}
        actions={
          <>
            <AppButton onClick={() => { setCreateOpen(false); resetForm(); }} color="inherit">
              {t('measures.cancel')}
            </AppButton>
            <AppButton type="submit" form="create-measure-form">
              {t('measures.create')}
            </AppButton>
          </>
        }
      >
        <form id="create-measure-form" onSubmit={handleCreate}>
          <AppTextField
            label={t('measures.name')}
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            margin="dense"
            required
            fullWidth
          />
          <AppTextField
            label={t('measures.abbreviation')}
            value={form.abbreviation}
            onChange={(e) =>
              setForm((f) => ({ ...f, abbreviation: e.target.value.toUpperCase() }))
            }
            margin="dense"
            required
            inputProps={{ maxLength: 10 }}
            placeholder="e.g. UND, CJ"
            fullWidth
          />
        </form>
      </AppDialog>

      <AppDialog
        open={editOpen}
        onClose={() => { setEditOpen(false); resetForm(); }}
        title={t('measures.edit')}
        actions={
          <>
            <AppButton onClick={() => { setEditOpen(false); resetForm(); }} color="inherit">
              {t('measures.cancel')}
            </AppButton>
            <AppButton type="submit" form="edit-measure-form">
              {t('measures.save')}
            </AppButton>
          </>
        }
      >
        <form id="edit-measure-form" onSubmit={handleUpdate}>
          <AppTextField
            label={t('measures.name')}
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            margin="dense"
            required
            fullWidth
          />
          <AppTextField
            label={t('measures.abbreviation')}
            value={form.abbreviation}
            onChange={(e) =>
              setForm((f) => ({ ...f, abbreviation: e.target.value.toUpperCase() }))
            }
            margin="dense"
            required
            inputProps={{ maxLength: 10 }}
            fullWidth
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
