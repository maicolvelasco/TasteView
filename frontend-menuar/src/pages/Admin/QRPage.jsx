import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const QRPage = () => {
  const [tables, setTables] = useState([]);
  const [branchCode, setBranchCode] = useState('SUC-001');

  useEffect(() => {
    // Mock tables - en producción vendrían de API
    setTables([
      { id: 1, number: '01', name: 'Terraza 1', qr_code: 'TABLE-ABC123-01' },
      { id: 2, number: '02', name: 'Terraza 2', qr_code: 'TABLE-ABC123-02' },
      { id: 3, number: '03', name: 'Salón 1', qr_code: 'TABLE-ABC123-03' },
      { id: 4, number: '04', name: 'Salón 2', qr_code: 'TABLE-ABC123-04' },
      { id: 5, number: '05', name: 'VIP A', qr_code: 'TABLE-ABC123-05' },
    ]);
  }, []);

  const generateQRUrl = (table) => {
    // URL del menú con parámetro de mesa
    const baseUrl = window.location.origin;
    return `${baseUrl}/menu/${branchCode}?table=${table.number}`;
  };

  const downloadQR = (table) => {
    const url = generateQRUrl(table);
    // Usar API de QR de Google (gratuita)
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`;
    const link = document.createElement('a');
    link.href = qrApiUrl;
    link.download = `QR-Mesa-${table.number}.png`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printQR = (table) => {
    const url = generateQRUrl(table);
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(url)}`;
    const printWindow = window.open('', '_blank', 'width=500,height=600');
    printWindow.document.write(`
      <html>
        <head><title>QR Mesa ${table.number}</title></head>
        <body style="text-align:center; padding:40px; font-family:sans-serif;">
          <h2 style="margin-bottom:10px;">${table.name}</h2>
          <h1 style="font-size:48px; margin:10px 0;">Mesa ${table.number}</h1>
          <img src="${qrApiUrl}" style="width:300px; height:300px; margin:20px 0;" />
          <p style="color:#666; font-size:14px;">Escanea para ver el menú digital</p>
          <p style="color:#999; font-size:12px; word-break:break-all;">${url}</p>
          <script>window.onload = () => setTimeout(() => window.print(), 500);</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div>
      <h1 style={{ color: '#e2e8f0', marginBottom: 24, fontSize: 28 }}>📱 Códigos QR por Mesa</h1>
      <p style={{ color: '#94a3b8', marginBottom: 24 }}>
        Genera e imprime códigos QR para cada mesa. Los clientes escanean y acceden directamente al menú digital.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
        {tables.map(table => {
          const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(generateQRUrl(table))}`;
          return (
            <div key={table.id} className="card" style={{ textAlign: 'center' }}>
              <h3 style={{ color: '#e2e8f0', marginBottom: 4 }}>{table.name}</h3>
              <p style={{ color: '#38bdf8', fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Mesa {table.number}</p>
              <img src={qrUrl} alt={`QR Mesa ${table.number}`} style={{ width: 180, height: 180, borderRadius: 12, marginBottom: 12 }} />
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                <button onClick={() => downloadQR(table)} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: 12 }}>⬇️ Descargar</button>
                <button onClick={() => printQR(table)} className="btn btn-success" style={{ padding: '8px 16px', fontSize: 12 }}>🖨️ Imprimir</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QRPage;
