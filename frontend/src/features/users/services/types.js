/**
 * @typedef {{ id: string; name: string }} WarehouseRef
 * @typedef {{ id: string; email: string; name: string; identification?: string; role: string; warehouses?: WarehouseRef[]; is_active: boolean }} User
 */

/**
 * @typedef {{ identification: string; name: string; email: string; role: string; password: string; warehouses?: string[] }} CreateUserPayload
 */

/**
 * @typedef {{ name?: string; email?: string; role?: string; is_active?: boolean; identification?: string; password?: string; warehouses?: string[] }} UpdateUserPayload
 */
