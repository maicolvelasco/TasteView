import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from '../../utils/roles';

// Panel de cocina: SOLO LECTURA.
// El cocinero únicamente visualiza los pedidos entrantes, no cambia su estado.
const KitchenPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | pending | in_preparation | ready

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000); // Actualizar cada 10 seg
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = () => {
    api.get('/orders')
      .then(res => {
        const allOrders = res.data.data.data || [];
        // Mostrar solo pedidos activos (aún no servidos/cancelados)
        const active = allOrders.filter(o =>
          ['pending', 'confirmed', 'in_preparation', 'ready'].includes(o.status)
        );
        setOrders(active);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  if (loading) return <p style={{ color: '#94a3b8' }}>Cargando pedidos...</p>;

  return (
    <div>
      <h1 style={{ color: '#e2e8f0', marginBottom: 8, fontSize: 28 }}>👨‍🍳 Panel de Cocina</h1>
      <p style={{ color: '#64748b', marginBottom: 24, fontSize: 13 }}>
        Vista de solo lectura · Los pedidos aparecen automáticamente apenas se generan
      </p>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { key: 'all', label: 'Todos', color: '#94a3b8' },
          { key: 'pending', label: 'Pendientes', color: '#f59e0b' },
          { key: 'in_preparation', label: 'En preparación', color: '#8b5cf6' },
          { key: 'ready', label: 'Listos', color: '#10b981' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            style={{
              padding: '10px 20px', borderRadius: 10, border: 'none',
              background: filter === f.key ? f.color : '#1e293b',
              color: filter === f.key ? '#0f172a' : f.color,
              fontWeight: 600, cursor: 'pointer', fontSize: 13,
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Órdenes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
        {filteredOrders.map(order => (
          <div key={order.id} className="card animate-fade-in" style={{ borderLeft: `4px solid ${ORDER_STATUS_COLORS[order.status]}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <span style={{ color: '#38bdf8', fontWeight: 700, fontSize: 16 }}>{order.order_number}</span>
                <span style={{ color: '#64748b', marginLeft: 10, fontSize: 12 }}>
                  {new Date(order.created_at).toLocaleTimeString('es-BO')}
                </span>
              </div>
              <span style={{
                padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                background: ORDER_STATUS_COLORS[order.status] + '20',
                color: ORDER_STATUS_COLORS[order.status],
              }}>
                {ORDER_STATUS_LABELS[order.status]}
              </span>
            </div>

            <div style={{ marginBottom: 8 }}>
              <span style={{ color: '#94a3b8', fontSize: 12 }}>
                {order.table ? `🪑 Mesa ${order.table.number}` : '📦 ' + order.order_type} ·
                {order.user ? ` 👤 ${order.user.name}` : ''}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {order.items?.map(item => (
                <div key={item.id} style={{
                  background: '#0f172a', borderRadius: 8, padding: 12,
                  border: `1px solid ${ORDER_STATUS_COLORS[item.status] || '#334155'}40`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ color: '#e2e8f0', fontWeight: 600 }}>
                      {item.quantity}x {item.product?.name}
                    </span>
                    <span style={{
                      fontSize: 11, padding: '2px 8px', borderRadius: 10,
                      background: (ORDER_STATUS_COLORS[item.status] || '#334155') + '20',
                      color: ORDER_STATUS_COLORS[item.status] || '#94a3b8',
                      fontWeight: 600,
                    }}>
                      {ORDER_STATUS_LABELS[item.status] || item.status}
                    </span>
                  </div>

                  {item.modifiers?.length > 0 && (
                    <div style={{ marginBottom: 6 }}>
                      {item.modifiers.map((mod, mi) => (
                        <span key={mi} style={{ color: '#a855f7', fontSize: 12, display: 'block' }}>
                          + {mod.option_name}
                        </span>
                      ))}
                    </div>
                  )}

                  {item.notes && (
                    <p style={{ color: '#f59e0b', fontSize: 12 }}>📝 {item.notes}</p>
                  )}
                </div>
              ))}
            </div>

            {order.notes && (
              <p style={{ color: '#f59e0b', fontSize: 12, marginTop: 10 }}>📝 Nota del pedido: {order.notes}</p>
            )}
          </div>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <p style={{ fontSize: 48, marginBottom: 16 }}>☕</p>
          <p style={{ color: '#64748b', fontSize: 16 }}>No hay pedidos en este momento</p>
        </div>
      )}
    </div>
  );
};

export default KitchenPage;