import React from 'react';
import { Search, X } from 'lucide-react';

/**
 * Buscador genérico reutilizable (toma de pedidos y catálogos de Admin).
 * Con listas de 50+ ítems, escribir es más rápido que navegar filtro por
 * filtro — quien lo use decide si al buscar ignora otros filtros activos.
 */
const SearchInput = ({ value, onChange, placeholder = 'Buscar...' }) => (
  <div className="search-input">
    <Search size={17} className="search-input-icon" />
    <input
      type="text"
      className="search-input-field"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
    {value && (
      <button
        type="button"
        className="search-input-clear"
        onClick={() => onChange('')}
        aria-label="Limpiar búsqueda"
      >
        <X size={15} />
      </button>
    )}
  </div>
);

export default SearchInput;
