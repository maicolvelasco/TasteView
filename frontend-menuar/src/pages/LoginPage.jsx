import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, KeyRound, Loader2, LogIn, Mail, UtensilsCrossed } from 'lucide-react';
import TabSwitcher from '../components/ui/TabSwitcher';
import LoginBrandPanel from '../components/auth/LoginBrandPanel';
import PasswordField from '../components/auth/PasswordField';
import useLoginForm from '../hooks/useLoginForm';
import '../components/css/AdminCatalog.css';
import '../components/css/SharedUI.css';
import './LoginPage.css';

const MODE_TABS = [
  { key: 'email', label: 'Email', icon: Mail },
  { key: 'pin', label: 'PIN Rápido', icon: KeyRound },
];

/**
 * Pantalla de Login. Toda la lógica de formulario/redirección vive en
 * hooks/useLoginForm.js (y utils/auth.js); la autenticación real ya vivía
 * en context/AuthContext.jsx. Este archivo solo compone la UI con el tema
 * corporativo (mismas variables --color-* que el resto de la app, listas
 * para el futuro selector de colores del administrador).
 */
const LoginPage = () => {
  const { mode, changeMode, form, setField, setPin, error, loading, handleSubmit } = useLoginForm();

  return (
    <div className="login-page">
      <motion.div
        className="login-panel"
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        <LoginBrandPanel />

        <div className="login-form-panel">
          {/* Marca compacta, solo visible en móvil (el panel de marca se oculta) */}
          <div className="login-form-mobile-brand">
            <span className="login-form-mobile-icon">
              <UtensilsCrossed size={22} strokeWidth={2} />
            </span>
            <span className="login-form-mobile-name">Restaurant AR</span>
          </div>

          <h2 className="login-form-title">Bienvenido de nuevo</h2>
          <p className="login-form-subtitle">Ingresa tus credenciales para continuar.</p>

          <div className="login-mode-tabs">
            <TabSwitcher
              tabs={MODE_TABS}
              active={mode}
              onChange={changeMode}
              layoutId="login-mode-pill"
            />
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                className="login-error-banner"
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.2 }}
              >
                <AlertCircle size={16} strokeWidth={2} />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="login-form">
            {mode === 'email' ? (
              <motion.div
                key="email-fields"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="login-field-group"
              >
                <div className="form-field">
                  <label htmlFor="login-email">Correo electrónico</label>
                  <input
                    id="login-email"
                    type="email"
                    className="input"
                    placeholder="tucorreo@restaurant.com"
                    value={form.email}
                    onChange={(e) => setField('email', e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="login-password">Contraseña</label>
                  <PasswordField
                    id="login-password"
                    value={form.password}
                    onChange={(v) => setField('password', v)}
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="pin-field"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="login-field-group"
              >
                <div className="form-field form-field--center">
                  <label htmlFor="login-pin">PIN de acceso</label>
                  <input
                    id="login-pin"
                    type="password"
                    inputMode="numeric"
                    className="input login-pin-input"
                    placeholder="••••••"
                    value={form.pin_code}
                    onChange={(e) => setPin(e.target.value)}
                    maxLength={6}
                    required
                  />
                </div>
              </motion.div>
            )}

            <button type="submit" className="login-submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={17} className="spin-icon" /> Ingresando...
                </>
              ) : (
                <>
                  <LogIn size={17} strokeWidth={2} /> Ingresar
                </>
              )}
            </button>
          </form>

          <p className="login-footer-link">
            ¿Eres cliente? <a href="/menu/SU1">Ver menú digital</a>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
