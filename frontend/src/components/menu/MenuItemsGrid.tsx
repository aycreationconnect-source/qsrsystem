import React from 'react';
import { useApp } from '../../context/AppContext';

interface MenuItemsGridProps {
  selectedCategory: string | null;
  onAddItem: () => void;
  onConfigItem: (item: any) => void;
  onEditItem: (item: any) => void;
  onDeleteItem: (item: any) => void;
}

export const MenuItemsGrid: React.FC<MenuItemsGridProps> = ({
  selectedCategory,
  onAddItem,
  onConfigItem,
  onEditItem,
  onDeleteItem,
}) => {
  const { appData } = useApp();

  return (
    <div className="items-content">
      {!selectedCategory ? (
        <div
          style={{
            display: 'flex',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#64748b',
            fontSize: '1.1rem',
            textAlign: 'center',
            padding: '0 40px',
          }}
        >
          Select a category from the left to view
          <br />
          and manage its items.
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: '1.25rem', color: '#1e293b', fontWeight: 600 }}>
              {selectedCategory} Items
            </h3>
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
              onClick={onAddItem}
            >
              + Add Item
            </button>
          </div>
          <div style={{ overflowY: 'auto', flex: 1, paddingBottom: 24 }}>
            {(() => {
              const items = appData.menu.filter(
                (m: any) => m.category === selectedCategory && !m.isAddon
              );

              return (
                <div style={{ marginBottom: 32 }}>
                  <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.1)', color: 'var(--text-muted)' }}>
                        <th style={{ padding: 12, width: 40 }}>#</th>
                        <th style={{ padding: 12 }}>Name</th>
                        <th style={{ padding: 12 }}>Price</th>
                        <th style={{ padding: 12 }}>Status</th>
                        <th style={{ padding: 12, textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.length === 0 ? (
                        <tr>
                          <td colSpan={5} style={{ padding: 12, textAlign: 'center', color: '#94a3b8' }}>
                            No items found.
                          </td>
                        </tr>
                      ) : (
                        items.map((item: any, i: number) => {
                          let typeColor = '#22c55e'; // Veg (Green)
                          if (item.type === 'Non-Veg') typeColor = '#ef4444'; // Red
                          if (item.type === 'Egg') typeColor = '#eab308'; // Yellow

                          return (
                            <tr key={i} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                              <td style={{ padding: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
                                {i + 1}
                              </td>
                              <td style={{ padding: 12 }}>
                                <span
                                  style={{
                                    display: 'inline-block',
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    backgroundColor: typeColor,
                                    marginRight: 8,
                                    border: `1px solid ${typeColor}`,
                                  }}
                                ></span>
                                {item.name}
                              </td>
                              <td style={{ padding: 12 }}>{item.price}</td>
                              <td style={{ padding: 12 }}>
                                <span
                                  style={{
                                    color: item.available ? 'var(--success)' : 'var(--primary-color)',
                                  }}
                                >
                                  {item.available ? 'Available' : 'Unavailable'}
                                </span>
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
                                    fontWeight: 600,
                                    marginRight: 8,
                                  }}
                                  onClick={() => onConfigItem(item)}
                                >
                                  ⚙ Config
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
                                    marginRight: 8,
                                  }}
                                  onClick={() => onEditItem(item)}
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
                                  onClick={() => onDeleteItem(item)}
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              );
            })()}
          </div>
        </>
      )}
    </div>
  );
};
