import React from 'react';
import { useApp } from '../../context/AppContext';

export const Header: React.FC = () => {
  const { activeTab, currentUser, storeProfile, licenseStatus } = useApp();
  const displayName = currentUser?.fullName || currentUser?.username || 'Staff User';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <header className="admin-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <h2>{activeTab}</h2>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {licenseStatus && (
          <div
            style={{
              padding: '6px 12px',
              borderRadius: '20px',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#059669',
              fontSize: '0.8rem',
              fontWeight: 600,
            }}
          >
            🟢 {licenseStatus.daysRemaining} days trial left ({storeProfile?.cafeCode || 'CF-MUM-001'})
          </div>
        )}
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            backgroundColor: 'var(--primary-color)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            boxShadow: '0 4px 10px rgba(59,130,246,0.3)',
          }}
        >
          {initial}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>
            {displayName}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {currentUser?.role || 'CASHIER'}
          </span>
        </div>
      </div>
    </header>
  );
};
