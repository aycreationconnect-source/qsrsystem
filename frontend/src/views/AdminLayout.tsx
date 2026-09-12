import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Header } from '../components/common/Header';
import { Sidebar } from '../components/common/Sidebar';
import { StoreProfileModal } from '../components/settings/StoreProfileModal';
import { Drawer } from '../components/ui';
import { cn } from '../lib/utils';

export const AdminLayout: React.FC = () => {
  const { storeProfile, setStoreProfile } = useApp();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isStoreProfileModalOpen, setIsStoreProfileModalOpen] = useState(false);

  // Persistent sidebar collapse state across all device resolutions
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    const saved = localStorage.getItem('pos_sidebar_collapsed');
    return saved !== null ? saved === 'true' : false;
  });

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('pos_sidebar_collapsed', String(next));
      return next;
    });
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#faf8f5] dark:bg-[#0c0f17] text-stone-900 dark:text-stone-100">
      {/* Sidebar Rail (Permanent on Tablet & Desktop >= 768px: transitions width smoothly between 72px and 260px) */}
      <div
        className={cn(
          "hidden md:block shrink-0 h-full relative z-30 transition-all duration-300 ease-in-out",
          isSidebarCollapsed ? "w-[72px]" : "w-[260px]"
        )}
      >
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={handleToggleSidebar}
          onOpenStoreProfile={() => setIsStoreProfileModalOpen(true)}
        />
      </div>

      {/* Mobile Drawer (Phones < 768px) */}
      <Drawer
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        side="left"
        hideHeader={true}
        contentClassName="p-0 h-full"
        className="max-w-[280px] w-[280px]"
      >
        <Sidebar
          isMobileDrawer={true}
          onOpenStoreProfile={() => {
            setIsMobileNavOpen(false);
            setIsStoreProfileModalOpen(true);
          }}
          onCloseMobileNav={() => setIsMobileNavOpen(false)}
        />
      </Drawer>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        <Header
          onToggleMobileNav={() => setIsMobileNavOpen(true)}
          onOpenStoreProfile={() => setIsStoreProfileModalOpen(true)}
        />

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Store Profile Modal */}
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
