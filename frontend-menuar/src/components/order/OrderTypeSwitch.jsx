import React from 'react';
import { motion } from 'framer-motion';
import { Bike, Package, Utensils } from 'lucide-react';
import { ORDER_TYPES } from '../../utils/orderForm';

const ORDER_TYPE_ICONS = { utensils: Utensils, package: Package, bike: Bike };

/** Segmentado de tipo de orden (comer aquí / para llevar / delivery). */
const OrderTypeSwitch = ({ value, onChange }) => (
  <div className="order-type-switch">
    {ORDER_TYPES.map((type) => {
      const Icon = ORDER_TYPE_ICONS[type.icon];
      const isActive = value === type.value;
      return (
        <motion.button
          key={type.value}
          type="button"
          whileTap={{ scale: 0.96 }}
          onClick={() => onChange(type.value)}
          className={`order-type-option ${isActive ? 'active' : ''}`}
        >
          <Icon size={15} strokeWidth={2} />
          <span>{type.label}</span>
        </motion.button>
      );
    })}
  </div>
);

export default OrderTypeSwitch;
