import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Button, Badge, Tooltip } from '../ui';
import {
  Plus,
  Settings2,
  Edit2,
  Trash2,
  UtensilsCrossed,
  Layers,
  Filter,
  Search,
  X,
} from 'lucide-react';
import { cn } from '../../lib/utils';

type DietFilter = 'All' | 'Veg' | 'Non-Veg' | 'Egg' | 'Vegan';

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
  const { appData } = useApp();

  // Search and Dietary Filter states (Default selected: 'Veg')
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDiet, setSelectedDiet] = useState<DietFilter>('Veg');

  // Reset dietary filter to 'Veg' and clear search when category changes
  useEffect(() => {
    setSelectedDiet('Veg');
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

  // Live item counts per dietary classification
  const dietCounts = useMemo(() => {
    const counts: Record<DietFilter, number> = {
      All: subcategoryScopedItems.length,
      Veg: 0,
      'Non-Veg': 0,
      Egg: 0,
      Vegan: 0,
    };

    subcategoryScopedItems.forEach((m: any) => {
      const type = m.type || 'Veg';
      if (type === 'Non-Veg') counts['Non-Veg']++;
      else if (type === 'Egg') counts['Egg']++;
      else if (type === 'Vegan') counts['Vegan']++;
      else counts['Veg']++;
    });

    return counts;
  }, [subcategoryScopedItems]);

  // Filter items by active dietary filter and search query
  const filteredItems = useMemo(() => {
    if (!selectedCategory) return [];
    return subcategoryScopedItems.filter((item: any) => {
      // Dietary filter
      if (selectedDiet !== 'All') {
        const itemType = item.type || 'Veg';
        if (itemType !== selectedDiet) return false;
      }

      // Search by Menu Name (case-insensitive substring match)
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        if (!item.name?.toLowerCase().includes(q)) return false;
      }

      return true;
    });
  }, [subcategoryScopedItems, selectedCategory, selectedDiet, searchQuery]);

  // Cross-diet search helper: checks if other dietary filters have matches when current diet yields none
  const crossDietMatches = useMemo(() => {
    if (!searchQuery.trim() || selectedDiet === 'All' || !selectedCategory) return [];
    const q = searchQuery.trim().toLowerCase();
    return subcategoryScopedItems.filter(
      (m: any) => (m.type || 'Veg') !== selectedDiet && m.name?.toLowerCase().includes(q)
    );
  }, [subcategoryScopedItems, selectedCategory, selectedDiet, searchQuery]);

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
  });

  const subcategories: string[] =
    currentCatObj && typeof currentCatObj !== 'string' && Array.isArray(currentCatObj.subcategories)
      ? currentCatObj.subcategories
      : [];

  // Dietary chip configurations
  const dietChips: {
    id: DietFilter;
    label: string;
    icon?: React.ReactNode;
    count: number;
  }[] = [
    {
      id: 'All',
      label: 'All',
      count: dietCounts.All,
    },
    {
      id: 'Veg',
      label: 'Veg',
      icon: <span className="badge-diet-veg scale-75 shrink-0" />,
      count: dietCounts.Veg,
    },
    {
      id: 'Non-Veg',
      label: 'Non-Veg',
      icon: <span className="badge-diet-nonveg scale-75 shrink-0" />,
      count: dietCounts['Non-Veg'],
    },
    {
      id: 'Egg',
      label: 'Egg',
      icon: <span className="text-xs leading-none shrink-0">🟡</span>,
      count: dietCounts.Egg,
    },
    {
      id: 'Vegan',
      label: 'Vegan',
      icon: <span className="text-xs leading-none shrink-0">🌱</span>,
      count: dietCounts.Vegan,
    },
  ];

  const getChipStyle = (id: DietFilter) => {
    const isSelected = selectedDiet === id;
    if (!isSelected) {
      return 'bg-white dark:bg-stone-850 text-stone-600 dark:text-stone-400 border border-stone-200/90 dark:border-stone-800 hover:bg-stone-100/70 dark:hover:bg-stone-800';
    }
    switch (id) {
      case 'All':
        return 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-sm ring-1 ring-stone-900/10 font-bold';
      case 'Veg':
        return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border-2 border-emerald-500 shadow-sm ring-2 ring-emerald-500/20 font-extrabold';
      case 'Non-Veg':
        return 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 border-2 border-rose-500 shadow-sm ring-2 ring-rose-500/20 font-extrabold';
      case 'Egg':
        return 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 border-2 border-amber-500 shadow-sm ring-2 ring-amber-500/20 font-extrabold';
      case 'Vegan':
        return 'bg-green-50 dark:bg-green-950/60 text-green-800 dark:text-green-200 border-2 border-green-600 shadow-sm ring-2 ring-green-600/20 font-extrabold';
    }
  };

  const getCountBadgeStyle = (id: DietFilter) => {
    const isSelected = selectedDiet === id;
    if (!isSelected) {
      return 'bg-stone-100 dark:bg-stone-750 text-stone-500 dark:text-stone-400';
    }
    switch (id) {
      case 'All':
        return 'bg-stone-800 dark:bg-stone-200 text-stone-100 dark:text-stone-900';
      case 'Veg':
        return 'bg-emerald-200/90 dark:bg-emerald-900/90 text-emerald-900 dark:text-emerald-100';
      case 'Non-Veg':
        return 'bg-rose-200/90 dark:bg-rose-900/90 text-rose-900 dark:text-rose-100';
      case 'Egg':
        return 'bg-amber-200/90 dark:bg-amber-900/90 text-amber-900 dark:text-amber-100';
      case 'Vegan':
        return 'bg-green-200/90 dark:bg-green-900/90 text-green-900 dark:text-green-100';
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-stone-50/40 dark:bg-stone-950/20">
      {/* Top Header */}
      <div className="p-4 sm:p-5 bg-white dark:bg-stone-900 border-b border-stone-200/80 dark:border-stone-800 flex items-center justify-between shrink-0">
        <div>
          <h3 className="text-base font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <span>{selectedCategory}</span>
            <span className="text-xs font-semibold text-stone-400">
              ({allCategoryItems.length} {allCategoryItems.length === 1 ? 'item' : 'items'})
            </span>
          </h3>
          {subcategories.length > 0 && (
            <span className="text-[11px] text-stone-400 font-medium">
              {subcategories.length} subcategories configured
            </span>
          )}
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => onAddItem(selectedDiet !== 'All' ? selectedDiet : 'Veg')}
          leftIcon={<Plus className="w-4 h-4" />}
          className="font-bold cursor-pointer"
        >
          Add Dish / Beverage
        </Button>
      </div>

      {/* Filter Controls: Dietary Chips & Search by Menu Name */}
      <div className="px-4 sm:px-6 py-2.5 bg-white dark:bg-stone-900 border-b border-stone-200/80 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        {/* Dietary Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <div className="flex items-center gap-1 text-[11px] font-bold text-stone-400 uppercase tracking-wider mr-1 shrink-0">
            <Filter className="w-3.5 h-3.5 text-stone-400" />
            <span>Diet:</span>
          </div>

          {dietChips.map((chip) => {
            const isSelected = selectedDiet === chip.id;
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => setSelectedDiet(isSelected && chip.id !== 'All' ? 'All' : chip.id)}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 select-none',
                  getChipStyle(chip.id)
                )}
              >
                {chip.icon}
                <span>{chip.label}</span>
                <span
                  className={cn(
                    'text-[10px] px-1.5 py-0.2 rounded-full font-bold',
                    getCountBadgeStyle(chip.id)
                  )}
                >
                  {chip.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search by Menu Name */}
        <div className="relative w-full sm:w-64 md:w-72 shrink-0">
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
      </div>

      {/* Subcategories Filter Chips Bar (if configured) */}
      {subcategories.length > 0 && (
        <div className="px-4 sm:px-6 py-2 bg-stone-50/80 dark:bg-stone-900/60 border-b border-stone-200/60 dark:border-stone-800/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          <div className="flex items-center gap-1 text-[11px] font-bold text-stone-400 uppercase tracking-wider mr-1 shrink-0">
            <Layers className="w-3.5 h-3.5 text-amber-500" />
            <span>Subcategories:</span>
          </div>

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
              <button
                key={sub}
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
            );
          })}
        </div>
      )}

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
                  onClick={() => onAddItem(selectedDiet !== 'All' ? selectedDiet : 'Veg')}
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
                {crossDietMatches.length > 0 ? (
                  <p className="text-stone-500 dark:text-stone-400 text-xs mt-1.5 max-w-sm">
                    Found {crossDietMatches.length} matching {crossDietMatches.length === 1 ? 'dish' : 'dishes'} in other dietary filters.
                  </p>
                ) : (
                  <p className="text-stone-400 text-xs mt-1">
                    Try searching with a different keyword or clear the search filter.
                  </p>
                )}
                <div className="flex items-center gap-2 mt-4">
                  {crossDietMatches.length > 0 && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setSelectedDiet('All')}
                      className="font-bold cursor-pointer"
                    >
                      View All Results ({crossDietMatches.length})
                    </Button>
                  )}
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
            ) : selectedDiet !== 'All' ? (
              <>
                <Filter className="w-10 h-10 text-stone-300 dark:text-stone-600 mb-2.5 opacity-50" />
                <span className="font-semibold text-stone-700 dark:text-stone-300 text-sm">
                  No {selectedDiet} dishes found in "{selectedSubcategory || selectedCategory}".
                </span>
                <p className="text-stone-400 text-xs mt-1">
                  Switch to "All" to view dishes from other dietary preferences or add a new {selectedDiet} dish.
                </p>
                <div className="flex items-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedDiet('All')}
                    className="cursor-pointer"
                  >
                    Show All Items ({subcategoryScopedItems.length})
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onAddItem(selectedDiet)}
                    leftIcon={<Plus className="w-3.5 h-3.5" />}
                    className="font-bold cursor-pointer"
                  >
                    Add {selectedDiet} Dish
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
                    onClick={() => onAddItem(selectedDiet !== 'All' ? selectedDiet : 'Veg')}
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
                  <th className="py-3 px-4">Item Name & Diet</th>
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

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {item.type === 'Non-Veg' ? (
                            <Badge variant="nonveg" size="sm">Non-Veg</Badge>
                          ) : item.type === 'Egg' ? (
                            <Badge variant="egg" size="sm">Egg</Badge>
                          ) : item.type === 'Vegan' ? (
                            <Badge variant="vegan" size="sm">Vegan</Badge>
                          ) : (
                            <Badge variant="veg" size="sm">Veg</Badge>
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
    </div>
  );
};
