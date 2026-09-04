import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Header } from '../components/common/Header';
import { Sidebar } from '../components/common/Sidebar';
import { StoreProfileModal } from '../components/settings/StoreProfileModal';
import { Drawer } from '../components/ui';

export const AdminLayout: React.FC = () => {
  const { storeProfile, setStoreProfile } = useApp();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isStoreProfileModalOpen, setIsStoreProfileModalOpen] = useState(false);

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
          <Outlet />
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
