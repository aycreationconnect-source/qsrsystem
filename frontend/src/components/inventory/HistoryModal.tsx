import React from 'react';
import { useApp } from '../../context/AppContext';

interface HistoryModalProps {
  show: boolean;
  onClose: () => void;
  historyItemIndex: number | null;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ show, onClose, historyItemIndex }) => {
  const { appData } = useApp();

  if (!show || historyItemIndex === null || !appData.inventory[historyItemIndex]) {
    return null;
  }

  const currentItem = appData.inventory[historyItemIndex];

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ width: 500 }}>
        <div className="modal-header">
          <h2>Stock History: {currentItem.item}</h2>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-body" style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {!currentItem.history || currentItem.history.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No history available for this item.</p>
          ) : (
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: 12 }}>Date</th>
                  <th style={{ padding: 12 }}>Change</th>
                  <th style={{ padding: 12 }}>Type</th>
                </tr>
              </thead>
              <tbody>
                {currentItem.history.map((hist: any, i: number) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: 12 }}>{hist.date}</td>
                    <td
                      style={{
                        padding: 12,
                        color: hist.change.startsWith('+') ? 'var(--success)' : 'var(--primary-color)',
                      }}
                    >
                      {hist.change} {currentItem.unit}
                    </td>
                    <td style={{ padding: 12 }}>{hist.type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
