import { Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageContainer } from '../../../components/layout';
import { AppButton, AppSnackbar, AppTextField } from '../../../components/ui';
import { useRegisterCount } from '../hooks';

export function RegisterCountPage() {
  const { sessionId } = useParams();
  const { t } = useTranslation();
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
        {t('products.title')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Session: {sessionId}
      </Typography>
      <form onSubmit={handleSubmit}>
        <AppTextField
          label={t('products.product')}
          value={product_id}
          onChange={(e) => setProduct_id(e.target.value)}
          required
        />
        <AppTextField
          label={t('products.packagingQuantity')}
          type="number"
          inputProps={{ min: 1 }}
          value={packaging_quantity}
          onChange={(e) => setPackaging_quantity(e.target.value)}
          required
        />
        {lastTotal != null && (
          <Typography sx={{ mt: 1 }}>
            {t('products.totalUnits')}: <strong>{lastTotal}</strong>
          </Typography>
        )}
        <AppButton type="submit" sx={{ mt: 2 }} disabled={loading}>
          {loading ? t('products.submitting') : t('products.submit')}
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
