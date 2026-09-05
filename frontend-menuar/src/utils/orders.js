// Lógica pura compartida sobre pedidos (utilizada por Caja y Mesero).

// Traduce cada estado de pedido a un "tono" semántico de la paleta de la app
// (ver variables --color-warning/--color-info/--color-primary/--color-success
// /--color-error en index.css), para que las badges usen siempre los mismos
// colores corporativos en vez de valores sueltos.
export const ORDER_STATUS_THEME = {
  pending: 'warning',
  confirmed: 'info',
  in_preparation: 'primary',
  ready: 'success',
  served: 'success',
  cancelled: 'error',
};
