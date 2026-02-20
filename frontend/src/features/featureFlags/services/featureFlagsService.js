import { apiClient } from '../../../services/apiClient';

/**
 * @typedef {Object} FeatureFlag
 * @property {string} id
 * @property {string} key
 * @property {boolean} enabled
 * @property {string|null} description
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} CreateFlagPayload
 * @property {string} key
 * @property {boolean} [enabled=false]
 * @property {string|null} [description]
 */

/**
 * @typedef {Object} UpdateFlagPayload
 * @property {boolean} [enabled]
 * @property {string|null} [description]
 */

/**
 * @returns {Promise<FeatureFlag[]>}
 */
export async function getFlags() {
  const { data } = await apiClient.get('/feature-flags/');
  return data;
}

/**
 * @param {CreateFlagPayload} payload
 * @returns {Promise<FeatureFlag>}
 */
export async function createFlag(payload) {
  const { data } = await apiClient.post('/feature-flags/', payload);
  return data;
}

/**
 * @param {string} id - UUID of the flag
 * @param {UpdateFlagPayload} payload
 * @returns {Promise<FeatureFlag>}
 */
export async function updateFlag(id, payload) {
  const { data } = await apiClient.put(`/feature-flags/${id}`, payload);
  return data;
}

/**
 * @param {string} id - UUID of the flag
 * @returns {Promise<FeatureFlag>}
 */
export async function toggleFlag(id) {
  const { data } = await apiClient.patch(`/feature-flags/${id}/toggle`);
  return data;
}
