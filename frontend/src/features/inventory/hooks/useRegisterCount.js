import { useState, useCallback } from 'react';
import { getErrorMessage } from '../../../utils/errorHandling';
import { registerCount as registerCountApi } from '../services/inventoryService';

/**
 * Register count form and submit for a session.
 * @param {string} sessionId
 * @returns {{
 *   product_id: string;
 *   setProduct_id: (v: string) => void;
 *   packaging_quantity: string;
 *   setPackaging_quantity: (v: string) => void;
 *   loading: boolean;
 *   lastTotal: number | null;
 *   handleSubmit: (e: React.FormEvent) => Promise<void>;
 *   snack: { open: boolean; message: string; severity: string };
 *   closeSnack: () => void;
 * }}
 */
export function useRegisterCount(sessionId) {
  const [product_id, setProduct_id] = useState('');
  const [packaging_quantity, setPackaging_quantity] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastTotal, setLastTotal] = useState(null);
  const [snack, setSnack] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const closeSnack = useCallback(() => {
    setSnack((s) => ({ ...s, open: false }));
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setLoading(true);
      setLastTotal(null);
      try {
        const data = await registerCountApi(sessionId, {
          product_id,
          packaging_quantity: Number(packaging_quantity),
        });
        setLastTotal(data.total_units);
        setSnack({ open: true, message: 'Count registered', severity: 'success' });
        setProduct_id('');
        setPackaging_quantity('');
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
    [sessionId, product_id, packaging_quantity]
  );

  return {
    product_id,
    setProduct_id,
    packaging_quantity,
    setPackaging_quantity,
    loading,
    lastTotal,
    handleSubmit,
    snack,
    closeSnack,
  };
}
