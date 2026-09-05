import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Users, Armchair, StickyNote, Phone, CheckCircle2, Utensils, XCircle } from 'lucide-react';
import Badge from '../ui/Badge';
import {
  RESERVATION_STATUS_THEME,
  RESERVATION_STATUS_LABELS,
  formatReservationDate,
  formatReservationTime,
  isReservationToday,
} from '../../utils/reservations';

/** Tarjeta de una reserva, con acciones según su estado actual. */
const ReservationCard = ({ reservation, onConfirm, onSeat, onCancel, delay = 0 }) => {
  const today = isReservationToday(reservation.reservation_date);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay, ease: 'easeOut' }}
      whileHover={{ y: -2 }}
      className="reservation-card"
    >
      <div className="reservation-card-main">
        <div className="reservation-card-header">
          <h3 className="reservation-card-name">{reservation.customer_name}</h3>
          <Badge tone={RESERVATION_STATUS_THEME[reservation.status] || 'info'}>
            {RESERVATION_STATUS_LABELS[reservation.status] || reservation.status}
          </Badge>
          {today && <span className="reservation-today-tag">Hoy</span>}
        </div>

        <div className="reservation-card-meta">
          <span className="reservation-meta-item">
            <Calendar size={13} /> {formatReservationDate(reservation.reservation_date)}
          </span>
          <span className="reservation-meta-item">
            <Clock size={13} /> {formatReservationTime(reservation.reservation_time)}
          </span>
          <span className="reservation-meta-item">
            <Users size={13} /> {reservation.guests_count} pers.
          </span>
          {reservation.table && (
            <span className="reservation-meta-item">
              <Armchair size={13} /> Mesa {reservation.table.number}
            </span>
          )}
          {reservation.customer_phone && (
            <span className="reservation-meta-item">
              <Phone size={13} /> {reservation.customer_phone}
            </span>
          )}
        </div>

        {reservation.notes && (
          <p className="reservation-card-notes">
            <StickyNote size={12} /> {reservation.notes}
          </p>
        )}
      </div>

      <div className="admin-card-actions reservation-card-actions">
        {reservation.status === 'pending' && (
          <button type="button" className="admin-action-btn admin-action-btn--on" onClick={onConfirm}>
            <CheckCircle2 size={13} /> Confirmar
          </button>
        )}
        {reservation.status === 'confirmed' && (
          <button type="button" className="admin-action-btn admin-action-btn--on" onClick={onSeat}>
            <Utensils size={13} /> Sentar
          </button>
        )}
        {(reservation.status === 'pending' || reservation.status === 'confirmed') && (
          <button type="button" className="admin-action-btn admin-action-btn--delete" onClick={onCancel}>
            <XCircle size={13} /> Cancelar
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default ReservationCard;
