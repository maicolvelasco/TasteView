import React from 'react';
import { ClipboardList, Wallet, Receipt, TrendingUp } from 'lucide-react';
import StatCard from './StatCard';
import { formatCurrency } from '../../utils/roles';

/** Fila de tarjetas de estadísticas del día, resumidas por hooks/useCashier.js. */
const StatsGrid = ({ stats }) => (
  <div className="cashier-stats-grid">
    <StatCard icon={ClipboardList} tone="warning" label="Pedidos por cobrar" value={stats.pendingCount} delay={0} />
    <StatCard icon={Wallet} tone="primary" label="Monto pendiente" value={formatCurrency(stats.pendingTotal)} delay={0.05} />
    <StatCard icon={Receipt} tone="info" label="Facturas hoy" value={stats.invoicesTodayCount} delay={0.1} />
    <StatCard icon={TrendingUp} tone="success" label="Cobrado hoy" value={formatCurrency(stats.revenueToday)} delay={0.15} />
  </div>
);

export default StatsGrid;
