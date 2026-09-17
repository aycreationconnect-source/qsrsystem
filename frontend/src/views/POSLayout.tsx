import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { usePOS } from '../context/POSContext';
import { POSTopNav } from '../components/pos/POSTopNav';
import { POSVerticalCategorySidebar } from '../components/pos/POSVerticalCategorySidebar';
import { POSTableSubheader } from '../components/pos/POSTableSubheader';
import { POSProductGrid } from '../components/pos/POSProductGrid';
import { POSCartSidebar } from '../components/pos/POSCartSidebar';
import { POSTableTerminalView } from '../components/pos/POSTableTerminalView';
import { StoreProfileModal } from '../components/settings/StoreProfileModal';
import { PackageDetailsModal } from '../components/common/PackageDetailsModal';
import { CheckoutModal } from '../components/pos/CheckoutModal';
import { AddonSelectModal } from '../components/pos/AddonSelectModal';
import { ShiftTableModal } from '../components/pos/ShiftTableModal';
import { AddTablePOSModal } from '../components/pos/AddTablePOSModal';
import { OrderSuccessModal } from '../components/pos/OrderSuccessModal';
import { POSOrderHistoryModal } from '../components/pos/POSOrderHistoryModal';
import { Drawer } from '../components/ui';
import { useSearchParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export const POSLayout: React.FC = () => {
  const { posMode: contextPosMode, storeProfile, setStoreProfile } = useApp();
  const [searchParams] = useSearchParams();
  const posMode = searchParams.get('mode') || contextPosMode || 'quick';
  const { selectedTableId, cart, getCartTotals } = usePOS();
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [isStoreProfileModalOpen, setIsStoreProfileModalOpen] = useState(false);

  const { total } = getCartTotals();
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // When in Table Mode and no table is actively selected, show dedicated Floor Terminal (Figure 2)
  const isFloorTerminalActive = posMode === 'table' && !selectedTableId;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#faf8f5] dark:bg-[#0c0f17] text-stone-900 dark:text-stone-100 select-none">
      {/* 1. Station Top Navigation Bar */}
      <POSTopNav
        onOpenMobileCart={() => setIsMobileCartOpen(true)}
        onOpenPackageDetails={() => setIsPackageModalOpen(true)}
        onOpenStoreProfile={() => setIsStoreProfileModalOpen(true)}
      />

      {/* 2. Main Operational Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {isFloorTerminalActive ? (
          /* Component 1: Dedicated Full-Screen Table Terminal View (Figure 2) */
          <POSTableTerminalView />
        ) : (
          /* Component 2: Dedicated Menu & Ordering View (Image 2) */
          <div className="flex-1 flex overflow-hidden relative">
            {/* Left & Center Canvas (Subheader + Categories + Product Grid) */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative min-w-0">
              {/* Active Table Subheader (Spans only across Left & Center) */}
              {posMode === 'table' && selectedTableId && (
                <POSTableSubheader />
              )}

              {/* Menu Operational Canvas */}
              <div className="flex-1 flex overflow-hidden relative">
                {/* Left Column: Dedicated Vertical Categories Sidebar */}
                <div className="hidden 2xl:flex h-full shrink-0">
                  <POSVerticalCategorySidebar />
                </div>

                {/* Center Area: Visual Food Catalog Grid */}
                <div className="flex-1 flex flex-col h-full overflow-hidden relative min-w-0">
                  <POSProductGrid />

                  {/* Mobile Bottom Order Floating Pill Bar */}
                  {totalCount > 0 && (
                    <div className="lg:hidden fixed bottom-4 left-4 right-4 z-30">
                      <div
                        onClick={() => setIsMobileCartOpen(true)}
                        className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-extrabold px-5 py-3.5 rounded-2xl shadow-xl shadow-amber-500/30 flex items-center justify-between cursor-pointer active:scale-98 transition-all"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-xl bg-stone-950 text-amber-400 flex items-center justify-center text-xs">
                            {totalCount}
                          </div>
                          <span className="text-sm">View Current Order</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-mono">₹{total.toFixed(2)}</span>
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Desktop Cart & Ticket Sidebar: EXPANDED TO UPSIDE (Full Height) */}
            <div className="hidden lg:flex w-96 xl:w-[420px] 2xl:w-[460px] h-full shrink-0">
              <POSCartSidebar />
            </div>
          </div>
        )}
      </div>

      {/* Mobile Waiter Cart Drawer (Slide-Up Drawer for Phones & Small Tablets) */}
      <Drawer
        isOpen={isMobileCartOpen}
        onClose={() => setIsMobileCartOpen(false)}
        side="right"
        hideHeader={true}
        contentClassName="p-0 h-full"
        className="max-w-md sm:max-w-lg w-full"
      >
        <POSCartSidebar onCloseMobileDrawer={() => setIsMobileCartOpen(false)} />
      </Drawer>

      {/* POS Operational Modals */}
      <CheckoutModal />
      <AddonSelectModal />
      <ShiftTableModal />
      <AddTablePOSModal />
      <OrderSuccessModal />
      <POSOrderHistoryModal />
      <PackageDetailsModal
        isOpen={isPackageModalOpen}
        onClose={() => setIsPackageModalOpen(false)}
      />
      <StoreProfileModal
        isOpen={isStoreProfileModalOpen}
        onClose={() => setIsStoreProfileModalOpen(false)}
        storeProfile={storeProfile}
        onProfileUpdated={(updated) => setStoreProfile(updated)}
      />
    </div>
  );
};
