import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRedirectPath, sanitizePin } from '../utils/auth';

const INITIAL_FORM = { email: '', password: '', pin_code: '' };

/**
 * Gestiona el estado y el envío del formulario de Login.
 * La autenticación en sí vive en context/AuthContext.jsx (que a su vez usa
 * services/api.js); este hook solo orquesta el formulario y la redirección.
 */
export default function useLoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [mode, setMode]       = useState('email'); // 'email' | 'pin'
  const [form, setForm]       = useState(INITIAL_FORM);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const setField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));
  const setPin = (value) => setField('pin_code', sanitizePin(value));

  const changeMode = (nextMode) => {
    setMode(nextMode);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const credentials = mode === 'email'
        ? { email: form.email, password: form.password }
        : { pin_code: form.pin_code };

      const user = await login(credentials);
      navigate(getRedirectPath(user));
    } catch (err) {
      setError(err.response?.data?.message || 'Error al iniciar sesión. Verifica tus datos.');
    } finally {
      setLoading(false);
    }
  };

  return {
    mode, changeMode,
    form, setField, setPin,
    error, loading,
    handleSubmit,
  };
}
