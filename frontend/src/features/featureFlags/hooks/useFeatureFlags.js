import { useCallback, useState } from 'react';
import { getErrorMessage } from '../../../utils/errorHandling';
import {
  getFlags,
  createFlag,
  updateFlag,
  toggleFlag,
} from '../services/featureFlagsService';

/**
 * Feature flags admin: list, create, update, toggle.
 * @returns {{
 *   flags: import('../services/featureFlagsService').FeatureFlag[];
 *   loading: boolean;
 *   error: string | null;
 *   fetchFlags: () => Promise<void>;
 *   toggleFlag: (id: string) => Promise<void>;
 *   createFlag: (payload: import('../services/featureFlagsService').CreateFlagPayload) => Promise<void>;
 *   updateFlag: (id: string, payload: import('../services/featureFlagsService').UpdateFlagPayload) => Promise<void>;
 *   snack: { open: boolean; message: string; severity: string };
 *   closeSnack: () => void;
 * }}
 */
export function useFeatureFlags() {
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [snack, setSnack] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const closeSnack = useCallback(() => {
    setSnack((s) => ({ ...s, open: false }));
  }, []);

  const fetchFlags = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getFlags();
      setFlags(data);
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      setSnack({ open: true, message: msg, severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  const handleToggleFlag = useCallback(
    async (id) => {
      try {
        const updated = await toggleFlag(id);
        setFlags((prev) =>
          prev.map((f) => (f.id === id ? updated : f))
        );
        setSnack({
          open: true,
          message: updated.enabled ? 'Flag enabled' : 'Flag disabled',
          severity: 'success',
        });
      } catch (err) {
        setSnack({
          open: true,
          message: getErrorMessage(err),
          severity: 'error',
        });
      }
    },
    []
  );

  const handleCreateFlag = useCallback(
    async (payload) => {
      try {
        const created = await createFlag(payload);
        setFlags((prev) => [...prev, created].sort((a, b) => a.key.localeCompare(b.key)));
        setSnack({ open: true, message: 'Feature flag created', severity: 'success' });
        return created;
      } catch (err) {
        setSnack({
          open: true,
          message: getErrorMessage(err),
          severity: 'error',
        });
        throw err;
      }
    },
    []
  );

  const handleUpdateFlag = useCallback(
    async (id, payload) => {
      try {
        const updated = await updateFlag(id, payload);
        setFlags((prev) =>
          prev.map((f) => (f.id === id ? updated : f))
        );
        setSnack({ open: true, message: 'Feature flag updated', severity: 'success' });
        return updated;
      } catch (err) {
        setSnack({
          open: true,
          message: getErrorMessage(err),
          severity: 'error',
        });
        throw err;
      }
    },
    []
  );

  return {
    flags,
    loading,
    error,
    fetchFlags,
    toggleFlag: handleToggleFlag,
    createFlag: handleCreateFlag,
    updateFlag: handleUpdateFlag,
    snack,
    closeSnack,
  };
}
