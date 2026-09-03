import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { InventoryTable } from './InventoryTable';
import { UpdateStockModal } from './UpdateStockModal';
import { HistoryModal } from './HistoryModal';
import { Button } from '../ui';
import { Boxes, Plus } from 'lucide-react';

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
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Card */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Boxes className="w-5 h-5 text-amber-500" />
            <span>Raw Material & Stock Tracking</span>
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Real-time depletion on every order settled at POS.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            if (appData.inventory.length > 0) {
              handleEditInventory(0);
            }
          }}
          leftIcon={<Plus className="w-4 h-4" />}
          className="font-bold"
        >
          Update Stock
        </Button>
      </div>

      {/* Inventory Table */}
      <InventoryTable onUpdateStock={handleEditInventory} onViewHistory={handleViewHistory} />

      {/* Modals */}
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
