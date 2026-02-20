import { useState, useCallback, useEffect } from 'react';
import { getMeasures } from '../services/inventoryService';

/**
 * Load measurement units once for measure-unit selects.
 * @returns {{
 *   measures: Array<{ id: string; name: string; description?: string }>;
 *   loading: boolean;
 *   error: string | null;
 *   refetch: () => Promise<void>;
 * }}
 */
export function useMeasures() {
  const [measures, setMeasures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(/** @type {string | null} */ (null));

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await getMeasures({ active_only: true });
      setMeasures(
        list.map((m) => ({
          id: m.id,
          name: m.name,
          abbreviation: m.abbreviation ?? '',
        }))
      );
    } catch (err) {
      const msg = err.response?.data?.detail ?? err.message ?? 'Failed to load measures';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
      setMeasures([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    measures,
    loading,
    error,
    refetch,
  };
}
