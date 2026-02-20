import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../context/AuthContext';
import { getErrorMessage } from '../../../utils/errorHandling';
import { getWarehouses } from '../../warehouses/services';
import {
  createSession as createSessionApi,
  registerCount as registerCountApi,
} from '../services/inventoryService';

/**
 * Converts quantity to packaging_quantity for the backend.
 * If measure is packaging unit: packaging_quantity = quantity.
 * If measure is inventory unit: packaging_quantity = quantity / conversion_factor.
 * @param {Object} row - Row with product, measure_unit_id, quantity
 * @returns {number}
 */
function toPackagingQuantity(row) {
  const q = Number(row.quantity);
  if (!Number.isFinite(q) || q <= 0) return 0;
  const product = row.product;
  if (!product?.conversion_factor) return Math.round(q);
  const factor = Number(product.conversion_factor) || 1;
  const isPackaging =
    product.packaging_unit_id && row.measure_unit_id === product.packaging_unit_id;
  if (isPackaging) return Math.round(q);
  return Math.max(1, Math.round(q / factor));
}

/**
 * Create session form and submit. Single flow: warehouse + month + product rows (product, unit, quantity).
 * Creates session then registers each product count with computed packaging_quantity.
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

  /**
   * Submit: validate rows, create session, then register count for each product.
   * @param {Array<{ id: string; product_id: string; measure_unit_id: string; quantity: number; product?: import('../services/types').ProductListItem }>} rows
   * @param {() => boolean} validateRows - Callback that runs validation and returns true if valid
   */
  const handleSubmit = useCallback(
    async (e, rows, validateRows) => {
      e.preventDefault();
      if (!user?.sub) return;
      if (typeof validateRows === 'function' && !validateRows()) return;
      const validRows = rows.filter(
        (r) =>
          r.product_id &&
          r.measure_unit_id &&
          Number(r.quantity) > 0 &&
          r.product
      );
      if (validRows.length === 0) {
        setSnack({
          open: true,
          message: t('inventorySessions.addAtLeastOneProduct'),
          severity: 'warning',
        });
        return;
      }
      setLoading(true);
      try {
        const monthDate = month
          ? `${month}-01T00:00:00.000Z`
          : new Date().toISOString().slice(0, 10) + 'T00:00:00.000Z';
        const sessionData = await createSessionApi({
          warehouse_id,
          month: monthDate,
          created_by: user.sub,
        });
        const sessionId = sessionData.id;
        for (const row of validRows) {
          const packagingQuantity = toPackagingQuantity(row);
          await registerCountApi(sessionId, {
            product_id: row.product_id,
            packaging_quantity: packagingQuantity,
          });
        }
        setSnack({
          open: true,
          message: t('inventorySessions.sessionCreated', { id: sessionId }),
          severity: 'success',
        });
        setCreatedSessionId(sessionId);
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
    resetCreatedSession,
    snack,
    closeSnack,
  };
}
