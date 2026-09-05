import React, { useMemo, useState } from 'react';
import { AlertTriangle, Armchair, CheckCircle2, Clock3, Loader2, PlusCircle, RotateCcw, XCircle } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import SearchInput from '../../components/ui/SearchInput';
import TabSwitcher from '../../components/ui/TabSwitcher';
import FormModal from '../../components/ui/FormModal';
import EmptyStateCard from '../../components/ui/EmptyStateCard';
import StatCard from '../../components/ui/StatCard';
import TableCard from '../../components/tables/TableCard';
import TableForm from '../../components/tables/TableForm';
import useTables from '../../hooks/useTables';
import { TABLE_STATUS_FILTERS } from '../../utils/tables';
import './TablesPage.css';

// Vista de administración de Mesas: crear/editar, cambiar estado (libre,
// ocupada, reservada, limpieza) y eliminar. Toda la lógica de datos vive en
// hooks/useTables.js — este archivo solo compone la UI con el tema
// corporativo de src/index.css.
const TablesPage = () => {
  const { tables, loading, error, refetch, saveTable, changeStatus, deleteTable } = useTables();

  const [showForm, setShowForm] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const stats = useMemo(
    () => ({
      total: tables.length,
      free: tables.filter((t) => t.status === 'free').length,
      occupied: tables.filter((t) => t.status === 'occupied').length,
      reserved: tables.filter((t) => t.status === 'reserved').length,
    }),
    [tables]
  );

  const filteredTables = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return tables
      .filter((t) => statusFilter === 'all' || t.status === statusFilter)
      .filter(
        (t) =>
          !term ||
          String(t.number).toLowerCase().includes(term) ||
          (t.name || '').toLowerCase().includes(term)
      );
  }, [tables, searchTerm, statusFilter]);

  const startCreate = () => {
    setEditingTable(null);
    setShowForm(true);
  };

  const startEdit = (table) => {
    setEditingTable(table);
    setShowForm(true);
  };

  const handleSave = async (form) => {
    await saveTable(form, editingTable);
    setShowForm(false);
  };

  const hasActiveFilter = Boolean(searchTerm) || statusFilter !== 'all';

  if (loading) {
    return (
      <div className="page-loading">
        <Loader2 size={32} className="page-loading-spinner" />
        <p>Cargando mesas...</p>
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
        icon={Armchair}
        title="Mesas"
        subtitle="Administra las mesas del local y su disponibilidad en tiempo real."
      />

      <div className="stat-card-grid">
        <StatCard icon={Armchair} tone="primary" label="Total de mesas" value={stats.total} delay={0} />
        <StatCard icon={CheckCircle2} tone="success" label="Libres" value={stats.free} delay={0.05} />
        <StatCard icon={XCircle} tone="error" label="Ocupadas" value={stats.occupied} delay={0.1} />
        <StatCard icon={Clock3} tone="warning" label="Reservadas" value={stats.reserved} delay={0.15} />
      </div>

      <div className="admin-toolbar">
        <div className="admin-toolbar-search">
          <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Buscar por número o nombre..." />
        </div>
        <button type="button" className="admin-new-btn" onClick={startCreate}>
          <PlusCircle size={16} /> Agregar Mesa
        </button>
      </div>

      <TabSwitcher
        tabs={TABLE_STATUS_FILTERS}
        active={statusFilter}
        onChange={setStatusFilter}
        layoutId="tables-status-pill"
      />

      {showForm && (
        <FormModal
          title={editingTable ? 'Editar Mesa' : 'Nueva Mesa'}
          icon={Armchair}
          onClose={() => setShowForm(false)}
          maxWidth={480}
        >
          <TableForm table={editingTable} onSave={handleSave} />
        </FormModal>
      )}

      <div className="admin-grid">
        {filteredTables.map((table, idx) => (
          <TableCard
            key={table.id}
            table={table}
            delay={Math.min(idx * 0.04, 0.3)}
            onEdit={() => startEdit(table)}
            onDelete={() => deleteTable(table)}
            onChangeStatus={changeStatus}
          />
        ))}
      </div>

      {filteredTables.length === 0 && (
        <EmptyStateCard
          icon={Armchair}
          title={hasActiveFilter ? 'Sin resultados' : 'No hay mesas registradas todavía'}
          message={
            hasActiveFilter
              ? 'No hay mesas que coincidan con tu búsqueda o filtro.'
              : 'Agrega la primera mesa para empezar a gestionar el salón.'
          }
        />
      )}
    </div>
  );
};

export default TablesPage;
