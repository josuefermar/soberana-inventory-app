import { getErrorMessage as apiGetErrorMessage } from '../services/apiClient';

/**
 * Get a user-friendly error message from an API error.
 * @param {unknown} err - Error from axios/API call
 * @returns {string}
 */
export function getErrorMessage(err) {
  return apiGetErrorMessage(err);
}
