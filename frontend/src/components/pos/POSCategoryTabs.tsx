import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { usePOS } from '../../context/POSContext';
import { cn } from '../../lib/utils';
import {
  Coffee,
  UtensilsCrossed,
  LayoutGrid,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  Check,
  Search,
} from 'lucide-react';

const DIETARY_FILTERS = [
  { id: 'ALL', label: 'All Diets', badge: '🍽️' },
  { id: 'Veg', label: 'Pure Veg', badge: '🟢' },
  { id: 'Non-Veg', label: 'Non-Veg', badge: '🔴' },
  { id: 'Egg', label: 'Contains Egg', badge: '🟡' },
  { id: 'Vegan', label: 'Vegan', badge: '🌱' },
] as const;

export const POSCategoryTabs: React.FC = () => {
  const { appData } = useApp();
  const { posCategory, setPosCategory, dietFilter, setDietFilter } = usePOS();

  const [showCategoryGrid, setShowCategoryGrid] = useState(false);
  const [showDietMenu, setShowDietMenu] = useState(false);
  const [categorySearchQuery, setCategorySearchQuery] = useState('');

  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

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

  // Check scroll overflows for smooth arrow indicators
  const checkScroll = useCallback(() => {
    if (tabsContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsContainerRef.current;
      setCanScrollLeft(scrollLeft > 4);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
    }
  }, []);

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [checkScroll, categories]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (tabsContainerRef.current) {
      const offset = direction === 'left' ? -220 : 220;
      tabsContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
      setTimeout(checkScroll, 250);
    }
  };

  // Filtered categories for the popover grid
  const filteredCategoriesForGrid = useMemo(() => {
    if (!categorySearchQuery.trim()) return categories;
    return categories.filter((c) =>
      c.toLowerCase().includes(categorySearchQuery.toLowerCase())
    );
  }, [categories, categorySearchQuery]);

  return (
    <div className="w-full bg-white/90 dark:bg-stone-900/90 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800 px-2.5 sm:px-4 py-1.5 flex items-center justify-between gap-2 shrink-0 select-none">
      {/* 1. Fast "All Categories" Popover Picker (Zero Horizontal Scrolling) */}
      <div className="relative shrink-0">
        <button
          type="button"
          onClick={() => {
            setShowCategoryGrid((prev) => !prev);
            setShowDietMenu(false);
          }}
          className={cn(
            'px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 flex items-center gap-1.5 cursor-pointer border shadow-2xs',
            showCategoryGrid
              ? 'bg-amber-500 text-stone-950 border-amber-500'
              : posCategory !== 'All Items'
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border-amber-300/80 dark:border-amber-700/60'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border-stone-200/80 dark:border-stone-750 hover:bg-stone-200/70'
          )}
          title="Browse all categories in a visual grid"
        >
          <LayoutGrid className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden sm:inline">Categories</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-stone-200/80 dark:bg-stone-700 text-stone-700 dark:text-stone-300 font-mono">
            {categories.length - 1}
          </span>
          <ChevronDown
            className={cn(
              'w-3.5 h-3.5 text-stone-400 transition-transform duration-150',
              showCategoryGrid && 'rotate-180'
            )}
          />
        </button>

        {/* Categories Popover Grid */}
        {showCategoryGrid && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => {
                setShowCategoryGrid(false);
                setCategorySearchQuery('');
              }}
            />
            <div className="absolute left-0 top-full mt-1.5 w-80 sm:w-96 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl z-50 p-2.5 animate-in fade-in duration-100 max-h-[80vh] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800 shrink-0">
                <div className="flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-extrabold text-stone-900 dark:text-stone-100">
                    All Menu Categories
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

              {/* Quick Search inside Popover if categories > 6 */}
              {categories.length > 6 && (
                <div className="pt-2 pb-1 shrink-0">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={categorySearchQuery}
                      onChange={(e) => setCategorySearchQuery(e.target.value)}
                      placeholder="Type category name..."
                      className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-stone-100/90 dark:bg-stone-800/90 border border-transparent focus:border-amber-500 text-xs font-medium text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none"
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
              )}

              {/* Category Cards Multi-Column Grid (Zero Horizontal Scrolling!) */}
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
              </div>
            </div>
          </>
        )}
      </div>

      {/* 2. Visible Category Tabs with Smooth Arrow Scroll Step Controls */}
      <div className="relative flex-1 min-w-0 flex items-center">
        {/* Scroll Left Arrow Button */}
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => handleScroll('left')}
            className="absolute left-0 z-10 p-1 rounded-lg bg-white/95 dark:bg-stone-900/95 border border-stone-200 dark:border-stone-700 shadow-md text-stone-600 dark:text-stone-300 hover:bg-stone-100 cursor-pointer"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Scrollable Container */}
        <div
          ref={tabsContainerRef}
          onScroll={checkScroll}
          className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth w-full px-1"
        >
          {categories.map((cat: string, i: number) => {
            const isActive = posCategory === cat;
            return (
              <button
                key={i}
                type="button"
                onClick={() => setPosCategory(cat)}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 flex items-center gap-1.5 select-none touch-manipulation cursor-pointer whitespace-nowrap shrink-0',
                  isActive
                    ? 'bg-amber-500 text-stone-950 shadow-sm shadow-amber-500/20'
                    : 'bg-stone-100 dark:bg-stone-800/80 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-750'
                )}
              >
                {i === 0 ? (
                  <UtensilsCrossed className="w-3.5 h-3.5" />
                ) : (
                  <Coffee className="w-3.5 h-3.5 opacity-60" />
                )}
                <span>{cat}</span>
              </button>
            );
          })}
        </div>

        {/* Scroll Right Arrow Button */}
        {canScrollRight && (
          <button
            type="button"
            onClick={() => handleScroll('right')}
            className="absolute right-0 z-10 p-1 rounded-lg bg-white/95 dark:bg-stone-900/95 border border-stone-200 dark:border-stone-700 shadow-md text-stone-600 dark:text-stone-300 hover:bg-stone-100 cursor-pointer"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* 3. High-Speed Compact Dietary Filter (Zero Scrolling & 1-Click Fast Toggles) */}
      <div className="flex items-center gap-1 shrink-0 pl-2 border-l border-stone-200 dark:border-stone-800">
        {/* Quick 1-Click Veg Toggle */}
        <button
          type="button"
          onClick={() => setDietFilter(dietFilter === 'Veg' ? 'ALL' : 'Veg')}
          className={cn(
            'px-2 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 select-none border',
            dietFilter === 'Veg'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs font-black'
              : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-transparent hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700 dark:hover:text-emerald-300'
          )}
          title="Filter Pure Veg dishes only (Click again to reset)"
        >
          <span className="badge-diet-veg" />
          <span className="hidden sm:inline">Veg</span>
        </button>

        {/* Quick 1-Click Non-Veg Toggle */}
        <button
          type="button"
          onClick={() => setDietFilter(dietFilter === 'Non-Veg' ? 'ALL' : 'Non-Veg')}
          className={cn(
            'px-2 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 select-none border',
            dietFilter === 'Non-Veg'
              ? 'bg-rose-600 text-white border-rose-600 shadow-xs font-black'
              : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-transparent hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-700 dark:hover:text-rose-300'
          )}
          title="Filter Non-Veg dishes only (Click again to reset)"
        >
          <span className="badge-diet-nonveg" />
          <span className="hidden sm:inline">Non-Veg</span>
        </button>

        {/* More Diets Dropdown (Egg, Vegan, Reset) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowDietMenu((prev) => !prev);
              setShowCategoryGrid(false);
            }}
            className={cn(
              'px-2 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 border select-none',
              dietFilter === 'Egg' || dietFilter === 'Vegan'
                ? 'bg-amber-500 text-stone-950 border-amber-500 shadow-xs font-extrabold'
                : dietFilter !== 'ALL'
                  ? 'bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-stone-200 border-stone-300 dark:border-stone-600'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 border-transparent hover:bg-stone-200/70'
            )}
            title="Dietary preferences dropdown"
          >
            {dietFilter === 'Egg' ? (
              <span>🟡 Egg</span>
            ) : dietFilter === 'Vegan' ? (
              <span>🌱 Vegan</span>
            ) : (
              <Filter className="w-3.5 h-3.5" />
            )}
            <ChevronDown
              className={cn(
                'w-3 h-3 transition-transform duration-150',
                showDietMenu && 'rotate-180'
              )}
            />
          </button>

          {/* Diet Selection Popover Menu */}
          {showDietMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowDietMenu(false)}
              />
              <div className="absolute right-0 top-full mt-1.5 w-48 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl z-50 p-1.5 space-y-1 animate-in fade-in duration-100">
                <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider px-2 py-1">
                  Filter By Diet
                </div>

                {DIETARY_FILTERS.map((df) => {
                  const isSelected = dietFilter === df.id;
                  return (
                    <button
                      key={df.id}
                      type="button"
                      onClick={() => {
                        setDietFilter(df.id);
                        setShowDietMenu(false);
                      }}
                      className={cn(
                        'w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-between cursor-pointer transition-all',
                        isSelected
                          ? 'bg-amber-500 text-stone-950 font-bold shadow-xs'
                          : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span>{df.badge}</span>
                        <span>{df.label}</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Clear Filter Button if any diet is active */}
        {dietFilter !== 'ALL' && (
          <button
            type="button"
            onClick={() => setDietFilter('ALL')}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
            title="Reset to All Diets"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
