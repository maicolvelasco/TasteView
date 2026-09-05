import React from 'react';
import { motion } from 'framer-motion';
import { Banknote, CreditCard, Landmark, QrCode } from 'lucide-react';
import { PAYMENT_METHODS } from '../../utils/cashier';

// Igual criterio que icons/index.jsx: la lista de métodos de pago (utils/cashier.js)
// solo conoce claves de texto, este componente es el único que las traduce a íconos.
const PAYMENT_ICONS = { banknote: Banknote, creditCard: CreditCard, landmark: Landmark, qrCode: QrCode };

/** Selector visual de método de pago (efectivo/tarjeta/transferencia/QR). */
const PaymentMethodPicker = ({ value, onChange }) => (
  <div className="cashier-payment-grid">
    {PAYMENT_METHODS.map((method) => {
      const Icon = PAYMENT_ICONS[method.icon];
      const isActive = value === method.value;
      return (
        <motion.button
          key={method.value}
          type="button"
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => onChange(method.value)}
          className={`cashier-payment-option ${isActive ? 'active' : ''}`}
        >
          {Icon && <Icon size={18} strokeWidth={2} />}
          <span>{method.label}</span>
        </motion.button>
      );
    })}
  </div>
);

export default PaymentMethodPicker;
