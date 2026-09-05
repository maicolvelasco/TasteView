import React, { useMemo, useState } from 'react';
import { AlertTriangle, FolderTree, Loader2, MoveHorizontal, PlusCircle, RotateCcw } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import SearchInput from '../../components/ui/SearchInput';
import FormModal from '../../components/ui/FormModal';
import EmptyStateCard from '../../components/ui/EmptyStateCard';
import CategoryForm from '../../components/categories/CategoryForm';
import CategoryCard from '../../components/categories/CategoryCard';
import useCategories from '../../hooks/useCategories';
import './CategoriesPage.css';

// Vista de administración de Categorías: crear/editar/eliminar y reordenar
// por drag & drop. Toda la lógica de datos vive en hooks/useCategories.js —
// este archivo solo compone la UI con el tema corporativo de src/index.css.
const CategoriesPage = () => {
  const { categories, loading, error, refetch, saveCategory, deleteCategory, reorderCategories } = useCategories();

  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [draggedId, setDraggedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const startCreate = () => {
    setEditingCategory(null);
    setShowForm(true);
  };

  const startEdit = (cat) => {
    setEditingCategory(cat);
    setShowForm(true);
  };

  const handleSave = async (form) => {
    await saveCategory(form, editingCategory);
    setShowForm(false);
  };

  const handleDrop = (targetCategory) => {
    if (draggedId === null || draggedId === targetCategory.id) return;
    reorderCategories(draggedId, targetCategory.id);
    setDraggedId(null);
  };

  const filteredCategories = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return categories;
    return categories.filter((c) => c.name.toLowerCase().includes(term));
  }, [categories, searchTerm]);

  if (loading) {
    return (
      <div className="page-loading">
        <Loader2 size={32} className="page-loading-spinner" />
        <p>Cargando categorías...</p>
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
        icon={FolderTree}
        title="Categorías"
        subtitle="Organiza el menú en categorías y define el orden en que aparecen."
      />

      <div className="admin-toolbar">
        <div className="admin-toolbar-search">
          <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Buscar categoría..." />
        </div>
        <button type="button" className="admin-new-btn" onClick={startCreate}>
          <PlusCircle size={16} /> Nueva Categoría
        </button>
      </div>

      <p className="admin-drag-hint">
        <MoveHorizontal size={14} /> Arrastra las tarjetas para cambiar el orden en que aparecen en el menú.
      </p>

      {showForm && (
        <FormModal
          title={editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
          icon={FolderTree}
          onClose={() => setShowForm(false)}
          maxWidth={480}
        >
          <CategoryForm category={editingCategory} onSave={handleSave} />
        </FormModal>
      )}

      <div className="admin-grid">
        {filteredCategories.map((cat) => (
          <CategoryCard
            key={cat.id}
            category={cat}
            isDragging={draggedId === cat.id}
            onDragStart={() => setDraggedId(cat.id)}
            onDrop={() => handleDrop(cat)}
            onEdit={() => startEdit(cat)}
            onDelete={() => deleteCategory(cat)}
          />
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <EmptyStateCard
          icon={FolderTree}
          title={searchTerm ? 'Sin resultados' : 'No hay categorías todavía'}
          message={searchTerm ? 'No hay categorías que coincidan con tu búsqueda.' : 'Crea la primera categoría para empezar a organizar el menú.'}
        />
      )}
    </div>
  );
};

export default CategoriesPage;
