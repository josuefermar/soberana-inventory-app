import { useState, useEffect, useCallback } from 'react';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { PageContainer } from '../../../components/layout';
import {
  AppButton,
  AppLoader,
  AppSnackbar,
  AppTable,
  MonthPicker,
} from '../../../components/ui';
import { AppSelect } from '../../../components/ui/Select';
import { WarehouseAutocomplete } from '../../warehouses/components';
import { getWarehouses } from '../../warehouses/services';
import { SessionDetailDialog } from '../components';
import { useAdminSessions } from '../hooks';
import styles from './AdminSessionsPage.module.scss';

const STATUS_OPTIONS = [
  { value: '', label: '—' },
  { value: 'open', label: 'Open' },
  { value: 'closed', label: 'Closed' },
];

function useColumns() {
  const { t } = useTranslation();
  return [
    { id: 'warehouse_description', label: t('inventorySessions.warehouseColumn') },
    { id: 'month', label: t('inventorySessions.monthColumn') },
    { id: 'count_number', label: t('inventorySessions.countColumn') },
    { id: 'created_at', label: t('inventorySessions.createdAt') },
    { id: 'closed_at', label: t('inventorySessions.closedAt') },
    { id: 'products_count', label: t('inventorySessions.productsCount') },
    { id: 'actions', label: t('inventorySessions.actions') },
  ];
}

export function AdminSessionsPage() {
  const { t } = useTranslation();
  const [warehouseOptions, setWarehouseOptions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [openDetailModal, setOpenDetailModal] = useState(false);

  useEffect(() => {
    getWarehouses()
      .then((list) =>
        setWarehouseOptions(
          list.map((w) => ({ id: w.id, label: w.description || w.code }))
        )
      )
      .catch(() => setWarehouseOptions([]));
  }, []);

  const {
    sessions,
    loading,
    filters,
    setFilters,
    loadSessions,
    resetFilters,
    snack,
    closeSnack,
    formatDate,
  } = useAdminSessions();
  const columns = useColumns();

  const handleViewSession = useCallback((session) => {
    setSelectedSession(session);
    setOpenDetailModal(true);
  }, []);

  const handleCloseDetailModal = useCallback(() => {
    setOpenDetailModal(false);
    setSelectedSession(null);
  }, []);

  const rows = sessions.map((s) => ({
    id: s.id,
    warehouse_description: s.warehouse_description || '—',
    month: s.month ? s.month.slice(0, 7) : '—',
    count_number: s.count_number,
    created_at: formatDate(s.created_at),
    closed_at: formatDate(s.closed_at),
    products_count: s.products_count ?? 0,
    actions: (
      <AppButton size="small" variant="outlined" onClick={() => handleViewSession(s)}>
        {t('inventorySessions.view')}
      </AppButton>
    ),
  }));

  return (
    <PageContainer maxWidth="lg">
      <Typography variant="h5" className={styles.pageTitle}>
        {t('inventorySessions.adminSessionsTitle')}
      </Typography>
      <Box className={styles.filtersBar}>
        <WarehouseAutocomplete
          options={warehouseOptions}
          valueIds={filters.warehouse_id}
          onChange={(id) => setFilters((f) => ({ ...f, warehouse_id: id }))}
          multiple={false}
          label={t('inventorySessions.warehouseColumn')}
        />
        <MonthPicker
          label={t('inventorySessions.monthColumn')}
          value={filters.month}
          onChange={(month) => setFilters((f) => ({ ...f, month }))}
          size="small"
          sx={{ minWidth: 200 }}
        />
        <AppSelect
          label={t('inventorySessions.status')}
          value={filters.status}
          onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
          options={STATUS_OPTIONS.map((o) => ({
            value: o.value,
            label: o.value ? t(`inventorySessions.${o.value}`) : o.label,
          }))}
        />
        <AppButton onClick={loadSessions} disabled={loading}>
          {t('inventorySessions.applyFilters')}
        </AppButton>
        <AppButton variant="outlined" onClick={resetFilters} disabled={loading}>
          {t('inventorySessions.clearFilters')}
        </AppButton>
      </Box>
      {loading && <AppLoader message={t('common.loading')} />}
      {!loading && rows.length === 0 && (
        <Typography className={styles.emptyMessage}>{t('inventorySessions.noSessions')}</Typography>
      )}
      {!loading && rows.length > 0 && (
        <div className={styles.tableWrap}>
          <AppTable columns={columns} rows={rows} rowKey="id" />
        </div>
      )}
      <SessionDetailDialog
        open={openDetailModal}
        onClose={handleCloseDetailModal}
        session={selectedSession}
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
