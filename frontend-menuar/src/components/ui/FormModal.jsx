import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

/**
 * Modal genérico con el tema corporativo (fondo claro, sombras suaves,
 * animación de entrada/salida). Usado por las pantallas de administración
 * del menú (Gestionar Menú, Categorías, Modificadores) para que crear/editar
 * se vea siempre igual, en vez de formularios sueltos empujando la página.
 */
const FormModal = ({ title, icon: Icon, onClose, children, maxWidth = 560 }) => {
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        className="form-modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="form-modal"
          style={{ maxWidth }}
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.97 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="form-modal-header">
            <h3 className="form-modal-title">
              {Icon && <Icon size={18} strokeWidth={2} />}
              {title}
            </h3>
            <button type="button" className="form-modal-close" onClick={onClose} aria-label="Cerrar">
              <X size={18} />
            </button>
          </div>
          <div className="form-modal-body">{children}</div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FormModal;
