import React from 'react';
import { motion } from 'framer-motion';
import { Armchair, Package, User as UserIcon } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/roles';

/** Tarjeta de un pedido por cobrar, seleccionable para armar su factura. */
const OrderCard = ({ order, selected, onSelect }) => (
  <motion.button
    type="button"
    layout
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    whileHover={{ y: -2 }}
    whileTap={{ scale: 0.99 }}
    onClick={() => onSelect(order)}
    className={`cashier-order-card ${selected ? 'selected' : ''}`}
  >
    <div className="cashier-order-card-top">
      <span className="cashier-order-number">{order.order_number}</span>
      <span className="cashier-order-total">{formatCurrency(order.total)}</span>
    </div>

    <div className="cashier-order-card-meta">
      <span className="cashier-order-meta-item">
        {order.table ? <Armchair size={13} /> : <Package size={13} />}
        {order.table ? `Mesa ${order.table.number}` : order.order_type}
      </span>
      <span className="cashier-order-meta-item">{order.items?.length || 0} items</span>
      <span className="cashier-order-meta-item">{formatDate(order.created_at)}</span>
      <StatusBadge status={order.status} />
    </div>

    {order.user && (
      <p className="cashier-order-waiter">
        <UserIcon size={12} /> {order.user.name}
      </p>
    )}
  </motion.button>
);

export default OrderCard;
