import React from 'react';
import { useApp } from '../../context/AppContext';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, registerData, handleLogout } = useApp();
  const tabs = ['Dashboard', 'Menu Management', 'Inventory', 'Table Setup', 'Settings'];

  return (
    <aside className="admin-sidebar">
      <div className="admin-brand">{registerData.restaurantName || 'QSR Admin'}</div>
      <div className="admin-nav">
        {tabs.map((tab) => (
          <div
            key={tab}
            className={`admin-nav-item ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </div>
        ))}
        <div className="admin-nav-item" onClick={() => window.open('/?view=pos', '_blank')}>
          <span style={{ fontSize: '1.2rem' }}>🖥️</span> QSR Terminal
        </div>
        <div className="admin-nav-item" onClick={() => window.open('/?view=pos&mode=table', '_blank')}>
          <span style={{ fontSize: '1.2rem' }}>🍽️</span> Table POS Terminal
        </div>
        <div style={{ marginTop: 'auto', paddingTop: 24, borderTop: '1px solid rgba(0,0,0,0.05)' }}>
          <div className="admin-nav-item" style={{ color: '#e11d48' }} onClick={handleLogout}>
            <span style={{ fontSize: '1.2rem' }}>🚪</span> Logout
          </div>
        </div>
      </div>
    </aside>
  );
};
