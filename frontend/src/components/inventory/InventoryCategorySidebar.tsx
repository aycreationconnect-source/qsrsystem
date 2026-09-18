import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button, Tooltip } from '../ui';
import { Plus, FolderTree, Search, Layers, AlertTriangle, Boxes, Edit2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { InventoryCategory } from '../../types/app.types';

interface InventoryCategorySidebarProps {
  categories: InventoryCategory[];
  selectedCategory: string;
  setSelectedCategory: (categoryName: string) => void;
  onAddCategory: () => void;
  onEditCategory: (category: InventoryCategory) => void;
}

export const InventoryCategorySidebar: React.FC<InventoryCategorySidebarProps> = ({
  categories,
  selectedCategory,
  setSelectedCategory,
  onAddCategory,
  onEditCategory,
}) => {
  const { appData } = useApp();
  const [catSearch, setCatSearch] = useState('');

  const inventory = appData.inventory || [];

  // Filter categories by search term
  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(catSearch.toLowerCase())
  );

  // Global counts for "All Raw Materials"
  const totalAllItems = inventory.length;
  const totalLowStock = inventory.filter((i) => i.stock <= i.threshold).length;
  const isAllSelected = selectedCategory === 'All';

  return (
    <div className="w-full md:w-64 lg:w-72 xl:w-80 h-full flex flex-col bg-white dark:bg-stone-900 border-r border-stone-200/80 dark:border-stone-800 shrink-0 select-none">
      {/* Top Header */}
      <div className="px-4 py-3 border-b border-stone-200/80 dark:border-stone-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <FolderTree className="w-4 h-4 text-amber-500 shrink-0" />
          <h3 className="text-sm font-extrabold text-stone-900 dark:text-stone-100">
            Categories
          </h3>
          <span className="text-xs text-stone-400 font-medium shrink-0">
            ({categories.length} Sections)
          </span>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={onAddCategory}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
          className="text-xs font-bold py-1 px-2.5 cursor-pointer"
        >
          Add
        </Button>
      </div>

      {/* Search Input Filter */}
      <div className="p-3 border-b border-stone-100 dark:border-stone-800/80 shrink-0">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Filter categories..."
            value={catSearch}
            onChange={(e) => setCatSearch(e.target.value)}
            className="w-full bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 text-xs pl-8 pr-3 py-1.5 rounded-xl border border-transparent focus:border-amber-500 focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Category List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {/* 'All Raw Materials' option */}
        <div
          onClick={() => setSelectedCategory('All')}
          className={cn(
            'p-3.5 rounded-2xl border transition-all cursor-pointer select-none flex flex-col gap-2',
            isAllSelected
              ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-500 ring-1 ring-amber-500 shadow-sm'
              : 'bg-white dark:bg-stone-850 border-stone-200/80 dark:border-stone-750 hover:border-stone-300 dark:hover:border-stone-700'
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className={cn(
                  'w-5 h-5 rounded-md text-[10px] font-bold flex items-center justify-center shrink-0',
                  isAllSelected
                    ? 'bg-amber-500 text-white'
                    : 'bg-stone-100 dark:bg-stone-750 text-stone-500'
                )}
              >
                <Layers className="w-3 h-3" />
              </span>
              <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 truncate">
                All Raw Materials
              </h4>
            </div>

            <span
              className={cn(
                'text-[10px] font-extrabold px-2 py-0.5 rounded-full',
                isAllSelected
                  ? 'bg-amber-500 text-white'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
              )}
            >
              {totalAllItems}
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap text-[10px] font-bold">
            <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
              Total: {totalAllItems}
            </span>
            {totalLowStock > 0 && (
              <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50 flex items-center gap-1">
                <AlertTriangle className="w-2.5 h-2.5" />
                <span>{totalLowStock} Low Stock</span>
              </span>
            )}
          </div>
        </div>

        {/* Dynamic Category Items */}
        {filteredCategories.map((cat, i) => {
          const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase();
          const itemsInCat = inventory.filter(
            (item) => (item.category || 'General').toLowerCase() === cat.name.toLowerCase()
          );
          const lowStockCount = itemsInCat.filter((item) => item.stock <= item.threshold).length;
          const goodStockCount = itemsInCat.length - lowStockCount;
          const isInactive = cat.status === 'Inactive';

          return (
            <div
              key={cat.id || i}
              onClick={() => setSelectedCategory(cat.name)}
              className={cn(
                'p-3.5 rounded-2xl border transition-all cursor-pointer select-none flex flex-col gap-2',
                isSelected
                  ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-500 ring-1 ring-amber-500 shadow-sm'
                  : 'bg-white dark:bg-stone-850 border-stone-200/80 dark:border-stone-750 hover:border-stone-300 dark:hover:border-stone-700'
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={cn(
                      'w-5 h-5 rounded-md text-[10px] font-bold flex items-center justify-center shrink-0',
                      isSelected
                        ? 'bg-amber-500 text-white'
                        : 'bg-stone-100 dark:bg-stone-750 text-stone-500'
                    )}
                  >
                    {i + 1}
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 truncate">
                    {cat.name}
                  </h4>
                  {isInactive && (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-stone-200 dark:bg-stone-750 text-stone-600 dark:text-stone-400 shrink-0">
                      Inactive
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span
                    className={cn(
                      'text-[10px] font-extrabold px-2 py-0.5 rounded-full',
                      isSelected
                        ? 'bg-amber-500 text-white'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
                    )}
                  >
                    {itemsInCat.length}
                  </span>

                  <Tooltip content="Edit Category" position="top" align="end">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditCategory(cat);
                      }}
                      className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-750 transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </Tooltip>
                </div>
              </div>

              {/* Status breakdown pills: Good Stock & Low Stock */}
              <div className="flex items-center gap-1.5 flex-wrap text-[10px] font-bold">
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                  {goodStockCount} Good Stock
                </span>
                {lowStockCount > 0 && (
                  <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50 flex items-center gap-1">
                    <AlertTriangle className="w-2.5 h-2.5" />
                    <span>{lowStockCount} Low Stock</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {filteredCategories.length === 0 && catSearch && (
          <div className="py-8 text-center text-stone-400">
            <Boxes className="w-6 h-6 mx-auto mb-1.5 opacity-40" />
            <p className="text-xs font-semibold">No category matches "{catSearch}"</p>
          </div>
        )}
      </div>
    </div>
  );
};
