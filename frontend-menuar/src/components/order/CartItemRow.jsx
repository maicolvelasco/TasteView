import React from 'react';
import { motion } from 'framer-motion';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { computeCartItemSubtotal } from '../../utils/orderForm';
import { formatCurrency } from '../../utils/roles';

/** Fila de un ítem del carrito: nombre, modificadores, cantidad, subtotal y notas. */
const CartItemRow = ({ item, index, onRemove, onChangeQuantity, onChangeNotes }) => (
  <motion.div
    layout
    initial={{ opacity: 0, x: -8 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 8 }}
    className="order-cart-item"
  >
    <div className="order-cart-item-top">
      <span className="order-cart-item-name">{item.name}</span>
      <button type="button" className="order-cart-item-remove" onClick={() => onRemove(index)} aria-label="Quitar">
        <Trash2 size={14} />
      </button>
    </div>

    {item.modifiers?.length > 0 && (
      <p className="order-cart-item-modifiers">
        {item.modifiers.map((mod, mi) => (
          <span key={mi}>+ {mod.option_name || mod.modifier_option_id}</span>
        ))}
      </p>
    )}

    <div className="order-cart-item-row">
      <div className="order-cart-qty">
        <button type="button" onClick={() => onChangeQuantity(index, -1)} aria-label="Restar">
          <Minus size={13} />
        </button>
        <span>{item.quantity}</span>
        <button type="button" onClick={() => onChangeQuantity(index, 1)} aria-label="Sumar">
          <Plus size={13} />
        </button>
      </div>
      <span className="order-cart-item-subtotal">{formatCurrency(computeCartItemSubtotal(item))}</span>
    </div>

    <input
      type="text"
      className="input order-cart-item-notes"
      placeholder="Notas: sin cebolla, etc."
      value={item.notes}
      onChange={(e) => onChangeNotes(index, e.target.value)}
    />
  </motion.div>
);

export default CartItemRow;
