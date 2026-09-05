import React from 'react';
import { Save } from 'lucide-react';
import ImageUploadButton from '../ImageUploadButton';
import ProductModifiersPicker from './ProductModifiersPicker';
import useProductForm from '../../hooks/useProductForm';
import { formatCurrency } from '../../utils/roles';

/**
 * Formulario de crear/editar producto. Si recibe `product`, edita ese
 * producto (precargando sus datos y sus opciones); si no, crea uno nuevo.
 */
const ProductForm = ({ product, categories, allProducts, modifiers, onSaved }) => {
  const {
    form,
    setField,
    comboItems,
    toggleComboItem,
    setComboQty,
    modifierSelections,
    setModifierSelections,
    loadingExtras,
    handleSubmit,
  } = useProductForm(product, onSaved);

  const comboCandidates = allProducts.filter((p) => !product || p.id !== product.id);

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-field-row">
        <div className="form-field">
          <label>Nombre *</label>
          <input type="text" className="input" value={form.name} onChange={(e) => setField('name', e.target.value)} required />
        </div>
        <div className="form-field">
          <label>Categoría *</label>
          <select className="input" value={form.category_id} onChange={(e) => setField('category_id', e.target.value)} required>
            <option value="">Seleccionar...</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-field-row">
        <div className="form-field">
          <label>Precio *</label>
          <input type="number" step="0.01" className="input" value={form.price} onChange={(e) => setField('price', e.target.value)} required />
        </div>
        <div className="form-field">
          <label>Costo</label>
          <input type="number" step="0.01" className="input" value={form.cost} onChange={(e) => setField('cost', e.target.value)} />
        </div>
        <div className="form-field">
          <label>Tiempo (min)</label>
          <input type="number" className="input" value={form.preparation_time_min} onChange={(e) => setField('preparation_time_min', e.target.value)} />
        </div>
      </div>

      <ImageUploadButton value={form.image_url} onChange={(url) => setField('image_url', url)} label="Foto del plato" />

      <div className="form-field-row" style={{ marginTop: 4 }}>
        <label className="form-checkbox">
          <input type="checkbox" checked={form.is_available} onChange={(e) => setField('is_available', e.target.checked)} />
          <span>Disponible</span>
        </label>
        <label className="form-checkbox">
          <input type="checkbox" checked={form.is_combo} onChange={(e) => setField('is_combo', e.target.checked)} />
          <span>Es un combo/promoción</span>
        </label>
      </div>

      {form.is_combo && (
        <div className="combo-section">
          <p className="combo-section-hint">Elige qué productos incluye este combo y en qué cantidad:</p>
          <div className="combo-section-list">
            {comboCandidates.map((p) => (
              <div key={p.id} className="combo-item-row">
                <label className="combo-item-label">
                  <input
                    type="checkbox"
                    checked={comboItems[p.id] !== undefined}
                    onChange={(e) => toggleComboItem(p.id, e.target.checked)}
                  />
                  <span className="combo-item-name">{p.name}</span>
                  <span className="combo-item-price">{formatCurrency(p.price)}</span>
                </label>
                {comboItems[p.id] !== undefined && (
                  <input
                    type="number"
                    min="1"
                    className="input combo-item-qty"
                    value={comboItems[p.id]}
                    onChange={(e) => setComboQty(p.id, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="form-field">
        <label>Opciones para este plato (ej: término de cocción, con/sin papas)</label>
        {loadingExtras ? (
          <p className="modifiers-picker-empty">Cargando opciones del producto...</p>
        ) : (
          <ProductModifiersPicker allModifiers={modifiers} selections={modifierSelections} onChange={setModifierSelections} />
        )}
      </div>

      <div className="form-field">
        <label>Descripción</label>
        <textarea className="input" rows={2} value={form.description} onChange={(e) => setField('description', e.target.value)} />
      </div>
      <div className="form-field">
        <label>Historia</label>
        <textarea className="input" rows={2} value={form.history} onChange={(e) => setField('history', e.target.value)} />
      </div>
      <div className="form-field">
        <label>Ingredientes</label>
        <textarea className="input" rows={2} value={form.ingredients} onChange={(e) => setField('ingredients', e.target.value)} />
      </div>

      <button type="submit" className="form-submit-btn">
        <Save size={16} /> {product ? 'Guardar Cambios' : 'Crear Plato'}
      </button>
    </form>
  );
};

export default ProductForm;
