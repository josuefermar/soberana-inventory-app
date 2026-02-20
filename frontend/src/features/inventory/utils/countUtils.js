/**
 * Converts quantity to packaging_quantity for the backend.
 * If measure is packaging unit: packaging_quantity = quantity.
 * If measure is inventory unit: packaging_quantity = quantity / conversion_factor.
 * @param {Object} row - Row with product, measure_unit_id, quantity
 * @param {import('../services/types').ProductListItem} [row.product]
 * @param {string} [row.measure_unit_id]
 * @param {number} [row.quantity]
 * @returns {number}
 */
export function toPackagingQuantity(row) {
  const q = Number(row.quantity);
  if (!Number.isFinite(q) || q <= 0) return 0;
  const product = row.product;
  if (!product?.conversion_factor) return Math.round(q);
  const factor = Number(product.conversion_factor) || 1;
  const isPackaging =
    product.packaging_unit_id && row.measure_unit_id === product.packaging_unit_id;
  if (isPackaging) return Math.round(q);
  return Math.max(1, Math.round(q / factor));
}
