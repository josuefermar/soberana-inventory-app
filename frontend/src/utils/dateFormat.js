/**
 * @param {string} [iso]
 * @returns {string}
 */
export function formatDateTime(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}
