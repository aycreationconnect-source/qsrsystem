import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { inventoryApi } from '../../api/inventoryApi';
import { Modal, Button, Input, Select, type SelectOption } from '../ui';
import { toast } from '../../context/ToastContext';
import { Boxes, CheckCircle2, AlertTriangle } from 'lucide-react';
import type { InventoryCategory } from '../../types/app.types';

interface AddInventoryItemModalProps {
  show: boolean;
  onClose: () => void;
  categories: InventoryCategory[];
  defaultCategory?: string | null;
}

const UNIT_OPTIONS: SelectOption[] = [
  { value: 'pcs', label: 'Pieces (pcs)', badge: 'Count' },
  { value: 'kg', label: 'Kilograms (kg)', badge: 'Weight' },
  { value: 'g', label: 'Grams (g)', badge: 'Weight' },
  { value: 'L', label: 'Liters (L)', badge: 'Volume' },
  { value: 'ml', label: 'Milliliters (ml)', badge: 'Volume' },
  { value: 'slice', label: 'Slices (slice)', badge: 'Portion' },
  { value: 'portion', label: 'Portions (portion)', badge: 'Portion' },
  { value: 'box', label: 'Boxes (box)', badge: 'Package' },
];

export const AddInventoryItemModal: React.FC<AddInventoryItemModalProps> = ({
  show,
  onClose,
  categories,
  defaultCategory,
}) => {
  const { refreshInventory } = useApp();
  const [name, setName] = useState('');
  const [category, setCategory] = useState(defaultCategory || 'General');
  const [unit, setUnit] = useState('pcs');
  const [stock, setStock] = useState('');
  const [threshold, setThreshold] = useState('10');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync default category if prop changes when opening
  React.useEffect(() => {
    if (show) {
      setCategory(defaultCategory && defaultCategory !== 'All' ? defaultCategory : (categories[0]?.name || 'General'));
      setName('');
      setStock('');
      setThreshold('10');
      setUnit('pcs');
      setError(null);
    }
  }, [show, defaultCategory, categories]);

  if (!show) return null;

  const categoryOptions: SelectOption[] = categories.map((c) => ({
    value: c.name,
    label: c.name,
    badge: c.status === 'Inactive' ? 'Inactive' : undefined,
  }));

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name.trim()) {
      setError('Item Name is required.');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      const stockNum = parseFloat(stock) || 0;
      const threshNum = parseFloat(threshold) || 0;

      await inventoryApi.createInventory({
        item: name.trim(),
        name: name.trim(),
        category: category || 'General',
        unit: unit || 'pcs',
        stock: stockNum,
        threshold: threshNum,
        status: stockNum <= threshNum ? (stockNum <= 0 ? 'Out of Stock' : 'Low Stock') : 'Good Stock',
      });

      await refreshInventory();
      toast.success(`Inventory item "${name.trim()}" added!`);
      onClose();
    } catch (err: any) {
      const msg = err.message || 'Failed to add item to inventory.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={show}
      onClose={onClose}
      title="Add New Raw Material / Item"
      description="Track a new ingredient or stock item under an inventory category."
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
            Save Item
          </Button>
        </>
      }
    >
      <form onSubmit={handleSave} className="space-y-4">
        {error && (
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 text-xs font-semibold border border-rose-200 dark:border-rose-900/50">
            {error}
          </div>
        )}

        {/* Item Name */}
        <Input
          label="Item / Raw Material Name *"
          placeholder="e.g. Milk, Burger Buns, Coffee Beans, Tomato Sauce"
          value={name}
          onChange={(e) => setName(e.target.value)}
          leftIcon={<Boxes className="w-4 h-4" />}
          required
        />

        {/* Category & Unit with Rich Custom Dropdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Category"
            options={categoryOptions}
            value={category}
            onChange={(val) => setCategory(String(val))}
            searchable={false}
            triggerClassName="min-h-[42px] h-[42px]"
          />

          <Select
            label="Unit of Measure"
            options={UNIT_OPTIONS}
            value={unit}
            onChange={(val) => setUnit(String(val))}
            searchable={false}
            triggerClassName="min-h-[42px] h-[42px]"
          />
        </div>

        {/* Initial Stock & Threshold */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label={`Initial Stock (${unit}) *`}
            type="number"
            step="0.01"
            placeholder="0"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            leftIcon={<Boxes className="w-4 h-4" />}
            required
          />

          <Input
            label={`Low Stock Alert (${unit}) *`}
            type="number"
            step="0.01"
            placeholder="10"
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            leftIcon={<AlertTriangle className="w-4 h-4" />}
            required
          />
        </div>
      </form>
    </Modal>
  );
};
