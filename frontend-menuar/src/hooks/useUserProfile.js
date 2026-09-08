import { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

/**
 * Perfil propio (pestaña "Usuario" de Ajustes): permite a CUALQUIER
 * usuario logueado editar su nombre/teléfono y cambiar su contraseña.
 * A propósito no toca email, rol, sucursal ni PIN — esos son cambios
 * administrativos que ya cubre el panel de Usuarios (Admin+).
 */
export default function useUserProfile() {
  const { user, updateUser } = useAuth();
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const saveProfile = async ({ name, phone }) => {
    setSavingProfile(true);
    try {
      const res = await api.put('/me', { name, phone });
      updateUser(res.data.data);
      return res.data.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Error al guardar tus datos.');
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async ({ currentPassword, newPassword, newPasswordConfirmation }) => {
    setSavingPassword(true);
    try {
      await api.put('/me/password', {
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: newPasswordConfirmation,
      });
    } catch (err) {
      const errors = err.response?.data?.errors;
      const firstError = errors ? Object.values(errors)[0]?.[0] : null;
      throw new Error(firstError || err.response?.data?.message || 'Error al cambiar la contraseña.');
    } finally {
      setSavingPassword(false);
    }
  };

  return { user, savingProfile, savingPassword, saveProfile, changePassword };
}
