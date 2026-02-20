import { apiClient } from '../../../services/apiClient';

/**
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ access_token: string }>}
 */
export async function login(email, password) {
  const { data } = await apiClient.post('/auth/login', { email, password });
  return data;
}
