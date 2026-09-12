import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Button, Tooltip, Modal } from '../ui';
import { menuApi } from '../../api/menuApi';
import {
  Plus,
  Settings2,
  Edit2,
  Trash2,
  UtensilsCrossed,
  Layers,
  Search,
  X,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface MenuItemsGridProps {
  selectedCategory: string | null;
  selectedSubcategory?: string | null;
  setSelectedSubcategory?: (sub: string | null) => void;
  onAddItem: (dietType?: string) => void;
  onConfigItem: (item: any) => void;
  onEditItem: (item: any) => void;
  onDeleteItem: (item: any) => void;
}

export const MenuItemsGrid: React.FC<MenuItemsGridProps> = ({
  selectedCategory,
  selectedSubcategory = null,
  setSelectedSubcategory,
  onAddItem,
  onConfigItem,
  onEditItem,
  onDeleteItem,
}) => {
  const { appData, refreshCategories } = useApp();

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Add Subcategory Modal State
  const [isAddSubcatModalOpen, setIsAddSubcatModalOpen] = useState(false);
  const [newSubcatName, setNewSubcatName] = useState('');
  const [isSavingSubcat, setIsSavingSubcat] = useState(false);
  const [subcatError, setSubcatError] = useState<string | null>(null);

  // Clear search when category changes
  useEffect(() => {
    setSearchQuery('');
  }, [selectedCategory]);

  // All menu items belonging to the selected category (excluding standalone add-ons)
  const allCategoryItems = useMemo(() => {
    if (!selectedCategory) return [];
    return (appData.menu || []).filter(
      (m: any) => m.category === selectedCategory && !m.isAddon
    );
  }, [appData.menu, selectedCategory]);

  // Items scoped by subcategory (if active)
  const subcategoryScopedItems = useMemo(() => {
    if (!selectedCategory) return [];
    return selectedSubcategory
      ? allCategoryItems.filter((m: any) => m.subcategory === selectedSubcategory)
      : allCategoryItems;
  }, [allCategoryItems, selectedCategory, selectedSubcategory]);

  // Filter items by search query
  const filteredItems = useMemo(() => {
    if (!selectedCategory) return [];
    return subcategoryScopedItems.filter((item: any) => {
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        if (!item.name?.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [subcategoryScopedItems, selectedCategory, searchQuery]);

  if (!selectedCategory) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-stone-400">
        <UtensilsCrossed className="w-12 h-12 mb-3 opacity-30 stroke-1" />
        <h4 className="font-bold text-sm text-stone-700 dark:text-stone-300">
          No Category Selected
        </h4>
        <p className="text-xs mt-1 max-w-xs">
          Select a category from the left sidebar to manage its dishes, prices, and recipes.
        </p>
      </div>
    );
  }

  // Find selected category object to check for subcategories
  const currentCatObj = (appData.categories || []).find((c: any) => {
    const name = typeof c === 'string' ? c : c.name;
    return name === selectedCategory;
  }) as any;

  const subcategories: string[] =
    currentCatObj && typeof currentCatObj !== 'string' && Array.isArray(currentCatObj.subcategories)
      ? currentCatObj.subcategories
      : [];

  const handleSaveSubcat = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newSubcatName.trim();
    if (!trimmed) {
      setSubcatError('Please enter a subcategory name');
      return;
    }

    if (!currentCatObj?.id) {
      setSubcatError('Category ID not found');
      return;
    }

    if (subcategories.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      setSubcatError(`Subcategory "${trimmed}" already exists in this category`);
      return;
    }

    try {
      setIsSavingSubcat(true);
      setSubcatError(null);
      await menuApi.addSubcategory(currentCatObj.id, trimmed);
      await refreshCategories();
      setSelectedSubcategory?.(trimmed);
      setNewSubcatName('');
      setIsAddSubcatModalOpen(false);
    } catch (err: any) {
      setSubcatError(err.message || 'Failed to add subcategory');
    } finally {
      setIsSavingSubcat(false);
    }
  };

  const handleDeleteSubcat = async (subNameToDelete: string) => {
    if (!currentCatObj?.id) return;
    if (!window.confirm(`Are you sure you want to delete subcategory "${subNameToDelete}"?`)) return;
    try {
      await menuApi.removeSubcategory(currentCatObj.id, subNameToDelete);
      await refreshCategories();
      if (selectedSubcategory === subNameToDelete) {
        setSelectedSubcategory?.(null);
      }
    } catch (err) {
      console.error('Failed to remove subcategory', err);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-stone-50/40 dark:bg-stone-950/20">
      {/* Top Header Row: Category Name, Search by Menu Name & Add Item Button */}
      <div className="p-4 sm:p-5 bg-white dark:bg-stone-900 border-b border-stone-200/80 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div className="min-w-0">
          <h3 className="text-base font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <span className="truncate">{selectedCategory}</span>
            <span className="text-xs font-semibold text-stone-400 shrink-0">
              ({allCategoryItems.length} {allCategoryItems.length === 1 ? 'item' : 'items'})
            </span>
          </h3>
          {subcategories.length > 0 && (
            <span className="text-[11px] text-stone-400 font-medium block mt-0.5">
              {subcategories.length} subcategories configured
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search by Menu Name (Moved to header row) */}
          <div className="relative flex-1 sm:w-64 md:w-72 shrink-0">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by menu name..."
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

          {/* Renamed to Add Item */}
          <Button
            variant="primary"
            size="sm"
            onClick={() => onAddItem('Veg')}
            leftIcon={<Plus className="w-4 h-4" />}
            className="font-bold cursor-pointer whitespace-nowrap shrink-0"
          >
            Add Item
          </Button>
        </div>
      </div>

      {/* Subcategories Filter Chips Bar with Direct '+' Button */}
      <div className="px-4 sm:px-6 py-2 bg-stone-50/80 dark:bg-stone-900/60 border-b border-stone-200/60 dark:border-stone-800/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
        <div className="flex items-center gap-1 text-[11px] font-bold text-stone-400 uppercase tracking-wider mr-1 shrink-0">
          <Layers className="w-3.5 h-3.5 text-amber-500" />
          <span>Subcategories:</span>
        </div>

        {subcategories.length > 0 ? (
          <>
            <button
              type="button"
              onClick={() => setSelectedSubcategory?.(null)}
              className={cn(
                'px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer',
                selectedSubcategory === null
                  ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-sm'
                  : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-stone-200/80 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-750'
              )}
            >
              All Subcategories ({allCategoryItems.length})
            </button>

            {subcategories.map((sub) => {
              const count = allCategoryItems.filter((m: any) => m.subcategory === sub).length;
              const isSubSelected = selectedSubcategory === sub;
              return (
                <div key={sub} className="relative inline-flex items-center group">
                  <button
                    type="button"
                    onClick={() => setSelectedSubcategory?.(isSubSelected ? null : sub)}
                    className={cn(
                      'px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5',
                      isSubSelected
                        ? 'bg-amber-500 text-stone-950 shadow-sm font-extrabold ring-1 ring-amber-400'
                        : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-stone-200/80 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-750'
                    )}
                  >
                    <span>{sub}</span>
                    <span
                      className={cn(
                        'text-[10px]',
                        isSubSelected ? 'text-stone-900 font-extrabold' : 'text-stone-400'
                      )}
                    >
                      ({count})
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSubcat(sub);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-0.5 -ml-1 mr-1 rounded-full text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer"
                    title={`Delete subcategory "${sub}"`}
                  >
                    <X className="w-3 h-3 stroke-[2.5]" />
                  </button>
                </div>
              );
            })}
          </>
        ) : (
          <span className="text-xs text-stone-400 italic mr-1">No subcategories</span>
        )}

        {/* Dedicated "+" Add Subcategory Button directly from Menugrid (Image 1) */}
        <button
          type="button"
          onClick={() => setIsAddSubcatModalOpen(true)}
          title={`Add subcategory directly into "${selectedCategory}"`}
          className="w-7 h-7 rounded-xl flex items-center justify-center bg-white dark:bg-stone-800 hover:bg-amber-500 text-stone-600 dark:text-stone-300 hover:text-stone-950 border border-stone-200/80 dark:border-stone-700 hover:border-amber-500 shadow-xs transition-all cursor-pointer shrink-0 active:scale-95"
          aria-label="Add Subcategory"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>

      {/* Items Table / Empty States Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {filteredItems.length === 0 ? (
          <div className="h-72 flex flex-col items-center justify-center text-center text-stone-400 text-xs p-6">
            {allCategoryItems.length === 0 ? (
              <>
                <UtensilsCrossed className="w-10 h-10 text-stone-300 dark:text-stone-600 mb-2.5 opacity-50" />
                <span className="font-semibold text-stone-700 dark:text-stone-300 text-sm">
                  No menu items created under "{selectedCategory}" yet.
                </span>
                <p className="text-stone-400 text-xs mt-1 max-w-xs">
                  Get started by adding your first dish or beverage to this category.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onAddItem('Veg')}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                  className="mt-3.5 font-bold cursor-pointer"
                >
                  Add First Item
                </Button>
              </>
            ) : searchQuery.trim() ? (
              <>
                <Search className="w-10 h-10 text-stone-300 dark:text-stone-600 mb-2.5 opacity-50" />
                <span className="font-semibold text-stone-700 dark:text-stone-300 text-sm">
                  No dishes matching "{searchQuery}"
                </span>
                <p className="text-stone-400 text-xs mt-1">
                  Try searching with a different keyword or clear the search filter.
                </p>
                <div className="flex items-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSearchQuery('')}
                    className="cursor-pointer"
                  >
                    Clear Search
                  </Button>
                </div>
              </>
            ) : selectedSubcategory ? (
              <>
                <Layers className="w-10 h-10 text-stone-300 dark:text-stone-600 mb-2.5 opacity-50" />
                <span className="font-semibold text-stone-700 dark:text-stone-300 text-sm">
                  No dishes tagged with "{selectedSubcategory}" yet.
                </span>
                <div className="flex items-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedSubcategory?.(null)}
                    className="cursor-pointer"
                  >
                    View All Subcategories
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onAddItem('Veg')}
                    leftIcon={<Plus className="w-3.5 h-3.5" />}
                    className="cursor-pointer"
                  >
                    Add to {selectedSubcategory}
                  </Button>
                </div>
              </>
            ) : null}
          </div>
        ) : (
          <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-stone-200/80 dark:border-stone-800 bg-stone-50 dark:bg-stone-850/60 text-stone-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4 w-12">#</th>
                  <th className="py-3 px-4">Item Name</th>
                  <th className="py-3 px-4">Subcategory</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {filteredItems.map((item: any, i: number) => {
                  return (
                    <tr
                      key={item.id || i}
                      className="hover:bg-stone-50/60 dark:hover:bg-stone-800/40 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono text-stone-400 font-medium">
                        {i + 1}
                      </td>

                      {/* Item Name & Dietary Icon Only (Image 2 - No text) */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          {item.type === 'Non-Veg' ? (
                            <span
                              title="Non-Vegetarian"
                              className="badge-diet-nonveg shrink-0"
                            />
                          ) : item.type === 'Egg' ? (
                            <span
                              title="Contains Egg"
                              className="inline-flex items-center justify-center w-3.5 h-3.5 border-[1.5px] border-amber-500 rounded-[3px] p-[1.5px] shrink-0"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            </span>
                          ) : item.type === 'Vegan' ? (
                            <span
                              title="Vegan"
                              className="inline-flex items-center justify-center w-3.5 h-3.5 border-[1.5px] border-emerald-600 rounded-[3px] shrink-0 text-[10px] leading-none"
                            >
                              🌱
                            </span>
                          ) : (
                            <span
                              title="Vegetarian"
                              className="badge-diet-veg shrink-0"
                            />
                          )}

                          <span className="font-bold text-stone-900 dark:text-stone-100">
                            {item.name}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        {item.subcategory ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/50 text-xs font-bold">
                            <Layers className="w-2.5 h-2.5 text-amber-500" />
                            <span>{item.subcategory}</span>
                          </span>
                        ) : (
                          <span className="text-stone-400 text-xs italic">General</span>
                        )}
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-amber-600 dark:text-amber-400">
                        ₹{parseFloat(item.price.toString().replace('₹', '')).toFixed(2)}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={cn(
                            'text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider',
                            item.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50'
                              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50'
                          )}
                        >
                          {item.status === 'Active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Tooltip content="Recipe & Ingredients" position="top" align="center">
                            <button
                              type="button"
                              onClick={() => onConfigItem(item)}
                              className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                            >
                              <Settings2 className="w-4 h-4" />
                            </button>
                          </Tooltip>

                          <Tooltip content="Edit Details" position="top" align="end">
                            <button
                              type="button"
                              onClick={() => onEditItem(item)}
                              className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </Tooltip>

                          <Tooltip content="Delete Item" position="top" align="end">
                            <button
                              type="button"
                              onClick={() => onDeleteItem(item)}
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Add Subcategory Modal (Point 3) */}
      <Modal
        isOpen={isAddSubcatModalOpen}
        onClose={() => {
          setIsAddSubcatModalOpen(false);
          setNewSubcatName('');
          setSubcatError(null);
        }}
        title="Add Subcategory"
        description={`Directly add a new subcategory under "${selectedCategory}".`}
        maxWidth="sm"
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsAddSubcatModalOpen(false);
                setNewSubcatName('');
                setSubcatError(null);
              }}
              disabled={isSavingSubcat}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveSubcat}
              isLoading={isSavingSubcat}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Subcategory
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveSubcat} className="space-y-4">
          {subcatError && (
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 text-xs font-semibold border border-rose-200 dark:border-rose-900/50">
              {subcatError}
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5 block">
              Subcategory Name
            </label>
            <input
              type="text"
              autoFocus
              placeholder="e.g. Starters, Cold Brews, Combos"
              value={newSubcatName}
              onChange={(e) => setNewSubcatName(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
