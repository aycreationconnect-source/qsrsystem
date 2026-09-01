import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { InventoryTable } from './InventoryTable';
import { UpdateStockModal } from './UpdateStockModal';
import { HistoryModal } from './HistoryModal';

export const InventoryView: React.FC = () => {
  const { appData } = useApp();

  const [showUpdateStockModal, setShowUpdateStockModal] = useState(false);
  const [editingInventoryIndex, setEditingInventoryIndex] = useState<number | null>(null);
  const [inventoryUpdateData, setInventoryUpdateData] = useState({ stock: '', threshold: '' });

  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyItemIndex, setHistoryItemIndex] = useState<number | null>(null);

  const handleEditInventory = (index: number) => {
    const item = appData.inventory[index];
    setInventoryUpdateData({ stock: item.stock.toString(), threshold: item.threshold.toString() });
    setEditingInventoryIndex(index);
    setShowUpdateStockModal(true);
  };

  const handleViewHistory = (index: number) => {
    setHistoryItemIndex(index);
    setShowHistoryModal(true);
  };

  return (
    <div className="admin-content">
      <div className="admin-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3>Stock & Inventory</h3>
          <button
            className="btn btn-next"
            onClick={() => {
              if (appData.inventory.length > 0) {
                handleEditInventory(0);
              }
            }}
          >
            + Update Stock
          </button>
        </div>

        <InventoryTable onUpdateStock={handleEditInventory} onViewHistory={handleViewHistory} />
      </div>

      <UpdateStockModal
        show={showUpdateStockModal}
        onClose={() => {
          setShowUpdateStockModal(false);
          setEditingInventoryIndex(null);
        }}
        editingInventoryIndex={editingInventoryIndex}
        inventoryUpdateData={inventoryUpdateData}
        setInventoryUpdateData={setInventoryUpdateData}
      />

      <HistoryModal
        show={showHistoryModal}
        onClose={() => {
          setShowHistoryModal(false);
          setHistoryItemIndex(null);
        }}
        historyItemIndex={historyItemIndex}
      />
    </div>
  );
};
