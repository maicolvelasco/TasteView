import api from './api';

/**
 * Servicio de Usuarios — todas las llamadas HTTP relacionadas con
 * /users y /branches. Los hooks consumen estas funciones para que
 * la lógica de red no quede mezclada con el estado de React.
 */

/** Trae todos los usuarios (con rol y sucursal incluidos). */
export const getUsers = () => api.get('/users');

/** Trae todas las sucursales activas. */
export const getBranches = () => api.get('/branches');

/** Crea un nuevo usuario con los datos del formulario. */
export const createUser = (data) => api.post('/users', data);

/**
 * Actualiza los campos de un usuario existente.
 * Si `password` viene vacío se elimina antes de enviar para no
 * sobreescribir la contraseña actual con un string vacío.
 */
export const updateUser = (id, data) => {
  const payload = { ...data };
  if (!payload.password) delete payload.password;
  return api.put(`/users/${id}`, payload);
};

/**
 * Cambia el estado activo/inactivo de un usuario.
 * @param {number|string} id
 * @param {boolean} isActive  nuevo valor de `is_active`
 */
export const toggleUserActive = (id, isActive) =>
  api.put(`/users/${id}`, { is_active: isActive });
