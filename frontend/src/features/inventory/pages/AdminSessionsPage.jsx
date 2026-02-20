import { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { PageContainer } from '../../../components/layout';
import {
  AppButton,
  AppLoader,
  AppSnackbar,
  AppTable,
  AppTextField,
} from '../../../components/ui';
import { AppSelect } from '../../../components/ui/Select';
import { WarehouseAutocomplete } from '../../warehouses/components';
import { getWarehouses } from '../../warehouses/services';
import { useAdminSessions } from '../hooks';

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
  ];
}

export function AdminSessionsPage() {
  const { t } = useTranslation();
  const [warehouseOptions, setWarehouseOptions] = useState([]);
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
    snack,
    closeSnack,
    formatDate,
  } = useAdminSessions();
  const columns = useColumns();

  const rows = sessions.map((s) => ({
    id: s.id,
    warehouse_description: s.warehouse_description || '—',
    month: s.month ? s.month.slice(0, 7) : '—',
    count_number: s.count_number,
    created_at: formatDate(s.created_at),
    closed_at: formatDate(s.closed_at),
    products_count: s.products_count ?? 0,
  }));

  return (
    <PageContainer maxWidth="lg">
      <Typography variant="h5" gutterBottom>
        {t('inventorySessions.adminSessionsTitle')}
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2, alignItems: 'center' }}>
        <WarehouseAutocomplete
          options={warehouseOptions}
          valueIds={filters.warehouse_id}
          onChange={(id) => setFilters((f) => ({ ...f, warehouse_id: id }))}
          multiple={false}
          label={t('inventorySessions.warehouseColumn')}
        />
        <AppTextField
          label={t('inventorySessions.monthColumn')}
          type="month"
          value={filters.month}
          onChange={(e) => setFilters((f) => ({ ...f, month: e.target.value }))}
          InputLabelProps={{ shrink: true }}
          size="small"
          sx={{ minWidth: 160 }}
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
      </Box>
      {loading && <AppLoader message={t('common.loading')} />}
      {!loading && rows.length === 0 && (
        <Typography color="text.secondary">{t('inventorySessions.noSessions')}</Typography>
      )}
      {!loading && rows.length > 0 && (
        <AppTable columns={columns} rows={rows} rowKey="id" />
      )}
      <AppSnackbar
        open={snack.open}
        message={snack.message}
        severity={snack.severity}
        onClose={closeSnack}
      />
    </PageContainer>
  );
}
