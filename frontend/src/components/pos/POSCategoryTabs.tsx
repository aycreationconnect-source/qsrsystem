import React from 'react';
import { useApp } from '../../context/AppContext';
import { usePOS } from '../../context/POSContext';
import { cn } from '../../lib/utils';
import { Coffee, UtensilsCrossed } from 'lucide-react';

export const POSCategoryTabs: React.FC = () => {
  const { appData } = useApp();
  const { posCategory, setPosCategory } = usePOS();

  const categories = [
    'All Items',
    ...appData.categories.map((c: any) => (typeof c === 'string' ? c : c.name)),
  ];

  return (
    <div className="w-full bg-white/70 dark:bg-stone-900/70 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800 px-4 sm:px-6 py-2.5 overflow-x-auto no-scrollbar shrink-0">
      <div className="flex items-center gap-2 min-w-max">
        {categories.map((cat: string, i: number) => {
          const isActive = posCategory === cat;
          return (
            <button
              key={i}
              type="button"
              onClick={() => setPosCategory(cat)}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-bold transition-all duration-150 flex items-center gap-2 select-none touch-manipulation cursor-pointer',
                isActive
                  ? 'bg-amber-500 text-stone-950 shadow-sm shadow-amber-500/20 scale-[1.02]'
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
    </div>
  );
};
