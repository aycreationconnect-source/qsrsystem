import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { inventoryApi } from '../../api/inventoryApi';
import { Modal, Button, Input } from '../ui';
import { Boxes, AlertTriangle, CheckCircle2 } from 'lucide-react';

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
  const { appData, setAppData, refreshInventory } = useApp();
  const [isSaving, setIsSaving] = useState(false);

  if (!show || editingInventoryIndex === null || !appData.inventory[editingInventoryIndex]) {
    return null;
  }

  const currentItem = appData.inventory[editingInventoryIndex];
  const stockVal = parseFloat(inventoryUpdateData.stock) || 0;
  const threshVal = parseFloat(inventoryUpdateData.threshold) || 0;

  let computedStatus = 'Good';
  let badgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800';
  if (stockVal <= 0) {
    computedStatus = 'Out of Stock';
    badgeClass = 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800';
  } else if (stockVal <= threshVal) {
    computedStatus = 'Low Stock Alert';
    badgeClass = 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800';
  }

  const handleSave = async () => {
    try {
      setIsSaving(true);
      let status = 'Good';
      if (stockVal <= 0) status = 'Out of Stock';
      else if (stockVal <= threshVal) status = 'Low Stock';

      if (currentItem.id) {
        await inventoryApi.updateInventory(currentItem.id, {
          stock: stockVal,
          threshold: threshVal,
        });
        await refreshInventory();
      } else {
        const newAppData = { ...appData };
        const item = newAppData.inventory[editingInventoryIndex];
        item.stock = stockVal;
        item.threshold = threshVal;
        item.status = status;
        setAppData(newAppData);
      }

      onClose();
    } catch (e) {
      console.error('Failed to update inventory:', e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={show}
      onClose={onClose}
      title={`Adjust Stock: ${currentItem.item}`}
      description={`Update current on-hand inventory levels and low-stock replenishment alert limits (${currentItem.unit}).`}
      maxWidth="md"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            isLoading={isSaving}
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
          >
            Confirm Stock Count
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Status Indicator */}
        <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-850 border border-stone-200/80 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Boxes className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-bold text-stone-700 dark:text-stone-300">
              Computed Stock Status:
            </span>
          </div>
          <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold border ${badgeClass}`}>
            {computedStatus}
          </span>
        </div>

        {/* Stock Level Input */}
        <div>
          <Input
            label={`Current Stock Level (${currentItem.unit})`}
            type="number"
            step="0.01"
            placeholder="0"
            value={inventoryUpdateData.stock}
            onChange={(e) =>
              setInventoryUpdateData({ ...inventoryUpdateData, stock: e.target.value })
            }
            leftIcon={<Boxes className="w-4 h-4" />}
            required
          />
        </div>

        {/* Minimum Threshold Input */}
        <div>
          <Input
            label={`Low Stock Alert Threshold (${currentItem.unit})`}
            type="number"
            step="0.01"
            placeholder="e.g. 10"
            value={inventoryUpdateData.threshold}
            onChange={(e) =>
              setInventoryUpdateData({ ...inventoryUpdateData, threshold: e.target.value })
            }
            leftIcon={<AlertTriangle className="w-4 h-4" />}
            required
          />
          <p className="text-[11px] text-stone-400 mt-1">
            When available stock drops to or below this amount, the system will highlight the item for replenishment.
          </p>
        </div>
      </div>
    </Modal>
  );
};
