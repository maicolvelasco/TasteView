import api from './api';

/**
 * Servicio de Menú Público — el que ve el cliente al escanear el QR de su
 * mesa. Sin autenticación: la ruta es pública (ver App.jsx, /menu/:branchCode).
 */
export const getPublicMenu = (branchCode) => api.get(`/menu/${branchCode}`);

/**
 * Menú de administración: categorías + productos de una sucursal (activos
 * E inactivos, con `cost` incluido). Sin argumento, el backend resuelve la
 * sucursal desde la sesión del usuario logueado. Un Admin/Super Admin puede
 * pedir explícitamente la de otra sucursal pasando `branchId` — se usa,
 * por ejemplo, para elegir de qué sucursal traer platos al duplicar.
 */
export const getAdminMenu = (branchId) =>
  api.get('/menu', branchId ? { params: { branch_id: branchId } } : undefined);

/**
 * Duplica un lote de platos de una sucursal a otra, con toda su
 * información (imagen, precio, historia, ingredientes, modelo 3D/AR,
 * modificadores). `forceIds` son los ids que el usuario confirmó duplicar
 * aunque el backend haya detectado un plato con el mismo nombre (sin
 * importar mayúsculas/espacios) ya existente en la sucursal destino.
 *
 * Respuesta: { created: [...], created_count, skipped: [{product_id, name, existing}] }
 */
export const duplicateProductsToBranch = ({ targetBranchId, productIds, forceIds = [] }) =>
  api.post('/products/duplicate-to-branch', {
    target_branch_id: targetBranchId,
    product_ids: productIds,
    force_ids: forceIds,
  });
