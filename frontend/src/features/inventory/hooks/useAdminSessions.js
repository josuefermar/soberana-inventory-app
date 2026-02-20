import { useCallback, useEffect, useState } from 'react';
import { getErrorMessage } from '../../../utils/errorHandling';
import { listSessions } from '../services/inventoryService';
import { formatDateTime } from '../../../utils';

/**
 * Admin inventory sessions list with filters.
 * @returns {{
 *   sessions: Array;
 *   loading: boolean;
 *   filters: { warehouse_id: string; month: string; status: string };
 *   setFilters: React.Dispatch<React.SetStateAction<{ warehouse_id: string; month: string; status: string }>>;
 *   loadSessions: () => Promise<void>;
 *   snack: { open: boolean; message: string; severity: string };
 *   closeSnack: () => void;
 *   formatDate: (d: string) => string;
 * }}
 */
export function useAdminSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    warehouse_id: '',
    month: '',
    status: '',
  });
  const [snack, setSnack] = useState({
    open: false,
    message: '',
    severity: 'error',
  });

  const closeSnack = useCallback(() => {
    setSnack((s) => ({ ...s, open: false }));
  }, []);

  const loadSessions = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.warehouse_id) params.warehouse_id = filters.warehouse_id;
      if (filters.month) params.month = filters.month;
      if (filters.status) params.status = filters.status;
      const data = await listSessions(params);
      setSessions(data);
    } catch (err) {
      setSnack({
        open: true,
        message: getErrorMessage(err),
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [filters.warehouse_id, filters.month, filters.status]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  return {
    sessions,
    loading,
    filters,
    setFilters,
    loadSessions,
    snack,
    closeSnack,
    formatDate: (d) => (d ? formatDateTime(d) : '—'),
  };
}
