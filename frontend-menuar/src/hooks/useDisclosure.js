import { useCallback, useState } from 'react';

/**
 * Maneja un estado abierto/cerrado (cajones, desplegables, modales).
 * Genérico a propósito: lo usa el menú de navegación, pero sirve para
 * cualquier otra parte de la app que necesite un patrón "abrir/cerrar".
 */
export function useDisclosure(initialValue = false) {
  const [isOpen, setIsOpen] = useState(initialValue);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return { isOpen, open, close, toggle };
}