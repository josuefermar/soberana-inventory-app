import { useCallback, useState } from 'react';
import { getErrorMessage } from '../utils/errorHandling';

/**
 * Standardized async operation with loading, error, and reset.
 * Use in hooks for API calls; centralizes error formatting.
 * @param {Object} [options]
 * @param {boolean} [options.initialLoading=false]
 * @returns {{ data: unknown; error: string | null; loading: boolean; execute: (fn: () => Promise<unknown>) => Promise<unknown>; reset: () => void; setError: (v: string | null) => void }}
 */
export function useAsync(options = {}) {
  const { initialLoading = false } = options;
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(initialLoading);

  const execute = useCallback(async (asyncFn) => {
    if (typeof asyncFn !== 'function') return null;
    setError(null);
    setLoading(true);
    try {
      const result = await asyncFn();
      setData(result);
      return result;
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, error, loading, execute, reset, setError };
}
