import { apiClient } from '../../../services/apiClient';

/**
 * @param {{ warehouse_id?: string; month?: string; status?: string }} params
 * @returns {Promise<Array<import('./types').SessionListItem>>}
 */
export async function listSessions(params = {}) {
  const { data } = await apiClient.get('/inventory-sessions/', { params });
  return Array.isArray(data) ? data : [];
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
 * @param {{ product_ids: string[] }} payload
 * @returns {Promise<{ added: number }>}
 */
export async function addSessionProducts(sessionId, payload) {
  const { data } = await apiClient.post(
    `/inventory-sessions/${sessionId}/products`,
    payload
  );
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
 * @param {{ product_id: string; packaging_quantity: number }} payload
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
