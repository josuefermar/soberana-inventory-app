import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { getErrorMessage } from '../../../utils/errorHandling';
import { registerCount as registerCountApi } from '../services/inventoryService';
import { toPackagingQuantity } from '../utils/countUtils';

/**
 * Register count form and submit for an existing session.
 * Reuses the same row-based flow as create session: validate rows, then register count for each.
 * @param {string} sessionId
 * @returns {{
 *   loading: boolean;
 *   handleSubmit: (e: React.FormEvent, rows: Array<{ id: string; product_id: string; measure_unit_id: string; quantity: number; product?: import('../services/types').ProductListItem }>, validateRows: () => boolean) => Promise<void>;
 *   snack: { open: boolean; message: string; severity: string };
 *   closeSnack: () => void;
 * }}
 */
export function useRegisterCount(sessionId) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const closeSnack = useCallback(() => {
    setSnack((s) => ({ ...s, open: false }));
  }, []);

  const handleSubmit = useCallback(
    async (e, rows, validateRows) => {
      e.preventDefault();
      if (!sessionId) return;
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
        for (const row of validRows) {
          const packagingQuantity = toPackagingQuantity(row);
          await registerCountApi(sessionId, {
            product_id: row.product_id,
            packaging_quantity: packagingQuantity,
            measure_unit_id: row.measure_unit_id || undefined,
          });
        }
        setSnack({
          open: true,
          message: t('inventorySessions.countsRegistered', { count: validRows.length }),
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
    [sessionId, t]
  );

  return {
    loading,
    handleSubmit,
    snack,
    closeSnack,
  };
}
