import React, { useState } from 'react';
import { BookOpen, Clock, UtensilsCrossed, Eye, Wheat, PackageOpen } from 'lucide-react';
import FormModal from '../ui/FormModal';
import MenuARViewer from './MenuARViewer';
import { formatCurrency } from '../../utils/roles';
import { formatPrepTime } from '../../utils/menu';

/**
 * Modal de detalle de un producto del menú público. Reutiliza el shell
 * genérico FormModal (backdrop, animación, cierre con Esc) y compone el
 * contenido específico de un platillo: imagen, precio, descripción,
 * ingredientes, historia y el disparador del visor de AR.
 *
 * Si el producto es un combo, además lista cada plato incluido con su
 * propia foto y, si tiene modelo 3D, su propio botón de AR — el visor
 * (`arModelUrl`) es un solo estado compartido: puede mostrar el modelo
 * del combo en sí o el de cualquiera de sus platos incluidos, nunca dos
 * a la vez.
 */
const MenuProductModal = ({ product, onClose }) => {
  const [arModelUrl, setArModelUrl] = useState(null);

  if (!product) return null;

  const prepTime = formatPrepTime(product.preparation_time_min);
  const comboItems = product.is_combo ? (product.combo_items || []) : [];

  return (
    <>
      <FormModal title={product.name} icon={UtensilsCrossed} onClose={onClose} maxWidth={600}>
        <div className="menu-product-modal">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="menu-product-modal-image" />
          ) : (
            <div className="menu-product-modal-image menu-product-modal-image--placeholder">
              <UtensilsCrossed size={40} strokeWidth={1.5} />
            </div>
          )}

          <div className="menu-product-modal-price-row">
            <span className="menu-product-modal-price">{formatCurrency(product.price ?? 0)}</span>
            {prepTime && (
              <span className="menu-product-modal-time">
                <Clock size={13} strokeWidth={2} /> {prepTime}
              </span>
            )}
          </div>

          {product.description && (
            <section className="menu-product-modal-section">
              <h4 className="menu-product-modal-heading">Descripción</h4>
              <p className="menu-product-modal-text">{product.description}</p>
            </section>
          )}

          {comboItems.length > 0 && (
            <section className="menu-product-modal-section">
              <h4 className="menu-product-modal-heading">
                <PackageOpen size={13} strokeWidth={2} /> Este combo incluye
              </h4>
              <div className="menu-combo-list">
                {comboItems.map((item, idx) => {
                  const dish = item.product;
                  const key = item.product_id ?? idx;

                  // El producto referenciado pudo haberse borrado después
                  // de armar el combo; se muestra un placeholder en vez de
                  // romper la lista.
                  if (!dish) {
                    return (
                      <div key={key} className="menu-combo-item menu-combo-item--missing">
                        <div className="menu-combo-item-thumb menu-combo-item-thumb--placeholder">
                          <UtensilsCrossed size={18} strokeWidth={1.75} />
                        </div>
                        <div className="menu-combo-item-info">
                          <p className="menu-combo-item-name">Plato ya no disponible</p>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={key} className="menu-combo-item">
                      {dish.image_url ? (
                        <img
                          src={dish.image_url}
                          alt={dish.name}
                          className="menu-combo-item-thumb"
                        />
                      ) : (
                        <div className="menu-combo-item-thumb menu-combo-item-thumb--placeholder">
                          <UtensilsCrossed size={18} strokeWidth={1.75} />
                        </div>
                      )}

                      <div className="menu-combo-item-info">
                        <p className="menu-combo-item-name">
                          {dish.name}
                          {item.quantity > 1 && (
                            <span className="menu-combo-item-qty">x{item.quantity}</span>
                          )}
                        </p>
                        {dish.description && (
                          <p className="menu-combo-item-desc">{dish.description}</p>
                        )}
                      </div>

                      {dish.model_3d_url && (
                        <button
                          type="button"
                          className="menu-combo-item-ar-btn"
                          onClick={() => setArModelUrl(dish.model_3d_url)}
                          aria-label={`Ver ${dish.name} en Realidad Aumentada`}
                          title="Ver en Realidad Aumentada"
                        >
                          <Eye size={14} strokeWidth={2} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {product.ingredients && (
            <section className="menu-product-modal-section">
              <h4 className="menu-product-modal-heading">
                <Wheat size={13} strokeWidth={2} /> Ingredientes
              </h4>
              <p className="menu-product-modal-text">{product.ingredients}</p>
            </section>
          )}

          {product.history && (
            <section className="menu-product-modal-history">
              <h4 className="menu-product-modal-heading">
                <BookOpen size={13} strokeWidth={2} /> Historia del platillo
              </h4>
              <p className="menu-product-modal-text menu-product-modal-text--italic">{product.history}</p>
            </section>
          )}

          {product.model_3d_url && (
            <button
              type="button"
              className="menu-product-modal-ar-btn"
              onClick={() => setArModelUrl(product.model_3d_url)}
            >
              <Eye size={16} strokeWidth={2} />
              Ver en Realidad Aumentada
            </button>
          )}
        </div>
      </FormModal>

      <MenuARViewer modelUrl={arModelUrl} onClose={() => setArModelUrl(null)} />
    </>
  );
};

export default MenuProductModal;
