import api from './api';

/**
 * Servicio de Dashboard — resumen general del panel administrativo:
 * pedidos, ventas y estado de mesas del día.
 * El hook useDashboard consume esta función y gestiona el estado.
 */
export const getDashboardSummary = () => api.get('/dashboard');
