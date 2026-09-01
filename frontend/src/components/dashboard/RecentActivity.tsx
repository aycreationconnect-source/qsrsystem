import React from 'react';
import type { Order } from '../../types/app.types';

interface RecentActivityProps {
  recentOrders: Order[];
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ recentOrders }) => {
  return (
    <div className="admin-card" style={{ flex: 1 }}>
      <h3>Recent Activity</h3>
      <ul style={{ marginTop: 12, listStyle: 'none', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        {recentOrders.length > 0 ? (
          recentOrders.map((o: any, i: number) => (
            <li
              key={i}
              style={{
                padding: '12px 0',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                gap: 12,
              }}
            >
              <span style={{ color: '#059669' }}>●</span> Order #{o.id} completed (₹{o.total?.toFixed(2)})
            </li>
          ))
        ) : (
          <li style={{ padding: '12px 0', display: 'flex', gap: 12 }}>No recent activity.</li>
        )}
      </ul>
    </div>
  );
};
