import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  Loader2,
  PlusCircle,
  RotateCcw,
  Utensils,
} from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import SearchInput from '../../components/ui/SearchInput';
import TabSwitcher from '../../components/ui/TabSwitcher';
import FormModal from '../../components/ui/FormModal';
import EmptyStateCard from '../../components/ui/EmptyStateCard';
import StatCard from '../../components/ui/StatCard';
import ReservationCard from '../../components/reservations/ReservationCard';
import ReservationForm from '../../components/reservations/ReservationForm';
import useReservations from '../../hooks/useReservations';
import { RESERVATION_STATUS_FILTERS, isReservationToday } from '../../utils/reservations';
import './ReservationsPage.css';

// Vista de administración de Reservas: crear, confirmar, sentar o cancelar.
// Toda la lógica de datos vive en hooks/useReservations.js (y en
// hooks/useAvailableTables.js para el formulario) — este archivo solo
// compone la UI con el tema corporativo de src/index.css.
const ReservationsPage = () => {
  const { reservations, loading, error, refetch, createReservation, updateStatus } = useReservations();

  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const stats = useMemo(() => {
    const todays = reservations.filter((r) => isReservationToday(r.reservation_date));
    return {
      todayTotal: todays.length,
      pending: reservations.filter((r) => r.status === 'pending').length,
      confirmed: reservations.filter((r) => r.status === 'confirmed').length,
      seatedToday: todays.filter((r) => r.status === 'seated').length,
    };
  }, [reservations]);

  const filteredReservations = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return reservations
      .filter((r) => statusFilter === 'all' || r.status === statusFilter)
      .filter((r) => !term || r.customer_name.toLowerCase().includes(term));
  }, [reservations, searchTerm, statusFilter]);

  const handleCreate = async (form) => {
    await createReservation(form);
    setShowForm(false);
  };

  const hasActiveFilter = Boolean(searchTerm) || statusFilter !== 'all';

  if (loading) {
    return (
      <div className="page-loading">
        <Loader2 size={32} className="page-loading-spinner" />
        <p>Cargando reservas...</p>
      </div>
    );
  }

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

  return (
    <div className="admin-page">
      <PageHeader
        icon={CalendarCheck}
        title="Reservas"
        subtitle="Gestiona las reservas de mesas: confirma, sienta o cancela según avanza el servicio."
      />

      <div className="stat-card-grid">
        <StatCard icon={CalendarCheck} tone="primary" label="Reservas hoy" value={stats.todayTotal} delay={0} />
        <StatCard icon={Clock3} tone="warning" label="Pendientes" value={stats.pending} delay={0.05} />
        <StatCard icon={CheckCircle2} tone="info" label="Confirmadas" value={stats.confirmed} delay={0.1} />
        <StatCard icon={Utensils} tone="success" label="Sentados hoy" value={stats.seatedToday} delay={0.15} />
      </div>

      <div className="admin-toolbar">
        <div className="admin-toolbar-search">
          <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Buscar por cliente..." />
        </div>
        <button type="button" className="admin-new-btn" onClick={() => setShowForm(true)}>
          <PlusCircle size={16} /> Nueva Reserva
        </button>
      </div>

      <TabSwitcher
        tabs={RESERVATION_STATUS_FILTERS}
        active={statusFilter}
        onChange={setStatusFilter}
        layoutId="reservations-status-pill"
      />

      {showForm && (
        <FormModal title="Nueva Reserva" icon={CalendarCheck} onClose={() => setShowForm(false)} maxWidth={640}>
          <ReservationForm onSave={handleCreate} />
        </FormModal>
      )}

      <div className="reservation-list">
        {filteredReservations.map((r, idx) => (
          <ReservationCard
            key={r.id}
            reservation={r}
            delay={Math.min(idx * 0.04, 0.3)}
            onConfirm={() => updateStatus(r.id, 'confirmed')}
            onSeat={() => updateStatus(r.id, 'seated')}
            onCancel={() => updateStatus(r.id, 'cancelled')}
          />
        ))}
      </div>

      {filteredReservations.length === 0 && (
        <EmptyStateCard
          icon={CalendarCheck}
          title={hasActiveFilter ? 'Sin resultados' : 'No hay reservas registradas'}
          message={
            hasActiveFilter
              ? 'No hay reservas que coincidan con tu búsqueda o filtro.'
              : 'Crea la primera reserva para empezar a organizar las mesas.'
          }
        />
      )}
    </div>
  );
};

export default ReservationsPage;