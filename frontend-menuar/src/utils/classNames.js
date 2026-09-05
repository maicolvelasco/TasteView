// Combina clases CSS condicionalmente (equivalente casero a "clsx"),
// sin sumar otra dependencia solo para esto.
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}