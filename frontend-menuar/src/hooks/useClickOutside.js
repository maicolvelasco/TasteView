import { useEffect } from 'react';

/**
 * Ejecuta `onOutsideClick` cuando se hace click fuera del elemento referenciado.
 * Se usa, por ejemplo, para cerrar un desplegable al tocar afuera.
 */
export function useClickOutside(ref, onOutsideClick) {
  useEffect(() => {
    function handlePointerDown(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        onOutsideClick(event);
      }
    }
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [ref, onOutsideClick]);
}