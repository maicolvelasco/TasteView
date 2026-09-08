import React, { useState } from 'react';
import { Check, KeyRound, User as UserIcon } from 'lucide-react';
import useUserProfile from '../../hooks/useUserProfile';

/**
 * Pestaña "Usuario" de Ajustes: cada usuario logueado (sin importar su
 * rol) puede editar su propio nombre/teléfono y cambiar su contraseña.
 * A propósito no incluye email, rol, sucursal ni PIN — esos son cambios
 * administrativos que ya cubre el panel de Usuarios (Admin+).
 */
const UserProfileForm = () => {
  const { user, savingProfile, savingPassword, saveProfile, changePassword } = useUserProfile();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState('');
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const isProfileDirty = name !== (user?.name || '') || phone !== (user?.phone || '');

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSaved(false);
    try {
      await saveProfile({ name: name.trim(), phone: phone.trim() || null });
      setProfileSaved(true);
    } catch (err) {
      setProfileError(err.message);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSaved(false);

    if (newPassword !== newPasswordConfirmation) {
      setPasswordError('La confirmación no coincide con la contraseña nueva.');
      return;
    }

    try {
      await changePassword({ currentPassword, newPassword, newPasswordConfirmation });
      setPasswordSaved(true);
      setCurrentPassword('');
      setNewPassword('');
      setNewPasswordConfirmation('');
    } catch (err) {
      setPasswordError(err.message);
    }
  };

  return (
    <div className="settings-user-forms">
      <form className="settings-subsection" onSubmit={handleProfileSubmit}>
        <h3 className="settings-subsection-title">
          <UserIcon size={16} strokeWidth={2} /> Mis datos
        </h3>

        <div className="form-field">
          <label htmlFor="profile-name">Nombre</label>
          <input
            id="profile-name"
            type="text"
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="profile-email">Correo</label>
          <input id="profile-email" type="email" className="input" value={user?.email || ''} disabled />
          <p className="settings-field-hint">
            El correo no se puede cambiar desde acá; pídeselo a un administrador.
          </p>
        </div>

        <div className="form-field">
          <label htmlFor="profile-phone">Teléfono</label>
          <input
            id="profile-phone"
            type="tel"
            className="input"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Opcional"
            maxLength={20}
          />
        </div>

        <div className="settings-form-actions">
          <button type="submit" className="form-submit-btn" disabled={!isProfileDirty || savingProfile}>
            {savingProfile ? 'Guardando...' : 'Guardar mis datos'}
          </button>
          {profileSaved && !isProfileDirty && (
            <span className="settings-saved-badge">
              <Check size={14} strokeWidth={2.5} /> Guardado
            </span>
          )}
        </div>

        {profileError && <p className="settings-field-error">{profileError}</p>}
      </form>

      <form className="settings-subsection" onSubmit={handlePasswordSubmit}>
        <h3 className="settings-subsection-title">
          <KeyRound size={16} strokeWidth={2} /> Cambiar contraseña
        </h3>

        <div className="form-field">
          <label htmlFor="current-password">Contraseña actual</label>
          <input
            id="current-password"
            type="password"
            className="input"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="new-password">Contraseña nueva</label>
          <input
            id="new-password"
            type="password"
            className="input"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
          />
          <p className="settings-field-hint">Mínimo 8 caracteres.</p>
        </div>

        <div className="form-field">
          <label htmlFor="new-password-confirmation">Confirmar contraseña nueva</label>
          <input
            id="new-password-confirmation"
            type="password"
            className="input"
            value={newPasswordConfirmation}
            onChange={(e) => setNewPasswordConfirmation(e.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
          />
        </div>

        <div className="settings-form-actions">
          <button type="submit" className="form-submit-btn" disabled={savingPassword}>
            {savingPassword ? 'Guardando...' : 'Cambiar contraseña'}
          </button>
          {passwordSaved && (
            <span className="settings-saved-badge">
              <Check size={14} strokeWidth={2.5} /> Contraseña actualizada
            </span>
          )}
        </div>

        {passwordError && <p className="settings-field-error">{passwordError}</p>}
      </form>
    </div>
  );
};

export default UserProfileForm;
