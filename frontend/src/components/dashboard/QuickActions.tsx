import React from 'react';
import { useApp } from '../../context/AppContext';

export const QuickActions: React.FC = () => {
  const { setActiveTab } = useApp();

  return (
    <div className="admin-card">
      <h3>Quick Actions</h3>
      <div className="quick-actions-grid">
        <button className="quick-action-btn" onClick={() => setActiveTab('Menu Management')}>
          <span className="quick-action-icon">🍔</span>
          Add Menu Item
        </button>
        <button className="quick-action-btn" onClick={() => setActiveTab('Table Setup')}>
          <span className="quick-action-icon">🪑</span>
          New Table
        </button>
        <button className="quick-action-btn" onClick={() => setActiveTab('Inventory')}>
          <span className="quick-action-icon">📦</span>
          Update Stock
        </button>
        <button className="quick-action-btn" onClick={() => setActiveTab('Settings')}>
          <span className="quick-action-icon">⚙️</span>
          Settings
        </button>
      </div>
    </div>
  );
};
