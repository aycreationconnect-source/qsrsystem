import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { usePOS } from '../context/POSContext';
import { POSTopNav } from '../components/pos/POSTopNav';
import { POSCategoryTabs } from '../components/pos/POSCategoryTabs';
import { POSProductGrid } from '../components/pos/POSProductGrid';
import { POSCartSidebar } from '../components/pos/POSCartSidebar';
import { POSTableSidebar } from '../components/pos/POSTableSidebar';
import { CheckoutModal } from '../components/pos/CheckoutModal';
import { AddonSelectModal } from '../components/pos/AddonSelectModal';
import { ShiftTableModal } from '../components/pos/ShiftTableModal';
import { AddTablePOSModal } from '../components/pos/AddTablePOSModal';
import { OrderSuccessModal } from '../components/pos/OrderSuccessModal';
import { Drawer } from '../components/ui';
import { Utensils, ArrowRight } from 'lucide-react';

export const POSLayout: React.FC = () => {
  const { posMode } = useApp();
  const { selectedTableId, cart, getCartTotals } = usePOS();
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

  const { total } = getCartTotals();
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#faf8f5] dark:bg-[#0c0f17] text-stone-900 dark:text-stone-100 select-none">
      {/* 1. Left Table / Floor Sidebar (Dine-In Mode Only) */}
      {posMode === 'table' && (
        <div className="hidden md:flex h-full shrink-0">
          <POSTableSidebar />
        </div>
      )}

      {/* 2. Center Main Operational Area (Nav + Categories + Food Grid) */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <POSTopNav onOpenMobileCart={() => setIsMobileCartOpen(true)} />

        {/* If Table Mode and No Table Selected */}
        {posMode === 'table' && !selectedTableId ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            {/* Mobile Table Selector if on phone/small tablet */}
            <div className="md:hidden w-full max-w-md h-full flex flex-col">
              <POSTableSidebar />
            </div>

            <div className="hidden md:flex flex-col items-center justify-center text-stone-400 dark:text-stone-500">
              <div className="w-20 h-20 rounded-3xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4">
                <Utensils className="w-10 h-10 stroke-1" />
              </div>
              <h3 className="text-lg font-bold text-stone-700 dark:text-stone-300">
                Select a Dining Table
              </h3>
              <p className="text-xs max-w-xs mt-1">
                Choose an active or available table from the left floor sidebar to take orders.
              </p>
            </div>
          </div>
        ) : (
          <>
            <POSCategoryTabs />
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
          </>
        )}
      </div>

      {/* 3. Right Desktop Cart Sidebar (Hidden on mobile/small tablets, fixed on large desktop) */}
      <div className="hidden lg:flex w-80 xl:w-96 h-full shrink-0">
        <POSCartSidebar />
      </div>

      {/* 4. Mobile Waiter Cart Drawer (Slide-Up Drawer for Phones & Small Tablets) */}
      <Drawer
        isOpen={isMobileCartOpen}
        onClose={() => setIsMobileCartOpen(false)}
        title="Live Order Ticket"
        side="right"
      >
        <POSCartSidebar onCloseMobileDrawer={() => setIsMobileCartOpen(false)} />
      </Drawer>

      {/* POS Operational Modals */}
      <CheckoutModal />
      <AddonSelectModal />
      <ShiftTableModal />
      <AddTablePOSModal />
      <OrderSuccessModal />
    </div>
  );
};
