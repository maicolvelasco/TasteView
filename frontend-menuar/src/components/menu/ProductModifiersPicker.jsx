import React from 'react';
import { motion } from 'framer-motion';
import { formatCurrency } from '../../utils/roles';

/**
 * Selector de opciones/modificadores integrado DENTRO del formulario del
 * producto. El admin marca qué grupos aplican a este plato y, para cada uno,
 * qué opciones puntuales ofrece (ej: este jugo no tiene "sirope de vainilla")
 * y si es obligatorio. Todo se guarda junto con el producto en un solo paso.
 */
const ProductModifiersPicker = ({ allModifiers, selections, onChange }) => {
  if (allModifiers.length === 0) {
    return (
      <p className="modifiers-picker-empty">
        Todavía no creaste ningún grupo de opciones. Puedes crearlos en "Modificadores" en el menú lateral
        y después volver acá a activarlos para este plato.
      </p>
    );
  }

  const toggleGroup = (modifierId) => {
    const current = selections[modifierId];
    if (current?.checked) {
      const next = { ...selections };
      delete next[modifierId];
      onChange(next);
    } else {
      onChange({ ...selections, [modifierId]: { checked: true, is_required: false, disabled_option_ids: [] } });
    }
  };

  const toggleOption = (modifierId, optionId) => {
    const cfg = selections[modifierId];
    if (!cfg) return;
    const disabled = new Set(cfg.disabled_option_ids || []);
    if (disabled.has(optionId)) disabled.delete(optionId); else disabled.add(optionId);
    onChange({ ...selections, [modifierId]: { ...cfg, disabled_option_ids: Array.from(disabled) } });
  };

  const toggleRequired = (modifierId) => {
    const cfg = selections[modifierId];
    if (!cfg) return;
    onChange({ ...selections, [modifierId]: { ...cfg, is_required: !cfg.is_required } });
  };

  return (
    <div className="modifiers-picker">
      {allModifiers.map((mod) => {
        const cfg = selections[mod.id];
        const active = !!cfg?.checked;
        return (
          <motion.div key={mod.id} layout className={`modifiers-picker-group ${active ? 'active' : ''}`}>
            <label className="modifiers-picker-group-header">
              <span className="form-checkbox" style={{ marginBottom: 0 }}>
                <input type="checkbox" checked={active} onChange={() => toggleGroup(mod.id)} />
                <span>{mod.name}</span>
              </span>
              <span className="modifiers-picker-count">{mod.options?.length || 0} opciones</span>
            </label>

            {active && (
              <div className="modifiers-picker-body">
                <label className="form-checkbox modifiers-picker-required" style={{ marginBottom: 10 }}>
                  <input type="checkbox" checked={cfg.is_required} onChange={() => toggleRequired(mod.id)} />
                  <span>Obligatorio en este plato</span>
                </label>
                <div className="modifiers-picker-options">
                  {mod.options?.map((opt) => {
                    const included = !(cfg.disabled_option_ids || []).includes(opt.id);
                    const priceAdjustment = parseFloat(opt.price_adjustment);
                    return (
                      <label key={opt.id} className={`modifiers-picker-option ${included ? '' : 'disabled'}`}>
                        <span className="modifiers-picker-option-name">
                          <input
                            type="checkbox"
                            checked={included}
                            onChange={() => toggleOption(mod.id, opt.id)}
                          />
                          {opt.name}
                        </span>
                        <span className={`modifiers-picker-option-price ${priceAdjustment > 0 ? 'positive' : ''}`}>
                          {priceAdjustment > 0 ? `+${formatCurrency(priceAdjustment)}` : 'Incluido'}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

export default ProductModifiersPicker;
