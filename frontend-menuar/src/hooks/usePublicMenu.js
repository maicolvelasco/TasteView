import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getPublicMenu } from '../services/menu';
import { buildCategoryTabs, getVisibleProducts } from '../utils/menu';

/**
 * Gestiona el estado y la carga de datos del Menú Digital Público.
 * Toda la lógica pura (pestañas de categoría, filtrado/búsqueda) vive en
 * utils/menu.js; este hook solo orquesta el fetch y el estado de UI.
 */
export default function usePublicMenu(branchCode) {
  const [searchParams] = useSearchParams();
  const tableNumber = searchParams.get('table');

  const [branch, setBranch]           = useState(null);
  const [rawCategories, setRawCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [searchTerm, setSearchTerm]   = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');

  const fetchMenu = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getPublicMenu(branchCode);
      const data = res.data.data;
      setBranch(data.branch);
      setRawCategories(data.categories || []);
      if (data.categories?.length > 0) {
        setActiveCategory(data.categories[0].id);
      }
    } catch (err) {
      const msg = err.response?.data?.message;
      setError(
        msg
          ? `Error del servidor: ${msg}`
          : 'No se pudo cargar el menú. Verifica tu conexión e intenta de nuevo.',
      );
    } finally {
      setLoading(false);
    }
  }, [branchCode]);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  const categories = useMemo(() => buildCategoryTabs(rawCategories), [rawCategories]);
  const isSearching = searchTerm.trim().length > 0;
  const visibleProducts = useMemo(
    () => getVisibleProducts({ categories: rawCategories, activeCategory, searchTerm }),
    [rawCategories, activeCategory, searchTerm],
  );

  return {
    branch,
    tableNumber,
    categories,
    activeCategory,
    setActiveCategory,
    searchTerm,
    setSearchTerm,
    isSearching,
    visibleProducts,
    loading,
    error,
    refetch: fetchMenu,
    selectedProduct,
    openProduct: setSelectedProduct,
    closeProduct: () => setSelectedProduct(null),
  };
}
