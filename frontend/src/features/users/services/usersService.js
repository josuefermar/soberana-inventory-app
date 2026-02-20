import { apiClient } from '../../../services/apiClient';

/**
 * @returns {Promise<Array<import('./types').User>>}
 */
export async function getUsers() {
  const { data } = await apiClient.get('/users/');
  return data;
}

/**
 * @param {import('./types').CreateUserPayload} payload
 * @returns {Promise<unknown>}
 */
export async function createUser(payload) {
  const { data } = await apiClient.post('/users/', payload);
  return data;
}

/**
 * @param {string} userId
 * @param {import('./types').UpdateUserPayload} payload
 * @returns {Promise<import('./types').User>}
 */
export async function updateUser(userId, payload) {
  const { data } = await apiClient.put(`/users/${userId}`, payload);
  return data;
}
