import React from 'react';
import { motion } from 'framer-motion';
import { Pencil, SlidersHorizontal, Trash2 } from 'lucide-react';
import { formatCurrency } from '../../utils/roles';

/** Tarjeta de un grupo de opciones (ej: "Tipo de bebida") con su lista de opciones. */
const ModifierGroupCard = ({ modifier, onEdit, onDelete }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -3 }}
    className="admin-card"
  >
    <div className="admin-card-header">
      <h4 className="modifier-group-card-name">
        <SlidersHorizontal size={14} /> {modifier.name}
      </h4>
      <div className="admin-card-actions" style={{ marginTop: 0, paddingTop: 0 }}>
        <button type="button" className="admin-action-btn admin-action-btn--edit admin-action-btn--icon-only" onClick={onEdit} title="Editar">
          <Pencil size={13} />
        </button>
        <button type="button" className="admin-action-btn admin-action-btn--delete admin-action-btn--icon-only" onClick={onDelete} title="Eliminar">
          <Trash2 size={13} />
        </button>
      </div>
    </div>

    {modifier.description && <p className="modifier-group-card-description">{modifier.description}</p>}
    <p className="modifier-group-card-meta">Mín {modifier.min_selections} · Máx {modifier.max_selections}</p>

    <div className="modifier-group-card-options">
      {modifier.options?.map((opt) => {
        const price = parseFloat(opt.price_adjustment);
        return (
          <div key={opt.id} className="modifier-group-card-option">
            <span>{opt.name}</span>
            <span className={price > 0 ? 'positive' : ''}>{price > 0 ? `+${formatCurrency(price)}` : 'Incluido'}</span>
          </div>
        );
      })}
      {(!modifier.options || modifier.options.length === 0) && (
        <p className="modifier-group-card-no-options">Sin opciones — edítalo para agregar.</p>
      )}
    </div>
  </motion.div>
);

export default ModifierGroupCard;
