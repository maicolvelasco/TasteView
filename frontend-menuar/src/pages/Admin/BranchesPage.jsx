import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Loader2,
  PlusCircle,
  RotateCcw,
  Store,
  Power,
  PowerOff,
  Users,
  Trash2,
  Edit3,
  PlusSquare,
} from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import SearchInput from '../../components/ui/SearchInput';
import StatCard from '../../components/ui/StatCard';
import TabSwitcher from '../../components/ui/TabSwitcher';
import EmptyStateCard from '../../components/ui/EmptyStateCard';
import FormModal from '../../components/ui/FormModal';
import BranchCard from '../../components/branches/BranchCard';
import BranchForm from '../../components/branches/BranchForm';
import BranchNetworkIcon from '../../components/branches/BranchNetworkIcon';
import useBranches from '../../hooks/useBranches';
import { useAuth } from '../../context/AuthContext';
import { buildBranchStatusFilters, filterBranches } from '../../utils/branches';
import '../../components/css/AdminCatalog.css';
import '../../components/css/SharedUI.css';
import './BranchesPage.css';

/**
 * Vista de administración de Sucursales.
 * Toda la lógica de datos vive en hooks/useBranches.js y services/branches.js;
 * este archivo solo compone la UI con el tema corporativo (mismo patrón que
 * UsersPage). La papelera solo es visible/operable para Super Admin, en
 * línea con las reglas del backend (BranchController).
 */
