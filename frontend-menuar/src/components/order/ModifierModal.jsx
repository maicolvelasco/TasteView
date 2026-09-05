import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { PlusCircle, X } from 'lucide-react';
import { formatCurrency } from '../../utils/roles';

// Modal para seleccionar opciones/modificadores de un producto
// (ej: término de cocción, guarnición, con/sin papas, tamaño, etc.).
// Vive junto al resto de components/order/ porque solo lo usa OrderForm.jsx.
const ModifierModal = ({ product, onClose, onAdd }) => {
  const [selectedModifiers, setSelectedModifiers] = useState({});
  const [itemNotes, setItemNotes] = useState('');

  if (!product) return null;

  const handleToggleOption = (modifierId, option) => {
    const modifier = product.modifiers?.find((m) => m.id === modifierId);
    if (!modifier) return;

    setSelectedModifiers((prev) => {
      const current = prev[modifierId] || [];
      const exists = current.find((c) => c.id === option.id);
      const max = modifier.max_selections || 1;

      if (exists) {
        // Quitar si ya está seleccionado
        return { ...prev, [modifierId]: current.filter((c) => c.id !== option.id) };
      }
      if (max === 1) {
        // Selección única: reemplaza directamente (ideal para "término medio/cocido", "con/sin papas")
        return { ...prev, [modifierId]: [option] };
      }
      if (current.length >= max) {
        // Reemplazar el primero si excede el máximo permitido
        return { ...prev, [modifierId]: [...current.slice(1), option] };
      }
      return { ...prev, [modifierId]: [...current, option] };
    });
  };

  const isOptionSelected = (modifierId, optionId) =>
    selectedModifiers[modifierId]?.some((o) => o.id === optionId) || false;

  const isMissingRequired = () =>
    (product.modifiers || []).some((mod) => {
      const min = mod.min_selections ?? (mod.is_required ? 1 : 0);
      const count = (selectedModifiers[mod.id] || []).length;
      return min > 0 && count < min;
    });

  const handleAdd = () => {
    if (isMissingRequired()) {
      alert('Falta seleccionar alguna opción obligatoria');
      return;
    }

    const modifiersArray = [];
    Object.values(selectedModifiers).forEach((opts) => {
      opts.forEach((opt) => {
        modifiersArray.push({
          modifier_option_id: opt.id,
          option_name: opt.name,
          price_adjustment: opt.price_adjustment || 0,
          quantity: 1,
        });
      });
    });

    onAdd(product, modifiersArray, itemNotes);
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        className="modifier-modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="modifier-modal"
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.97 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modifier-modal-header">
            <div>
              <h3 className="modifier-modal-title">Personalizar: {product.name}</h3>
              <p className="modifier-modal-price">{formatCurrency(product.price)}</p>
            </div>
            <button type="button" className="modifier-modal-close" onClick={onClose} aria-label="Cerrar">
              <X size={18} />
            </button>
          </div>

          <div className="modifier-modal-body">
            {product.modifiers?.map((modifier) => (
              <div key={modifier.id} className="modifier-group">
                <div className="modifier-group-header">
                  <h4>
                    {modifier.name}
                    {(modifier.is_required || modifier.min_selections > 0) && <span className="modifier-required"> *</span>}
                  </h4>
                  <span className="modifier-group-hint">
                    {modifier.min_selections > 0 ? `Mín ${modifier.min_selections}` : ''}
                    {modifier.max_selections > 1 ? ` · Máx ${modifier.max_selections}` : ''}
                  </span>
                </div>
                {modifier.description && <p className="modifier-group-description">{modifier.description}</p>}

                <div className="modifier-options">
                  {modifier.options?.map((option) => {
                    const selected = isOptionSelected(modifier.id, option.id);
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => handleToggleOption(modifier.id, option)}
                        className={`modifier-option ${selected ? 'selected' : ''}`}
                      >
                        <span>{option.name}</span>
                        <span className="modifier-option-price">
                          {option.price_adjustment > 0
                            ? `+${formatCurrency(option.price_adjustment)}`
                            : option.price_adjustment < 0
                            ? `-${formatCurrency(Math.abs(option.price_adjustment))}`
                            : 'Incluido'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="modifier-notes-field">
              <label>Notas especiales</label>
              <input
                type="text"
                className="input"
                placeholder="Ej: sin cebolla, bien cocido, etc."
                value={itemNotes}
                onChange={(e) => setItemNotes(e.target.value)}
              />
            </div>

            <motion.button
              type="button"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="modifier-add-btn"
              onClick={handleAdd}
            >
              <PlusCircle size={18} /> Agregar al Pedido
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ModifierModal;
