import React from 'react';
import { tableApi } from '../../api/tableApi';
import { useApp } from '../../context/AppContext';

interface TableModalProps {
  show: boolean;
  onClose: () => void;
  editingTableId: number | string | null;
  newTableConfig: any;
  setNewTableConfig: React.Dispatch<React.SetStateAction<any>>;
}

export const TableModal: React.FC<TableModalProps> = ({
  show,
  onClose,
  editingTableId,
  newTableConfig,
  setNewTableConfig,
}) => {
  const { appData, fetchBackendData } = useApp();

  if (!show) return null;

  const handleSaveTable = async () => {
    try {
      const payload = {
        name: newTableConfig.name,
        seats: parseInt(newTableConfig.seats) || 4,
        status: newTableConfig.status || 'Available',
        areaId: parseInt(newTableConfig.areaId),
      };

      if (editingTableId && typeof editingTableId === 'number') {
        await tableApi.updateTable(editingTableId, payload);
      } else {
        await tableApi.createTable(payload);
      }
      onClose();
      fetchBackendData();
    } catch (e) {
      console.error('Failed to save table:', e);
    }
  };

  return (
    <div className="modal-overlay">
      <div
        className="modal-content"
        style={{ width: 500, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
      >
        <div className="modal-header">
          <h2>{editingTableId ? 'Edit Table' : 'Add New Table'}</h2>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-body" style={{ overflowY: 'auto', paddingRight: 8 }}>
          <div className="form-group">
            <label>Table Name</label>
            <input
              type="text"
              placeholder="e.g. T-12"
              value={newTableConfig.name}
              onChange={(e) => setNewTableConfig({ ...newTableConfig, name: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Seats</label>
            <input
              type="number"
              placeholder="e.g. 4"
              value={newTableConfig.seats}
              onChange={(e) => setNewTableConfig({ ...newTableConfig, seats: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Area</label>
            <select
              value={newTableConfig.areaId}
              onChange={(e) => setNewTableConfig({ ...newTableConfig, areaId: e.target.value })}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                marginTop: '8px',
              }}
            >
              <option value="">Select Area</option>
              {appData.areas?.map((a: any) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 32 }}>
            <button className="btn btn-prev" style={{ flex: 1 }} onClick={onClose}>
              Cancel
            </button>
            <button
              className="btn btn-next"
              style={{ flex: 1 }}
              onClick={handleSaveTable}
              disabled={!newTableConfig.areaId}
            >
              Save Table
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
