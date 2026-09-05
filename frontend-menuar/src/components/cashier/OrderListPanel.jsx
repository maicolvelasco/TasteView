import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { Inbox } from 'lucide-react';
import OrderCard from './OrderCard';
import EmptyStateCard from '../ui/EmptyStateCard';

/** Lista de pedidos pendientes de cobro, con estado vacío animado. */
const OrderListPanel = ({ orders, selectedOrder, onSelect }) => (
  <section className="cashier-panel">
    <h2 className="cashier-panel-title">Pedidos por cobrar</h2>

    <div className="cashier-order-list">
      <AnimatePresence initial={false}>
        {orders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            selected={selectedOrder?.id === order.id}
            onSelect={onSelect}
          />
        ))}
      </AnimatePresence>

      {orders.length === 0 && (
        <EmptyStateCard
          icon={Inbox}
          title="Sin pedidos pendientes"
          message="Los nuevos pedidos por cobrar aparecerán aquí automáticamente."
        />
      )}
    </div>
  </section>
);

export default OrderListPanel;
