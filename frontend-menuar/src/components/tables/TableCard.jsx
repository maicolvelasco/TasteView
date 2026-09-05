import React from 'react';
import { motion } from 'framer-motion';
import { Users, Pencil, Trash2 } from 'lucide-react';
import Badge from '../ui/Badge';
import { TABLE_STATUS_THEME, TABLE_STATUS_LABELS } from '../../utils/tables';

/** Tarjeta de una mesa, con selector rápido de estado y acciones de edición. */
const TableCard = ({ table, onEdit, onDelete, onChangeStatus, delay = 0 }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay, ease: 'easeOut' }}
    whileHover={{ y: -3 }}
    className={`admin-card table-card table-card--${table.status}`}
  >
    <div className="admin-card-header">
      <div>
        <h3 className="table-card-number">Mesa {table.number}</h3>
        {table.name && <p className="table-card-name">{table.name}</p>}
      </div>
      <Badge tone={TABLE_STATUS_THEME[table.status] || 'info'}>
        {TABLE_STATUS_LABELS[table.status] || table.status}
      </Badge>
    </div>

    <p className="table-card-capacity">
      <Users size={13} /> Capacidad: {table.capacity} personas
    </p>

    <select
      className="input table-card-status-select"
      value={table.status}
      onChange={(e) => onChangeStatus(table, e.target.value)}
    >
      {Object.entries(TABLE_STATUS_LABELS).map(([val, label]) => (
        <option key={val} value={val}>
          {label}
        </option>
      ))}
    </select>

    <div className="admin-card-actions">
      <button type="button" className="admin-action-btn admin-action-btn--edit" onClick={onEdit}>
        <Pencil size={13} /> Editar
      </button>
      <button type="button" className="admin-action-btn admin-action-btn--delete" onClick={onDelete}>
        <Trash2 size={13} /> Quitar
      </button>
    </div>
  </motion.div>
);

export default TableCard;
