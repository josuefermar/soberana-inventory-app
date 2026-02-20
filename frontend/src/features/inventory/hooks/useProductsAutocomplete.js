import { useState, useCallback, useRef } from 'react';
import { getProducts } from '../services/inventoryService';

/**
 * Products for autocomplete. Fetches the full list once per session; filtering is done client-side by MUI Autocomplete.
 * @returns {{
 *   options: Array<{ id: string; label: string; product?: import('../services/types').ProductListItem }>;
 *   loading: boolean;
 *   error: string | null;
 *   fetchOptions: () => void;
 *   clearError: () => void;
 * }}
 */
export function useProductsAutocomplete() {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(/** @type {string | null} */ (null));
  const fetchedOnceRef = useRef(false);

  const fetchOptions = useCallback(() => {
    if (fetchedOnceRef.current) return;
    fetchedOnceRef.current = true;
    setLoading(true);
    setError(null);
    getProducts()
      .then((list) => {
        const mapped = list.map((p) => ({
          id: p.id,
          label: [p.code, p.description].filter(Boolean).join(' — ') || p.id,
          product: p,
        }));
        setOptions(mapped);
      })
      .catch((err) => {
        fetchedOnceRef.current = false;
        const msg = err.response?.data?.detail ?? err.message ?? 'Failed to load products';
        setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
        setOptions([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    options,
    loading,
    error,
    fetchOptions,
    clearError,
  };
}
