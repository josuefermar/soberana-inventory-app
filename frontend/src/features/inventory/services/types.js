/**
 * @typedef {{ warehouse_id: string; month: string; created_by: string }} CreateSessionPayload
 */

/**
 * @typedef {{ id: string; warehouse_id: string; warehouse_description: string; month: string; count_number: number; created_at: string; closed_at: string | null; products_count: number }} SessionListItem
 */

/**
 * @typedef {{ product?: { id?: string; description?: string; code?: string }; packaging_quantity: number; total_units: number; created_at?: string }} CountRow
 */
