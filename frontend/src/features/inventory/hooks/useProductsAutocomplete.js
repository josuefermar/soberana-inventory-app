import { useState, useCallback, useRef } from 'react';
import { getProducts } from '../services/inventoryService';

/**
 * Async autocomplete for products. Fetches options on open and optionally on input.
 * @returns {{
 *   options: Array<{ id: string; label: string; product?: import('../services/types').ProductListItem }>;
 *   loading: boolean;
 *   error: string | null;
 *   fetchOptions: (inputValue?: string) => Promise<void>;
 *   clearError: () => void;
 * }}
 */
export function useProductsAutocomplete() {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(/** @type {string | null} */ (null));
  const fetchedRef = useRef(false);

  const fetchOptions = useCallback(async (inputValue = '') => {
    setLoading(true);
    setError(null);
    try {
      const list = await getProducts();
      const mapped = list.map((p) => ({
        id: p.id,
        label: [p.code, p.description].filter(Boolean).join(' — ') || p.id,
        product: p,
      }));
      const filtered =
        typeof inputValue === 'string' && inputValue.trim()
          ? mapped.filter(
              (o) =>
                o.label.toLowerCase().includes(inputValue.trim().toLowerCase())
            )
          : mapped;
      setOptions(filtered);
      fetchedRef.current = true;
    } catch (err) {
      const msg = err.response?.data?.detail ?? err.message ?? 'Failed to load products';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
      setOptions([]);
    } finally {
      setLoading(false);
    }
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
