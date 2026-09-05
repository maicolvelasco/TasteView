import React, { useEffect } from 'react';
import Card from './ui/Card';

// Modal genérico usado por todas las pantallas de admin (Usuarios, Mesas,
// Categorías, Modificadores, Menú) para que crear/editar se vea siempre igual,
// en vez de formularios sueltos empujando el contenido de la página.
const Modal = ({ title, onClose, children, maxWidth = 560 }) => {
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/80 z-[600] flex items-center justify-center p-5"
      onClick={onClose}
    >
      <Card
        className="w-full max-h-[85vh] overflow-y-auto animate-fade-in"
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-slate-200">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="bg-slate-700 text-slate-200 border-none rounded-full w-8 h-8 shrink-0 cursor-pointer"
          >
            ✕
          </button>
        </div>
        {children}
      </Card>
    </div>
  );
};

export default Modal;
