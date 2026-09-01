import React from 'react';
import { useApp } from '../../context/AppContext';
import { usePOS } from '../../context/POSContext';

export const AddTablePOSModal: React.FC = () => {
  const { setAppData } = useApp();
  const { showAddTableModal, setShowAddTableModal, newTableName, setNewTableName } = usePOS();

  if (!showAddTableModal) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 100 }}>
      <div className="modal-content" style={{ maxWidth: 400 }}>
        <h2>Add Custom Table</h2>
        <div className="form-group">
          <label>Table Name (e.g. VIP-1)</label>
          <input
            type="text"
            value={newTableName}
            onChange={(e) => setNewTableName(e.target.value)}
            placeholder="Enter table name"
          />
        </div>
        <div className="modal-actions">
          <button className="btn-outline" onClick={() => setShowAddTableModal(false)}>
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={() => {
              if (!newTableName.trim()) return;
              const newId = `T${Date.now()}`;
              setAppData((prev: any) => ({
                ...prev,
                tables: [...prev.tables, { id: newId, name: newTableName.trim() }],
              }));
              setNewTableName('');
              setShowAddTableModal(false);
            }}
          >
            Add Table
          </button>
        </div>
      </div>
    </div>
  );
};
