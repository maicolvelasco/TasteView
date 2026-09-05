import React from 'react';
import {
  AlertTriangle,
  BarChart2,
  DollarSign,
  TrendingUp,
  CalendarDays,
  ReceiptText,
  ShoppingBag,
  Loader2,
  RotateCcw,
  Trophy,
} from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import EmptyStateCard from '../../components/ui/EmptyStateCard';
import SummaryCard from '../../components/Reports/SummaryCard';
import BarChart from '../../components/Reports/BarChart';
import TopProductsList from '../../components/Reports/TopProductsList';
import PeriodSelector from '../../components/Reports/PeriodSelector';
import useReports from '../../hooks/useReports';
import { formatCurrency } from '../../utils/roles';
import '../../components/css/AdminCatalog.css';
import '../../components/css/SharedUI.css';
import './ReportsPage.css';

/**
 * Vista de Reportes y Análisis.
 * Toda la lógica de datos vive en hooks/useReports.js y services/reports.js.
 * Este archivo solo compone la UI con el tema corporativo.
 */
const ReportsPage = () => {
  const {
    period, setPeriod,
    salesData, topProducts, summary,
    loading, error, refetch,
  } = useReports();

  // ─── Estado de carga ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="page-loading">
        <Loader2 size={32} className="page-loading-spinner" />
        <p>Cargando reportes...</p>
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
        icon={BarChart2}
        title="Reportes y Análisis"
        subtitle="Visualiza el rendimiento del negocio: ventas, productos y tendencias."
      />

      {/* ── Grid de métricas de resumen ── */}
      {summary && (
        <div className="reports-summary-grid">
          <SummaryCard
            icon={DollarSign}
            label="Ventas hoy"
            rawValue={summary.today_sales ?? 0}
            displayValue={formatCurrency(summary.today_sales ?? 0)}
            tone="primary"
            delay={0}
          />
          <SummaryCard
            icon={TrendingUp}
            label="Ventas semana"
            rawValue={summary.week_sales ?? 0}
            displayValue={formatCurrency(summary.week_sales ?? 0)}
            tone="info"
            delay={0.06}
          />
          <SummaryCard
            icon={CalendarDays}
            label="Ventas mes"
            rawValue={summary.month_sales ?? 0}
            displayValue={formatCurrency(summary.month_sales ?? 0)}
            tone="success"
            delay={0.12}
          />
          <SummaryCard
            icon={ReceiptText}
            label="Ticket promedio"
            rawValue={summary.avg_ticket ?? 0}
            displayValue={formatCurrency(summary.avg_ticket ?? 0)}
            tone="warning"
            delay={0.18}
          />
          <SummaryCard
            icon={ShoppingBag}
            label="Pedidos hoy"
            rawValue={summary.today_orders ?? 0}
            tone="error"
            delay={0.24}
          />
        </div>
      )}

      {/* ── Grid de gráficos ── */}
      <div className="reports-charts-grid">

        {/* Gráfico de ventas por período */}
        <div className="reports-chart-card">
          <div className="reports-chart-header">
            <h3 className="reports-chart-title">
              <TrendingUp size={18} strokeWidth={2} />
              Ventas por período
            </h3>
            <PeriodSelector value={period} onChange={setPeriod} />
          </div>

          {salesData.length > 0 ? (
            <BarChart
              data={salesData}
              color="var(--color-primary)"
              height={220}
            />
          ) : (
            <EmptyStateCard
              icon={TrendingUp}
              title="Sin ventas en este período"
              message="No hay datos de ventas para el rango seleccionado."
            />
          )}
        </div>

        {/* Top productos */}
        <div className="reports-chart-card">
          <div className="reports-chart-header">
            <h3 className="reports-chart-title">
              <Trophy size={18} strokeWidth={2} />
              Productos más vendidos
            </h3>
          </div>

          {topProducts.length > 0 ? (
            <>
              <BarChart
                data={topProducts}
                color="var(--color-warning)"
                height={160}
                valueKey="total_sold"
              />
              <TopProductsList products={topProducts.slice(0, 8)} />
            </>
          ) : (
            <EmptyStateCard
              icon={Trophy}
              title="Sin datos de productos"
              message="Aún no hay pedidos registrados para calcular el ranking."
            />
          )}
        </div>

      </div>
    </div>
  );
};

export default ReportsPage;