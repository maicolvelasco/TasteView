import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Copy, FolderTree, Loader2, MoveHorizontal, PlusCircle, RotateCcw, SlidersHorizontal, UtensilsCrossed } from 'lucide-react';
import FormModal from '../../components/ui/FormModal';
import SearchInput from '../../components/ui/SearchInput';
import EmptyStateCard from '../../components/ui/EmptyStateCard';
import PageHeader from '../../components/ui/PageHeader';
import CategoryTabs from '../../components/menu/CategoryTabs';
import ProductCard from '../../components/menu/ProductCard';
import ProductForm from '../../components/menu/ProductForm';
import DuplicateBranchModal from '../../components/menu/DuplicateBranchModal';
import useMenu from '../../hooks/useMenu';
import useModifiers from '../../hooks/useModifiers';
import { useAuth } from '../../context/AuthContext';
import './MenuPage.css';

// Vista de administración del Menú: catálogo de platos con búsqueda, filtro
// por categoría, disponibilidad, duplicado y reordenado por drag & drop.
// Toda la lógica de datos vive en hooks/useMenu.js — este archivo solo
// compone la UI con el tema corporativo de src/index.css.
const MenuPage = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const {
    categories,
    products,
    loading,
    error,
    refetch,
    toggleAvailability,
    deleteProduct,
    duplicateProduct,
    reorderProducts,
  } = useMenu();
  const { modifiers } = useModifiers();

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showDuplicateBranch, setShowDuplicateBranch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategoryTab, setActiveCategoryTab] = useState('all');
  const [draggedProductId, setDraggedProductId] = useState(null);

  const startCreate = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const startEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const closeForm = () => setShowForm(false);

  const handleSaved = () => {
    setShowForm(false);
    refetch();
  };

  const handleDrop = (targetProduct) => {
    if (draggedProductId === null || draggedProductId === targetProduct.id || activeCategoryTab === 'all') return;
    reorderProducts(targetProduct.category_id, draggedProductId, targetProduct.id);
    setDraggedProductId(null);
  };

  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return products.filter((p) => {
      const matchesCategory = term || activeCategoryTab === 'all' || p.category_id === activeCategoryTab;
      const matchesSearch = !term || p.name.toLowerCase().includes(term);
      return matchesCategory && matchesSearch;
    });
  }, [products, activeCategoryTab, searchTerm]);

  if (loading) {
    return (
      <div className="page-loading">
        <Loader2 size={32} className="page-loading-spinner" />
        <p>Cargando menú...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-error">
        <AlertTriangle size={32} />
        <p>{error}</p>
        <button type="button" className="page-retry-btn" onClick={refetch}>
          <RotateCcw size={16} /> Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <PageHeader
        icon={UtensilsCrossed}
        title="Gestionar Menú"
        subtitle="Crea, edita y organiza los platos disponibles en tu carta."
      />

      <p className="admin-hint">
        ¿Necesitas crear o reordenar categorías? Andá a{' '}
        <button type="button" className="admin-hint-link" onClick={() => navigate('/admin/categories')}>
          <FolderTree size={12} style={{ verticalAlign: '-2px' }} /> Categorías
        </button>
        . ¿Necesitas crear nuevos grupos de opciones (ej. "Tipo de bebida")? Andá a{' '}
        <button type="button" className="admin-hint-link" onClick={() => navigate('/admin/modifiers')}>
          <SlidersHorizontal size={12} style={{ verticalAlign: '-2px' }} /> Modificadores
        </button>
        .
      </p>

      <div className="admin-toolbar">
        <div className="admin-toolbar-search">
          <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Buscar producto por nombre..." />
        </div>
        {isAdmin && (
          <button
            type="button"
            className="admin-new-btn admin-new-btn--secondary"
            onClick={() => setShowDuplicateBranch(true)}
            disabled={!user?.branch}
            title={!user?.branch ? 'Tu usuario no tiene una sucursal asignada' : undefined}
          >
            <Copy size={16} /> Duplicar de otra sucursal
          </button>
        )}
        <button type="button" className="admin-new-btn" onClick={startCreate}>
          <PlusCircle size={16} /> Nuevo Plato
        </button>
      </div>

      {!searchTerm && (
        <CategoryTabs categories={categories} products={products} active={activeCategoryTab} onChange={setActiveCategoryTab} />
      )}

      {showForm && (
        <FormModal
          title={editingProduct ? 'Editar Producto' : 'Crear Producto'}
          icon={UtensilsCrossed}
          onClose={closeForm}
          maxWidth={780}
        >
          <ProductForm
            product={editingProduct}
            categories={categories}
            allProducts={products}
            modifiers={modifiers}
            onSaved={handleSaved}
          />
        </FormModal>
      )}

      {!searchTerm && activeCategoryTab !== 'all' && (
        <p className="admin-drag-hint">
          <MoveHorizontal size={14} /> Arrastra las tarjetas para cambiar el orden en que aparecen en el menú.
        </p>
      )}

      {showDuplicateBranch && (
        <DuplicateBranchModal
          currentBranch={user?.branch}
          onClose={() => setShowDuplicateBranch(false)}
          onDone={refetch}
        />
      )}

      <div className="admin-grid">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            draggable={!searchTerm && activeCategoryTab !== 'all'}
            isDragging={draggedProductId === product.id}
            onDragStart={() => setDraggedProductId(product.id)}
            onDrop={() => handleDrop(product)}
            onToggleAvailability={() => toggleAvailability(product.id, product.is_available)}
            onDuplicate={() => duplicateProduct(product.id)}
            onEdit={() => startEdit(product)}
            onDelete={() => deleteProduct(product.id)}
          />
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <EmptyStateCard
          icon={UtensilsCrossed}
          title="Sin resultados"
          message="No hay productos que coincidan con la búsqueda o categoría."
        />
      )}
    </div>
  );
};

export default MenuPage;
