import React from 'react';
import { motion } from 'framer-motion';

// Avatar con iniciales + nombre + rol. Se reutiliza en la barra superior (PC)
// y en el pie del cajón lateral (móvil/tablet). `compact` oculta el texto
// para cuando solo hay lugar para el avatar (header móvil).
const UserBadge = ({ user, align = 'left', size = 36, compact = false }) => {
  const initials = user?.name?.charAt(0)?.toUpperCase() || '?';

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: compact ? 0 : 10,
      flexDirection: align === 'right' ? 'row-reverse' : 'row',
    }}>
      <motion.div
        whileHover={{ scale: 1.06 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        style={{
          width: size, height: size, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-hover))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, color: 'var(--color-text-on-primary)', fontSize: size * 0.4,
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        {initials}
      </motion.div>
      {!compact && (
        <div style={{ textAlign: align === 'right' ? 'right' : 'left', overflow: 'hidden' }}>
          <p style={{
            color: 'var(--color-text)', fontSize: 13, fontWeight: 600, lineHeight: 1.3,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 160,
          }}>
            {user?.name}
          </p>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 11 }}>{user?.role?.name}</p>
        </div>
      )}
    </div>
  );
};

export default UserBadge;