import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { usePOS } from '../../context/POSContext';
import { cn } from '../../lib/utils';
import {
  Coffee,
  UtensilsCrossed,
  LayoutGrid,
  ChevronDown,
  X,
  Check,
  Search,
} from 'lucide-react';

export const POSCategoryTabs: React.FC = () => {
  const { appData } = useApp();
  const { posCategory, setPosCategory, dietFilter, setDietFilter } = usePOS();

  const [showCategoryGrid, setShowCategoryGrid] = useState(false);
  const [categorySearchQuery, setCategorySearchQuery] = useState('');

  // Filter out Inactive categories from POS navigation
  const activeCategories = useMemo(() => {
    return (appData.categories || []).filter((c: any) => {
      if (typeof c === 'string') return true;
      return c.status !== 'Inactive' && c.isActive !== false;
    });
  }, [appData.categories]);

  const categories = useMemo(() => {
    return [
      'All Items',
      ...activeCategories.map((c: any) => (typeof c === 'string' ? c : c.name)),
    ];
  }, [activeCategories]);

  // Dish counts per category
  const categoryDishCounts = useMemo(() => {
    const counts: Record<string, number> = { 'All Items': 0 };
    (appData.menu || []).forEach((m: any) => {
      if (m.isAddon || m.status !== 'Active') return;
      counts['All Items'] = (counts['All Items'] || 0) + 1;
      if (m.category) {
        counts[m.category] = (counts[m.category] || 0) + 1;
      }
    });
    return counts;
  }, [appData.menu]);

  // Auto-reset selection if currently selected category was set to Inactive
  useEffect(() => {
    if (posCategory !== 'All Items' && !categories.includes(posCategory)) {
      setPosCategory('All Items');
    }
  }, [posCategory, categories, setPosCategory]);

  // Close popover on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showCategoryGrid) {
        setShowCategoryGrid(false);
        setCategorySearchQuery('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showCategoryGrid]);

  // Filtered categories for the popover grid
  const filteredCategoriesForGrid = useMemo(() => {
    const q = categorySearchQuery.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) => c.toLowerCase().includes(q));
  }, [categories, categorySearchQuery]);

  return (
    <div
      className={cn(
        'relative w-full bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800 px-3 sm:px-4 py-2 flex items-center justify-between gap-3 shrink-0 select-none transition-all',
        showCategoryGrid ? 'z-40' : 'z-20'
      )}
    >
      {/* 1. Category Dropdown Filter Button */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowCategoryGrid((prev) => !prev)}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 flex items-center gap-2 cursor-pointer border shadow-2xs select-none',
              showCategoryGrid
                ? 'bg-amber-500 text-stone-950 border-amber-500 shadow-sm'
                : posCategory !== 'All Items'
                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border-amber-300/80 dark:border-amber-700/60 hover:border-amber-400'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border-stone-200/80 dark:border-stone-750 hover:bg-stone-200/70'
            )}
            title="Browse all categories"
          >
            <LayoutGrid className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span className="font-bold">
              {posCategory === 'All Items' ? 'Categories' : posCategory}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-stone-200/80 dark:bg-stone-700 text-stone-700 dark:text-stone-300 font-mono font-bold">
              {posCategory === 'All Items'
                ? categories.length - 1
                : categoryDishCounts[posCategory] || 0}
            </span>
            <ChevronDown
              className={cn(
                'w-3.5 h-3.5 text-stone-400 transition-transform duration-200',
                showCategoryGrid && 'rotate-180 text-stone-950 dark:text-stone-900'
              )}
            />
          </button>

          {/* Categories Popover Grid (High Z-Index so cards never overlap) */}
          {showCategoryGrid && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-40 bg-stone-900/10 dark:bg-black/30 backdrop-blur-[1px]"
                onClick={() => {
                  setShowCategoryGrid(false);
                  setCategorySearchQuery('');
                }}
              />
              <div className="absolute left-0 top-full mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl z-50 p-3 animate-in fade-in duration-100 max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800 shrink-0">
                  <div className="flex items-center gap-2">
                    <LayoutGrid className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-extrabold text-stone-900 dark:text-stone-100">
                      All Menu Categories
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 font-mono">
                      {categories.length - 1}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCategoryGrid(false);
                      setCategorySearchQuery('');
                    }}
                    className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Quick Search inside Popover */}
                <div className="pt-2 pb-1 shrink-0">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={categorySearchQuery}
                      onChange={(e) => setCategorySearchQuery(e.target.value)}
                      placeholder="Type category name..."
                      className="w-full pl-8 pr-7 py-2 rounded-xl bg-stone-100/90 dark:bg-stone-800/90 border border-stone-200/60 dark:border-stone-750 focus:border-amber-500 text-xs font-medium text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none transition-all"
                      autoFocus
                    />
                    {categorySearchQuery && (
                      <button
                        type="button"
                        onClick={() => setCategorySearchQuery('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-stone-400 hover:text-stone-600 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Category Cards Multi-Column Grid */}
                <div className="grid grid-cols-2 gap-1.5 overflow-y-auto max-h-72 p-1 mt-1">
                  {filteredCategoriesForGrid.map((cat, idx) => {
                    const isActive = posCategory === cat;
                    const dishCount = categoryDishCounts[cat] || 0;

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setPosCategory(cat);
                          setShowCategoryGrid(false);
                          setCategorySearchQuery('');
                        }}
                        className={cn(
                          'p-2.5 rounded-xl text-left border transition-all flex items-center justify-between cursor-pointer select-none group',
                          isActive
                            ? 'bg-amber-500 text-stone-950 border-amber-500 font-bold shadow-xs'
                            : 'bg-stone-50/80 dark:bg-stone-800/60 border-stone-200/80 dark:border-stone-750 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-750 hover:border-amber-400/60'
                        )}
                      >
                        <div className="flex items-center gap-2 min-w-0 pr-1">
                          {idx === 0 ? (
                            <UtensilsCrossed className="w-3.5 h-3.5 shrink-0" />
                          ) : (
                            <Coffee className="w-3.5 h-3.5 shrink-0 opacity-70" />
                          )}
                          <span className="text-xs font-bold truncate leading-tight">
                            {cat}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <span
                            className={cn(
                              'text-[10px] px-1.5 py-0.2 rounded-md font-mono',
                              isActive
                                ? 'bg-stone-950/15 text-stone-950 font-black'
                                : 'bg-stone-200/70 dark:bg-stone-750 text-stone-500 dark:text-stone-400'
                            )}
                          >
                            {dishCount}
                          </span>
                          {isActive && <Check className="w-3.5 h-3.5" />}
                        </div>
                      </button>
                    );
                  })}

                  {filteredCategoriesForGrid.length === 0 && (
                    <div className="col-span-2 py-6 text-center text-xs text-stone-400">
                      No categories found matching "{categorySearchQuery}"
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Quick Reset Button if a specific category is active */}
        {posCategory !== 'All Items' && (
          <button
            type="button"
            onClick={() => setPosCategory('All Items')}
            className="px-2 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200 dark:hover:bg-stone-700 border border-stone-200/80 dark:border-stone-750 transition-colors cursor-pointer text-xs flex items-center gap-1 font-semibold"
            title="Reset to All Categories"
          >
            <X className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        )}
      </div>

      {/* 2. All Dietary Filters Aligned Horizontally */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 shrink-0">
        {/* All Diets */}
        <button
          type="button"
          onClick={() => setDietFilter('ALL')}
          className={cn(
            'px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 select-none border',
            dietFilter === 'ALL'
              ? 'bg-amber-500 text-stone-950 border-amber-500 shadow-2xs font-black'
              : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200/80 dark:border-stone-750 hover:bg-stone-200/70'
          )}
          title="Show all diets"
        >
          <UtensilsCrossed className="w-3.5 h-3.5" />
          <span>All</span>
        </button>

        {/* Pure Veg */}
        <button
          type="button"
          onClick={() => setDietFilter(dietFilter === 'Veg' ? 'ALL' : 'Veg')}
          className={cn(
            'px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 select-none border',
            dietFilter === 'Veg'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs font-black ring-1 ring-emerald-500'
              : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200/80 dark:border-stone-750 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:border-emerald-300 dark:hover:border-emerald-800 hover:text-emerald-700 dark:hover:text-emerald-300'
          )}
          title="Filter Pure Veg dishes (Click to toggle)"
        >
          <span className="badge-diet-veg" />
          <span>Veg</span>
        </button>

        {/* Non-Veg */}
        <button
          type="button"
          onClick={() => setDietFilter(dietFilter === 'Non-Veg' ? 'ALL' : 'Non-Veg')}
          className={cn(
            'px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 select-none border',
            dietFilter === 'Non-Veg'
              ? 'bg-rose-600 text-white border-rose-600 shadow-2xs font-black ring-1 ring-rose-500'
              : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200/80 dark:border-stone-750 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:border-rose-300 dark:hover:border-rose-800 hover:text-rose-700 dark:hover:text-rose-300'
          )}
          title="Filter Non-Veg dishes (Click to toggle)"
        >
          <span className="badge-diet-nonveg" />
          <span>Non-Veg</span>
        </button>

        {/* Contains Egg */}
        <button
          type="button"
          onClick={() => setDietFilter(dietFilter === 'Egg' ? 'ALL' : 'Egg')}
          className={cn(
            'px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 select-none border',
            dietFilter === 'Egg'
              ? 'bg-amber-500 text-stone-950 border-amber-500 shadow-2xs font-black ring-1 ring-amber-400'
              : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200/80 dark:border-stone-750 hover:bg-amber-50 dark:hover:bg-amber-950/30 hover:border-amber-300 dark:hover:border-amber-800 hover:text-amber-800 dark:hover:text-amber-300'
          )}
          title="Filter Contains Egg dishes (Click to toggle)"
        >
          <span className="inline-flex items-center justify-center w-3.5 h-3.5 border-[1.5px] border-amber-500 rounded-[3px] p-[1.5px] shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          </span>
          <span>Egg</span>
        </button>

        {/* Vegan */}
        <button
          type="button"
          onClick={() => setDietFilter(dietFilter === 'Vegan' ? 'ALL' : 'Vegan')}
          className={cn(
            'px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 select-none border',
            dietFilter === 'Vegan'
              ? 'bg-teal-600 text-white border-teal-600 shadow-2xs font-black ring-1 ring-teal-500'
              : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200/80 dark:border-stone-750 hover:bg-teal-50 dark:hover:bg-teal-950/30 hover:border-teal-300 dark:hover:border-teal-800 hover:text-teal-700 dark:hover:text-teal-300'
          )}
          title="Filter Vegan dishes (Click to toggle)"
        >
          <span className="inline-flex items-center justify-center w-3.5 h-3.5 border-[1.5px] border-emerald-600 rounded-[3px] p-[1px] shrink-0 text-[9px] leading-none">
            🌱
          </span>
          <span>Vegan</span>
        </button>

        {/* Clear Filter Button if any specific diet is active */}
        {dietFilter !== 'ALL' && (
          <button
            type="button"
            onClick={() => setDietFilter('ALL')}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer transition-colors"
            title="Reset to All Diets"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
