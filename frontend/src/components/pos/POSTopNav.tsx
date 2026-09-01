import React from 'react';
import { useApp } from '../../context/AppContext';
import { usePOS } from '../../context/POSContext';

export const POSTopNav: React.FC = () => {
  const { posMode, appData, setView } = useApp();
  const { selectedTableId } = usePOS();

  const currentDateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const currentTableName =
    posMode === 'table'
      ? selectedTableId
        ? `Table: ${appData.tables.find((t: any) => t.id === selectedTableId)?.name || selectedTableId}`
        : 'Table Point of Sale (Select a table)'
      : 'QSR Point of Sale';

  return (
    <header className="pos-header">
      <h2>{currentTableName}</h2>
      <div className="pos-header-actions">
        <span>{currentDateStr}</span>
        <button className="btn-outline" onClick={() => setView('dashboard')}>
          Back to Admin
        </button>
      </div>
    </header>
  );
};
