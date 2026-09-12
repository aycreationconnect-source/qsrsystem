import React from 'react';
import { useApp } from '../../context/AppContext';
import { usePOS } from '../../context/POSContext';
import { cn } from '../../lib/utils';
import { Coffee, UtensilsCrossed } from 'lucide-react';

const DIETARY_FILTERS = [
  { id: 'ALL', label: 'All Diets' },
  { id: 'Veg', label: '🟢 Veg' },
  { id: 'Non-Veg', label: '🔴 Non-Veg' },
  { id: 'Egg', label: '🟡 Egg' },
  { id: 'Vegan', label: '🌱 Vegan' },
] as const;

export const POSCategoryTabs: React.FC = () => {
  const { appData } = useApp();
  const { posCategory, setPosCategory, dietFilter, setDietFilter } = usePOS();

  // Filter out Inactive categories from POS navigation
  const activeCategories = (appData.categories || []).filter((c: any) => {
    if (typeof c === 'string') return true;
    return c.status !== 'Inactive' && c.isActive !== false;
  });

  const categories = [
    'All Items',
    ...activeCategories.map((c: any) => (typeof c === 'string' ? c : c.name)),
  ];

  // Auto-reset selection if currently selected category was set to Inactive
  React.useEffect(() => {
    if (posCategory !== 'All Items' && !categories.includes(posCategory)) {
      setPosCategory('All Items');
    }
  }, [posCategory, categories, setPosCategory]);

  return (
    <div className="w-full bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800 px-3 sm:px-5 py-2 flex items-center justify-between gap-3 shrink-0">
      {/* Categories (horizontally scrollable) */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar min-w-0 flex-1">
        {categories.map((cat: string, i: number) => {
          const isActive = posCategory === cat;
          return (
            <button
              key={i}
              type="button"
              onClick={() => setPosCategory(cat)}
              className={cn(
                'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 flex items-center gap-1.5 select-none touch-manipulation cursor-pointer whitespace-nowrap shrink-0',
                isActive
                  ? 'bg-amber-500 text-stone-950 shadow-sm shadow-amber-500/20 scale-[1.01]'
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

      {/* Dietary Filters Pill Strip */}
      <div className="flex items-center gap-1 shrink-0 pl-3 border-l border-stone-200 dark:border-stone-800 overflow-x-auto no-scrollbar">
        {DIETARY_FILTERS.map((df) => {
          const isSelected = dietFilter === df.id;
          return (
            <button
              key={df.id}
              type="button"
              onClick={() => setDietFilter(df.id)}
              className={cn(
                'px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer select-none',
                isSelected
                  ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-xs'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-750'
              )}
            >
              {df.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
