import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import DashboardLayout from './components/DashboardLayout';

import LoginPage from './pages/LoginPage';
import CustomerMenuPage from './pages/Customer/MenuPage';
import WaiterPage from './pages/Waiter/WaiterPage';
import KitchenPage from './pages/Kitchen/KitchenPage';
import CashierPage from './pages/Cashier/CashierPage';
import AdminDashboard from './pages/Admin/DashboardPage';
import AdminUsers from './pages/Admin/UsersPage';
import AdminBranches from './pages/Admin/BranchesPage';
import SettingsUserPage from './pages/Admin/SettingsUserPage';
import SettingsBusinessPage from './pages/Admin/SettingsBusinessPage';
import AdminMenu from './pages/Admin/MenuPage';
import CategoriesPage from './pages/Admin/CategoriesPage';
import ModifiersPage from './pages/Admin/ModifiersPage';
import TablesPage from './pages/Admin/TablesPage';
import ReportsPage from './pages/Admin/ReportsPage';
import ReservationsPage from './pages/Admin/ReservationsPage';

const ProtectedRoute = ({ children, minLevel = 0 }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) return <div style={{ color: '#fff', textAlign: 'center', padding: 50 }}>Cargando...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (minLevel > 0 && user?.role?.level < minLevel) return <Navigate to="/" replace />;

  return children;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/menu/:branchCode" element={<CustomerMenuPage />} />

      <Route path="/waiter/*" element={
        <ProtectedRoute minLevel={30}>
          <DashboardLayout>
            <Routes>
              <Route path="/" element={<WaiterPage />} />
            </Routes>
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/kitchen/*" element={
        <ProtectedRoute minLevel={40}>
          <DashboardLayout>
            <Routes>
              <Route path="/" element={<KitchenPage />} />
            </Routes>
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/cashier/*" element={
        <ProtectedRoute minLevel={50}>
          <DashboardLayout>
            <Routes>
              <Route path="/" element={<CashierPage />} />
            </Routes>
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/admin/*" element={
        <ProtectedRoute minLevel={70}>
          <DashboardLayout>
            <Routes>
              <Route path="/dashboard" element={<AdminDashboard />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/reservations" element={<ReservationsPage />} />
              <Route path="/menu" element={<AdminMenu />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/modifiers" element={<ModifiersPage />} />
              <Route path="/tables" element={<TablesPage />} />
              <Route path="/users" element={<AdminUsers />} />
              <Route path="/branches" element={<AdminBranches />} />
              <Route path="/settings/user" element={<SettingsUserPage />} />
              <Route path="/settings/business" element={<SettingsBusinessPage />} />
              <Route path="/settings" element={<Navigate to="/admin/settings/user" replace />} />
              <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
            </Routes>
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;