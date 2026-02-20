import { useEffect } from 'react';
import { Typography } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { PageContainer } from '../../../components/layout';
import { AppButton, AppSnackbar } from '../../../components/ui';
import { ProductCountTable } from '../components';
import {
  useRegisterCount,
  useProductsAutocomplete,
  useMeasures,
  useInventorySessionProducts,
  useSession,
} from '../hooks';
import styles from './RegisterCountPage.module.scss';

/**
 * Register count page for an existing session.
 * Reuses the same form as Create Session: product rows with autocomplete, measure unit, quantity.
 */
export function RegisterCountPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { session, loading: sessionLoading } = useSession(sessionId);
  const {
    loading,
    handleSubmit,
    snack,
    closeSnack,
  } = useRegisterCount(sessionId);

  const {
    options: productOptions,
    loading: productOptionsLoading,
    fetchOptions: fetchProducts,
  } = useProductsAutocomplete();

  const { measures: measureOptions, loading: measuresLoading } = useMeasures();

  const {
    rows,
    addRow,
    removeRow,
    updateRow,
    validationErrors,
    validate,
  } = useInventorySessionProducts();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const onSubmit = (e) => {
    handleSubmit(e, rows, validate);
  };

  const dayjsLocale = i18n.language?.startsWith('es') ? 'es' : 'en';
  const monthLabel = session?.month
    ? dayjs(session.month).locale(dayjsLocale).format('MMMM YYYY')
    : '';
  let subtitle = '';
  if (session) {
    subtitle = t('inventorySessions.registerCountSubtitle', {
      warehouse: session.warehouse_description || sessionId,
      month: monthLabel,
    });
  } else if (sessionLoading) {
    subtitle = '...';
  }

  return (
    <PageContainer maxWidth="md">
      <Typography variant="h5" gutterBottom className={styles.pageTitle}>
        {t('dashboard.registerCount')}
      </Typography>
      {subtitle && (
        <Typography variant="body2" color="text.secondary" className={styles.sessionBadge} sx={{ mb: 2 }}>
          {subtitle}
        </Typography>
      )}
      <form onSubmit={onSubmit}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2, mb: 1 }}>
          {t('inventorySessions.addProducts')}
        </Typography>
        <ProductCountTable
          rows={rows}
          onUpdateRow={updateRow}
          onRemoveRow={removeRow}
          onAddRow={addRow}
          productOptions={productOptions}
          productOptionsLoading={productOptionsLoading}
          onFetchProducts={fetchProducts}
          measureOptions={measureOptions}
          validationErrors={validationErrors}
          addProductLabel={t('inventorySessions.addProduct')}
          productColumnLabel={t('products.product')}
          unitColumnLabel={t('inventorySessions.measureUnit')}
          quantityColumnLabel={t('inventorySessions.quantity')}
        />
        <AppButton
          type="submit"
          sx={{ mt: 2 }}
          disabled={loading || measuresLoading}
        >
          {loading ? t('inventorySessions.registerCountsSubmitting') : t('inventorySessions.registerCounts')}
        </AppButton>
        <AppButton
          type="button"
          variant="outlined"
          sx={{ mt: 2, ml: 1 }}
          onClick={() => navigate(-1)}
        >
          {t('inventorySessions.cancel')}
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
