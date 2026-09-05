import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileStack, Printer } from 'lucide-react';
import EmptyStateCard from '../ui/EmptyStateCard';
import { formatCurrency, formatDate } from '../../utils/roles';

/** Historial de facturas emitidas, con acción de reimpresión de ticket. */
const InvoiceHistoryPanel = ({ invoices, onReprint }) => (
  <section className="cashier-panel">
    <h2 className="cashier-panel-title">Historial de facturas</h2>

    <div className="cashier-invoice-history">
      <AnimatePresence initial={false}>
        {invoices.map((inv) => (
          <motion.div
            key={inv.id}
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="cashier-invoice-history-item"
          >
            <div className="cashier-invoice-history-top">
              <span className="cashier-invoice-number">{inv.invoice_number}</span>
              <span className="cashier-invoice-total">{formatCurrency(inv.total)}</span>
            </div>
            <p className="cashier-invoice-history-meta">
              {formatDate(inv.created_at)} · {inv.customer_name || 'Consumidor Final'} ·{' '}
              {inv.has_tax ? 'Con IVA' : 'Sin IVA'}
            </p>
            <motion.button
              type="button"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.96 }}
              className="cashier-reprint-btn"
              onClick={() => onReprint(inv.id)}
            >
              <Printer size={14} /> Reimprimir Ticket
            </motion.button>
          </motion.div>
        ))}
      </AnimatePresence>

      {invoices.length === 0 && (
        <EmptyStateCard
          icon={FileStack}
          title="Sin facturas emitidas"
          message="Las facturas que emitas aparecerán en este historial."
        />
      )}
    </div>
  </section>
);

export default InvoiceHistoryPanel;
