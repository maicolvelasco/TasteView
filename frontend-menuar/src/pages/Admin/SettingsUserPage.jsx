import React from 'react';
import { User as UserIcon } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import UserProfileForm from '../../components/settings/UserProfileForm';
import '../../components/css/AdminCatalog.css';
import '../../components/css/SharedUI.css';
import './SettingsPage.css';

/**
 * Ajustes > Usuario: perfil propio (nombre, teléfono, contraseña).
 * Disponible para cualquiera que llegue a esta ruta (hoy, Manager+; ver
 * el submenú "Ajustes" en utils/navigation.js) — es su propia cuenta.
 */
const SettingsUserPage = () => (
  <div className="admin-page settings-page">
    <PageHeader icon={UserIcon} title="Mi Usuario" subtitle="Tus datos personales y tu contraseña." />
    <div className="settings-tab-content">
      <UserProfileForm />
    </div>
  </div>
);

export default SettingsUserPage;
