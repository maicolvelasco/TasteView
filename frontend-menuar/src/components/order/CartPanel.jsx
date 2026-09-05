import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Loader2, ShoppingCart } from 'lucide-react';
import CartItemRow from './CartItemRow';
import EmptyStateCard from '../ui/EmptyStateCard';
import { formatCurrency } from '../../utils/roles';

/** Panel lateral del carrito: ítems, notas generales, total y envío del pedido. */
const CartPanel = ({
  cart,
  cartTotal,
  onRemove,
  onChangeQuantity,
  onChangeNotes,
  notes,
  onNotesChange,
  loading,
  success,
  onSubmit,
}) => (
  <section className="order-cart-panel">
    <h3 className="order-cart-title">
      <ShoppingCart size={17} /> Pedido Actual
    </h3>

    <AnimatePresence>
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          className="order-cart-success"
        >
          <CheckCircle2 size={16} /> {success}
        </motion.div>
      )}
    </AnimatePresence>

    {cart.length === 0 ? (
      <EmptyStateCard icon={ShoppingCart} title="Carrito vacío" message="Selecciona productos del menú para comenzar." />
    ) : (
      <>
        <div className="order-cart-items">
          <AnimatePresence initial={false}>
            {cart.map((item, index) => (
              <CartItemRow
                key={index}
                item={item}
                index={index}
                onRemove={onRemove}
                onChangeQuantity={onChangeQuantity}
                onChangeNotes={onChangeNotes}
              />
            ))}
          </AnimatePresence>
        </div>

        <div className="order-cart-total">
          <span>Total</span>
          <span>{formatCurrency(cartTotal)}</span>
        </div>

        <textarea
          className="input order-cart-general-notes"
          placeholder="Notas generales del pedido..."
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
        />

        <motion.button
          type="button"
          whileHover={{ y: loading ? 0 : -2 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
          className="order-submit-btn"
          onClick={onSubmit}
          disabled={loading}
        >
          {loading ? <Loader2 className="spin-icon" size={18} /> : <CheckCircle2 size={18} />}
          {loading ? 'Enviando...' : 'Enviar Pedido'}
        </motion.button>
      </>
    )}
  </section>
);

export default CartPanel;
