import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Loader2,
  PlusCircle,
  RotateCcw,
  Users,
  UserCheck,
  UserX,
  Shield,
  UserPlus,
  Edit3,
} from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import SearchInput from '../../components/ui/SearchInput';
import StatCard from '../../components/ui/StatCard';
import TabSwitcher from '../../components/ui/TabSwitcher';
import EmptyStateCard from '../../components/ui/EmptyStateCard';
import FormModal from '../../components/ui/FormModal';
import UserCard from '../../components/users/UserCard';
import UserForm from '../../components/users/UserForm';
import useUsers from '../../hooks/useUsers';
import { buildUserRoleFilters, filterUsers } from '../../utils/users';
import '../../components/css/AdminCatalog.css';
import '../../components/css/SharedUI.css';
import './UsersPage.css';

/**
 * Vista de administración de Usuarios.
 * Toda la lógica de datos vive en hooks/useUsers.js y services/users.js.
 * Este archivo solo compone la UI con el tema corporativo.
 */
const UsersPage = () => {
  const {
    users, roles, branches, stats,
    loading, error, refetch,
    addUser, editUser, toggleActive,
    EMPTY_FORM,
  } = useUsers();

  const [showForm, setShowForm]       = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [saving, setSaving]           = useState(false);
  const [searchTerm, setSearchTerm]   = useState('');
  const [roleFilter, setRoleFilter]   = useState('all');

  // ─── Tabs de rol ───────────────────────────────────────────────────────────
  const roleTabs = useMemo(() => buildUserRoleFilters(roles), [roles]);

  // ─── Lista filtrada ────────────────────────────────────────────────────────
  const filtered = useMemo(
    () => filterUsers(users, searchTerm, roleFilter),
    [users, searchTerm, roleFilter],
  );

  const hasActiveFilter = Boolean(searchTerm) || roleFilter !== 'all';

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const openCreate = () => {
    setEditingUser(null);
    setShowForm(true);
  };

  const openEdit = (user) => {
    setEditingUser(user);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingUser(null);
  };

  const handleSave = async (formData) => {
    setSaving(true);
    try {
      if (editingUser) {
        await editUser(editingUser.id, formData);
      } else {
        await addUser(formData);
      }
      closeForm();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Error al guardar el usuario.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (user) => {
    try {
      await toggleActive(user);
    } catch (err) {
      alert(err.message || 'Error al cambiar el estado.');
    }
  };

  // ─── Estado de carga ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="page-loading">
        <Loader2 size={32} className="page-loading-spinner" />
        <p>Cargando usuarios...</p>
      </div>
    );
  }

  // ─── Estado de error ───────────────────────────────────────────────────────
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

  // ─── Vista principal ────────────────────────────────────────────────────────
  return (
    <div className="admin-page">

      {/* Encabezado */}
      <PageHeader
        icon={Users}
        title="Usuarios"
        subtitle="Administra los miembros del equipo: roles, sucursales y accesos."
      />

      {/* Estadísticas rápidas */}
      <div className="stat-card-grid">
        <StatCard icon={Users}      tone="primary" label="Total usuarios"  value={stats.total}      delay={0}    />
        <StatCard icon={UserCheck}  tone="success" label="Activos"          value={stats.active}     delay={0.05} />
        <StatCard icon={UserX}      tone="error"   label="Inactivos"        value={stats.inactive}   delay={0.1}  />
        <StatCard icon={Shield}     tone="info"    label="Roles distintos"  value={stats.rolesCount} delay={0.15} />
      </div>

      {/* Barra de herramientas */}
      <div className="admin-toolbar">
        <div className="admin-toolbar-search">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar por nombre o correo..."
          />
        </div>
        <button type="button" className="admin-new-btn" onClick={openCreate}>
          <PlusCircle size={16} />
          Nuevo Usuario
        </button>
      </div>

      {/* Filtro por rol */}
      {roleTabs.length > 1 && (
        <TabSwitcher
          tabs={roleTabs}
          active={roleFilter}
          onChange={setRoleFilter}
          layoutId="users-role-pill"
        />
      )}

      {/* Modal de crear / editar */}
      {showForm && (
        <FormModal
          title={editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
          icon={editingUser ? Edit3 : UserPlus}
          onClose={closeForm}
          maxWidth={600}
        >
          <UserForm
            initialData={editingUser}
            roles={roles}
            branches={branches}
            onSave={handleSave}
            saving={saving}
          />
        </FormModal>
      )}

      {/* Lista de usuarios */}
      <div className="user-list">
        {filtered.map((user, idx) => (
          <UserCard
            key={user.id}
            user={user}
            delay={Math.min(idx * 0.04, 0.3)}
            onEdit={openEdit}
            onToggleActive={handleToggleActive}
          />
        ))}
      </div>

      {/* Estado vacío */}
      {filtered.length === 0 && (
        <EmptyStateCard
          icon={Users}
          title={hasActiveFilter ? 'Sin resultados' : 'No hay usuarios registrados'}
          message={
            hasActiveFilter
              ? 'Ningún usuario coincide con tu búsqueda o filtro activo.'
              : 'Crea el primer usuario para comenzar a gestionar el equipo.'
          }
        />
      )}
    </div>
  );
};

export default UsersPage;