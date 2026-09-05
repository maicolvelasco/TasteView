// Arma el HTML del ticket imprimible y abre la ventana de impresión térmica.
// Vive aparte del componente para poder testearlo sin renderizar React y para
// que CashierPage/useCashier no mezclen lógica de negocio con marcado HTML.

export function buildTicketHtml(ticket) {
  const itemsHtml = ticket.items
    .map(
      (item) => `
        <p>${item.quantity}x ${item.product}</p>
        ${item.modifiers.length ? `<p style="margin-left:10px">${item.modifiers.join(', ')}</p>` : ''}
        <p style="text-align:right">$${item.subtotal.toFixed(2)}</p>
      `
    )
    .join('');

  return `
    <html>
      <head><title>Ticket ${ticket.invoice_number}</title></head>
      <body style="font-family: monospace; font-size: 12px; padding: 10px; width: 280px;">
        <center><b>${ticket.header}</b></center>
        <center>${ticket.date}</center>
        <hr>
        <p><b>Factura:</b> ${ticket.invoice_number}</p>
        <p><b>Cliente:</b> ${ticket.customer}</p>
        <p><b>NIT:</b> ${ticket.nit}</p>
        <p><b>Cajero:</b> ${ticket.cashier}</p>
        <hr>
        ${itemsHtml}
        <hr>
        <p>Subtotal: $${ticket.subtotal.toFixed(2)}</p>
        ${ticket.has_tax ? `<p>IVA: $${ticket.tax.toFixed(2)}</p>` : '<p>SIN IVA (CF)</p>'}
        <p><b>TOTAL: $${ticket.total.toFixed(2)}</b></p>
        <hr>
        <center><i>${ticket.footer}</i></center>
      </body>
    </html>
  `;
}

/** Abre una ventana angosta (formato ticketera) y dispara la impresión. */
export function openTicketWindow(ticket) {
  const ticketWindow = window.open('', '_blank', 'width=320,height=600');
  if (!ticketWindow) return false;
  ticketWindow.document.write(buildTicketHtml(ticket));
  ticketWindow.document.close();
  ticketWindow.print();
  return true;
}
