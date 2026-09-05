import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ClipboardList, PlusCircle } from 'lucide-react';
import OrderForm from '../../components/OrderForm';
import PageHeader from '../../components/ui/PageHeader';
import TabSwitcher from '../../components/ui/TabSwitcher';
import MyOrdersList from '../../components/waiter/MyOrdersList';
import useWaiterOrders from '../../hooks/useWaiterOrders';
import './WaiterPage.css';

const WAITER_TABS = [
  { key: 'new', label: 'Nuevo Pedido', icon: PlusCircle },
  { key: 'history', label: 'Mis Pedidos', icon: ClipboardList },
];

// Vista de Mesero: toma de pedidos + historial propio. Comparte el mismo
// tema corporativo y componente de toma de pedidos (components/OrderForm.jsx)
// que Caja, ya que es exactamente la misma tarea de negocio.
const WaiterPage = () => {
  const [activeTab, setActiveTab] = useState('new');
  const { orders, refetch } = useWaiterOrders();

  return (
    <div className="waiter-page">
      <PageHeader
        icon={ClipboardList}
        title="Toma de Pedidos"
        subtitle="Arma pedidos y revisa el historial de lo que llevas registrado."
      />

      <TabSwitcher tabs={WAITER_TABS} active={activeTab} onChange={setActiveTab} layoutId="waiter-tab-pill" />

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          {activeTab === 'new' ? (
            <OrderForm onOrderCreated={refetch} />
          ) : (
            <MyOrdersList orders={orders} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default WaiterPage;
