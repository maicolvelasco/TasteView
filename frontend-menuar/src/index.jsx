import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import App from './App';
import './index.css';
import './components/css/SharedUI.css';
import './components/css/AdminCatalog.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

// Registrar el Service Worker SOLO en producción.
// En desarrollo (npm start) el SW cachea bundle.js "para siempre" y hace que el
// navegador siga ejecutando código viejo aunque el archivo ya haya cambiado,
// lo que provoca errores fantasma (ej. 403 en pantallas que ya no llaman a ese endpoint).
if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => console.log('SW registered:', registration))
      .catch(error => console.log('SW registration failed:', error));
  });
} else if ('serviceWorker' in navigator) {
  // En desarrollo, asegurarnos de desregistrar cualquier SW viejo que haya quedado activo
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(r => r.unregister());
  });
}