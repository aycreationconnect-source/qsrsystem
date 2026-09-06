import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import './index.css';
import { AppProvider, useApp } from './context/AppContext';
import { POSProvider } from './context/POSContext';
import { LoginView } from './components/auth/LoginView';
import { ActivateLicenseView } from './components/auth/ActivateLicenseView';
import { AuthGuard } from './components/auth/AuthGuard';
import { PublicOnlyGuard } from './components/auth/PublicOnlyGuard';
import { AdminLayout } from './views/AdminLayout';
import { POSLayout } from './views/POSLayout';
import { DashboardView } from './components/dashboard/DashboardView';
import { MenuView } from './components/menu/MenuView';
import { InventoryView } from './components/inventory/InventoryView';
import { FloorManagement } from './components/tables/FloorManagement';
import { SettingsView } from './components/settings/SettingsView';
import { PageTitleUpdater } from './components/common/PageTitleUpdater';
import { OrderNotificationToast } from './components/common/OrderNotificationToast';

const ActivateScreen: React.FC = () => {
  const { checkLicenseStatus } = useApp();
  const navigate = useNavigate();

  return (
    <ActivateLicenseView
      onActivationSuccess={async () => {
        await checkLicenseStatus();
        navigate('/login');
      }}
    />
  );
};

const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <PageTitleUpdater />
      <OrderNotificationToast />
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicOnlyGuard>
              <LoginView />
            </PublicOnlyGuard>
          }
        />
        <Route path="/activate" element={<ActivateScreen />} />

        {/* Protected Routes (JWT authenticated on every transition) */}
        <Route element={<AuthGuard />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Admin Management Views */}
          <Route element={<AdminLayout />}>
            <Route path="/dashboard" element={<DashboardView />} />
            <Route path="/menu" element={<MenuView />} />
            <Route path="/inventory" element={<InventoryView />} />
            <Route path="/tables" element={<FloorManagement />} />
            <Route path="/settings" element={<SettingsView />} />
          </Route>

          {/* POS Terminal */}
          <Route path="/pos" element={<POSLayout />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

function App() {
  return (
    <AppProvider>
      <POSProvider>
        <AppRoutes />
      </POSProvider>
    </AppProvider>
  );
}

export default App;
