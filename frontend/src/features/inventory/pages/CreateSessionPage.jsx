import { useEffect } from 'react';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { PageContainer } from '../../../components/layout';
import { AppButton, AppSnackbar, MonthPicker } from '../../../components/ui';
import { WarehouseAutocomplete } from '../../warehouses/components';
import { ProductCountTable } from '../components';
import {
  useCreateSession,
  useProductsAutocomplete,
  useMeasures,
  useInventorySessionProducts,
} from '../hooks';

export function CreateSessionPage() {
  const { t } = useTranslation();
  const {
    warehouse_id,
    setWarehouse_id,
    month,
    setMonth,
    loading,
    warehouseOptions,
    handleSubmit,
    createdSessionId,
    resetCreatedSession,
    snack,
    closeSnack,
  } = useCreateSession();

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

  return (
    <PageContainer maxWidth="md">
      <Typography variant="h5" gutterBottom>
        {t('inventorySessions.title')}
      </Typography>
      {!createdSessionId ? (
        <form onSubmit={onSubmit}>
          <WarehouseAutocomplete
            label={t('inventorySessions.warehouse')}
            placeholder={t('inventorySessions.warehousePlaceholder')}
            options={warehouseOptions}
            valueIds={warehouse_id}
            onChange={setWarehouse_id}
            multiple={false}
            required
          />
          <MonthPicker
            label={t('inventorySessions.month')}
            value={month}
            onChange={setMonth}
            required
            sx={{ mt: 2 }}
          />
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
            {loading ? t('inventorySessions.creating') : t('inventorySessions.create')}
          </AppButton>
        </form>
      ) : (
        <>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t('inventorySessions.sessionCreated', { id: createdSessionId })}
          </Typography>
          <AppButton variant="outlined" onClick={resetCreatedSession}>
            {t('inventorySessions.createAnother')}
          </AppButton>
        </>
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
