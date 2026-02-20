import { useState, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { getErrorMessage } from '../../../utils/errorHandling';
import { createSession as createSessionApi } from '../services/inventoryService';

/**
 * Create session form and submit. Uses current user for created_by.
 * @returns {{
 *   warehouse_id: string;
 *   setWarehouse_id: (v: string) => void;
 *   month: string;
 *   setMonth: (v: string) => void;
 *   count_number: number;
 *   setCount_number: (v: number) => void;
 *   loading: boolean;
 *   handleSubmit: (e: React.FormEvent) => Promise<void>;
 *   snack: { open: boolean; message: string; severity: string };
 *   closeSnack: () => void;
 * }}
 */
export function useCreateSession() {
  const { user } = useAuth();
  const [warehouse_id, setWarehouse_id] = useState('');
  const [month, setMonth] = useState('');
  const [count_number, setCount_number] = useState(1);
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
          count_number: Number(count_number),
          created_by: user.sub,
        });
        setSnack({
          open: true,
          message: `Session created: ${data.id}`,
          severity: 'success',
        });
        setWarehouse_id('');
        setMonth('');
        setCount_number(1);
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
    [warehouse_id, month, count_number, user?.sub]
  );

  return {
    warehouse_id,
    setWarehouse_id,
    month,
    setMonth,
    count_number,
    setCount_number,
    loading,
    handleSubmit,
    snack,
    closeSnack,
  };
}
