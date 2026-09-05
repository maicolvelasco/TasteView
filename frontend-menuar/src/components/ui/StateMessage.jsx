import React from 'react';
import Card from './Card';
import Button from './Button';

/** Texto centrado simple, para pantallas de carga ("Cargando..."). */
export const Loading = ({ text = 'Cargando...' }) => (
  <p className="text-slate-400 text-center py-12">{text}</p>
);

/** Mensaje de error con botón de reintentar, usado tras un fetch fallido. */
export const ErrorState = ({ title, message, onRetry }) => (
  <div>
    {title && <h1 className="text-slate-200 text-2xl mb-6">{title}</h1>}
    <Card className="text-center py-10">
      <p className="text-red-500 mb-4">{message}</p>
      {onRetry && (
        <Button variant="primary" onClick={onRetry}>
          Reintentar
        </Button>
      )}
    </Card>
  </div>
);

/** Aviso de "no hay resultados", para listas/grillas filtradas vacías. */
export const EmptyState = ({ message, className = '' }) => (
  <p className={`text-slate-500 text-center py-8 ${className}`}>{message}</p>
);
