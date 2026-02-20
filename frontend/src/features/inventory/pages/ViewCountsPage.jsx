import { Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageContainer } from '../../../components/layout';
import { AppLoader, AppSnackbar, AppTable } from '../../../components/ui';
import { useViewCounts } from '../hooks';
import { formatDateTime } from '../../../utils';

function useCountColumns() {
  const { t } = useTranslation();
  return [
    { id: 'product', label: t('products.product') },
    { id: 'packaging_quantity', label: t('products.packagingQuantity') },
    { id: 'total_units', label: t('products.totalUnits') },
    { id: 'created_at', label: t('inventorySessions.createdAt') },
  ];
}

export function ViewCountsPage() {
  const { sessionId } = useParams();
  const { t } = useTranslation();
  const { counts, loading, snack, closeSnack } = useViewCounts(sessionId);
  const COUNT_COLUMNS = useCountColumns();

  const tableRows = counts.map((row, idx) => ({
    id: row.product?.id ?? idx,
    product:
      row.product?.description ??
      row.product?.code ??
      row.product?.id ??
      '—',
    packaging_quantity: row.packaging_quantity,
    total_units: row.total_units,
    created_at: formatDateTime(row.created_at),
  }));

  return (
    <PageContainer maxWidth="lg">
      <Typography variant="h5" gutterBottom>
        {t('dashboard.viewCounts')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Session: {sessionId}
      </Typography>
      {loading ? (
        <AppLoader message={t('common.loading')} />
      ) : (
        <AppTable columns={COUNT_COLUMNS} rows={tableRows} rowKey="id" />
      )}
      <AppSnackbar
        open={snack.open}
        message={snack.message}
        severity="error"
        onClose={closeSnack}
      />
    </PageContainer>
  );
}
