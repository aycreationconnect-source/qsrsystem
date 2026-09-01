import React from 'react';
import { useApp } from '../../context/AppContext';
import { inventoryApi } from '../../api/inventoryApi';

interface UpdateStockModalProps {
  show: boolean;
  onClose: () => void;
  editingInventoryIndex: number | null;
  inventoryUpdateData: { stock: string; threshold: string };
  setInventoryUpdateData: React.Dispatch<React.SetStateAction<{ stock: string; threshold: string }>>;
}

export const UpdateStockModal: React.FC<UpdateStockModalProps> = ({
  show,
  onClose,
  editingInventoryIndex,
  inventoryUpdateData,
  setInventoryUpdateData,
}) => {
  const { appData, setAppData, fetchBackendData } = useApp();

  if (!show || editingInventoryIndex === null || !appData.inventory[editingInventoryIndex]) {
    return null;
  }

  const currentItem = appData.inventory[editingInventoryIndex];

  const handleSave = async () => {
    const stockVal = parseFloat(inventoryUpdateData.stock) || 0;
    const threshVal = parseFloat(inventoryUpdateData.threshold) || 0;
    let status = 'Good';
    if (stockVal <= 0) status = 'Out of Stock';
    else if (stockVal <= threshVal) status = 'Low Stock';

    if (currentItem.id) {
      await inventoryApi.updateInventory(currentItem.id, {
        stock: stockVal,
        threshold: threshVal,
      });
      fetchBackendData();
    } else {
      const newAppData = { ...appData };
      const item = newAppData.inventory[editingInventoryIndex];
      item.stock = stockVal;
      item.threshold = threshVal;
      item.status = status;
      setAppData(newAppData);
    }

    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ width: 400 }}>
        <div className="modal-header">
          <h2>Update Stock: {currentItem.item}</h2>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label>Current Stock ({currentItem.unit})</label>
            <input
              type="number"
              value={inventoryUpdateData.stock}
              onChange={(e) =>
                setInventoryUpdateData({ ...inventoryUpdateData, stock: e.target.value })
              }
            />
          </div>
          <div className="form-group" style={{ marginTop: 16 }}>
            <label>Alert Threshold ({currentItem.unit})</label>
            <input
              type="number"
              value={inventoryUpdateData.threshold}
              onChange={(e) =>
                setInventoryUpdateData({ ...inventoryUpdateData, threshold: e.target.value })
              }
            />
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 32 }}>
            <button className="btn btn-prev" style={{ flex: 1 }} onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-next" style={{ flex: 1 }} onClick={handleSave}>
              Save Stock
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
