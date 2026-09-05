import React from 'react';
import { motion } from 'framer-motion';
import { Armchair, Package } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/roles';

/** Tarjeta de un pedido registrado por el mesero (solo lectura, sin acciones). */
const MyOrderCard = ({ order }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    className="my-order-card"
  >
    <div className="my-order-card-top">
      <div>
        <span className="my-order-number">{order.order_number}</span>
        <span className="my-order-date">{formatDate(order.created_at)}</span>
      </div>
      <StatusBadge status={order.status} />
    </div>
    <div className="my-order-card-bottom">
      <span className="my-order-meta">
        {order.order_type === 'dine_in' ? <Armchair size={13} /> : <Package size={13} />}
        {order.items?.length || 0} items · {order.order_type === 'dine_in' ? 'Mesa' : order.order_type}
      </span>
      <span className="my-order-total">{formatCurrency(order.total)}</span>
    </div>
  </motion.div>
);

export default MyOrderCard;
