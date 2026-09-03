import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Header } from '../components/common/Header';
import { Sidebar } from '../components/common/Sidebar';
import { DashboardView } from '../components/dashboard/DashboardView';
import { MenuView } from '../components/menu/MenuView';
import { InventoryView } from '../components/inventory/InventoryView';
import { FloorManagement } from '../components/tables/FloorManagement';
import { SettingsView } from '../components/settings/SettingsView';
import { StoreProfileModal } from '../components/settings/StoreProfileModal';
import { Drawer } from '../components/ui';

export const AdminLayout: React.FC = () => {
  const { activeTab, storeProfile, setStoreProfile } = useApp();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isStoreProfileModalOpen, setIsStoreProfileModalOpen] = useState(false);

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
          <div className="p-6">
            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-8 text-center text-stone-400">
              <h3 className="text-lg font-bold text-stone-800 dark:text-stone-200">{activeTab}</h3>
              <p className="text-xs mt-2">This section is currently under development.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#faf8f5] dark:bg-[#0c0f17] text-stone-900 dark:text-stone-100">
      {/* Desktop Sidebar (Permanent on >= lg screen) */}
      <div className="hidden lg:flex h-full shrink-0">
        <Sidebar onOpenStoreProfile={() => setIsStoreProfileModalOpen(true)} />
      </div>

      {/* Mobile Navigation Drawer (For phones and small tablets) */}
      <Drawer
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        side="left"
        title="Store Navigation"
      >
        <Sidebar
          onOpenStoreProfile={() => {
            setIsMobileNavOpen(false);
            setIsStoreProfileModalOpen(true);
          }}
          onCloseMobileNav={() => setIsMobileNavOpen(false)}
        />
      </Drawer>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header
          onToggleMobileNav={() => setIsMobileNavOpen(true)}
          onOpenStoreProfile={() => setIsStoreProfileModalOpen(true)}
        />

        <main className="flex-1 overflow-y-auto">
          {renderContent()}
        </main>
      </div>

      {/* Store Profile & Logo Upload Modal */}
      <StoreProfileModal
        isOpen={isStoreProfileModalOpen}
        onClose={() => setIsStoreProfileModalOpen(false)}
        storeProfile={storeProfile}
        onProfileUpdated={(updated) => {
          setStoreProfile(updated);
        }}
      />
    </div>
  );
};
