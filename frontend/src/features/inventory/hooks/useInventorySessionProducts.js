import { useState, useCallback } from 'react';

/**
 * @typedef {{
 *   id: string;
 *   product_id: string;
 *   productLabel?: string;
 *   measure_unit_id: string;
 *   quantity: number;
 *   product?: import('../services/types').ProductListItem;
 * }} ProductRowState
 */

const INITIAL_QUANTITY = 1;
const MIN_QUANTITY = 0.0001;

/**
 * Manages dynamic list of product rows for create session form.
 * Validations: no duplicate product_id, quantity > 0, measure_unit_id required.
 * @returns {{
 *   rows: ProductRowState[];
 *   addRow: () => void;
 *   removeRow: (id: string) => void;
 *   updateRow: (id: string, patch: Partial<ProductRowState>) => void;
 *   getPayload: () => Array<{ product_id: string; measure_unit_id: string; quantity: number }>;
 *   validationErrors: Record<string, string>;
 *   validate: () => boolean;
 * }}
 */
export function useInventorySessionProducts() {
  const [rows, setRows] = useState(/** @type {ProductRowState[]} */ ([]));
  const [validationErrors, setValidationErrors] = useState(/** @type {Record<string, string>} */ ({}));

  const addRow = useCallback(() => {
    const id = `row-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setRows((prev) => [
      ...prev,
      {
        id,
        product_id: '',
        measure_unit_id: '',
        quantity: INITIAL_QUANTITY,
      },
    ]);
    setValidationErrors((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const removeRow = useCallback((id) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
    setValidationErrors((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const updateRow = useCallback((id, patch) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...patch } : r))
    );
    setValidationErrors((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const validate = useCallback(() => {
    const errors = /** @type {Record<string, string>} */ ({});
    const productIds = new Set();
    for (const row of rows) {
      if (!row.product_id) {
        errors[row.id] = 'Product is required';
        continue;
      }
      if (productIds.has(row.product_id)) {
        errors[row.id] = 'Duplicate product';
        continue;
      }
      productIds.add(row.product_id);
      if (!row.measure_unit_id) {
        errors[row.id] = 'Unit is required';
        continue;
      }
      const q = Number(row.quantity);
      if (Number.isNaN(q) || q < MIN_QUANTITY) {
        errors[row.id] = 'Quantity must be greater than 0';
      }
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [rows]);

  const getPayload = useCallback(() => {
    return rows
      .filter(
        (r) =>
          r.product_id &&
          r.measure_unit_id &&
          Number.isFinite(Number(r.quantity)) &&
          Number(r.quantity) >= MIN_QUANTITY
      )
      .map((r) => ({
        product_id: r.product_id,
        measure_unit_id: r.measure_unit_id,
        quantity: Number(r.quantity),
      }));
  }, [rows]);

  return {
    rows,
    addRow,
    removeRow,
    updateRow,
    getPayload,
    validationErrors,
    validate,
  };
}
