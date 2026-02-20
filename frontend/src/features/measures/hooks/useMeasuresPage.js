import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getErrorMessage } from '../../../utils/errorHandling';
import {
  getMeasures,
  createMeasure,
  updateMeasure,
  toggleMeasure,
} from '../services/measuresService';

const INITIAL_FORM = { name: '', abbreviation: '' };

/**
 * Measures dashboard: list, create, update, toggle. ADMIN only.
 */
export function useMeasuresPage() {
  const { t } = useTranslation();
  const [measures, setMeasures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [snack, setSnack] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const closeSnack = useCallback(() => {
    setSnack((s) => ({ ...s, open: false }));
  }, []);

  const loadMeasures = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMeasures();
      setMeasures(data);
    } catch (err) {
      setSnack({ open: true, message: getErrorMessage(err), severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMeasures();
  }, [loadMeasures]);

  const handleCreate = useCallback(
    async (e) => {
      e.preventDefault();
      if (!form.name.trim() || !form.abbreviation.trim()) {
        setSnack({
          open: true,
          message: t('measures.nameAndAbbreviationRequired'),
          severity: 'error',
        });
        return;
      }
      try {
        await createMeasure({
          name: form.name.trim(),
          abbreviation: form.abbreviation.trim().toUpperCase(),
        });
        setSnack({ open: true, message: t('measures.created'), severity: 'success' });
        setCreateOpen(false);
        setForm(INITIAL_FORM);
        loadMeasures();
      } catch (err) {
        setSnack({ open: true, message: getErrorMessage(err), severity: 'error' });
      }
    },
    [form, loadMeasures, t]
  );

  const openEdit = useCallback((row) => {
    setEditingId(row.id);
    setForm({ name: row.name, abbreviation: row.abbreviation });
    setEditOpen(true);
  }, []);

  const handleUpdate = useCallback(
    async (e) => {
      e.preventDefault();
      if (!editingId || !form.name.trim() || !form.abbreviation.trim()) {
        setSnack({
          open: true,
          message: t('measures.nameAndAbbreviationRequired'),
          severity: 'error',
        });
        return;
      }
      try {
        await updateMeasure(editingId, {
          name: form.name.trim(),
          abbreviation: form.abbreviation.trim().toUpperCase(),
        });
        setSnack({ open: true, message: t('measures.updated'), severity: 'success' });
        setEditOpen(false);
        setEditingId(null);
        setForm(INITIAL_FORM);
        loadMeasures();
      } catch (err) {
        setSnack({ open: true, message: getErrorMessage(err), severity: 'error' });
      }
    },
    [editingId, form, loadMeasures, t]
  );

  const handleToggle = useCallback(
    async (id) => {
      try {
        await toggleMeasure(id);
        setSnack({ open: true, message: t('measures.toggled'), severity: 'success' });
        loadMeasures();
      } catch (err) {
        setSnack({ open: true, message: getErrorMessage(err), severity: 'error' });
      }
    },
    [loadMeasures, t]
  );

  return {
    measures,
    loading,
    createOpen,
    setCreateOpen,
    editOpen,
    setEditOpen,
    editingId,
    form,
    setForm,
    loadMeasures,
    handleCreate,
    openEdit,
    handleUpdate,
    handleToggle,
    snack,
    closeSnack,
    resetForm: () => setForm(INITIAL_FORM),
  };
}
