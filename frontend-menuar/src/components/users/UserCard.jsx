import React from 'react';
import { motion } from 'framer-motion';
import { Edit3, Power, PowerOff, Mail, Building2, Phone, Shield } from 'lucide-react';
import Badge from '../ui/Badge';
import { getUserInitials, getUserAvatarColor, getUserRoleTone } from '../../utils/users';

/**
 * Tarjeta de usuario con avatar de iniciales, información del perfil
 * y acciones de editar y activar/desactivar.
 * Animada con Framer Motion (entrada y hover lift).
 */
const UserCard = ({ user, delay = 0, onEdit, onToggleActive }) => {
  const initials = getUserInitials(user.name);
  const avatarColor = getUserAvatarColor(user.name);
  const roleTone = getUserRoleTone(user.role?.name || user.role?.slug || '');
  const isActive = user.is_active !== false;

  return (
    <motion.div
      className="user-card"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay, ease: 'easeOut' }}
      whileHover={{ y: -2, boxShadow: 'var(--shadow-md)' }}
      layout
    >
      {/* ── Avatar ── */}
      <div className="user-card-avatar-col">
        <motion.div
          className="user-avatar"
          style={{ background: isActive ? avatarColor : 'var(--color-border-strong)' }}
          whileHover={{ scale: 1.08 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        >
          {initials}
        </motion.div>
        <span className={`user-status-dot user-status-dot--${isActive ? 'active' : 'inactive'}`} />
      </div>

      {/* ── Información principal ── */}
      <div className="user-card-body">
        <div className="user-card-header">
          <p className="user-card-name">{user.name}</p>
          <div className="user-card-badges">
            <Badge tone={roleTone}>
              <Shield size={10} strokeWidth={2.5} style={{ marginRight: 4 }} />
              {user.role?.name || '—'}
            </Badge>
            <Badge tone={isActive ? 'success' : 'error'}>
              {isActive ? 'Activo' : 'Inactivo'}
            </Badge>
          </div>
        </div>

        <div className="user-card-meta">
          {user.email && (
            <span className="user-meta-item">
              <Mail size={13} strokeWidth={2} />
              {user.email}
            </span>
          )}
          {user.branch?.name && (
            <span className="user-meta-item">
              <Building2 size={13} strokeWidth={2} />
              {user.branch.name}
            </span>
          )}
          {user.phone && (
            <span className="user-meta-item">
              <Phone size={13} strokeWidth={2} />
              {user.phone}
            </span>
          )}
        </div>
      </div>

      {/* ── Acciones ── */}
      <div className="user-card-actions">
        <button
          type="button"
          className="admin-action-btn admin-action-btn--edit"
          onClick={() => onEdit(user)}
          aria-label={`Editar ${user.name}`}
        >
          <Edit3 size={13} strokeWidth={2} />
          Editar
        </button>

        <button
          type="button"
          className={`admin-action-btn ${isActive ? 'admin-action-btn--off' : 'admin-action-btn--on'}`}
          onClick={() => onToggleActive(user)}
          aria-label={isActive ? `Desactivar ${user.name}` : `Activar ${user.name}`}
        >
          {isActive
            ? <PowerOff size={13} strokeWidth={2} />
            : <Power size={13} strokeWidth={2} />}
          {isActive ? 'Desactivar' : 'Activar'}
        </button>
      </div>
    </motion.div>
  );
};

export default UserCard;
