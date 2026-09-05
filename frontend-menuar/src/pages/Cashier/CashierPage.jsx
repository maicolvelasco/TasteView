import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, ClipboardList, Loader2, PlusCircle, Receipt, RotateCcw, Wallet } from 'lucide-react';
import OrderForm from '../../components/OrderForm';
import useCashier from '../../hooks/useCashier';
import PageHeader from '../../components/ui/PageHeader';
import TabSwitcher from '../../components/ui/TabSwitcher';
import StatsGrid from '../../components/cashier/StatsGrid';
import OrderListPanel from '../../components/cashier/OrderListPanel';
import InvoiceForm from '../../components/cashier/InvoiceForm';
import InvoiceHistoryPanel from '../../components/cashier/InvoiceHistoryPanel';
import './CashierPage.css';

const CASHIER_TABS = [
  { key: 'new', label: 'Nuevo Pedido', icon: PlusCircle },
  { key: 'orders', label: 'Pedidos por Cobrar', icon: ClipboardList },
  { key: 'invoices', label: 'Facturas Emitidas', icon: Receipt },
];

// Vista de Caja: cobro de pedidos, emisión de facturas e historial. Toda la
// lógica (fetch, selección, formulario de factura, impresión) vive en
// hooks/useCashier.js — este archivo solo compone la UI con componentes de
// components/cashier/, siguiendo la paleta corporativa de src/index.css.
const CashierPage = () => {
  const {
    orders,
    invoices,
    selectedOrder,
    invoiceForm,
    activeTab,
    loading,
    fetching,
    error,
    stats,
    setActiveTab,
    selectOrder,
    updateInvoiceField,
    createInvoice,
    printTicket,
    refetch,
  } = useCashier();

  const isInitialLoad = fetching && orders.length === 0 && invoices.length === 0;

  if (isInitialLoad) {
    return (
      <div className="cashier-loading">
        <Loader2 size={32} className="cashier-loading-spinner" />
        <p>Cargando caja...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cashier-error">
        <AlertTriangle size={32} />
        <p>{error}</p>
        <button type="button" className="cashier-retry-btn" onClick={refetch}>
          <RotateCcw size={16} /> Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="cashier-page">
      <PageHeader
        icon={Wallet}
        title="Caja y Facturación"
        subtitle="Cobra pedidos, emite facturas e imprime tickets desde un solo lugar."
      />
      <StatsGrid stats={stats} />
      <TabSwitcher
        tabs={CASHIER_TABS.map((tab) => (tab.key === 'orders' ? { ...tab, count: orders.length } : tab))}
        active={activeTab}
        onChange={setActiveTab}
        layoutId="cashier-tab-pill"
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          {activeTab === 'new' && <OrderForm showWaiterSelect onOrderCreated={refetch} />}

          {activeTab === 'orders' && (
            <div className="cashier-orders-grid">
              <OrderListPanel orders={orders} selectedOrder={selectedOrder} onSelect={selectOrder} />
              <InvoiceForm
                order={selectedOrder}
                form={invoiceForm}
                loading={loading}
                onFieldChange={updateInvoiceField}
                onSubmit={createInvoice}
              />
            </div>
          )}

          {activeTab === 'invoices' && (
            <InvoiceHistoryPanel invoices={invoices} onReprint={printTicket} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default CashierPage;
