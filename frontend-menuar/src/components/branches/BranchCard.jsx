import React from 'react';
import { motion } from 'framer-motion';
import {
  Store, Edit3, Power, PowerOff, Trash2, RotateCcw,
  MapPin, Phone, Clock, Coins, Percent, Users, UtensilsCrossed, Armchair,
} from 'lucide-react';
import Badge from '../ui/Badge';
import { getBranchAvatarColor } from '../../utils/branches';

/**
 * Tarjeta de sucursal. Mismo lenguaje visual que UserCard (avatar +
 * cuerpo + acciones), pero con métricas propias de una sucursal
 * (usuarios, productos, mesas) en vez de rol/email.
 *
 * `trashed` cambia el set de acciones disponibles: una sucursal en la
 * papelera solo puede restaurarse, no editarse ni desactivarse.
 */
const BranchCard = ({
  branch,
  delay = 0,
  trashed = false,
  canDelete = false,
  onEdit,
  onToggleActive,
  onDelete,
  onRestore,
}) => {
  const avatarColor = getBranchAvatarColor(branch.code || branch.name || '');
  const isActive = branch.is_active !== false;
  const stats = branch.stats || {};

  return (
    <motion.div
      className={`branch-card ${trashed ? 'branch-card--trashed' : ''}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay, ease: 'easeOut' }}
      whileHover={{ y: -2, boxShadow: 'var(--shadow-md)' }}
      layout
    >
      {/* ── Avatar ── */}
      <div className="branch-card-avatar-col">
        <motion.div
          className="branch-avatar"
          style={{ background: trashed ? 'var(--color-border-strong)' : (isActive ? avatarColor : 'var(--color-border-strong)') }}
          whileHover={{ scale: 1.08 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        >
          <Store size={20} strokeWidth={2} />
        </motion.div>
        {!trashed && (
          <span className={`branch-status-dot branch-status-dot--${isActive ? 'active' : 'inactive'}`} />
        )}
      </div>

      {/* ── Información principal ── */}
      <div className="branch-card-body">
        <div className="branch-card-header">
          <p className="branch-card-name">{branch.name}</p>
          <div className="branch-card-badges">
            <Badge tone="neutral">{branch.code}</Badge>
            {branch.company?.name && (
              <Badge tone="info">{branch.company.name}</Badge>
            )}
            {!trashed && (
              <Badge tone={isActive ? 'success' : 'error'}>
                {isActive ? 'Activa' : 'Inactiva'}
              </Badge>
            )}
          </div>
        </div>

        <div className="branch-card-meta">
          {branch.address && (
            <span className="branch-meta-item">
              <MapPin size={13} strokeWidth={2} />
              {branch.address}
            </span>
          )}
          {branch.phone && (
            <span className="branch-meta-item">
              <Phone size={13} strokeWidth={2} />
              {branch.phone}
            </span>
          )}
          {branch.timezone && (
            <span className="branch-meta-item">
              <Clock size={13} strokeWidth={2} />
              {branch.timezone}
            </span>
          )}
          {branch.currency && (
            <span className="branch-meta-item">
              <Coins size={13} strokeWidth={2} />
              {branch.currency}
            </span>
          )}
          {branch.tax_rate != null && (
            <span className="branch-meta-item">
              <Percent size={13} strokeWidth={2} />
              {Number(branch.tax_rate).toFixed(2)}% impuesto
            </span>
          )}
        </div>

        {!trashed && (
          <div className="branch-card-stats">
            <span className="branch-stat-chip" title="Usuarios asignados">
              <Users size={12} strokeWidth={2.25} />
              {stats.users_count ?? 0}
            </span>
            <span className="branch-stat-chip" title="Productos en el menú">
              <UtensilsCrossed size={12} strokeWidth={2.25} />
              {stats.products_count ?? 0}
            </span>
            <span className="branch-stat-chip" title="Mesas registradas">
              <Armchair size={12} strokeWidth={2.25} />
              {stats.tables_count ?? 0}
            </span>
          </div>
        )}
      </div>

      {/* ── Acciones ── */}
      <div className="branch-card-actions">
        {trashed ? (
          <button
            type="button"
            className="admin-action-btn admin-action-btn--on"
            onClick={() => onRestore(branch)}
            aria-label={`Restaurar ${branch.name}`}
          >
            <RotateCcw size={13} strokeWidth={2} />
            Restaurar
          </button>
        ) : (
          <>
            <button
              type="button"
              className="admin-action-btn admin-action-btn--edit"
              onClick={() => onEdit(branch)}
              aria-label={`Editar ${branch.name}`}
            >
              <Edit3 size={13} strokeWidth={2} />
              Editar
            </button>

            <button
              type="button"
              className={`admin-action-btn ${isActive ? 'admin-action-btn--off' : 'admin-action-btn--on'}`}
              onClick={() => onToggleActive(branch)}
              aria-label={isActive ? `Desactivar ${branch.name}` : `Activar ${branch.name}`}
            >
              {isActive
                ? <PowerOff size={13} strokeWidth={2} />
                : <Power size={13} strokeWidth={2} />}
              {isActive ? 'Desactivar' : 'Activar'}
            </button>

            {canDelete && (
              <button
                type="button"
                className="admin-action-btn admin-action-btn--delete"
                onClick={() => onDelete(branch)}
                aria-label={`Eliminar ${branch.name}`}
              >
                <Trash2 size={13} strokeWidth={2} />
                Eliminar
              </button>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
};

export default BranchCard;
