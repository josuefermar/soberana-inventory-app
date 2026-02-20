import { apiClient } from '../../../services/apiClient';

/**
 * @returns {Promise<Array<{ id: string; code: string; description: string }>>}
 */
export async function getProducts() {
  const { data } = await apiClient.get('/products/');
  return Array.isArray(data) ? data : [];
}
