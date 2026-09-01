import React from 'react';
import { useApp } from '../../context/AppContext';
import type { Addon } from '../../types/app.types';

interface AddonsManagementProps {
  onAddAddon: () => void;
  onEditAddon: (addon: Addon) => void;
  onDeleteAddon: (addon: Addon) => void;
}

export const AddonsManagement: React.FC<AddonsManagementProps> = ({
  onAddAddon,
  onEditAddon,
  onDeleteAddon,
}) => {
  const { appData } = useApp();

  return (
    <div className="addons-layout" style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 style={{ fontSize: '1.25rem', color: '#1e293b', fontWeight: 600 }}>All Add-ons</h3>
        <button
          className="btn btn-next"
          style={{
            padding: '8px 16px',
            borderRadius: 20,
            backgroundColor: '#3b82f6',
            color: '#fff',
            border: 'none',
            fontWeight: 500,
          }}
          onClick={onAddAddon}
        >
          + Create Add-on
        </button>
      </div>
      <div style={{ overflowY: 'auto', flex: 1, paddingBottom: 24 }}>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.1)', color: 'var(--text-muted)' }}>
              <th style={{ padding: 12, width: 40 }}>#</th>
              <th style={{ padding: 12 }}>Name</th>
              <th style={{ padding: 12 }}>Description</th>
              <th style={{ padding: 12 }}>Price</th>
              <th style={{ padding: 12, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {appData.addons.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: 24, textAlign: 'center', color: '#94a3b8' }}>
                  No add-ons yet. Click "+ Create Add-on" to add one.
                </td>
              </tr>
            ) : (
              appData.addons.map((addon: Addon, i: number) => (
                <tr key={addon.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                  <td style={{ padding: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{i + 1}</td>
                  <td style={{ padding: 12, fontWeight: 600 }}>{addon.name}</td>
                  <td style={{ padding: 12, color: '#64748b', fontSize: '0.9rem' }}>
                    {addon.description || '—'}
                  </td>
                  <td style={{ padding: 12 }}>₹{parseFloat(String(addon.price)).toFixed(2)}</td>
                  <td style={{ padding: 12, textAlign: 'right' }}>
                    <button
                      className="btn btn-next"
                      style={{
                        padding: '4px 12px',
                        fontSize: '0.8rem',
                        background: '#eff6ff',
                        border: '1px solid #3b82f6',
                        color: '#1d4ed8',
                        fontWeight: 600,
                        marginRight: 8,
                      }}
                      onClick={() => onEditAddon(addon)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-next"
                      style={{
                        padding: '4px 12px',
                        fontSize: '0.8rem',
                        background: '#fef2f2',
                        border: '1px solid #ef4444',
                        color: '#b91c1c',
                        fontWeight: 600,
                      }}
                      onClick={() => onDeleteAddon(addon)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
