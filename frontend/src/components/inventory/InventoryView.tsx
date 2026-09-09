import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { inventoryApi } from '../../api/inventoryApi';
import { InventoryTable } from './InventoryTable';
import { UpdateStockModal } from './UpdateStockModal';
import { HistoryModal } from './HistoryModal';
import { AddCategoryModal } from './AddCategoryModal';
import { AddInventoryItemModal } from './AddInventoryItemModal';
import { Button } from '../ui';
import { Boxes, Plus, FolderPlus, Layers, AlertTriangle } from 'lucide-react';
import type { InventoryCategory } from '../../types/app.types';

export const InventoryView: React.FC = () => {
  const { appData } = useApp();

  const [categories, setCategories] = useState<InventoryCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Modals
  const [showUpdateStockModal, setShowUpdateStockModal] = useState(false);
  const [editingInventoryIndex, setEditingInventoryIndex] = useState<number | null>(null);
  const [inventoryUpdateData, setInventoryUpdateData] = useState<{ stock: string; threshold: string; category?: string }>({
    stock: '',
    threshold: '',
    category: 'General',
  });

  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyItemIndex, setHistoryItemIndex] = useState<number | null>(null);

  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);

  // Fetch inventory categories from backend
  const fetchCategories = useCallback(async () => {
    try {
      const cats = await inventoryApi.getCategories();
      if (Array.isArray(cats)) {
        setCategories(cats);
      }
    } catch (e) {
      console.error('Failed to fetch inventory categories:', e);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleEditInventory = (index: number) => {
    const item = appData.inventory[index];
    if (!item) return;
    setInventoryUpdateData({
      stock: item.stock.toString(),
      threshold: item.threshold.toString(),
      category: item.category || 'General',
    });
    setEditingInventoryIndex(index);
    setShowUpdateStockModal(true);
  };

  const handleViewHistory = (index: number) => {
    setHistoryItemIndex(index);
    setShowHistoryModal(true);
  };

  // Filter items based on selected category
  const filteredItems = appData.inventory.filter((item) => {
    if (selectedCategory === 'All') return true;
    const catName = item.category || 'General';
    return catName.toLowerCase() === selectedCategory.toLowerCase();
  });

  // Calculate stats for current filter
  const totalItemsCount = filteredItems.length;
  const lowStockCount = filteredItems.filter((i) => i.stock <= i.threshold).length;
  const outOfStockCount = filteredItems.filter((i) => i.stock <= 0).length;

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
            Organize ingredients by category with real-time automatic depletion on every POS order.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddCategoryModal(true)}
            leftIcon={<FolderPlus className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
            className="font-bold"
          >
            Add Category
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowAddItemModal(true)}
            leftIcon={<Plus className="w-4 h-4" />}
            className="font-bold"
          >
            Add Raw Item
          </Button>
        </div>
      </div>

      {/* Category Navigation Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => setSelectedCategory('All')}
          className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
            selectedCategory === 'All'
              ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
              : 'bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-850'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>All Categories</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
              selectedCategory === 'All'
                ? 'bg-amber-600/60 text-white'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
            }`}
          >
            {appData.inventory.length}
          </span>
        </button>

        {categories.map((cat) => {
          const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase();
          const itemsInCat = appData.inventory.filter(
            (i) => (i.category || 'General').toLowerCase() === cat.name.toLowerCase()
          );
          const hasLowStock = itemsInCat.some((i) => i.stock <= i.threshold);

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
                isSelected
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                  : 'bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-850'
              }`}
            >
              <span>{cat.name}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold flex items-center gap-1 ${
                  isSelected
                    ? 'bg-amber-600/60 text-white'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
                }`}
              >
                {hasLowStock && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block" />}
                {itemsInCat.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Category Summary Bar */}
      <div className="px-4 py-3 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 font-bold text-stone-800 dark:text-stone-200">
          <span>Viewing:</span>
          <span className="px-2.5 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/80 dark:border-amber-900/60">
            {selectedCategory === 'All' ? 'All Raw Materials' : selectedCategory}
          </span>
          <span className="text-stone-400 font-normal">({totalItemsCount} items)</span>
        </div>

        <div className="flex items-center gap-4 text-[11px] font-semibold text-stone-500 dark:text-stone-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Optimal: {totalItemsCount - lowStockCount}</span>
          </div>

          {lowStockCount > 0 && (
            <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Low Stock: {lowStockCount - outOfStockCount}</span>
            </div>
          )}

          {outOfStockCount > 0 && (
            <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>Depleted: {outOfStockCount}</span>
            </div>
          )}
        </div>
      </div>

      {/* Inventory Table */}
      <InventoryTable
        items={filteredItems}
        selectedCategoryName={selectedCategory}
        onUpdateStock={handleEditInventory}
        onViewHistory={handleViewHistory}
      />

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
        categories={categories}
      />

      <AddCategoryModal
        show={showAddCategoryModal}
        onClose={() => setShowAddCategoryModal(false)}
        onCategoryCreated={(newCat) => {
          setCategories((prev) => [...prev, newCat]);
          setSelectedCategory(newCat.name);
        }}
      />

      <AddInventoryItemModal
        show={showAddItemModal}
        onClose={() => setShowAddItemModal(false)}
        categories={categories}
        defaultCategory={selectedCategory === 'All' ? categories[0]?.name || 'General' : selectedCategory}
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

