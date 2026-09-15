import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { usePOS } from '../../context/POSContext';
import type { MenuItem } from '../../types/app.types';
import { Tooltip } from '../ui';
import {
  X,
  Utensils,
  AlertTriangle,
  LayoutGrid,
  List,
  Plus,
  Minus,
  ArrowRight,
  Flame,
  Soup,
  Sparkles,
  CookingPot,
  Wheat,
  CupSoda,
  Cake,
  Coffee,
} from 'lucide-react';
import { getMenuItemLowStockMaterials, type LowStockMaterial } from '../../lib/orderUtils';
import { getMenuItemImage } from '../../lib/foodImageUtils';
import { cn } from '../../lib/utils';

interface CategoryIconProps {
  name: string;
  className?: string;
}

const CategorySectionIcon: React.FC<CategoryIconProps> = ({ name, className = 'w-4 h-4' }) => {
  const n = name.toLowerCase();
  if (n.includes('popular') || n.includes('starter') || n.includes('snack') || n.includes('tandoor')) {
    return <Flame className={className} />;
  }
  if (n.includes('soup')) return <Soup className={className} />;
  if (n.includes('main') || n.includes('sabji') || n.includes('curry')) return <CookingPot className={className} />;
  if (n.includes('bread') || n.includes('roti') || n.includes('naan')) return <Wheat className={className} />;
  if (n.includes('drink') || n.includes('beverage') || n.includes('shake')) return <CupSoda className={className} />;
  if (n.includes('coffee') || n.includes('tea')) return <Coffee className={className} />;
  if (n.includes('dessert') || n.includes('sweet') || n.includes('cake')) return <Cake className={className} />;
  return <Sparkles className={className} />;
};

