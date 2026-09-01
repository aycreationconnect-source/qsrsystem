import React from 'react';
import { useApp } from '../context/AppContext';
import { Header } from '../components/common/Header';
import { Sidebar } from '../components/common/Sidebar';
import { DashboardView } from '../components/dashboard/DashboardView';
import { MenuView } from '../components/menu/MenuView';
import { InventoryView } from '../components/inventory/InventoryView';
import { FloorManagement } from '../components/tables/FloorManagement';
import { SettingsView } from '../components/settings/SettingsView';

export const AdminLayout: React.FC = () => {
  const { activeTab } = useApp();

  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard':
        return <DashboardView />;
      case 'Menu Management':
        return <MenuView />;
      case 'Inventory':
        return <InventoryView />;
      case 'Table Setup':
        return <FloorManagement />;
      case 'Settings':
        return <SettingsView />;
      default:
        return (
          <div className="admin-content">
            <div className="admin-card">
              <h3>{activeTab}</h3>
              <p style={{ color: 'var(--text-muted)', marginTop: 12 }}>
                This section is under construction.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="admin-dashboard-layout">
      <Sidebar />
      <main className="admin-main">
        <Header />
        {renderContent()}
      </main>
    </div>
  );
};
