import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { buildNavItems } from '../utils/navigation';

/**
 * Conecta el contexto de autenticación con la lógica pura de armado de menú.
 * Memoizado para no reconstruir el árbol de navegación en cada render del layout.
 */
export function useNavItems() {
  const { isAdmin, isManager, isCashier, isChef, isWaiter } = useAuth();

  return useMemo(
    () => buildNavItems({ isAdmin, isManager, isCashier, isChef, isWaiter }),
    [isAdmin, isManager, isCashier, isChef, isWaiter]
  );
}