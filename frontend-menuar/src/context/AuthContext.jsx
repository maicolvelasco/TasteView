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

  const hasRole = (minLevel) => {
    return user?.role?.level >= minLevel;
  };

  const value = {
    user,
    login,
    logout,
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
