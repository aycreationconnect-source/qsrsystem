import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { inventoryApi } from '../../api/inventoryApi';
import { InventoryCategorySidebar } from './InventoryCategorySidebar';
import { InventoryTable } from './InventoryTable';
import { UpdateStockModal } from './UpdateStockModal';
import { HistoryModal } from './HistoryModal';
import { AddCategoryModal } from './AddCategoryModal';
import { AddInventoryItemModal } from './AddInventoryItemModal';
import { Button } from '../ui';
import { Boxes, Plus, Search, X, AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { InventoryCategory } from '../../types/app.types';

export const InventoryView: React.FC = () => {
  const { appData } = useApp();

  const [categories, setCategories] = useState<InventoryCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [stockStatusFilter, setStockStatusFilter] = useState<'All' | 'Good Stock' | 'Low Stock' | 'Out of Stock'>('All');

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
  const [categoryToEdit, setCategoryToEdit] = useState<InventoryCategory | null>(null);
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

  // Clear search and reset status filter when switching categories
  useEffect(() => {
    setSearchQuery('');
  }, [selectedCategory]);

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

  const handleAddCategory = () => {
    setCategoryToEdit(null);
    setShowAddCategoryModal(true);
  };

  const handleEditCategory = (cat: InventoryCategory) => {
    setCategoryToEdit(cat);
    setShowAddCategoryModal(true);
  };

  // Filter items strictly belonging to the selected category (or all)
  const categoryItems = useMemo(() => {
    return appData.inventory.filter((item) => {
      if (selectedCategory === 'All') return true;
      const catName = item.category || 'General';
      return catName.toLowerCase() === selectedCategory.toLowerCase();
    });
  }, [appData.inventory, selectedCategory]);

  // Overall stats for the current category
  const totalItemsCount = categoryItems.length;
  const lowStockCount = categoryItems.filter((i) => i.stock <= i.threshold && i.stock > 0).length;
  const outOfStockCount = categoryItems.filter((i) => i.stock <= 0).length;
  const goodStockCount = categoryItems.filter((i) => i.stock > i.threshold).length;

  // Filter items by status filter and search query
  const displayItems = useMemo(() => {
    return categoryItems.filter((item) => {
      // Stock status filter
      if (stockStatusFilter === 'Good Stock' && item.stock <= item.threshold) return false;
      if (stockStatusFilter === 'Low Stock' && (item.stock > item.threshold || item.stock <= 0)) return false;
      if (stockStatusFilter === 'Out of Stock' && item.stock > 0) return false;

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const itemName = (item.item || item.name || '').toLowerCase();
        const itemCat = (item.category || '').toLowerCase();
        return itemName.includes(query) || itemCat.includes(query);
      }

      return true;
    });
  }, [categoryItems, stockStatusFilter, searchQuery]);

  return (
    <div className="h-full flex flex-col md:flex-row overflow-hidden bg-stone-50/50 dark:bg-stone-950/30">
      {/* Left Column: Category Sidebar */}
      <InventoryCategorySidebar
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        onAddCategory={handleAddCategory}
        onEditCategory={handleEditCategory}
      />

      {/* Right Column: Content Panel */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {/* Top Header Row: Category Title, Search & Add Item Button */}
        <div className="p-4 sm:p-5 bg-white dark:bg-stone-900 border-b border-stone-200/80 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="min-w-0">
            <h3 className="text-base font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Boxes className="w-5 h-5 text-amber-500 shrink-0" />
              <span className="truncate">{selectedCategory === 'All' ? 'All Raw Materials' : selectedCategory}</span>
              <span className="text-xs font-semibold text-stone-400 shrink-0">
                ({totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'})
              </span>
            </h3>

            {/* Quick stock status pills summary using simple terms */}
            <div className="flex items-center gap-3 mt-1 text-[11px] font-semibold text-stone-500 dark:text-stone-400">
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Good Stock: {goodStockCount}
              </span>
              {lowStockCount > 0 && (
                <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="w-3 h-3" />
                  Low Stock: {lowStockCount}
                </span>
              )}
              {outOfStockCount > 0 && (
                <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  Out of Stock: {outOfStockCount}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Search Raw Material */}
            <div className="relative flex-1 sm:w-60 md:w-68 shrink-0">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search raw materials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-[36px] bg-stone-50 dark:bg-stone-800/80 text-stone-900 dark:text-stone-100 placeholder-stone-400 text-xs sm:text-sm pl-9 pr-8 rounded-xl border border-stone-200 dark:border-stone-700 focus:border-amber-500 focus:bg-white dark:focus:bg-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-0.5 rounded-full hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Add Raw Item Button */}
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowAddItemModal(true)}
              leftIcon={<Plus className="w-4 h-4" />}
              className="font-bold cursor-pointer whitespace-nowrap shrink-0"
            >
              Add Raw Item
            </Button>
          </div>
        </div>

        {/* Status Filter Chips Bar with Simple Terminology */}
        <div className="px-4 sm:px-6 py-2 bg-stone-50/80 dark:bg-stone-900/60 border-b border-stone-200/60 dark:border-stone-800/60 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
          {(['All', 'Good Stock', 'Low Stock', 'Out of Stock'] as const).map((status) => {
            const isFilterActive = stockStatusFilter === status;
            const count =
              status === 'All'
                ? totalItemsCount
                : status === 'Good Stock'
                ? goodStockCount
                : status === 'Low Stock'
                ? lowStockCount
                : outOfStockCount;

            return (
              <button
                key={status}
                type="button"
                onClick={() => setStockStatusFilter(status)}
                className={cn(
                  'px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer',
                  isFilterActive
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-white dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-750'
                )}
              >
                <span>{status}</span>
                <span
                  className={cn(
                    'text-[10px] px-1.5 py-0.2 rounded-full font-extrabold',
                    isFilterActive
                      ? 'bg-amber-600/60 text-white'
                      : 'bg-stone-100 dark:bg-stone-700 text-stone-500 dark:text-stone-300'
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          <InventoryTable
            items={displayItems}
            selectedCategoryName={selectedCategory}
            onUpdateStock={handleEditInventory}
            onViewHistory={handleViewHistory}
          />
        </div>
      </div>

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
        onClose={() => {
          setShowAddCategoryModal(false);
          setCategoryToEdit(null);
        }}
        categoryToEdit={categoryToEdit}
        onCategorySaved={(savedCat) => {
          setCategories((prev) => {
            const exists = prev.some((c) => c.id === savedCat.id);
            if (exists) {
              return prev.map((c) => (c.id === savedCat.id ? savedCat : c));
            }
            return [...prev, savedCat];
          });
          setSelectedCategory(savedCat.name);
        }}
      />

      <AddInventoryItemModal
        show={showAddItemModal}
        onClose={() => setShowAddItemModal(false)}
        categories={categories}
        defaultCategory={selectedCategory === 'All' ? (categories[0]?.name || 'General') : selectedCategory}
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
