/**
 * Application role constants.
 * @readonly
 */
export const ROLES = {
  ADMIN: 'ADMIN',
  WAREHOUSE_MANAGER: 'WAREHOUSE_MANAGER',
  PROCESS_LEADER: 'PROCESS_LEADER',
};

/** @type {readonly string[]} */
export const ROLE_OPTIONS = ['ADMIN', 'WAREHOUSE_MANAGER', 'PROCESS_LEADER'];

/**
 * User-friendly labels for roles (Spanish).
 * @readonly
 */
export const ROLE_LABELS = {
  ADMIN: 'Administrador',
  WAREHOUSE_MANAGER: 'Responsable de Bodega',
  PROCESS_LEADER: 'Líder de Proceso',
};

/**
 * @param {string} [role]
 * @returns {string}
 */
export const getRoleLabel = (role) => (role ? ROLE_LABELS[role] ?? role : '');
