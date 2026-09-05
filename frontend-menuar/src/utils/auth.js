// Lógica pura de la pantalla de Login: a qué ruta redirigir según el rol
// del usuario autenticado, y saneo del campo de PIN. Sin JSX a propósito
// para poder testear sin depender de React.

/** Ruta a la que se redirige tras un login exitoso, según el rol del usuario. */
export function getRedirectPath(user) {
  if (!user?.role) return '/';
  if (user.role.level >= 70) return '/admin/dashboard'; // admin (90+) y manager (70+)
  if (user.role.slug === 'chef') return '/kitchen';
  if (user.role.slug === 'cashier') return '/cashier';
  if (user.role.slug === 'waiter') return '/waiter';
  return '/';
}

/** Deja solo dígitos y limita la longitud (para el campo de PIN rápido). */
export function sanitizePin(value, maxLength = 6) {
  return value.replace(/\D/g, '').slice(0, maxLength);
}
