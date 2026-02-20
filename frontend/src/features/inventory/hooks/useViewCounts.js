import { useCallback, useEffect } from 'react';
import { useAsync } from '../../../hooks/useAsync';
import { getCounts } from '../services/inventoryService';

/**
 * Load counts for a session. Uses useAsync for standardized loading/error.
 * @param {string} sessionId
 * @returns {{ counts: Array; loading: boolean; snack: { open: boolean; message: string }; closeSnack: () => void }}
 */
export function useViewCounts(sessionId) {
  const { data, error, loading, execute, reset, setError } = useAsync({
    initialLoading: true,
  });

  const closeSnack = useCallback(() => setError(null), [setError]);

  useEffect(() => {
    if (!sessionId) {
      reset();
      return;
    }
    execute(() => getCounts(sessionId)).catch(() => {});
  }, [sessionId, execute, reset]);

  return {
    counts: Array.isArray(data) ? data : [],
    loading,
    snack: { open: Boolean(error), message: error ?? '' },
    closeSnack,
  };
}
