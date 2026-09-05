import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getBranches,
  createBranch,
  updateBranch,
  toggleBranchActive,
  deleteBranch,
  restoreBranch,
  getTrashedBranches,
} from '../services/branches';
import { buildBranchStats, EMPTY_BRANCH_FORM } from '../utils/branches';

/**
 * Gestiona el estado y las mutaciones de la pantalla de Sucursales.
 * Separa completamente la lógica de datos del árbol de componentes,
 * igual que hooks/useUsers.js.
 */
export default function useBranches() {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [trashed, setTrashed] = useState([]);
  const [trashedLoading, setTrashedLoading] = useState(false);
  const [trashedError, setTrashedError] = useState('');
  const [trashedLoaded, setTrashedLoaded] = useState(false);

  // ─── Fetch ────────────────────────────────────────────────────────────

  const fetchBranches = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getBranches();
      setBranches(res.data.data || []);
    } catch (err) {
      const msg = err.response?.data?.message;
      setError(msg ? `Error del servidor: ${msg}` : 'No se pudieron cargar las sucursales.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  /**
   * Trae la papelera bajo demanda (recién cuando el usuario entra a esa
   * pestaña) — es un endpoint reservado a Super Admin, así que evitamos
   * pedirlo de entrada para cualquier otro rol.
   */
  const fetchTrashed = useCallback(async () => {
    setTrashedLoading(true);
    setTrashedError('');
    try {
      const res = await getTrashedBranches();
      setTrashed(res.data.data || []);
      setTrashedLoaded(true);
    } catch (err) {
      const msg = err.response?.data?.message;
      setTrashedError(msg || 'No se pudo cargar la papelera de sucursales.');
    } finally {
      setTrashedLoading(false);
    }
  }, []);

  // ─── Estadísticas ───────────────────────────────────────────────────────

  const stats = useMemo(() => buildBranchStats(branches), [branches]);

  // ─── Mutaciones ─────────────────────────────────────────────────────────

  const addBranch = async (formData) => {
    await createBranch(formData);
    await fetchBranches();
  };

  const editBranch = async (id, formData) => {
    await updateBranch(id, formData);
    await fetchBranches();
  };

  const toggleActive = async (branch) => {
    try {
      await toggleBranchActive(branch.id, !branch.is_active);
      await fetchBranches();
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Error al cambiar el estado de la sucursal.');
    }
  };

  const removeBranch = async (branch) => {
    try {
      await deleteBranch(branch.id);
      await fetchBranches();
      if (trashedLoaded) await fetchTrashed();
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Error al eliminar la sucursal.');
    }
  };

  const restoreBranchById = async (branch) => {
    try {
      await restoreBranch(branch.id);
      await fetchBranches();
      await fetchTrashed();
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Error al restaurar la sucursal.');
    }
  };

  return {
    branches,
    stats,
    loading,
    error,
    refetch: fetchBranches,

    trashed,
    trashedLoading,
    trashedError,
    trashedLoaded,
    fetchTrashed,

    addBranch,
    editBranch,
    toggleActive,
    removeBranch,
    restoreBranchById,

    EMPTY_FORM: EMPTY_BRANCH_FORM,
  };
}
