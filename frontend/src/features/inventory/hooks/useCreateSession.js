import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../context/AuthContext';
import { getErrorMessage } from '../../../utils/errorHandling';
import { getWarehouses } from '../../warehouses/services';
import {
  createSession as createSessionApi,
  addSessionProducts as addSessionProductsApi,
} from '../services/inventoryService';

/**
 * Create session form and submit. count_number is computed by backend.
 * After create, optional step to add products to session.
 */
export function useCreateSession() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [warehouse_id, setWarehouse_id] = useState('');
  const [month, setMonth] = useState('');
  const [warehouseOptions, setWarehouseOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [createdSessionId, setCreatedSessionId] = useState(null);
  const [snack, setSnack] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    getWarehouses()
      .then((list) =>
        setWarehouseOptions(
          list.map((w) => ({ id: w.id, label: w.description || w.code }))
        )
      )
      .catch(() => setWarehouseOptions([]));
  }, []);

  const closeSnack = useCallback(() => {
    setSnack((s) => ({ ...s, open: false }));
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!user?.sub) return;
      setLoading(true);
      try {
        const monthDate = month
          ? `${month}-01T00:00:00.000Z`
          : new Date().toISOString().slice(0, 10) + 'T00:00:00.000Z';
        const data = await createSessionApi({
          warehouse_id,
          month: monthDate,
          created_by: user.sub,
        });
        setSnack({
          open: true,
          message: t('inventorySessions.sessionCreated', { id: data.id }),
          severity: 'success',
        });
        setCreatedSessionId(data.id);
        setWarehouse_id('');
        setMonth('');
      } catch (err) {
        setSnack({
          open: true,
          message: getErrorMessage(err),
          severity: 'error',
        });
      } finally {
        setLoading(false);
      }
    },
    [warehouse_id, month, user?.sub, t]
  );

  const handleAddProducts = useCallback(
    async (productIds) => {
      if (!createdSessionId || !productIds?.length) return;
      setLoading(true);
      try {
        const { added } = await addSessionProductsApi(createdSessionId, {
          product_ids: productIds,
        });
        setSnack({
          open: true,
          message: t('inventorySessions.productsAdded') + ` (${added})`,
          severity: 'success',
        });
      } catch (err) {
        setSnack({
          open: true,
          message: getErrorMessage(err),
          severity: 'error',
        });
      } finally {
        setLoading(false);
      }
    },
    [createdSessionId, t]
  );

  const resetCreatedSession = useCallback(() => {
    setCreatedSessionId(null);
  }, []);

  return {
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
  };
}
