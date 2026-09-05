import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNavItems } from '../hooks/useNavItems';
import { useDisclosure } from '../hooks/useDisclosure';
import MobileHeader from './layout/MobileHeader';
import MobileDrawer from './layout/MobileDrawer';
import TopBar from './layout/TopBar';
import './css/DashboardLayout.css';

// Layout general del panel. Compone las piezas de navegación (todas en
// components/layout/) según el rol del usuario (hooks/useNavItems) y el
// tamaño de pantalla (CSS puro, ver DashboardLayout.css) — este archivo
// no dibuja nada del menú en sí, solo orquesta.
const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const navItems = useNavItems();
  const drawer = useDisclosure(false);

  const handleNavigate = (path) => {
    navigate(path);
    drawer.close();
  };

  // Red de seguridad: si la ruta cambia por otra vía (atrás/adelante del
  // navegador), el cajón se cierra igual.
  useEffect(() => {
    drawer.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <div className="dash-shell">
      <MobileHeader user={user} onOpenDrawer={drawer.open} />

      <MobileDrawer
        isOpen={drawer.isOpen}
        onClose={drawer.close}
        navItems={navItems}
        pathname={location.pathname}
        onNavigate={handleNavigate}
        user={user}
        onLogout={logout}
      />

      <TopBar
        navItems={navItems}
        pathname={location.pathname}
        onNavigate={handleNavigate}
        user={user}
        onLogout={logout}
      />

      <main className="dash-content">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;