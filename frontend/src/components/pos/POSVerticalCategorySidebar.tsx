import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { usePOS } from '../../context/POSContext';
import { Tooltip } from '../ui';
import {
  LayoutGrid,
  Flame,
  Soup,
  UtensilsCrossed,
  Wheat,
  Coffee,
  Cake,
  Pizza,
  Sandwich,
  Sparkles,
  CupSoda,
  CookingPot,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface CategoryIconProps {
  name: string;
  className?: string;
}

const CategoryIcon: React.FC<CategoryIconProps> = ({ name, className = 'w-4 h-4' }) => {
  const n = name.toLowerCase();
  if (n.includes('all')) return <LayoutGrid className={className} />;
  if (n.includes('starter') || n.includes('snack') || n.includes('appetizer')) return <Flame className={className} />;
  if (n.includes('soup')) return <Soup className={className} />;
  if (n.includes('main') || n.includes('sabji') || n.includes('curry')) return <CookingPot className={className} />;
  if (n.includes('rice') || n.includes('biryani')) return <UtensilsCrossed className={className} />;
  if (n.includes('bread') || n.includes('roti') || n.includes('naan')) return <Wheat className={className} />;
  if (n.includes('chinese') || n.includes('noodle')) return <Flame className={className} />;
  if (n.includes('beverage') || n.includes('drink') || n.includes('shake')) return <CupSoda className={className} />;
  if (n.includes('coffee') || n.includes('tea')) return <Coffee className={className} />;
  if (n.includes('dessert') || n.includes('sweet') || n.includes('cake') || n.includes('ice cream')) return <Cake className={className} />;
  if (n.includes('pizza')) return <Pizza className={className} />;
  if (n.includes('burger') || n.includes('sandwich')) return <Sandwich className={className} />;
  return <Sparkles className={className} />;
};

export const POSVerticalCategorySidebar: React.FC = () => {
  const { appData } = useApp();
  const {
    posCategory,
    setPosCategory,
    dietFilter,
    isCategorySidebarCollapsed: isCollapsed,
    toggleCategorySidebar: toggleCollapse,
  } = usePOS();

  // Filter out Inactive categories
  const activeCategories = useMemo(() => {
    return (appData.categories || []).filter((c: any) => {
      if (typeof c === 'string') return true;
      return c.status !== 'Inactive' && c.isActive !== false;
    });
  }, [appData.categories]);

  // Dish counts per category considering active diet filter
  const categoryDishCounts = useMemo(() => {
    const counts: Record<string, number> = { 'All Items': 0 };
    (appData.menu || []).forEach((m: any) => {
      if (m.isAddon || m.status !== 'Active') return;
      if (dietFilter !== 'ALL' && m.type !== dietFilter) return;

      counts['All Items'] = (counts['All Items'] || 0) + 1;
      const catName = typeof m.category === 'string' ? m.category : m.category?.name;
      if (catName) {
        counts[catName] = (counts[catName] || 0) + 1;
      }
    });
    return counts;
  }, [appData.menu, dietFilter]);

  const categories = useMemo(() => {
    return [
      { name: 'All Items', count: categoryDishCounts['All Items'] || 0 },
      ...activeCategories.map((c: any) => {
        const name = typeof c === 'string' ? c : c.name;
        return {
          name,
          count: categoryDishCounts[name] || 0,
        };
      }),
    ];
  }, [activeCategories, categoryDishCounts]);

  return (
    <aside
      className={cn(
        'bg-white dark:bg-stone-900 border-r border-stone-200/80 dark:border-stone-800 flex flex-col h-full shrink-0 select-none z-10 transition-all duration-300 ease-in-out relative overflow-hidden',
        isCollapsed ? 'w-16' : 'w-56 xl:w-64'
      )}
    >
      {/* 1. Sidebar Header with Collapse Button */}
      <div className="h-14 px-3 border-b border-stone-200/70 dark:border-stone-800 flex items-center justify-between shrink-0 overflow-hidden">
        <div
          className={cn(
            'flex items-center gap-2.5 text-stone-900 dark:text-stone-100 font-extrabold text-sm tracking-tight transition-all duration-300 ease-in-out overflow-hidden',
            isCollapsed ? 'opacity-0 max-w-0 pointer-events-none' : 'opacity-100 max-w-[180px]'
          )}
        >
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <LayoutGrid className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-black truncate">Categories</span>
            <span className="text-[10px] text-stone-400 font-medium truncate">
              {activeCategories.length} categories
            </span>
          </div>
        </div>

        <Tooltip
          content={isCollapsed ? 'Expand Categories' : 'Collapse Categories'}
          position="right"
          offset={12}
        >
          <button
            type="button"
            onClick={toggleCollapse}
            className={cn(
              'w-9 h-9 rounded-xl flex items-center justify-center text-stone-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 dark:hover:text-amber-400 border border-stone-200/70 dark:border-stone-800 transition-all duration-200 cursor-pointer click-bubble active:scale-90 active:ring-4 active:ring-amber-400/30 group shrink-0',
              isCollapsed && 'mx-auto'
            )}
            aria-label={isCollapsed ? 'Expand categories sidebar' : 'Collapse categories sidebar'}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="w-4.5 h-4.5 text-amber-500 transition-transform duration-200 group-hover:scale-110" />
            ) : (
              <PanelLeftClose className="w-4.5 h-4.5 transition-transform duration-200 group-hover:scale-110" />
            )}
          </button>
        </Tooltip>
      </div>

      {/* 2. Scrollable Categories List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5 custom-scrollbar">
        {categories.map((cat) => {
          const isSelected = posCategory === cat.name;

          return (
            <Tooltip
              key={cat.name}
              content={isCollapsed ? `${cat.name} (${cat.count})` : null}
              position="right"
              offset={12}
              wrapperClassName="w-full block"
            >
              <button
                type="button"
                onClick={() => setPosCategory(cat.name)}
                className={cn(
                  'w-full h-11 rounded-xl font-bold text-xs flex items-center transition-all cursor-pointer select-none group overflow-hidden click-bubble active:scale-95',
                  isSelected
                    ? 'bg-[#fff5ea] dark:bg-amber-950/40 text-amber-950 dark:text-amber-200 shadow-2xs border border-amber-300/70 dark:border-amber-800/80 font-extrabold'
                    : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100/80 dark:hover:bg-stone-850 hover:text-stone-900 dark:hover:text-stone-100 border border-transparent'
                )}
              >
                {/* Left: Icon Slot */}
                <div className="w-12 shrink-0 flex items-center justify-center">
                  <span
                    className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
                      isSelected
                        ? 'text-amber-600 dark:text-amber-400 bg-amber-500/10'
                        : 'text-stone-400 group-hover:text-stone-600 dark:group-hover:text-stone-300 group-hover:bg-stone-200/50 dark:group-hover:bg-stone-800'
                    )}
                  >
                    <CategoryIcon name={cat.name} className="w-4 h-4" />
                  </span>
                </div>

                {/* Right: Category Name + Dish Count Badge */}
                <div
                  className={cn(
                    'flex-1 flex items-center justify-between min-w-0 pr-2.5 whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out text-left',
                    isCollapsed ? 'opacity-0 max-w-0 pointer-events-none' : 'opacity-100 max-w-[180px]'
                  )}
                >
                  <span className="truncate">{cat.name}</span>
                  <span
                    className={cn(
                      'text-[11px] font-mono px-2 py-0.5 rounded-full font-bold transition-all shrink-0',
                      isSelected
                        ? 'bg-amber-500 text-stone-950'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-500 group-hover:bg-stone-200 dark:group-hover:bg-stone-700'
                    )}
                  >
                    {cat.count}
                  </span>
                </div>
              </button>
            </Tooltip>
          );
        })}
      </div>
    </aside>
  );
};
