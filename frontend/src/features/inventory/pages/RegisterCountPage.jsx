import { Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import { PageContainer } from '../../../components/layout';
import { AppButton, AppSnackbar, AppTextField } from '../../../components/ui';
import { useRegisterCount } from '../hooks';

export function RegisterCountPage() {
  const { sessionId } = useParams();
  const {
    product_id,
    setProduct_id,
    packaging_quantity,
    setPackaging_quantity,
    loading,
    lastTotal,
    handleSubmit,
    snack,
    closeSnack,
  } = useRegisterCount(sessionId);

  return (
    <PageContainer maxWidth="sm">
      <Typography variant="h5" gutterBottom>
        Register Count
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Session: {sessionId}
      </Typography>
      <form onSubmit={handleSubmit}>
        <AppTextField
          label="Product ID (UUID)"
          value={product_id}
          onChange={(e) => setProduct_id(e.target.value)}
          required
        />
        <AppTextField
          label="Packaging quantity"
          type="number"
          inputProps={{ min: 1 }}
          value={packaging_quantity}
          onChange={(e) => setPackaging_quantity(e.target.value)}
          required
        />
        {lastTotal != null && (
          <Typography sx={{ mt: 1 }}>
            Total units: <strong>{lastTotal}</strong>
          </Typography>
        )}
        <AppButton type="submit" sx={{ mt: 2 }} disabled={loading}>
          {loading ? 'Submitting...' : 'Submit'}
        </AppButton>
      </form>
      <AppSnackbar
        open={snack.open}
        message={snack.message}
        severity={snack.severity}
        onClose={closeSnack}
      />
    </PageContainer>
  );
}
