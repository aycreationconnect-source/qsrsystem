import React from 'react';
import { tableApi } from '../../api/tableApi';
import { useApp } from '../../context/AppContext';

interface AreaModalProps {
  show: boolean;
  onClose: () => void;
  editingAreaId: number | null;
  newArea: { name: string; description: string };
  setNewArea: React.Dispatch<React.SetStateAction<{ name: string; description: string }>>;
}

export const AreaModal: React.FC<AreaModalProps> = ({
  show,
  onClose,
  editingAreaId,
  newArea,
  setNewArea,
}) => {
  const { fetchBackendData } = useApp();

  if (!show) return null;

  const handleSaveArea = async () => {
    try {
      if (editingAreaId) {
        await tableApi.updateArea(editingAreaId, newArea);
      } else {
        await tableApi.createArea(newArea);
      }
      onClose();
      fetchBackendData();
    } catch (e) {
      console.error('Failed to save area:', e);
    }
  };

  return (
    <div className="modal-overlay">
      <div
        className="modal-content"
        style={{ width: 500, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
      >
        <div className="modal-header">
          <h2>{editingAreaId ? 'Edit Area' : 'Add New Area'}</h2>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-body" style={{ overflowY: 'auto', paddingRight: 8 }}>
          <div className="form-group">
            <label>Area Name</label>
            <input
              type="text"
              placeholder="e.g. Main Dining"
              value={newArea.name}
              onChange={(e) => setNewArea({ ...newArea, name: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              rows={3}
              placeholder="Brief description..."
              value={newArea.description}
              onChange={(e) => setNewArea({ ...newArea, description: e.target.value })}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                marginTop: '8px',
                resize: 'vertical',
              }}
            ></textarea>
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 32 }}>
            <button className="btn btn-prev" style={{ flex: 1 }} onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-next" style={{ flex: 1 }} onClick={handleSaveArea}>
              Save Area
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
