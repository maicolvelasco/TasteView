import React from 'react';
import { Building2 } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import BusinessSettingsForm from '../../components/settings/BusinessSettingsForm';
import ThemeSettingsForm from '../../components/settings/ThemeSettingsForm';
import '../../components/css/AdminCatalog.css';
import '../../components/css/SharedUI.css';
import './SettingsPage.css';

/**
 * Ajustes > Negocio: reemplaza el branding genérico del proyecto
 * ("🍽️ Restaurant AR") por el logo, nombre y colores reales del
 * negocio. Se aplica de inmediato en el panel, el favicon, los colores
 * de toda la app y el menú público (ver BusinessSettingsForm,
 * ThemeSettingsForm y CompanyController en el backend).
 * Solo Admin/Super Admin llegan a ver este ítem en el menú.
 */
const SettingsBusinessPage = () => (
  <div className="admin-page settings-page">
    <PageHeader icon={Building2} title="Negocio" subtitle="El logo, nombre y colores de tu negocio, en todo el sistema." />
    <div className="settings-tab-content">
      <div className="settings-section-card">
        <h2 className="settings-section-title">Logo y nombre</h2>
        <BusinessSettingsForm />
      </div>

      <div className="settings-section-card">
        <h2 className="settings-section-title">Colores del sistema</h2>
        <p className="settings-section-desc">
          Elige un solo color o combina dos (bicolor) — se aplican al instante en
          encabezados, botones principales, el menú público y el resto del panel.
        </p>
        <ThemeSettingsForm />
      </div>
    </div>
  </div>
);

export default SettingsBusinessPage;
