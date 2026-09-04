import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { menuApi } from '../../api/menuApi';
import { Modal, Input, Button } from '../ui';
import {
  UtensilsCrossed,
  IndianRupee,
  Clock,
  Barcode,
  Image as ImageIcon,
  CheckCircle2,
  FileText,
} from 'lucide-react';

interface ItemModalProps {
  show: boolean;
  onClose: () => void;
  editingItemIndex: number | null;
  newItem: any;
  setNewItem: React.Dispatch<React.SetStateAction<any>>;
  selectedCategory: string | null;
}

export const ItemModal: React.FC<ItemModalProps> = ({
  show,
  onClose,
  editingItemIndex,
  newItem,
  setNewItem,
  selectedCategory,
}) => {
  const { appData, refreshMenu } = useApp();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newItem.name?.trim() || !newItem.price) {
      setError('Item Name and Price are required.');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      const catToUse =
        newItem.category ||
        selectedCategory ||
        (appData.categories.length > 0
          ? typeof appData.categories[0] === 'string'
            ? appData.categories[0]
            : appData.categories[0].name
          : 'Uncategorized');

      const numericPrice = parseFloat(String(newItem.price).replace(/[^0-9.]/g, '')) || 0;

      const finalItem = {
        ...newItem,
        name: newItem.name.trim(),
        price: `₹${numericPrice.toFixed(2)}`,
        category: catToUse,
        available: newItem.available !== false,
        status: newItem.status || 'Active',
      };

      if (editingItemIndex !== null) {
        const existingItem = appData.menu[editingItemIndex];
        if (existingItem && existingItem.id) {
          await menuApi.updateMenuItem(existingItem.id, finalItem);
          await refreshMenu();
        }
      } else {
        await menuApi.createMenuItem(finalItem);
        await refreshMenu();
      }

      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save item');
    } finally {
      setIsSaving(false);
    }
  };

  const dietTypes = [
    { label: 'Veg', icon: '🟢', color: 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300' },
    { label: 'Non-Veg', icon: '🔴', color: 'border-rose-400 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300' },
    { label: 'Egg', icon: '🟡', color: 'border-amber-400 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300' },
    { label: 'Vegan', icon: '🌱', color: 'border-green-400 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300' },
  ];

  return (
    <Modal
      isOpen={show}
      onClose={onClose}
      title={
        editingItemIndex !== null
          ? newItem.isAddon
            ? 'Edit Add-on'
            : 'Edit Dish / Beverage'
          : newItem.isAddon
          ? 'Create Add-on'
          : 'Add New Dish / Beverage'
      }
      description="Set dish details, pricing, prep timing, and dietary tags."
      maxWidth="lg"
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
            {editingItemIndex !== null ? 'Update Dish' : 'Save Dish'}
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

        {/* Visibility & Availability Bar */}
        {!newItem.isAddon && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-850 border border-stone-200/80 dark:border-stone-800">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-stone-900 dark:text-stone-100 block">
                  Available for Order
                </span>
                <span className="text-[11px] text-stone-500 dark:text-stone-400">
                  {newItem.available !== false ? 'In stock on POS' : 'Marked sold out'}
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={newItem.available !== false}
                  onChange={(e) => setNewItem({ ...newItem, available: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-stone-300 peer-focus:outline-none rounded-full peer dark:bg-stone-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between sm:border-l sm:border-stone-200 sm:dark:border-stone-800 sm:pl-3">
              <div>
                <span className="text-xs font-bold text-stone-900 dark:text-stone-100 block">
                  Item Status
                </span>
                <span className="text-[11px] text-stone-500 dark:text-stone-400">
                  {newItem.status === 'Active' ? 'Active on menu' : 'Archived / Inactive'}
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={newItem.status === 'Active'}
                  onChange={(e) =>
                    setNewItem({ ...newItem, status: e.target.checked ? 'Active' : 'Inactive' })
                  }
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-stone-300 peer-focus:outline-none rounded-full peer dark:bg-stone-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>
          </div>
        )}

        {/* Item Name & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-7">
            <Input
              label="Dish / Beverage Name"
              required
              placeholder="e.g. Cappuccino, Butter Chicken, Truffle Fries"
              value={newItem.name || ''}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              leftIcon={<UtensilsCrossed className="w-4 h-4" />}
            />
          </div>

          <div className="sm:col-span-5">
            <label className="text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5 block">
              Category
            </label>
            <select
              value={newItem.category || selectedCategory || ''}
              onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
              className="w-full h-10 px-3 rounded-2xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 text-xs font-semibold text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 cursor-pointer"
            >
              {appData.categories.map((c: any) => {
                const name = typeof c === 'string' ? c : c.name;
                return (
                  <option key={name} value={name}>
                    {name}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Dietary Classification */}
        {!newItem.isAddon && (
          <div>
            <label className="text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5 block">
              Dietary Preference
            </label>
            <div className="grid grid-cols-4 gap-2">
              {dietTypes.map((dt) => {
                const isSelected = (newItem.type || 'Veg') === dt.label;
                return (
                  <button
                    key={dt.label}
                    type="button"
                    onClick={() => setNewItem({ ...newItem, type: dt.label })}
                    className={`py-2 px-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? `${dt.color} ring-2 ring-amber-500/20 shadow-sm`
                        : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-850'
                    }`}
                  >
                    <span>{dt.icon}</span>
                    <span>{dt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Pricing & Prep Timing */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <Input
              label="Price (₹)"
              required
              type="number"
              step="0.5"
              placeholder="0.00"
              value={
                typeof newItem.price === 'string'
                  ? newItem.price.replace(/[^0-9.]/g, '')
                  : newItem.price || ''
              }
              onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
              leftIcon={<IndianRupee className="w-4 h-4" />}
            />
          </div>

          <div>
            <Input
              label="Prep Time (Minutes)"
              type="number"
              placeholder="10"
              value={newItem.prepTime || ''}
              onChange={(e) => setNewItem({ ...newItem, prepTime: e.target.value })}
              leftIcon={<Clock className="w-4 h-4" />}
            />
          </div>

          <div>
            <Input
              label="Item Code / SKU"
              placeholder="e.g. CF-01"
              value={newItem.sku || ''}
              onChange={(e) => setNewItem({ ...newItem, sku: e.target.value })}
              leftIcon={<Barcode className="w-4 h-4" />}
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-stone-400" />
            <span>Description</span>
          </label>
          <textarea
            rows={2}
            placeholder="Ingredients, allergen warnings, or taste highlights..."
            value={newItem.description || ''}
            onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-2xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all resize-none"
          />
        </div>

        {/* Image File */}
        <div>
          <label className="text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5 flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-stone-400" />
            <span>Dish Photo (Optional)</span>
          </label>
          <div className="flex items-center gap-3">
            {newItem.image && (
              <img
                src={newItem.image}
                alt="Preview"
                className="w-12 h-12 rounded-xl object-cover border border-stone-200 dark:border-stone-700 shrink-0"
              />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setNewItem({ ...newItem, image: URL.createObjectURL(file) });
                }
              }}
              className="text-xs text-stone-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 cursor-pointer"
            />
          </div>
        </div>
      </form>
    </Modal>
  );
};
