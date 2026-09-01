import React from 'react';
import { useApp } from '../../context/AppContext';
import { usePOS } from '../../context/POSContext';
import type { Table } from '../../types/app.types';

export const POSTableSidebar: React.FC = () => {
  const { appData } = useApp();
  const {
    tableOrders,
    tableStartTimes,
    tablePrinted,
    selectedTableId,
    setSelectedTableId,
    setCart,
    now,
    setShowAddTableModal,
  } = usePOS();

  const tablesByArea: Record<string, Table[]> = {};
  const unassignedTables: Table[] = [];

  appData.tables.forEach((t: Table) => {
    if (t.areaId) {
      if (!tablesByArea[t.areaId]) tablesByArea[t.areaId] = [];
      tablesByArea[t.areaId].push(t);
    } else {
      unassignedTables.push(t);
    }
  });

  const renderTableList = (tables: Table[]) =>
    tables.map((t: Table) => {
      const orderData = tableOrders[t.id];
      const hasOrder =
        orderData && (orderData.activeCart.length > 0 || orderData.savedOrders.length > 0);
      const isSelected = selectedTableId === String(t.id);

      return (
        <div
          key={t.id}
          onClick={() => {
            setSelectedTableId(String(t.id));
            setCart(orderData?.activeCart || []);
          }}
          style={{
            padding: '16px',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12,
            background: isSelected ? '#eff6ff' : hasOrder ? '#fff7ed' : '#ffffff',
            border: `2px solid ${isSelected ? '#3b82f6' : hasOrder ? '#f97316' : '#e2e8f0'}`,
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: '1.6rem' }}>{hasOrder ? '🍽️' : '🛋️'}</span>
            <span
              style={{
                fontWeight: 600,
                fontSize: '1.1rem',
                color: isSelected ? '#1d4ed8' : hasOrder ? '#c2410c' : '#475569',
              }}
            >
              {t.name}
            </span>
          </div>
          {hasOrder && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
              <span
                style={{
                  fontSize: '0.65rem',
                  background: tablePrinted[t.id] ? '#10b981' : '#f97316',
                  color: '#fff',
                  padding: '2px 6px',
                  borderRadius: 12,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                }}
              >
                {tablePrinted[t.id] ? 'Bill Printed' : 'In Use'}
              </span>
              {tableStartTimes[t.id] && (
                <span
                  style={{
                    fontSize: '0.8rem',
                    color: '#f97316',
                    fontWeight: 700,
                    fontFamily: 'monospace',
                  }}
                >
                  {(() => {
                    const diffSecs = Math.max(0, Math.floor((now - tableStartTimes[t.id]) / 1000));
                    const m = Math.floor(diffSecs / 60)
                      .toString()
                      .padStart(2, '0');
                    const s = (diffSecs % 60).toString().padStart(2, '0');
                    return `${m}:${s}`;
                  })()}
                </span>
              )}
            </div>
          )}
        </div>
      );
    });

  return (
    <aside className="pos-tables-sidebar">
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#1e293b' }}>Tables</h3>
        <button
          className="btn-primary"
          style={{ padding: '4px 10px', fontSize: '0.85rem' }}
          onClick={() => setShowAddTableModal(true)}
        >
          + Add
        </button>
      </div>
      <div className="pos-tables-list" style={{ padding: '0 16px' }}>
        {appData.areas?.map((area: any) => {
          const areaTables = tablesByArea[area.id] || [];
          if (areaTables.length === 0) return null;
          return (
            <div key={area.id} style={{ marginBottom: 24 }}>
              <h4 style={{ margin: '0 0 12px 4px', fontSize: '1.1rem', color: '#b91c1c' }}>
                {area.name}
              </h4>
              {renderTableList(areaTables)}
            </div>
          );
        })}
        {unassignedTables.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <h4 style={{ margin: '0 0 12px 4px', fontSize: '1.1rem', color: '#b91c1c' }}>Unassigned</h4>
            {renderTableList(unassignedTables)}
          </div>
        )}
      </div>
    </aside>
  );
};
