import { Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import { PageContainer } from '../../../components/layout';
import { AppLoader, AppSnackbar, AppTable } from '../../../components/ui';
import { useViewCounts } from '../hooks';
import { formatDateTime } from '../../../utils';

const COUNT_COLUMNS = [
  { id: 'product', label: 'Product' },
  { id: 'packaging_quantity', label: 'Packaging quantity' },
  { id: 'total_units', label: 'Total units' },
  { id: 'created_at', label: 'Created at' },
];

export function ViewCountsPage() {
  const { sessionId } = useParams();
  const { counts, loading, snack, closeSnack } = useViewCounts(sessionId);

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
        View Counts
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Session: {sessionId}
      </Typography>
      {loading ? (
        <AppLoader message="Loading..." />
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
