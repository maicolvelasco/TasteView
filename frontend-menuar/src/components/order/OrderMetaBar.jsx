import React from 'react';
import OrderTypeSwitch from './OrderTypeSwitch';

/**
 * Barra de datos generales del pedido: tipo de orden, mesa (si aplica),
 * mesero asignado (solo Caja) y nombre del cliente.
 */
const OrderMetaBar = ({
  orderType,
  onOrderTypeChange,
  tables,
  selectedTable,
  onSelectTable,
  showWaiterSelect,
  waiters,
  selectedWaiterId,
  onSelectWaiter,
  customerName,
  onCustomerNameChange,
}) => (
  <div className="order-meta-bar">
    <div className="order-meta-field">
      <label>Tipo de orden</label>
      <OrderTypeSwitch value={orderType} onChange={onOrderTypeChange} />
    </div>

    {orderType === 'dine_in' && (
      <div className="order-meta-field">
        <label>Mesa</label>
        <select className="input" value={selectedTable?.id || ''} onChange={(e) => onSelectTable(e.target.value)}>
          <option value="">Seleccionar...</option>
          {tables.filter((t) => t.status === 'free').map((t) => (
            <option key={t.id} value={t.id}>
              Mesa {t.number}{t.name ? ` — ${t.name}` : ''}
            </option>
          ))}
        </select>
      </div>
    )}

    {showWaiterSelect && (
      <div className="order-meta-field">
        <label>Asignar a mesero</label>
        <select className="input" value={selectedWaiterId} onChange={(e) => onSelectWaiter(e.target.value)}>
          <option value="">Sin asignar (yo mismo)</option>
          {waiters.map((w) => (
            <option key={w.id} value={w.id}>{w.name}</option>
          ))}
        </select>
      </div>
    )}

    <div className="order-meta-field order-meta-field--grow">
      <label>Cliente</label>
      <input
        type="text"
        className="input"
        placeholder="Nombre del cliente (opcional)"
        value={customerName}
        onChange={(e) => onCustomerNameChange(e.target.value)}
      />
    </div>
  </div>
);

export default OrderMetaBar;
