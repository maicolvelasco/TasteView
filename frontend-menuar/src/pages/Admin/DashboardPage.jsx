import React, { useMemo } from 'react';
import {
  AlertTriangle,
  Armchair,
  DollarSign,
  Flame,
  Hourglass,
  LayoutDashboard,
  LayoutGrid,
  Loader2,
  RotateCcw,
  ShoppingBag,
  TrendingUp,
  Trophy,
} from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import EmptyStateCard from '../../components/ui/EmptyStateCard';
import SummaryCard from '../../components/Reports/SummaryCard';
import BarChart from '../../components/Reports/BarChart';
import TopProductsList from '../../components/Reports/TopProductsList';
import WelcomeBanner from '../../components/dashboard/WelcomeBanner';
import TableStatusWidget from '../../components/dashboard/TableStatusWidget';
import QuickActionsGrid from '../../components/dashboard/QuickActionsGrid';
import useDashboard from '../../hooks/useDashboard';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/roles';
import { buildQuickActions } from '../../utils/dashboard';
import '../../components/css/AdminCatalog.css';
import '../../components/css/SharedUI.css';
import './ReportsPage.css';
import './DashboardPage.css';

/**
 * Panel de Control (Dashboard) del administrador.
 * Toda la lógica de datos vive en hooks/useDashboard.js y services/dashboard.js
 * (más services/reports.js para la tendencia semanal y el top de productos).
 * Este archivo solo compone la UI con el tema corporativo.
 */
const DashboardPage = () => {
  const { user, isAdmin } = useAuth();
  const {
    stats, salesTrend, topProducts,
    loading, error, refetch,
  } = useDashboard();

  const quickActions = useMemo(() => buildQuickActions({ isAdmin }), [isAdmin]);

  // ─── Estado de carga ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="page-loading">
        <Loader2 size={32} className="page-loading-spinner" />
        <p>Cargando panel...</p>
      </div>
    );
  }

  // ─── Estado de error ─────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="page-error">
        <AlertTriangle size={32} />
        <p>{error}</p>
        <button type="button" className="page-retry-btn" onClick={refetch}>
          <RotateCcw size={16} /> Reintentar
        </button>
      </div>
    );
  }

  // ─── Vista principal ─────────────────────────────────────────────────────
  return (
    <div className="admin-page">

      {/* Encabezado */}
      <PageHeader
        icon={LayoutDashboard}
        title="Panel de Control"
        subtitle="Vista general del restaurante: ventas, pedidos y ocupación en tiempo real."
      />

      {/* Bienvenida */}
      <WelcomeBanner user={user} />

      {/* ── KPIs principales ── */}
      <div className="reports-summary-grid">
        <SummaryCard
          icon={DollarSign}
          label="Ventas hoy"
          rawValue={stats?.today_sales ?? 0}
          displayValue={formatCurrency(stats?.today_sales ?? 0)}
          tone="primary"
          delay={0}
        />
        <SummaryCard
          icon={ShoppingBag}
          label="Pedidos hoy"
          rawValue={stats?.today_orders ?? 0}
          tone="info"
          delay={0.06}
        />
        <SummaryCard
          icon={Flame}
          label="Pedidos activos"
          rawValue={stats?.active_orders ?? 0}
          tone="warning"
          delay={0.12}
        />
        <SummaryCard
          icon={Hourglass}
          label="Items pendientes"
          rawValue={stats?.pending_items ?? 0}
          tone="error"
          delay={0.18}
        />
      </div>

      {/* ── Tendencia de ventas + ocupación de mesas ── */}
      <div className="dashboard-grid">
        <div className="reports-chart-card">
          <div className="reports-chart-header">
            <h3 className="reports-chart-title">
              <TrendingUp size={18} strokeWidth={2} />
              Ventas de la semana
            </h3>
          </div>

          {salesTrend.length > 0 ? (
            <BarChart data={salesTrend} color="var(--color-primary)" height={220} />
          ) : (
            <EmptyStateCard
              icon={TrendingUp}
              title="Sin ventas esta semana"
              message="Aún no hay datos de ventas para mostrar la tendencia."
            />
          )}
        </div>

        <div className="reports-chart-card">
          <div className="reports-chart-header">
            <h3 className="reports-chart-title">
              <Armchair size={18} strokeWidth={2} />
              Estado de mesas
            </h3>
          </div>
          <TableStatusWidget
            free={stats?.free_tables ?? 0}
            occupied={stats?.occupied_tables ?? 0}
          />
        </div>
      </div>

      {/* ── Top productos + accesos rápidos ── */}
      <div className="dashboard-grid">
        <div className="reports-chart-card">
          <div className="reports-chart-header">
            <h3 className="reports-chart-title">
              <Trophy size={18} strokeWidth={2} />
              Productos más vendidos
            </h3>
          </div>

          {topProducts.length > 0 ? (
            <TopProductsList products={topProducts} />
          ) : (
            <EmptyStateCard
              icon={Trophy}
              title="Sin datos de productos"
              message="Aún no hay pedidos registrados para calcular el ranking."
            />
          )}
        </div>

        <div className="reports-chart-card">
          <div className="reports-chart-header">
            <h3 className="reports-chart-title">
              <LayoutGrid size={18} strokeWidth={2} />
              Accesos rápidos
            </h3>
          </div>
          <QuickActionsGrid actions={quickActions} />
        </div>
      </div>

    </div>
  );
};

export default DashboardPage;
