import { useState, useEffect } from 'react';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { PageContainer } from '../../../components/layout';
import { AppButton, AppSnackbar, AppTextField } from '../../../components/ui';
import { WarehouseAutocomplete } from '../../warehouses/components';
import { ProductAutocomplete } from '../../products/components';
import { getProducts } from '../../products/services';
import { useCreateSession } from '../hooks';

export function CreateSessionPage() {
  const { t } = useTranslation();
  const [productOptions, setProductOptions] = useState([]);
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const {
    warehouse_id,
    setWarehouse_id,
    month,
    setMonth,
    loading,
    warehouseOptions,
    handleSubmit,
    createdSessionId,
    handleAddProducts,
    resetCreatedSession,
    snack,
    closeSnack,
  } = useCreateSession();

  useEffect(() => {
    getProducts()
      .then((list) =>
        setProductOptions(
          list.map((p) => ({
            id: p.id,
            label: p.description || p.code || p.id,
          }))
        )
      )
      .catch(() => setProductOptions([]));
  }, []);

  return (
    <PageContainer maxWidth="sm">
      <Typography variant="h5" gutterBottom>
        {t('inventorySessions.title')}
      </Typography>
      {!createdSessionId ? (
        <form onSubmit={handleSubmit}>
          <WarehouseAutocomplete
            label={t('inventorySessions.warehouse')}
            placeholder={t('inventorySessions.warehousePlaceholder')}
            options={warehouseOptions}
            valueIds={warehouse_id}
            onChange={setWarehouse_id}
            multiple={false}
            required
          />
          <AppTextField
            label={t('inventorySessions.month')}
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            required
            InputLabelProps={{ shrink: true }}
            sx={{ mt: 2 }}
          />
          <AppButton type="submit" sx={{ mt: 2 }} disabled={loading}>
            {loading ? t('inventorySessions.creating') : t('inventorySessions.create')}
          </AppButton>
        </form>
      ) : (
        <>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t('inventorySessions.addProducts')}
          </Typography>
          <ProductAutocomplete
            options={productOptions}
            valueIds={selectedProductIds}
            onChange={setSelectedProductIds}
            label={t('products.product')}
            placeholder={t('inventorySessions.productsPlaceholder')}
          />
          <AppButton
            sx={{ mt: 2 }}
            disabled={loading || !selectedProductIds.length}
            onClick={() => handleAddProducts(selectedProductIds)}
          >
            {loading ? t('common.loading') : t('inventorySessions.productsAdded')}
          </AppButton>
          <AppButton sx={{ mt: 2, ml: 1 }} variant="outlined" onClick={resetCreatedSession}>
            {t('users.cancel')}
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
