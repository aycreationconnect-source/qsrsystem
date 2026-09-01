import React from 'react';
import { useApp } from '../../context/AppContext';
import { usePOS } from '../../context/POSContext';
import type { Table } from '../../types/app.types';

export const ShiftTableModal: React.FC = () => {
  const { posMode, appData } = useApp();
  const {
    showShiftTableModal,
    setShowShiftTableModal,
    selectedTableId,
    setSelectedTableId,
    tableOrders,
    setTableOrders,
    setTableStartTimes,
  } = usePOS();

  if (!showShiftTableModal || posMode !== 'table' || !selectedTableId) return null;

  const emptyTables = appData.tables.filter(
    (t: Table) =>
      String(t.id) !== selectedTableId &&
      (!tableOrders[t.id] ||
        (tableOrders[t.id].activeCart.length === 0 && tableOrders[t.id].savedOrders.length === 0))
  );

  const areas = appData.areas || [];
  const tablesByArea = emptyTables.reduce((acc: any, table: Table) => {
    const area = areas.find((a: any) => a.id === table.areaId) || { name: 'Main Area' };
    if (!acc[area.name]) acc[area.name] = [];
    acc[area.name].push(table);
    return acc;
  }, {});

  return (
    <div className="modal-overlay" style={{ zIndex: 100 }}>
      <div className="modal-content" style={{ maxWidth: 500, padding: 0 }}>
        <div className="modal-header">
          <h2>Shift Table</h2>
          <button className="close-btn" onClick={() => setShowShiftTableModal(false)}>
            ×
          </button>
        </div>
        <div className="modal-body">
          <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>
            Select an empty table to shift the current order to:
          </p>

          {emptyTables.length === 0 ? (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)' }}>
              No empty tables available.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {Object.entries(tablesByArea).map(([areaName, tables]: [string, any]) => (
                <div key={areaName}>
                  <h4
                    style={{
                      fontSize: '0.9rem',
                      color: 'var(--text-muted)',
                      marginBottom: 12,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {areaName}
                  </h4>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                      gap: 12,
                    }}
                  >
                    {tables.map((t: Table) => (
                      <button
                        key={t.id}
                        style={{
                          padding: '12px 8px',
                          borderRadius: 8,
                          border: '1px solid var(--border-color)',
                          backgroundColor: '#f8fafc',
                          color: 'var(--text-main)',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          textAlign: 'center',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'var(--primary-color)';
                          e.currentTarget.style.backgroundColor = '#eff6ff';
                          e.currentTarget.style.color = 'var(--primary-color)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'var(--border-color)';
                          e.currentTarget.style.backgroundColor = '#f8fafc';
                          e.currentTarget.style.color = 'var(--text-main)';
                        }}
                        onClick={() => {
                          setTableOrders((prev) => {
                            const newOrders = { ...prev };
                            newOrders[t.id] = newOrders[selectedTableId];
                            delete newOrders[selectedTableId];
                            return newOrders;
                          });
                          setTableStartTimes((prev) => {
                            const newTimes = { ...prev };
                            if (newTimes[selectedTableId]) {
                              newTimes[t.id] = newTimes[selectedTableId];
                              delete newTimes[selectedTableId];
                            }
                            return newTimes;
                          });
                          setSelectedTableId(String(t.id));
                          setShowShiftTableModal(false);
                        }}
                      >
                        {t.name}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div
          className="modal-actions"
          style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'flex-end',
            backgroundColor: '#f8fafc',
            borderBottomLeftRadius: 16,
            borderBottomRightRadius: 16,
          }}
        >
          <button
            className="btn-outline"
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: '1px solid var(--border-color)',
              backgroundColor: '#fff',
              cursor: 'pointer',
            }}
            onClick={() => setShowShiftTableModal(false)}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