const BranchesPage = () => {
  const { isSuperAdmin } = useAuth();
  const {
    branches, stats,
    loading, error, refetch,
    trashed, trashedLoading, trashedError, trashedLoaded, fetchTrashed,
    addBranch, editBranch, toggleActive, removeBranch, restoreBranchById,
    EMPTY_FORM,
  } = useBranches();

  const [showForm, setShowForm]         = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [saving, setSaving]             = useState(false);
  const [searchTerm, setSearchTerm]     = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // ─── Tabs de estado ─────────────────────────────────────────────────────
  const statusTabs = useMemo(() => buildBranchStatusFilters(isSuperAdmin), [isSuperAdmin]);
  const isTrashedTab = statusFilter === 'trashed';

  const handleTabChange = (key) => {
    setStatusFilter(key);
    if (key === 'trashed' && !trashedLoaded) {
      fetchTrashed();
    }
  };

  // ─── Lista filtrada ─────────────────────────────────────────────────────
  const filtered = useMemo(
    () => filterBranches(branches, searchTerm, statusFilter === 'trashed' ? 'all' : statusFilter),
    [branches, searchTerm, statusFilter],
  );

  const filteredTrashed = useMemo(
    () => filterBranches(trashed, searchTerm, 'all'),
    [trashed, searchTerm],
  );

  const hasActiveFilter = Boolean(searchTerm) || (statusFilter !== 'all' && !isTrashedTab);

  // ─── Handlers ───────────────────────────────────────────────────────────
  const openCreate = () => {
    setEditingBranch(null);
    setShowForm(true);
  };

  const openEdit = (branch) => {
    setEditingBranch(branch);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingBranch(null);
  };

  const handleSave = async (formData) => {
    setSaving(true);
    try {
      if (editingBranch) {
        await editBranch(editingBranch.id, formData);
      } else {
        await addBranch(formData);
      }
      closeForm();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Error al guardar la sucursal.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (branch) => {
    try {
      await toggleActive(branch);
    } catch (err) {
      alert(err.message || 'Error al cambiar el estado de la sucursal.');
    }
  };

  const handleDelete = async (branch) => {
    const confirmed = window.confirm(
      `¿Eliminar la sucursal "${branch.name}"? Podrás restaurarla después desde la papelera.`
    );
    if (!confirmed) return;
    try {
      await removeBranch(branch);
    } catch (err) {
      alert(err.message || 'Error al eliminar la sucursal.');
    }
  };

  const handleRestore = async (branch) => {
    try {
      await restoreBranchById(branch);
    } catch (err) {
      alert(err.message || 'Error al restaurar la sucursal.');
    }
  };

  // ─── Estado de carga inicial ────────────────────────────────────────────
  if (loading) {
    return (
      <div className="page-loading">
        <Loader2 size={32} className="page-loading-spinner" />
        <p>Cargando sucursales...</p>
      </div>
    );
  }

  // ─── Estado de error inicial ────────────────────────────────────────────
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

  // ─── Vista principal ────────────────────────────────────────────────────
  return (
    <div className="admin-page">

      {/* Encabezado */}
      <PageHeader
        icon={Store}
        title="Sucursales"
        subtitle="Administra las sucursales de tu negocio: datos, moneda, impuestos y estado."
      />

      {/* Estadísticas rápidas */}
      <div className="stat-card-grid">
        <StatCard icon={Store}     tone="primary" label="Total sucursales" value={stats.total}      delay={0}    />
        <StatCard icon={Power}     tone="success" label="Activas"          value={stats.active}     delay={0.05} />
        <StatCard icon={PowerOff}  tone="error"   label="Inactivas"        value={stats.inactive}   delay={0.1}  />
        <StatCard icon={Users}     tone="info"    label="Usuarios totales" value={stats.usersTotal} delay={0.15} />
      </div>

      {/* Barra de herramientas */}
      <div className="admin-toolbar">
        <div className="admin-toolbar-search">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar por nombre, código o dirección..."
          />
        </div>
        <button type="button" className="admin-new-btn" onClick={openCreate}>
          <PlusCircle size={16} />
          Nueva Sucursal
        </button>
      </div>

      {/* Filtro por estado */}
      {statusTabs.length > 1 && (
        <TabSwitcher
          tabs={statusTabs}
          active={statusFilter}
          onChange={handleTabChange}
          layoutId="branches-status-pill"
        />
      )}

      {/* Modal de crear / editar */}
      {showForm && (
        <FormModal
          title={editingBranch ? 'Editar Sucursal' : 'Nueva Sucursal'}
          icon={editingBranch ? Edit3 : PlusSquare}
          onClose={closeForm}
          maxWidth={640}
        >
          <BranchForm
            initialData={editingBranch}
            onSave={handleSave}
            saving={saving}
          />
        </FormModal>
      )}

      {/* ── Pestaña Papelera ── */}
      {isTrashedTab ? (
        <>
          {trashedLoading && (
            <div className="branches-inline-state">
              <Loader2 size={26} className="page-loading-spinner" />
              <p>Cargando papelera...</p>
            </div>
          )}

          {!trashedLoading && trashedError && (
            <div className="branches-inline-state branches-inline-state--error">
              <AlertTriangle size={26} />
              <p>{trashedError}</p>
              <button type="button" className="page-retry-btn" onClick={fetchTrashed}>
                <RotateCcw size={16} /> Reintentar
              </button>
            </div>
          )}

          {!trashedLoading && !trashedError && (
            <div className="branch-list">
              {filteredTrashed.map((branch, idx) => (
                <BranchCard
                  key={branch.id}
                  branch={branch}
                  trashed
                  delay={Math.min(idx * 0.04, 0.3)}
                  onRestore={handleRestore}
                />
              ))}

              {filteredTrashed.length === 0 && (
                <EmptyStateCard
                  icon={Trash2}
                  title="La papelera está vacía"
                  message="Las sucursales que elimines aparecerán aquí, listas para restaurar."
                />
              )}
            </div>
          )}
        </>
      ) : (
        <>
          {/* Lista de sucursales */}
          <div className="branch-list">
            {filtered.map((branch, idx) => (
              <BranchCard
                key={branch.id}
                branch={branch}
                delay={Math.min(idx * 0.04, 0.3)}
                canDelete={isSuperAdmin}
                onEdit={openEdit}
                onToggleActive={handleToggleActive}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {/* Estado vacío */}
          {filtered.length === 0 && (
            <EmptyStateCard
              icon={hasActiveFilter ? Store : BranchNetworkIcon}
              title={hasActiveFilter ? 'Sin resultados' : 'No hay sucursales registradas'}
              message={
                hasActiveFilter
                  ? 'Ninguna sucursal coincide con tu búsqueda o filtro activo.'
                  : 'Crea la primera sucursal para empezar a operar.'
              }
            />
          )}
        </>
      )}
    </div>
  );
};

export default BranchesPage;
