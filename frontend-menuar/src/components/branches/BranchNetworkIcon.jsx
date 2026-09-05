import React from 'react';

/**
 * Ilustración SVG propia para la vista de Sucursales: un local central
 * y dos locales satélite conectados, con un pulso animado que sale del
 * local principal — sugiere una red de sucursales "en vivo".
 *
 * Se dibuja con `currentColor`, así que hereda el color de texto del
 * elemento contenedor (normalmente `var(--color-primary)`), igual que
 * cualquier ícono de lucide-react, para no romper el sistema de temas.
 *
 * Acepta `size` como los íconos de lucide-react para ser intercambiable
 * con ellos (por ejemplo dentro de EmptyStateCard).
 */
const BranchNetworkIcon = ({ size = 32, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`branch-network-icon ${className}`}
    role="img"
    aria-label="Red de sucursales"
  >
    {/* Líneas de conexión entre el local central y los satélites */}
    <path
      d="M32 30 L14 46"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeDasharray="1 5"
      opacity="0.5"
    />
    <path
      d="M32 30 L50 46"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeDasharray="1 5"
      opacity="0.5"
    />

    {/* Pulso animado emanando del local principal */}
    <circle
      className="branch-network-icon-pulse"
      cx="32"
      cy="20"
      r="6"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />

    {/* Local principal (más grande, arriba) */}
    <g transform="translate(32, 20)">
      <path
        d="M-9 -2 L-7 -9 L7 -9 L9 -2 Z"
        fill="currentColor"
        opacity="0.18"
      />
      <rect x="-9" y="-2" width="18" height="12" rx="1.5" fill="currentColor" opacity="0.9" />
      <rect x="-3" y="3" width="6" height="7" fill="var(--color-surface, #fff)" />
    </g>

    {/* Locales satélite (izquierda y derecha, más pequeños) */}
    <g transform="translate(14, 46)">
      <rect x="-7" y="-2" width="14" height="10" rx="1.5" fill="currentColor" opacity="0.55" />
      <rect x="-2.5" y="2" width="5" height="6" fill="var(--color-surface, #fff)" />
    </g>
    <g transform="translate(50, 46)">
      <rect x="-7" y="-2" width="14" height="10" rx="1.5" fill="currentColor" opacity="0.55" />
      <rect x="-2.5" y="2" width="5" height="6" fill="var(--color-surface, #fff)" />
    </g>
  </svg>
);

export default BranchNetworkIcon;
