import { apiClient } from '../../../services/apiClient';

/**
 * @returns {Promise<Array<import('./types').ProductListItem>>}
 */
export async function getProducts() {
  const { data } = await apiClient.get('/products/');
  return Array.isArray(data) ? data : [];
}

/**
 * @param {{ active_only?: boolean }} [params]
 * @returns {Promise<Array<import('./types').MeasureUnitItem>>}
 */
export async function getMeasures(params = {}) {
  const { data } = await apiClient.get('/measurement-units/', { params });
  return Array.isArray(data) ? data : [];
}

/**
 * @param {{ warehouse_id?: string; month?: string; status?: string }} params
 * @returns {Promise<Array<import('./types').SessionListItem>>}
 */
export async function listSessions(params = {}) {
  const { data } = await apiClient.get('/inventory-sessions/', { params });
  return Array.isArray(data) ? data : [];
}

/**
 * @param {string} sessionId
 * @returns {Promise<import('./types').SessionListItem>}
 */
export async function getSession(sessionId) {
  const { data } = await apiClient.get(`/inventory-sessions/${sessionId}`);
  return data;
}

/**
 * @param {import('./types').CreateSessionPayload} payload
 * @returns {Promise<{ id: string }>}
 */
export async function createSession(payload) {
  const { data } = await apiClient.post('/inventory-sessions/', payload);
  return data;
}

/**
 * @param {string} sessionId
 * @returns {Promise<Array<{ product_id: string; code: string; description: string }>>}
 */
export async function getSessionProducts(sessionId) {
  const { data } = await apiClient.get(
    `/inventory-sessions/${sessionId}/products`
  );
  return Array.isArray(data) ? data : [];
}

/**
 * @param {string} sessionId
 * @param {{ product_id: string; packaging_quantity: number; measure_unit_id?: string }} payload
 * @returns {Promise<{ total_units: number }>}
 */
export async function registerCount(sessionId, payload) {
  const { data } = await apiClient.post(
    `/inventory-sessions/${sessionId}/counts`,
    payload
  );
  return data;
}

/**
 * @param {string} sessionId
 * @returns {Promise<Array<import('./types').CountRow>>}
 */
export async function getCounts(sessionId) {
  const { data } = await apiClient.get(
    `/inventory-sessions/${sessionId}/counts`
  );
  return Array.isArray(data) ? data : [];
}
