import api from './api';

/**
 * Servicio de Sucursales — todas las llamadas HTTP relacionadas con
 * /branches. Los hooks consumen estas funciones para que la lógica de
 * red no quede mezclada con el estado de React (mismo patrón que
 * services/users.js).
 */

/**
 * Trae las sucursales visibles para el usuario actual.
 * @param {{ search?: string, is_active?: boolean, company_id?: number }} [params]
 */
export const getBranches = (params = {}) => api.get('/branches', { params });

/** Trae el detalle de una sucursal puntual (con sus contadores). */
export const getBranch = (id) => api.get(`/branches/${id}`);

/** Crea una sucursal nueva. */
export const createBranch = (data) => api.post('/branches', data);

/** Actualiza los campos de una sucursal existente. */
export const updateBranch = (id, data) => api.put(`/branches/${id}`, data);

/**
 * Cambia el estado activo/inactivo de una sucursal.
 * @param {number|string} id
 * @param {boolean} isActive  nuevo valor de `is_active`
 */
export const toggleBranchActive = (id, isActive) =>
  api.put(`/branches/${id}`, { is_active: isActive });

/** Elimina (soft delete) una sucursal. Reservado a Super Admin. */
export const deleteBranch = (id) => api.delete(`/branches/${id}`);

/** Restaura una sucursal previamente eliminada. Reservado a Super Admin. */
export const restoreBranch = (id) => api.post(`/branches/${id}/restore`);

/** Lista la papelera de sucursales eliminadas. Reservado a Super Admin. */
export const getTrashedBranches = () => api.get('/branches/trashed');
