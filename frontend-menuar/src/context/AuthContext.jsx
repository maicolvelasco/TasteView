import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { ROLE_LEVELS } from '../utils/roles';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.get('/me')
        .then(res => setUser(res.data.data))
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    const res = await api.post('/login', credentials);
    const { token, user } = res.data.data;
    localStorage.setItem('token', token);
    setUser(user);
    return user;
  };

  const logout = async () => {
    try {
      await api.post('/logout');
    } catch (e) {}
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/login';
  };

  /**
   * Actualiza el `user` en memoria con datos parciales (merge superficial),
   * sin pedirle nada al backend. Se usa después de guardar en Ajustes
   * (perfil propio, o el negocio/logo) para que el cambio se refleje al
   * instante en toda la app (topbar, drawer, user badge) sin recargar la
   * página ni esperar a que vuelva a andar el próximo /me.
   */
  const updateUser = (patch) => {
    setUser((prev) => (prev ? { ...prev, ...patch } : prev));
  };

  /** Vuelve a pedir /me completo — por si se prefiere la fuente de verdad del servidor. */
  const refreshUser = async () => {
    const res = await api.get('/me');
    setUser(res.data.data);
    return res.data.data;
  };

  const hasRole = (minLevel) => {
    return user?.role?.level >= minLevel;
  };

  const value = {
    user,
    login,
    logout,
    updateUser,
    refreshUser,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role?.level >= 90,
    isSuperAdmin: user?.role?.level >= ROLE_LEVELS.SUPER_ADMIN,
    isManager: user?.role?.level >= 70,
    isCashier: user?.role?.level >= 50,
    isChef: user?.role?.slug === 'chef',
    isWaiter: user?.role?.slug === 'waiter',
    isCustomer: !user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
