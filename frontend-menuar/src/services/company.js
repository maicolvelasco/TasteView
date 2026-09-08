import api from './api';

/** Ajustes del negocio: nombre + logo que se muestran en todo el sistema. */
export const getCompany = () => api.get('/company');
export const updateCompany = (data) => api.put('/company', data);
