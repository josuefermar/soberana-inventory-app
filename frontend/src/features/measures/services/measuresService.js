import { apiClient } from '../../../services/apiClient';

/**
 * @param {{ active_only?: boolean }} [params]
 * @returns {Promise<Array<import('./types').MeasureUnitItem>>}
 */
export async function getMeasures(params = {}) {
  const { data } = await apiClient.get('/measurement-units/', { params });
  return Array.isArray(data) ? data : [];
}

/**
 * @param {import('./types').CreateMeasurePayload} payload
 * @returns {Promise<import('./types').MeasureUnitItem>}
 */
export async function createMeasure(payload) {
  const { data } = await apiClient.post('/measurement-units/', {
    name: payload.name.trim(),
    abbreviation: (payload.abbreviation || '').trim().toUpperCase(),
  });
  return data;
}

/**
 * @param {string} id
 * @param {import('./types').UpdateMeasurePayload} payload
 * @returns {Promise<import('./types').MeasureUnitItem>}
 */
export async function updateMeasure(id, payload) {
  const { data } = await apiClient.put(`/measurement-units/${id}`, {
    name: payload.name.trim(),
    abbreviation: (payload.abbreviation || '').trim().toUpperCase(),
  });
  return data;
}

/**
 * @param {string} id
 * @returns {Promise<import('./types').MeasureUnitItem>}
 */
export async function toggleMeasure(id) {
  const { data } = await apiClient.patch(`/measurement-units/${id}/toggle`);
  return data;
}
