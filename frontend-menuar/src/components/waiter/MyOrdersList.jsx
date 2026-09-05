import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { Inbox } from 'lucide-react';
import MyOrderCard from './MyOrderCard';
import EmptyStateCard from '../ui/EmptyStateCard';

/** Lista de pedidos del mesero autenticado. */
const MyOrdersList = ({ orders }) => (
  <div className="my-orders-list">
    <AnimatePresence initial={false}>
      {orders.map((order) => (
        <MyOrderCard key={order.id} order={order} />
      ))}
    </AnimatePresence>

    {orders.length === 0 && (
      <EmptyStateCard
        icon={Inbox}
        title="Sin pedidos registrados"
        message="Los pedidos que tomes aparecerán aquí."
      />
    )}
  </div>
);

export default MyOrdersList;
