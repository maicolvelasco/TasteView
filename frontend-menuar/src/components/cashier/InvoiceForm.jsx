import React from 'react';
import { motion } from 'framer-motion';
import { Receipt, Loader2, CheckCircle2 } from 'lucide-react';
import PaymentMethodPicker from './PaymentMethodPicker';
import EmptyStateCard from '../ui/EmptyStateCard';
import { formatCurrency } from '../../utils/roles';

/** Panel lateral para armar y emitir la factura del pedido seleccionado. */
const InvoiceForm = ({ order, form, loading, onFieldChange, onSubmit }) => {
  if (!order) {
    return (
      <section className="cashier-panel cashier-invoice-panel">
        <h2 className="cashier-panel-title">
          <Receipt size={17} /> Emitir Factura
        </h2>
        <EmptyStateCard
          icon={Receipt}
          title="Ningún pedido seleccionado"
          message="Elige un pedido de la lista para comenzar a facturar."
        />
      </section>
    );
  }

  const taxRate = order.branch?.tax_rate || 13;
  const total = form.has_tax ? order.total : order.subtotal;

  return (
    <motion.section
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="cashier-panel cashier-invoice-panel"
    >
      <h2 className="cashier-panel-title">
        <Receipt size={17} /> Emitir Factura
      </h2>

      <div className="cashier-invoice-order-summary">
        <span className="cashier-order-number">{order.order_number}</span>
        <span className="cashier-invoice-order-meta">
          {order.items?.length || 0} items · Total {formatCurrency(order.total)}
        </span>
      </div>

      <div className="cashier-form-field">
        <label htmlFor="cashier-customer-name">Nombre del cliente</label>
        <input
          id="cashier-customer-name"
          type="text"
          className="input"
          placeholder="Consumidor Final"
          value={form.customer_name}
          onChange={(e) => onFieldChange('customer_name', e.target.value)}
        />
      </div>

      <div className="cashier-form-field">
        <label htmlFor="cashier-customer-nit">NIT / CI</label>
        <input
          id="cashier-customer-nit"
          type="text"
          className="input"
          placeholder="CF"
          value={form.customer_nit}
          onChange={(e) => onFieldChange('customer_nit', e.target.value)}
        />
      </div>

      <div className="cashier-form-field">
        <label>Método de pago</label>
        <PaymentMethodPicker value={form.payment_method} onChange={(v) => onFieldChange('payment_method', v)} />
      </div>

      <label className="cashier-checkbox">
        <input
          type="checkbox"
          checked={form.has_tax}
          onChange={(e) => onFieldChange('has_tax', e.target.checked)}
        />
        <span>Incluir IVA ({taxRate}%)</span>
      </label>

      <div className="cashier-invoice-totals">
        <div className="cashier-invoice-totals-row">
          <span>Subtotal</span>
          <span>{formatCurrency(order.subtotal)}</span>
        </div>
        {form.has_tax && (
          <div className="cashier-invoice-totals-row">
            <span>IVA</span>
            <span>{formatCurrency(order.tax_amount)}</span>
          </div>
        )}
        <div className="cashier-invoice-totals-row cashier-invoice-totals-total">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>

      <motion.button
        type="button"
        whileHover={{ y: loading ? 0 : -2 }}
        whileTap={{ scale: loading ? 1 : 0.98 }}
        className="cashier-submit-btn"
        onClick={onSubmit}
        disabled={loading}
      >
        {loading ? <Loader2 className="spin-icon" size={18} /> : <CheckCircle2 size={18} />}
        {loading ? 'Procesando...' : 'Cobrar e Imprimir'}
      </motion.button>
    </motion.section>
  );
};

export default InvoiceForm;
