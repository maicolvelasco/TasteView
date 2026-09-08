import React from 'react';

/**
 * Marca de la aplicación (logo + nombre) que se muestra en la topbar, el
 * header mobile y el drawer. Si el negocio configuró su propio logo/nombre
 * en Ajustes > Negocio, se usa eso — el logo SIEMPRE se redimensiona para
 * encajar en la misma caja cuadrada (object-fit: contain, ver
 * .dash-brand-logo en DashboardLayout.css), sin importar si la imagen
 * original es cuadrada, apaisada o vertical. Si todavía no hay nada
 * configurado, se muestra el branding por defecto del proyecto.
 */
const BrandLogo = ({ company, size = 26 }) => {
  const name = company?.name?.trim() || 'Restaurant AR';
  const logoUrl = company?.logo_url;

  return (
    <span className="dash-brand">
      {logoUrl ? (
        <img
          src={logoUrl}
          alt={name}
          className="dash-brand-logo"
          style={{ height: size, width: size }}
        />
      ) : (
        <span className="dash-brand-emoji" style={{ fontSize: size * 0.85 }} aria-hidden="true">
          🍽️
        </span>
      )}
      <span className="dash-brand-name">{name}</span>
    </span>
  );
};

export default BrandLogo;
