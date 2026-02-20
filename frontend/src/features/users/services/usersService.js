import { apiClient } from '../../../services/apiClient';

/**
 * @returns {Promise<Array<import('./types').User>>}
 */
export async function getUsers() {
  const { data } = await apiClient.get('/users/');
  return data;
}

/**
 * @returns {Promise<{ users_created?: number }>}
 */
export async function syncUsers() {
  const { data } = await apiClient.post('/users/sync');
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
