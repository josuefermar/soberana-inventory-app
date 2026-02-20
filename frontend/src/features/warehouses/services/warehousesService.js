import { apiClient } from '../../../services/apiClient';

/**
 * @returns {Promise<Array<{ id: string; code: string; description: string; status: string }>>}
 */
export async function getWarehouses() {
  const { data } = await apiClient.get('/warehouses/');
  return Array.isArray(data) ? data : [];
}
