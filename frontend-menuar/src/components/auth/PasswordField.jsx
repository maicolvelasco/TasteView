import React, { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';

/**
 * Campo de contraseña con botón para mostrar/ocultar el valor. Envuelve el
 * `.input` genérico de index.css para verse consistente con el resto de
 * formularios de la app.
 */
const PasswordField = ({ id, value, onChange, placeholder = 'Contraseña', autoComplete = 'current-password' }) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className="password-field">
      <Lock size={16} strokeWidth={2} className="password-field-icon" />
      <input
        id={id}
        type={visible ? 'text' : 'password'}
        className="input password-field-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        required
      />
      <button
        type="button"
        className="password-field-toggle"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        tabIndex={-1}
      >
        {visible ? <EyeOff size={16} strokeWidth={2} /> : <Eye size={16} strokeWidth={2} />}
      </button>
    </div>
  );
};

export default PasswordField;
