import React from 'react';
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

export const POSLayout: React.FC = () => {
  const { posMode } = useApp();
  const { selectedTableId } = usePOS();

  return (
    <div
      className="pos-layout"
      style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}
    >
      {posMode === 'table' && <POSTableSidebar />}

      <div className="pos-main-wrapper" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <POSTopNav />

        {posMode === 'table' && !selectedTableId ? (
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              color: '#94a3b8',
            }}
          >
            <span style={{ fontSize: '4rem', marginBottom: 16 }}>🍽️</span>
            <h2 style={{ color: '#475569' }}>No Table Selected</h2>
            <p>Please select a table from the left sidebar to start taking orders.</p>
          </div>
        ) : (
          <>
            <POSCategoryTabs />
            <POSProductGrid />
          </>
        )}
      </div>

      <POSCartSidebar />

      {/* POS Modals */}
      <CheckoutModal />
      <AddonSelectModal />
      <ShiftTableModal />
      <AddTablePOSModal />
      <OrderSuccessModal />
    </div>
  );
};
