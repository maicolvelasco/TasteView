import React, { useMemo, useState } from 'react';
import { AlertTriangle, Loader2, PlusCircle, RotateCcw, SlidersHorizontal } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import SearchInput from '../../components/ui/SearchInput';
import FormModal from '../../components/ui/FormModal';
import EmptyStateCard from '../../components/ui/EmptyStateCard';
import ModifierGroupCard from '../../components/modifiers/ModifierGroupCard';
import ModifierGroupForm from '../../components/modifiers/ModifierGroupForm';
import EditModifierGroupModal from '../../components/modifiers/EditModifierGroupModal';
import useModifiers from '../../hooks/useModifiers';
import './ModifiersPage.css';

// Vista de administración de Modificadores (grupos de opciones como "Tipo de
// bebida" o "Término de cocción"). Toda la lógica de datos vive en
// hooks/useModifiers.js y hooks/useModifierGroupEditor.js — este archivo
// solo compone la UI con el tema corporativo de src/index.css.
const ModifiersPage = () => {
  const { modifiers, loading, error, refetch, createGroup, deleteGroup } = useModifiers();

  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleCreated = async (payload) => {
    await createGroup(payload);
    setShowForm(false);
  };

  const filteredModifiers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return modifiers;
    return modifiers.filter((m) => m.name.toLowerCase().includes(term));
  }, [modifiers, searchTerm]);

  if (loading) {
    return (
      <div className="page-loading">
        <Loader2 size={32} className="page-loading-spinner" />
        <p>Cargando opciones...</p>
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
        icon={SlidersHorizontal}
        title="Modificadores"
        subtitle="Crea grupos de opciones reutilizables (ej. tipo de bebida, término de cocción)."
      />

      <p className="admin-hint">
        Crea acá los grupos de opciones. Después, al crear o editar un plato en "Gestionar Menú", elige cuáles de
        estos grupos aplican a ese plato y qué opciones específicas ofrece.
      </p>

      <div className="admin-toolbar">
        <div className="admin-toolbar-search">
          <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Buscar grupo de opciones..." />
        </div>
        <button type="button" className="admin-new-btn" onClick={() => setShowForm(true)}>
          <PlusCircle size={16} /> Nuevo grupo de opciones
        </button>
      </div>

      {showForm && (
        <FormModal title="Nuevo grupo de opciones" icon={SlidersHorizontal} onClose={() => setShowForm(false)} maxWidth={640}>
          <ModifierGroupForm onCreated={handleCreated} />
        </FormModal>
      )}

      <div className="admin-grid">
        {filteredModifiers.map((mod) => (
          <ModifierGroupCard
            key={mod.id}
            modifier={mod}
            onEdit={() => setEditTarget(mod)}
            onDelete={() => deleteGroup(mod.id)}
          />
        ))}
      </div>

      {filteredModifiers.length === 0 && (
        <EmptyStateCard
          icon={SlidersHorizontal}
          title={searchTerm ? 'Sin resultados' : 'No hay grupos de opciones todavía'}
          message={searchTerm ? 'No hay grupos que coincidan con tu búsqueda.' : 'Crea el primer grupo para empezar a personalizar tus platos.'}
        />
      )}

      {editTarget && (
        <EditModifierGroupModal modifier={editTarget} onClose={() => setEditTarget(null)} onSaved={refetch} />
      )}
    </div>
  );
};

export default ModifiersPage;
