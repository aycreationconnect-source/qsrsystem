import React from 'react';
import './index.css';
import { AppProvider, useApp } from './context/AppContext';
import { POSProvider } from './context/POSContext';
import { LoginView } from './components/auth/LoginView';
import { RegisterView } from './components/auth/RegisterView';
import { AdminLayout } from './views/AdminLayout';
import { POSLayout } from './views/POSLayout';

const AppContent: React.FC = () => {
  const { view } = useApp();

  switch (view) {
    case 'pos':
      return (
        <POSProvider>
          <POSLayout />
        </POSProvider>
      );
    case 'dashboard':
      return (
        <POSProvider>
          <AdminLayout />
        </POSProvider>
      );
    case 'register':
      return <RegisterView />;
    case 'login':
    default:
      return <LoginView />;
  }
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
