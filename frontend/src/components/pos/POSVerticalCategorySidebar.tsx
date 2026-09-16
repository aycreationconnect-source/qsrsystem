import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { usePOS } from '../../context/POSContext';
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
  LogOut,
  Sparkles,
  CupSoda,
  CookingPot,
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
  const { appData, handleLogout } = useApp();
  const { posCategory, setPosCategory, dietFilter } = usePOS();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await handleLogout();
    navigate('/login');
  };

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
    <aside className="w-56 xl:w-64 bg-white dark:bg-stone-900 border-r border-stone-200/80 dark:border-stone-800 flex flex-col h-full shrink-0 select-none z-10 transition-all">
      {/* 1. Sidebar Header */}
      <div className="h-13 px-4 flex items-center justify-between border-b border-stone-200/70 dark:border-stone-800 shrink-0">
        <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100 font-extrabold text-sm tracking-tight">
          <LayoutGrid className="w-4 h-4 text-amber-500" />
          <span>Categories</span>
        </div>
        <span className="text-[11px] font-bold text-stone-400 dark:text-stone-500 font-mono">
          {activeCategories.length}
        </span>
      </div>

      {/* 2. Scrollable Categories List */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-1 custom-scrollbar">
        {categories.map((cat) => {
          const isSelected = posCategory === cat.name;

          return (
            <button
              key={cat.name}
              type="button"
              onClick={() => setPosCategory(cat.name)}
              className={cn(
                'w-full px-3 py-2.5 rounded-xl font-bold text-xs flex items-center justify-between gap-2 transition-all cursor-pointer select-none group',
                isSelected
                  ? 'bg-[#fff5ea] dark:bg-amber-950/40 text-amber-950 dark:text-amber-200 shadow-2xs'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100/80 dark:hover:bg-stone-850 hover:text-stone-900 dark:hover:text-stone-100'
              )}
            >
              {/* Left: Icon + Name */}
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className={cn(
                    'transition-colors shrink-0',
                    isSelected
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-stone-400 group-hover:text-stone-600 dark:group-hover:text-stone-300'
                  )}
                >
                  <CategoryIcon name={cat.name} className="w-4 h-4" />
                </span>
                <span className="truncate text-left">{cat.name}</span>
              </div>

              {/* Right: Dish Count Badge */}
              <span
                className={cn(
                  'text-[11px] font-mono px-2 py-0.5 rounded-full font-bold transition-all shrink-0',
                  isSelected
                    ? 'bg-amber-200/70 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-500 group-hover:bg-stone-200 dark:group-hover:bg-stone-750'
                )}
              >
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Footer: Logout Button & Build Version */}
      <div className="p-2.5 border-t border-stone-200/70 dark:border-stone-800 shrink-0 bg-stone-50/50 dark:bg-stone-900/50 flex items-center justify-between">
        <button
          type="button"
          onClick={handleSignOut}
          className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2 cursor-pointer transition-all active:scale-95 group"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110" />
          <span>Logout</span>
        </button>
        <span className="text-[11px] font-mono font-bold text-stone-400 dark:text-stone-500 px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800/80 border border-stone-200/60 dark:border-stone-750/50">
          v1.0.0
        </span>
      </div>
    </aside>
  );
};