export const POSProductGrid: React.FC = () => {
  const { appData } = useApp();
  const {
    posCategory,
    setPosCategory,
    posSearchQuery,
    setPosSearchQuery,
    dietFilter,
    setDietFilter,
    cart,
    handleAddToCart,
    updateCartQty,
  } = usePOS();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [catSubcategoryMap, setCatSubcategoryMap] = useState<Record<string, string | null>>({});

  // Set of inactive category names to completely exclude from POS terminal
  const inactiveCategoryNames = new Set(
    (appData.categories || [])
      .filter((c: any) => typeof c !== 'string' && (c.status === 'Inactive' || c.isActive === false))
      .map((c: any) => c.name)
  );

  // Precompute low-stock raw materials attached to each menu item
  const lowStockMap = useMemo(() => {
    const map = new Map<number | string, LowStockMaterial[]>();
    (appData.menu || []).forEach((item: any) => {
      const lowMaterials = getMenuItemLowStockMaterials(item, appData.inventory);
      if (lowMaterials.length > 0) {
        map.set(item.id ?? item.name, lowMaterials);
      }
    });
    return map;
  }, [appData.menu, appData.inventory]);

  const activeCategories = (appData.categories || []).filter((c: any) => {
    if (typeof c === 'string') return true;
    return c.status !== 'Inactive' && c.isActive !== false;
  });

  const isPosCategoryInactive = inactiveCategoryNames.has(posCategory);

  // When All Items is selected, we group by active categories
  const categoriesToRender = isPosCategoryInactive
    ? []
    : posCategory === 'All Items'
    ? activeCategories.map((c: any) => (typeof c === 'string' ? c : c.name))
    : [posCategory];

  // Total items matching active filters
  const allFilteredItems = appData.menu.filter((m: any) => {
    if (m.isAddon || m.status !== 'Active') return false;
    if (inactiveCategoryNames.has(m.category)) return false;
    if (posCategory !== 'All Items' && m.category !== posCategory) return false;
    if (dietFilter !== 'ALL' && m.type !== dietFilter) return false;
    if (posSearchQuery && !m.name.toLowerCase().includes(posSearchQuery.toLowerCase()))
      return false;
    return true;
  });

  // Highlight popular items when on All Items with no active search
  const popularItems = useMemo(() => {
    if (posCategory !== 'All Items' || posSearchQuery) return [];
    return appData.menu
      .filter((m: any) => {
        if (m.isAddon || m.status !== 'Active') return false;
        if (inactiveCategoryNames.has(m.category)) return false;
        if (dietFilter !== 'ALL' && m.type !== dietFilter) return false;
        return true;
      })
      .slice(0, 4);
  }, [appData.menu, posCategory, posSearchQuery, dietFilter, inactiveCategoryNames]);

  return (
    <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#faf8f5]/60 dark:bg-stone-950/20">
      {/* 1. Top Filter & View Controls Strip */}
      <div className="h-14 px-4 sm:px-6 bg-white dark:bg-stone-900 border-b border-stone-200/80 dark:border-stone-800 flex items-center justify-between gap-3 shrink-0 z-10 select-none">
        {/* Left: Dietary Filter Pills */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-1">
          {/* All */}
          <button
            type="button"
            onClick={() => setDietFilter('ALL')}
            className={cn(
              'px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shadow-2xs shrink-0',
              dietFilter === 'ALL'
                ? 'bg-amber-500 text-stone-950 shadow-sm'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-750'
            )}
          >
            All
          </button>

          {/* Veg */}
          <button
            type="button"
            onClick={() => setDietFilter('Veg')}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 border shrink-0',
              dietFilter === 'Veg'
                ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-800 dark:text-emerald-300 shadow-2xs ring-1 ring-emerald-500'
                : 'bg-white dark:bg-stone-850 border-stone-200 dark:border-stone-750 text-stone-700 dark:text-stone-300 hover:border-emerald-400'
            )}
          >
            <span className="badge-diet-veg" />
            <span>Veg</span>
          </button>

          {/* Non-Veg */}
          <button
            type="button"
            onClick={() => setDietFilter('Non-Veg')}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 border shrink-0',
              dietFilter === 'Non-Veg'
                ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-500 text-rose-800 dark:text-rose-300 shadow-2xs ring-1 ring-rose-500'
                : 'bg-white dark:bg-stone-850 border-stone-200 dark:border-stone-750 text-stone-700 dark:text-stone-300 hover:border-rose-400'
            )}
          >
            <span className="badge-diet-nonveg" />
            <span>Non-Veg</span>
          </button>

          {/* Egg */}
          <button
            type="button"
            onClick={() => setDietFilter('Egg')}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 border shrink-0',
              dietFilter === 'Egg'
                ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-500 text-amber-900 dark:text-amber-300 shadow-2xs ring-1 ring-amber-500'
                : 'bg-white dark:bg-stone-850 border-stone-200 dark:border-stone-750 text-stone-700 dark:text-stone-300 hover:border-amber-400'
            )}
          >
            <span className="inline-flex items-center justify-center w-3.5 h-3.5 border-[1.5px] border-amber-500 rounded-[3px] p-[1.5px]">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            </span>
            <span>Egg</span>
          </button>

          {/* Vegan */}
          <button
            type="button"
            onClick={() => setDietFilter('Vegan')}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 border shrink-0',
              dietFilter === 'Vegan'
                ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-600 text-emerald-900 dark:text-emerald-300 shadow-2xs ring-1 ring-emerald-600'
                : 'bg-white dark:bg-stone-850 border-stone-200 dark:border-stone-750 text-stone-700 dark:text-stone-300 hover:border-emerald-400'
            )}
          >
            <span className="text-emerald-600 text-[11px] leading-none">🌱</span>
            <span>Vegan</span>
          </button>
        </div>

        {/* Right: View Mode Toggle */}
        <div className="flex items-center gap-1 p-1 bg-stone-100 dark:bg-stone-800 rounded-xl border border-stone-200/80 dark:border-stone-750 shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={cn(
              'p-1.5 rounded-lg transition-all cursor-pointer',
              viewMode === 'grid'
                ? 'bg-white dark:bg-stone-700 text-amber-600 shadow-xs'
                : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
            )}
            title="Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={cn(
              'p-1.5 rounded-lg transition-all cursor-pointer',
              viewMode === 'list'
                ? 'bg-white dark:bg-stone-700 text-amber-600 shadow-xs'
                : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
            )}
            title="List View"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile/Small Tablet Horizontal Category Rail (hidden on md and above) */}
      <div className="md:hidden px-3 py-2 bg-stone-50 dark:bg-stone-900/60 border-b border-stone-200/60 dark:border-stone-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 select-none">
        <button
          type="button"
          onClick={() => setPosCategory('All Items')}
          className={cn(
            'px-3 py-1 rounded-xl text-xs font-black shrink-0 transition-all shadow-2xs cursor-pointer',
            posCategory === 'All Items'
              ? 'bg-amber-500 text-stone-950 shadow-sm'
              : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-stone-200/80 dark:border-stone-750'
          )}
        >
          All Items
        </button>
        {activeCategories.map((c: any) => {
          const name = typeof c === 'string' ? c : c.name;
          const isSelected = posCategory === name;
          return (
            <button
              key={name}
              type="button"
              onClick={() => setPosCategory(name)}
              className={cn(
                'px-3 py-1 rounded-xl text-xs font-bold shrink-0 transition-all shadow-2xs cursor-pointer',
                isSelected
                  ? 'bg-amber-500 text-stone-950 shadow-sm'
                  : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-stone-200/80 dark:border-stone-750'
              )}
            >
              {name}
            </button>
          );
        })}
      </div>

      {/* 2. Food Items Scrollable Canvas */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-7 custom-scrollbar">
        {/* Active Search Feedback */}
        {posSearchQuery && (
          <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs text-stone-600 dark:text-stone-300">
                Search results for: <span className="font-extrabold text-stone-950 dark:text-stone-50">"{posSearchQuery}"</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-200/80 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200 font-mono">
                {allFilteredItems.length} {allFilteredItems.length === 1 ? 'item' : 'items'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setPosSearchQuery('')}
              className="text-xs text-amber-700 dark:text-amber-300 hover:text-amber-800 font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Clear
            </button>
          </div>
        )}

        {/* 2A. Popular Items Section (shown on All Items when not searching) */}
        {popularItems.length > 0 && (
          <div>
            <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-stone-200/80 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <span className="text-amber-500">
                  <Flame className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
                  Popular Items
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPosCategory('All Items')}
                className="text-xs font-bold text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className={cn(
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4'
                : 'space-y-2'
            )}>
              {popularItems.map((item: MenuItem) => renderCard(item))}
            </div>
          </div>
        )}

        {/* 2B. Render Categories */}
        {categoriesToRender.map((catName: string) => {
          const catObj = (appData.categories || []).find((c: any) => {
            const name = typeof c === 'string' ? c : c.name;
            return name === catName;
          });

          const catSubcats: string[] =
            catObj && typeof catObj !== 'string' && Array.isArray(catObj.subcategories)
              ? catObj.subcategories
              : [];
          const activeSub = catSubcategoryMap[catName];

          const allItemsInCat = appData.menu.filter((m: any) => {
            if (m.isAddon || m.status !== 'Active') return false;
            if (inactiveCategoryNames.has(m.category)) return false;
            if (m.category !== catName) return false;
            if (dietFilter !== 'ALL' && m.type !== dietFilter) return false;
            if (posSearchQuery && !m.name.toLowerCase().includes(posSearchQuery.toLowerCase()))
              return false;
            return true;
          });

          const itemsInCat = activeSub
            ? allItemsInCat.filter((m: any) => m.subcategory === activeSub)
            : allItemsInCat;

          if (allItemsInCat.length === 0) return null;

          return (
            <div key={catName}>
              {/* Category Header */}
              <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-stone-200/80 dark:border-stone-800">
                <div className="flex items-center gap-2">
                  <span className="text-amber-500">
                    <CategorySectionIcon name={catName} className="w-4 h-4" />
                  </span>
                  <h3 className="text-sm font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
                    {catName}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  {posCategory === 'All Items' && (
                    <button
                      type="button"
                      onClick={() => setPosCategory(catName)}
                      className="text-xs font-bold text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>View All</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <span className="text-[11px] font-bold text-stone-400 font-mono">
                    {itemsInCat.length} {itemsInCat.length === 1 ? 'item' : 'items'}
                  </span>
                </div>
              </div>

              {/* Subcategories Filter Chips (if single category or subcategories exist) */}
              {catSubcats.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap mb-3.5">
                  <button
                    type="button"
                    onClick={() => setCatSubcategoryMap((prev) => ({ ...prev, [catName]: null }))}
                    className={cn(
                      'px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer select-none',
                      !activeSub
                        ? 'bg-amber-500 text-stone-950 shadow-xs'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
                    )}
                  >
                    All ({allItemsInCat.length})
                  </button>

                  {catSubcats.map((sub: string) => {
                    const subCount = allItemsInCat.filter((m: any) => m.subcategory === sub).length;
                    const isSelected = activeSub === sub;
                    return (
                      <button
                        key={sub}
                        type="button"
                        onClick={() =>
                          setCatSubcategoryMap((prev) => ({
                            ...prev,
                            [catName]: isSelected ? null : sub,
                          }))
                        }
                        className={cn(
                          'px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer select-none flex items-center gap-1',
                          isSelected
                            ? 'bg-amber-500 text-stone-950 shadow-xs'
                            : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
                        )}
                      >
                        <span>{sub}</span>
                        <span className={cn('text-[10px] font-mono', isSelected ? 'text-stone-950 font-extrabold' : 'text-stone-400')}>
                          ({subCount})
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Product Cards Layout */}
              <div
                className={cn(
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4'
                    : 'space-y-2'
                )}
              >
                {itemsInCat.map((item: MenuItem) => renderCard(item))}
              </div>
            </div>
          );
        })}

        {/* Empty State */}
        {allFilteredItems.length === 0 && (
          <div className="h-72 flex flex-col items-center justify-center text-center p-6 text-stone-400">
            <div className="w-16 h-16 rounded-2xl bg-stone-100 dark:bg-stone-850 flex items-center justify-center mb-3 text-stone-300 dark:text-stone-700">
              <Utensils className="w-8 h-8 stroke-1" />
            </div>
            <h4 className="text-sm font-bold text-stone-700 dark:text-stone-300">
              {posSearchQuery
                ? `No items found matching "${posSearchQuery}"`
                : 'No active dishes available'}
            </h4>
            <p className="text-xs text-stone-400 mt-1 max-w-xs">
              {isPosCategoryInactive
                ? 'This category is currently hidden from POS ordering.'
                : 'Check menu management or dietary filters.'}
            </p>
            {posSearchQuery && (
              <button
                type="button"
                onClick={() => setPosSearchQuery('')}
                className="mt-4 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-xs"
              >
                Clear Search Filter
              </button>
            )}
          </div>
        )}
      </div>
    </main>
  );

  // Card Rendering Helper Function
  function renderCard(item: MenuItem) {
    const qty = cart
      .filter((c) => c.id === item.id)
      .reduce((sum, c) => sum + c.quantity, 0);

    const lowMaterials = lowStockMap.get(item.id ?? item.name) || [];
    const imageUrl = getMenuItemImage(item);
    const priceNum = parseFloat(item.price.toString().replace('₹', '')).toFixed(2);

    if (viewMode === 'list') {
      return (
        <div
          key={item.id}
          className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 hover:border-amber-400/80 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-2xs hover:shadow-md transition-all select-none"
        >
          {/* Left: Image + Info */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 shrink-0">
              <img
                src={imageUrl}
                alt={item.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute top-1 left-1 bg-white/95 dark:bg-stone-900/95 p-0.5 rounded shadow-2xs">
                {renderDietBadge(item.type)}
              </div>
            </div>

            <div className="min-w-0">
              <h4 className="text-sm font-extrabold text-stone-900 dark:text-stone-100 truncate">
                {item.name}
              </h4>
              {item.description && (
                <p className="text-[11px] text-stone-400 dark:text-stone-500 truncate mt-0.5">
                  {item.description}
                </p>
              )}
              <div className="text-sm font-black font-mono text-stone-900 dark:text-stone-100 mt-1">
                ₹{priceNum}
              </div>
            </div>
          </div>

          {/* Right: Quantity Stepper or + Add */}
          <div className="shrink-0 flex items-center gap-2">
            {renderActionControl(item, qty)}
          </div>
        </div>
      );
    }

    return (
      <div
        key={item.id}
        className={cn(
          'bg-white dark:bg-stone-900 border rounded-2xl overflow-hidden flex flex-col justify-between shadow-2xs hover:shadow-lg transition-all duration-200 select-none group',
          qty > 0
            ? 'border-amber-500 ring-1 ring-amber-500/50'
            : 'border-stone-200/80 dark:border-stone-800 hover:border-amber-400'
        )}
      >
        {/* 1. Image Banner */}
        <div className="relative h-36 sm:h-40 w-full overflow-hidden bg-stone-100 dark:bg-stone-800">
          <img
            src={imageUrl}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />

          {/* Floating Dietary Badge Top-Left */}
          <div className="absolute top-2.5 left-2.5 bg-white/95 dark:bg-stone-900/95 p-1 rounded-lg shadow-xs backdrop-blur-xs flex items-center justify-center">
            {renderDietBadge(item.type)}
          </div>

          {/* Floating Low Stock / Custom Tag Top-Right */}
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
            {item.addonIds && item.addonIds.trim() !== '' && (
              <span className="text-[9px] font-black text-amber-900 dark:text-amber-200 bg-amber-200/90 dark:bg-amber-900/90 px-1.5 py-0.5 rounded-md shadow-2xs">
                Custom
              </span>
            )}

            {lowMaterials.length > 0 && (
              <Tooltip
                content={
                  <div className="p-0.5 text-left">
                    <div className="font-extrabold text-[11px] text-rose-300 border-b border-stone-700/60 pb-1 mb-1.5 flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0" />
                        <span>Low Stock</span>
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-500/25 text-rose-300 font-mono font-bold">
                        {lowMaterials.length}
                      </span>
                    </div>
                    <ul className="space-y-1.5">
                      {lowMaterials.map((rm) => (
                        <li key={rm.name} className="text-[10px] flex items-center justify-between gap-3">
                          <span className="text-stone-200 truncate">{rm.name}</span>
                          <span className="font-mono font-bold text-amber-300 shrink-0">
                            {rm.stock} {rm.unit}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                }
                className="whitespace-normal min-w-[170px]"
                position="top"
                align="end"
              >
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-rose-500/90 text-white shadow-2xs cursor-help">
                  Low Stock
                </span>
              </Tooltip>
            )}
          </div>
        </div>

        {/* 2. Card Content & Action Button */}
        <div className="p-3 sm:p-3.5 flex flex-col flex-1 justify-between gap-2.5">
          <div>
            <h4 className="text-sm font-extrabold text-stone-900 dark:text-stone-100 line-clamp-1 leading-snug">
              {item.name}
            </h4>
            {item.description ? (
              <p className="text-[11px] text-stone-400 dark:text-stone-500 line-clamp-1 mt-0.5">
                {item.description}
              </p>
            ) : item.subcategory ? (
              <p className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider mt-0.5">
                {item.subcategory}
              </p>
            ) : null}
          </div>

          <div className="flex items-center justify-between gap-2 pt-1 border-t border-stone-100 dark:border-stone-800">
            <div className="text-sm sm:text-base font-extrabold font-mono text-stone-900 dark:text-stone-100">
              ₹{priceNum}
            </div>

            {renderActionControl(item, qty)}
          </div>
        </div>
      </div>
    );
  }

  // Dietary symbol helper
  function renderDietBadge(type?: string) {
    if (type === 'Non-Veg') {
      return <span className="badge-diet-nonveg" title="Non-Veg" />;
    }
    if (type === 'Egg') {
      return (
        <span
          className="inline-flex items-center justify-center w-3 h-3 border-[1.5px] border-amber-500 rounded-[3px] p-[1px]"
          title="Egg"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        </span>
      );
    }
    if (type === 'Vegan') {
      return (
        <span className="text-[10px] leading-none" title="Vegan">
          🌱
        </span>
      );
    }
    return <span className="badge-diet-veg" title="Veg" />;
  }

  // + Add or Stepper action helper
  function renderActionControl(item: MenuItem, qty: number) {
    if (qty > 0) {
      return (
        <div className="flex items-center bg-amber-500 text-stone-950 font-black rounded-xl p-0.5 shadow-2xs">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              updateCartQty(item, -1);
            }}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-amber-600 active:scale-90 transition-all cursor-pointer"
            title="Decrease quantity"
          >
            <Minus className="w-3.5 h-3.5 text-stone-950 stroke-[2.5]" />
          </button>
          <span className="px-2 text-xs font-mono font-black">{qty}</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              updateCartQty(item, 1);
            }}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-amber-600 active:scale-90 transition-all cursor-pointer"
            title="Increase quantity"
          >
            <Plus className="w-3.5 h-3.5 text-stone-950 stroke-[2.5]" />
          </button>
        </div>
      );
    }

    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handleAddToCart(item);
        }}
        className="px-3.5 py-1.5 rounded-xl border border-amber-500 text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-stone-950 font-black text-xs transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-2xs"
      >
        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
        <span>Add</span>
      </button>
    );
  }
};
