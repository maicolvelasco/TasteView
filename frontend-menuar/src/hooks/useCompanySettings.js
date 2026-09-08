import { useCallback, useEffect, useState } from 'react';
import { getCompany, updateCompany } from '../services/company';
import { useAuth } from '../context/AuthContext';

/**
 * Ajustes del negocio (pestaña "Negocio"): nombre y logo que reemplazan
 * el branding genérico ("🍽️ Restaurant AR") en todo el sistema — panel
 * de administración, favicon y menú público.
 *
 * Al guardar, actualiza también el `user` del contexto de auth
 * (`updateUser`) para que el cambio se vea al instante en la topbar/drawer
 * sin tener que recargar la página ni volver a loguearse.
 */
export default function useCompanySettings() {
  const { updateUser } = useAuth();

  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchCompany = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getCompany();
      setCompany(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudieron cargar los ajustes del negocio.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompany();
  }, [fetchCompany]);

  const save = async (data) => {
    setSaving(true);
    try {
      const res = await updateCompany(data);
      setCompany(res.data.data);
      updateUser({ company: res.data.data });
      return res.data.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Error al guardar los ajustes del negocio.');
    } finally {
      setSaving(false);
    }
  };

  return { company, loading, error, saving, save, refetch: fetchCompany };
}
