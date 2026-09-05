import api from './api';

/**
 * Servicio de Reportes — todas las llamadas HTTP relacionadas con /reports.
 * El hook useReports consume estas funciones y gestiona el estado.
 */

/**
 * Ventas agrupadas por el período elegido (day / week / month).
 * @param {'day'|'week'|'month'} period
 */
export const getSales = (period) => api.get(`/reports/sales?period=${period}`);

/**
 * Top productos más vendidos.
 * @param {number} limit  máximo de productos a devolver (default 8)
 */
export const getTopProducts = (limit = 8) =>
  api.get(`/reports/top-products?limit=${limit}`);

/** Resumen general: ventas del día, semana, mes, ticket promedio y pedidos. */
export const getSummary = () => api.get('/reports/summary');
