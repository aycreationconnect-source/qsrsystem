import React from 'react';
import { useApp } from '../../context/AppContext';
import type { InventoryItem } from '../../types/app.types';

interface InventoryTableProps {
  onUpdateStock: (index: number) => void;
  onViewHistory: (index: number) => void;
}

export const InventoryTable: React.FC<InventoryTableProps> = ({ onUpdateStock, onViewHistory }) => {
  const { appData } = useApp();

  return (
    <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)' }}>
          <th style={{ padding: 12 }}>Raw Material</th>
          <th style={{ padding: 12 }}>Current Stock</th>
          <th style={{ padding: 12 }}>Threshold</th>
          <th style={{ padding: 12 }}>Status</th>
          <th style={{ padding: 12, textAlign: 'right' }}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {appData.inventory.map((item: InventoryItem, i: number) => {
          let color = 'var(--success)';
          if (item.status === 'Low Stock') color = '#fbbf24'; // warning yellow
          if (item.status === 'Out of Stock') color = 'var(--primary-color)'; // red

          return (
            <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <td style={{ padding: 12, fontWeight: 500 }}>{item.item}</td>
              <td style={{ padding: 12 }}>
                {item.stock <= 0 ? (
                  <span
                    style={{
                      color: '#ef4444',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <svg
                      width="16"
                      height="16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      ></path>
                    </svg>
                    Out of stock
                  </span>
                ) : (
                  `${item.stock} ${item.unit}`
                )}
              </td>
              <td style={{ padding: 12, color: 'var(--text-muted)' }}>
                {item.threshold} {item.unit}
              </td>
              <td style={{ padding: 12 }}>
                <span style={{ color, fontWeight: 600 }}>{item.status}</span>
              </td>
              <td style={{ padding: 12, textAlign: 'right' }}>
                <button
                  className="btn btn-next"
                  style={{
                    padding: '4px 12px',
                    fontSize: '0.8rem',
                    background: '#f8fafc',
                    border: '1px solid #94a3b8',
                    color: '#475569',
                    marginRight: 8,
                    fontWeight: 600,
                  }}
                  onClick={() => onViewHistory(i)}
                >
                  History
                </button>
                <button
                  className="btn btn-next"
                  style={{
                    padding: '4px 12px',
                    fontSize: '0.8rem',
                    background: '#eff6ff',
                    border: '1px solid #3b82f6',
                    color: '#1d4ed8',
                    fontWeight: 600,
                  }}
                  onClick={() => onUpdateStock(i)}
                >
                  Edit
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
