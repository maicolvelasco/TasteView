import { useCallback, useEffect, useMemo, useState } from 'react';
import { getUsers, getBranches, createUser, updateUser, toggleUserActive } from '../services/users';

/** Estado inicial del formulario de usuario. */
const EMPTY_FORM = {
  name: '',
  email: '',
  password: '',
  role_id: '',
  branch_id: '',
  phone: '',
  pin_code: '',
  is_active: true,
};

/**
 * Gestiona el estado y las mutaciones de la pantalla de Usuarios.
 * Separa completamente la lógica de datos del árbol de componentes
 * para que UsersPage sea solo composición de UI.
 */
export default function useUsers() {
  const [users, setUsers]       = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  // ─── Fetch ──────────────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [usersRes, branchesRes] = await Promise.all([
        getUsers(),
        getBranches(),
      ]);
      setUsers(usersRes.data.data || []);
      setBranches(branchesRes.data.data || []);
    } catch (err) {
      const msg = err.response?.data?.message;
      setError(msg ? `Error del servidor: ${msg}` : 'No se pudieron cargar los usuarios.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ─── Roles derivados de los usuarios ────────────────────────────────────

  /** Roles únicos extraídos de la lista de usuarios (sin duplicados). */
  const roles = useMemo(() => {
    const map = new Map();
    users.forEach((u) => {
      if (u.role?.id) map.set(u.role.id, u.role);
    });
    return [...map.values()];
  }, [users]);

  // ─── Estadísticas ───────────────────────────────────────────────────────

  const stats = useMemo(() => ({
    total: users.length,
    active: users.filter((u) => u.is_active).length,
    inactive: users.filter((u) => !u.is_active).length,
    rolesCount: roles.length,
  }), [users, roles]);

  // ─── Mutaciones ─────────────────────────────────────────────────────────

  const addUser = async (formData) => {
    await createUser(formData);
    await fetchData();
  };

  const editUser = async (id, formData) => {
    await updateUser(id, formData);
    await fetchData();
  };

  const toggleActive = async (user) => {
    try {
      await toggleUserActive(user.id, !user.is_active);
      await fetchData();
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Error al cambiar el estado del usuario.');
    }
  };

  return {
    users,
    roles,
    branches,
    stats,
    loading,
    error,
    refetch: fetchData,
    addUser,
    editUser,
    toggleActive,
    EMPTY_FORM,
  };
}
