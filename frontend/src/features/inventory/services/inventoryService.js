import { apiClient } from '../../../services/apiClient';

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
