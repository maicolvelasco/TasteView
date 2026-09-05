import React from 'react';
import { ORDER_STATUS_THEME } from '../../utils/orders';
import { ORDER_STATUS_LABELS } from '../../utils/roles';

/** Badge de estado de pedido, con tonos alineados a la paleta corporativa. */
const StatusBadge = ({ status }) => {
  const tone = ORDER_STATUS_THEME[status] || 'info';
  return (
    <span className={`status-badge status-badge--${tone}`}>
      {ORDER_STATUS_LABELS[status] || status}
    </span>
  );
};

export default StatusBadge;
