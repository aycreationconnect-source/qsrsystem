import React from 'react';
import { useApp } from '../../context/AppContext';

export const Header: React.FC = () => {
  const { activeTab, loginData, registerData } = useApp();
  const adminName = loginData.adminId || registerData.adminId || 'Admin';
  const initial = (loginData.adminId || registerData.adminId || 'A').charAt(0).toUpperCase();

  return (
    <header className="admin-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <h2>{activeTab}</h2>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
            {adminName}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Super Admin</span>
        </div>
      </div>
    </header>
  );
};
