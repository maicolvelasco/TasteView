import { useCallback, useState } from 'react';
import { getBranches } from '../services/branches';
import { getAdminMenu, duplicateProductsToBranch } from '../services/menu';

/**
 * Gestiona todo el flujo del modal "Duplicar platos de otra sucursal":
 *  1) elegir la sucursal de ORIGEN (lista de sucursales, sin la propia)
 *  2) cargar sus categorías/platos para que el admin elija cuáles duplicar
 *  3) duplicar hacia `targetBranchId` (la sucursal del admin logueado);
 *     si el backend detecta nombres repetidos en destino, los reporta en
 *     `conflicts` para que el componente le pregunte al usuario si quiere
 *     duplicarlos de todas formas (ver `duplicate(ids, forceIds)`).
 */
export default function useDuplicateMenu(targetBranchId) {
  const [branches, setBranches] = useState([]);
  const [branchesLoading, setBranchesLoading] = useState(false);
  const [branchesError, setBranchesError] = useState('');

  const [sourceBranchId, setSourceBranchId] = useState(null);
  const [sourceCategories, setSourceCategories] = useState([]);
  const [sourceLoading, setSourceLoading] = useState(false);
  const [sourceError, setSourceError] = useState('');

  const [saving, setSaving] = useState(false);
  const [conflicts, setConflicts] = useState([]);
  const [createdCount, setCreatedCount] = useState(0);

  /** Sucursales disponibles como origen (todas menos la propia). */
  const fetchBranches = useCallback(async () => {
    setBranchesLoading(true);
    setBranchesError('');
    try {
      const res = await getBranches({ is_active: true });
      const list = (res.data.data || []).filter((b) => b.id !== targetBranchId);
      setBranches(list);
    } catch (err) {
      setBranchesError(err.response?.data?.message || 'No se pudieron cargar las sucursales.');
    } finally {
      setBranchesLoading(false);
    }
  }, [targetBranchId]);

  /** Trae los platos de la sucursal de origen elegida. */
  const selectSourceBranch = useCallback(async (branchId) => {
    setSourceBranchId(branchId);
    setSourceCategories([]);
    setConflicts([]);
    setCreatedCount(0);

    if (!branchId) return;

    setSourceLoading(true);
    setSourceError('');
    try {
      const res = await getAdminMenu(branchId);
      setSourceCategories(res.data.data.categories || []);
    } catch (err) {
      setSourceError(err.response?.data?.message || 'No se pudieron cargar los platos de esa sucursal.');
    } finally {
      setSourceLoading(false);
    }
  }, []);

  /**
   * Duplica los platos indicados hacia `targetBranchId`.
   * `forceIds` son los que hay que duplicar aunque ya exista un plato con
   * ese nombre en destino (el usuario ya lo confirmó).
   */
  const duplicate = useCallback(async (productIds, forceIds = []) => {
    setSaving(true);
    try {
      const res = await duplicateProductsToBranch({ targetBranchId, productIds, forceIds });
      const { created_count, skipped } = res.data.data;
      setConflicts(skipped || []);
      setCreatedCount((prev) => prev + (created_count || 0));
      return { createdCount: created_count || 0, skipped: skipped || [] };
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Error al duplicar los platos.');
    } finally {
      setSaving(false);
    }
  }, [targetBranchId]);

  const reset = useCallback(() => {
    setSourceBranchId(null);
    setSourceCategories([]);
    setSourceError('');
    setConflicts([]);
    setCreatedCount(0);
  }, []);

  return {
    branches, branchesLoading, branchesError, fetchBranches,
    sourceBranchId, sourceCategories, sourceLoading, sourceError, selectSourceBranch,
    saving, conflicts, createdCount, duplicate, reset,
  };
}
