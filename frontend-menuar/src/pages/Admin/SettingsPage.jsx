import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, SlidersHorizontal, Store, User as UserIcon } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import TabSwitcher from '../../components/ui/TabSwitcher';
import BusinessSettingsForm from '../../components/settings/BusinessSettingsForm';
import UserProfileForm from '../../components/settings/UserProfileForm';
import { useAuth } from '../../context/AuthContext';
import '../../components/css/AdminCatalog.css';
import '../../components/css/SharedUI.css';
import './SettingsPage.css';

/**
 * Ajustes: punto único para todo lo que antes no tenía un lugar fijo en
 * el panel — el perfil propio, un acceso directo a Sucursales, y el
 * branding del negocio (nombre + logo).
 *
 * "Sucursales" ya es una página completa con su propio header, stats y
 * CRUD (/admin/branches) — en vez de embeberla acá adentro (lo que
 * duplicaría su título y desperdiciaría todo ese trabajo ya hecho), este
 * tab simplemente navega hacia ella; es un acceso directo, no una copia.
 *
 * "Negocio" solo aparece para Admin/Super Admin (es una decisión a nivel
 * empresa, no algo que un Mesero o Cajero deba tocar). "Usuario" está
 * disponible para cualquiera que llegue a esta página (hoy, Manager+;
 * ver la ruta /admin/settings) — después de todo, es su propio perfil.
 */
const SettingsPage = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const tabs = [
    { key: 'usuario', label: 'Usuario', icon: UserIcon },
    ...(isAdmin ? [{ key: 'sucursales', label: 'Sucursales', icon: Store }] : []),
    ...(isAdmin ? [{ key: 'negocio', label: 'Negocio', icon: Building2 }] : []),
  ];

  const [activeTab, setActiveTab] = useState('usuario');

  const handleTabChange = (key) => {
    if (key === 'sucursales') {
      navigate('/admin/branches');
      return;
    }
    setActiveTab(key);
  };

  return (
    <div className="admin-page settings-page">
      <PageHeader
        icon={SlidersHorizontal}
        title="Ajustes"
        subtitle="Tu perfil y el branding de tu negocio, todo en un solo lugar."
      />

      <TabSwitcher tabs={tabs} active={activeTab} onChange={handleTabChange} layoutId="settings-tab-pill" />

      <div className="settings-tab-content">
        {activeTab === 'usuario' && <UserProfileForm />}

        {activeTab === 'negocio' && isAdmin && (
          <div className="settings-section-card">
            <h2 className="settings-section-title">Branding del negocio</h2>
            <p className="settings-section-desc">
              Reemplaza el logo y nombre genéricos ("🍽️ Restaurant AR") por los de tu
              negocio. Se aplica de inmediato en el panel de administración, el ícono de
              la pestaña del navegador y el menú público que ven tus clientes.
            </p>
            <BusinessSettingsForm />
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
