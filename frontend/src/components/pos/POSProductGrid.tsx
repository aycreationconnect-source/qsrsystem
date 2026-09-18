import React, { useState, useMemo, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { usePOS } from '../../context/POSContext';
import type { MenuItem, SubmoduleMode } from '../../types/app.types';
import { Tooltip } from '../ui';
import {
  X,
  Utensils,
  AlertTriangle,
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
  Settings2,
} from 'lucide-react';
import { getMenuItemLowStockMaterials, type LowStockMaterial } from '../../lib/orderUtils';
import { getMenuItemImage } from '../../lib/foodImageUtils';
import { useDeviceType, isItemImageVisible } from '../../lib/imageVisibilityUtils';
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
  const { appData, posMode } = useApp();
  const {
    posCategory,
    setPosCategory,
    posSearchQuery,
    setPosSearchQuery,
    dietFilter,
    cart,
    handleAddToCart,
    updateCartQty,
    viewMode,
    isCategorySidebarCollapsed,
  } = usePOS();

  const deviceType = useDeviceType();
  const submoduleMode: SubmoduleMode = posMode === 'table' ? 'table' : 'qsr';
  const showItemImages = isItemImageVisible(appData.settings, submoduleMode, deviceType);

  const [catSubcategoryMap, setCatSubcategoryMap] = useState<Record<string, string | null>>({});
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleSelectCategorySmooth = (catName: string) => {
    if (typeof document !== 'undefined' && 'startViewTransition' in document) {
      (document as any).startViewTransition(() => {
        setPosCategory(catName);
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    } else {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
      setPosCategory(catName);
    }
  };

  const handleViewAllPopular = () => {
    if (scrollContainerRef.current) {
      const popularSection = scrollContainerRef.current.querySelector('#popular-items-section');
      if (popularSection && popularSection.nextElementSibling) {
        popularSection.nextElementSibling.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        scrollContainerRef.current.scrollTo({ top: 280, behavior: 'smooth' });
      }
    }
  };

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
    const targetCount = isCategorySidebarCollapsed ? 6 : 5;
    return appData.menu
      .filter((m: any) => {
        if (m.isAddon || m.status !== 'Active') return false;
        if (inactiveCategoryNames.has(m.category)) return false;
        if (dietFilter !== 'ALL' && m.type !== dietFilter) return false;
        return true;
      })
      .slice(0, targetCount);
  }, [appData.menu, posCategory, posSearchQuery, dietFilter, inactiveCategoryNames, isCategorySidebarCollapsed]);

  // Dynamic grid column layout depending on category sidebar collapse state:
  // When sidebar opened: 5 in Desktop, 4 in Tab
  // When sidebar collapsed: 6 in Desktop, 5 in Tab
  const gridColsClass = isCategorySidebarCollapsed
    ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-6'
    : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5';

  return (
    <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#faf8f5]/60 dark:bg-stone-950/20">
      {/* Mobile Horizontal Category Rail (hidden on Desktop & Tab View: md:hidden) */}
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
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-7 custom-scrollbar scroll-smooth"
      >
        <div key={posCategory} className="space-y-7 animate-fade-in-up">
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

          {/* 2A. Popular Items Section (Prominently Highlighted) */}
          {popularItems.length > 0 && (
            <section
              id="popular-items-section"
              className="rounded-3xl p-4 sm:p-5 bg-gradient-to-br from-amber-500/[0.08] via-orange-500/[0.04] to-amber-500/[0.02] dark:from-amber-500/[0.14] dark:via-orange-500/[0.07] dark:to-transparent border-2 border-amber-500/35 dark:border-amber-500/25 shadow-xs relative overflow-hidden transition-all"
            >
              {/* Ambient warm glow decoration */}
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-400/15 dark:bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

              {/* Header */}
              <div className="flex items-center justify-between pb-3 mb-3.5 border-b border-amber-500/20 dark:border-amber-500/20 relative z-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center shadow-xs">
                    <Flame className="w-4 h-4 fill-stone-950 stroke-stone-950" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider bg-amber-500 text-stone-950 shadow-2xs">
                      Bestsellers
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleViewAllPopular}
                  className="text-xs font-bold text-amber-800 dark:text-amber-300 hover:text-amber-950 dark:hover:text-amber-100 flex items-center gap-1 cursor-pointer transition-colors px-2.5 py-1 rounded-lg hover:bg-amber-500/15 active:scale-95"
                >
                  <span>View All</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Cards Grid */}
              <div
                className={cn(
                  'relative z-1',
                  viewMode === 'grid'
                    ? cn('grid gap-3 sm:gap-3.5', gridColsClass)
                    : 'space-y-2'
                )}
              >
                {popularItems.map((item: MenuItem) => renderCard(item, true))}
              </div>
            </section>
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
                      onClick={() => handleSelectCategorySmooth(catName)}
                      className="text-xs font-bold text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 flex items-center gap-1 cursor-pointer transition-colors px-2 py-0.5 rounded-md hover:bg-stone-100 dark:hover:bg-stone-800 active:scale-95"
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
                    ? cn('grid gap-3 sm:gap-3.5', gridColsClass)
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
      </div>
    </main>
  );

  // Card Rendering Helper Function
  function renderCard(item: MenuItem, isPopular = false) {
    const qty = cart
      .filter((c) => c.id === item.id)
      .reduce((sum, c) => sum + c.quantity, 0);

    const lowMaterials = lowStockMap.get(item.id ?? item.name) || [];
    const imageUrl = getMenuItemImage(item);
    const rawPrice = parseFloat(item.price.toString().replace(/[^0-9.]/g, '')) || 0;
    const priceDisplay = rawPrice % 1 === 0 ? rawPrice.toFixed(0) : rawPrice.toFixed(2);

    if (viewMode === 'list') {
      return (
        <div
          key={item.id}
          onClick={() => handleAddToCart(item)}
          className={cn(
            'bg-white dark:bg-stone-900 border rounded-2xl p-3 flex items-center justify-between gap-3 shadow-2xs hover:shadow-md transition-all select-none cursor-pointer active:scale-[0.99] group',
            qty > 0
              ? 'border-2 border-amber-500 ring-2 ring-amber-500/20 bg-amber-500/[0.03] dark:bg-amber-500/[0.05]'
              : isPopular
              ? 'border-amber-300/80 dark:border-amber-800/60 bg-white/95 dark:bg-stone-900/95 shadow-xs hover:border-amber-500'
              : 'border-stone-200/80 dark:border-stone-800 hover:border-amber-400/80'
          )}
        >
          {/* Left: (Optional Image) + Info */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {showItemImages ? (
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
            ) : (
              <div className="shrink-0 mt-0.5">{renderDietBadge(item.type)}</div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="text-[14.5px] font-extrabold text-stone-900 dark:text-stone-100 line-clamp-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  {item.name}
                </h4>
                {item.addonIds && item.addonIds.trim() !== '' && (
                  <span className="text-[9px] font-extrabold text-amber-900 dark:text-amber-200 bg-amber-100 dark:bg-amber-950/60 px-1.5 py-0.5 rounded shadow-2xs shrink-0">
                    Custom
                  </span>
                )}
                {lowMaterials.length > 0 && (
                  <div className="shrink-0">{renderLowStockBadge(lowMaterials)}</div>
                )}
              </div>
              {item.description && (
                <p className="text-[11px] text-stone-400 dark:text-stone-500 truncate mt-0.5">
                  {item.description}
                </p>
              )}
            </div>
          </div>

          {/* Right: Price & Quick Action */}
          <div className="shrink-0 flex items-center gap-3">
            <div className="flex items-baseline gap-0.5 shrink-0 whitespace-nowrap">
              <span className="text-xs font-bold text-amber-600 dark:text-amber-500">₹</span>
              <span className="text-sm sm:text-base font-black font-mono text-stone-900 dark:text-stone-100">
                {priceDisplay}
              </span>
            </div>
            {renderActionControl(item, qty)}
          </div>
        </div>
      );
    }

    // Grid View: Text-Only Fast POS Mode (Default when showItemImages is false)
    if (!showItemImages) {
      return (
        <div
          key={item.id}
          onClick={() => handleAddToCart(item)}
          className={cn(
            'bg-white dark:bg-stone-900 border rounded-2xl p-3 flex flex-col justify-between min-h-[115px] sm:min-h-[120px] shadow-2xs hover:shadow-md transition-all duration-150 select-none cursor-pointer active:scale-[0.98] group relative overflow-hidden',
            qty > 0
              ? 'border-2 border-amber-500 ring-2 ring-amber-500/20 bg-amber-500/[0.04] dark:bg-amber-500/[0.08]'
              : isPopular
              ? 'border-amber-300/80 dark:border-amber-800/60 bg-white dark:bg-stone-900 shadow-xs hover:border-amber-500 hover:shadow-amber-500/10'
              : 'border-stone-200/90 dark:border-stone-800 hover:border-amber-400 dark:hover:border-amber-500'
          )}
        >
          {/* 1. Top Row: Badges (Dietary, Custom, Low Stock, Info) */}
          <div className="flex items-center justify-between gap-1.5 shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="shrink-0 flex items-center justify-center">
                {renderDietBadge(item.type)}
              </span>
              {item.addonIds && item.addonIds.trim() !== '' && (
                <Tooltip content="Customizable Item" position="top">
                  <span
                    className="inline-flex items-center justify-center p-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-300/80 dark:border-amber-800/60 shadow-2xs cursor-help shrink-0"
                    aria-label="Customizable"
                  >
                    <Settings2 className="w-3 h-3 shrink-0" />
                  </span>
                </Tooltip>
              )}
            </div>

            {/* Right Top Corner: TriangleAlert (Low Stock) */}
            {lowMaterials.length > 0 && (
              <div className="shrink-0">
                {renderLowStockBadge(lowMaterials)}
              </div>
            )}
          </div>

          {/* 2. Middle Content: Item Name */}
          <div className="my-1.5 min-w-0">
            <h4 className="text-[13px] sm:text-[14px] font-extrabold text-stone-900 dark:text-stone-100 leading-snug line-clamp-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
              {item.name}
            </h4>
          </div>

          {/* 3. Bottom Footer: Price (Left) + Quantity Badge or Quick Add Cue (Right) */}
          <div className="flex items-center justify-between gap-2 pt-2 mt-auto border-t border-stone-100 dark:border-stone-800/80 shrink-0">
            <div className="flex items-baseline gap-0.5 shrink-0 whitespace-nowrap">
              <span className="text-[11px] font-bold text-amber-600 dark:text-amber-500">₹</span>
              <span className="text-[14px] sm:text-[15px] font-black font-mono text-stone-900 dark:text-stone-100 tracking-tight">
                {priceDisplay}
              </span>
            </div>

            {renderActionControl(item, qty)}
          </div>
        </div>
      );
    }

    // Grid View: Photo Mode (when showItemImages is true)
    return (
      <div
        key={item.id}
        onClick={() => handleAddToCart(item)}
        className={cn(
          'bg-white dark:bg-stone-900 border rounded-2xl overflow-hidden flex flex-col min-h-[160px] sm:min-h-[180px] shadow-2xs hover:shadow-lg transition-all duration-200 select-none group cursor-pointer active:scale-[0.98]',
          qty > 0
            ? 'border-2 border-amber-500 ring-2 ring-amber-500/30'
            : isPopular
            ? 'border-amber-300/80 dark:border-amber-800/60 hover:border-amber-500'
            : 'border-stone-200/80 dark:border-stone-800 hover:border-amber-400'
        )}
      >
        {/* 1. Image Banner */}
        <div className="relative h-[90px] sm:h-[110px] shrink-0 w-full overflow-hidden bg-stone-100 dark:bg-stone-800">
          <img
            src={imageUrl}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />

          {/* Floating Dietary Badge & Custom Badge Top-Left */}
          <div className="absolute top-2 left-2 bg-white/95 dark:bg-stone-900/95 p-1 rounded-lg shadow-xs backdrop-blur-xs flex items-center gap-1.5">
            {renderDietBadge(item.type)}
            {item.addonIds && item.addonIds.trim() !== '' && (
              <Tooltip content="Customizable Item" position="top">
                <span
                  className="inline-flex items-center justify-center p-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 shadow-2xs cursor-help shrink-0"
                  aria-label="Customizable"
                >
                  <Settings2 className="w-3.5 h-3.5 shrink-0" />
                </span>
              </Tooltip>
            )}
          </div>

          {/* Floating Top-Right: TriangleAlert (Low Stock) */}
          {lowMaterials.length > 0 && (
            <div className="absolute top-2 right-2 flex items-center gap-1">
              {renderLowStockBadge(lowMaterials)}
            </div>
          )}
        </div>

        {/* 2. Card Content & Action Button */}
        <div className="p-2.5 sm:p-3 flex flex-col flex-1 justify-between gap-1.5 shrink-0">
          <div className="min-w-0 my-1">
            <h4 className="text-[13px] sm:text-[14px] font-extrabold text-stone-900 dark:text-stone-100 line-clamp-2 leading-snug group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
              {item.name}
            </h4>
          </div>

          <div className="flex items-center justify-between gap-2 mt-auto shrink-0 border-t border-stone-100 dark:border-stone-800 pt-2">
            <div className="flex items-baseline gap-0.5 shrink-0 whitespace-nowrap">
              <span className="text-[11px] font-bold text-amber-600 dark:text-amber-500">₹</span>
              <span className="text-[14px] sm:text-[15px] font-black font-mono text-stone-900 dark:text-stone-100 tracking-tight">
                {priceDisplay}
              </span>
            </div>

            {renderActionControl(item, qty)}
          </div>
        </div>
      </div>
    );
  }

  // Low stock badge helper
  function renderLowStockBadge(lowMaterials: LowStockMaterial[]) {
    return (
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
        <span className="inline-flex items-center justify-center p-0.5 rounded-md bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 shadow-2xs cursor-help" aria-label="Low Stock">
          <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
        </span>
      </Tooltip>
    );
  }

  // Dietary symbol helper
  function renderDietBadge(type?: string) {
    if (type === 'Non-Veg') {
      return <span className="badge-diet-nonveg shrink-0" title="Non-Veg" />;
    }
    if (type === 'Egg') {
      return (
        <span
          className="inline-flex items-center justify-center w-3.5 h-3.5 border-[1.5px] border-amber-500 rounded-[3px] p-[1px] shrink-0"
          title="Egg"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        </span>
      );
    }
    if (type === 'Vegan') {
      return (
        <span className="text-[11px] leading-none shrink-0" title="Vegan">
          🌱
        </span>
      );
    }
    return <span className="badge-diet-veg shrink-0" title="Veg" />;
  }

  // Action Control helper (Total Qty badge like (x6) on desktop/tablet, or +/- stepper on mobile)
  function renderActionControl(item: MenuItem, qty: number) {
    if (qty > 0) {
      return (
        <div className="shrink-0 flex items-center">
          {/* Desktop & Tablet: Count badge (x{qty}) */}
          <span className="hidden md:inline-flex px-2 py-0.5 rounded-lg bg-amber-500 text-stone-950 font-black text-[10px] sm:text-[11px] font-mono shadow-2xs tracking-tight">
            (x{qty})
          </span>

          {/* Mobile View: Plus and Minus Quantity Stepper Component */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="md:hidden inline-flex items-center gap-1 shrink-0 bg-stone-100/90 dark:bg-stone-800/90 p-0.5 rounded-lg border border-stone-200/70 dark:border-stone-700/70 shadow-2xs select-none"
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                const cartItem = cart.slice().reverse().find((c) => c.id === item.id) || item;
                updateCartQty(cartItem, -1);
              }}
              className="w-6 h-6 flex items-center justify-center rounded bg-white dark:bg-stone-700 text-stone-700 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-600 active:scale-90 transition-all cursor-pointer font-bold shadow-2xs border border-stone-200/60 dark:border-stone-600"
              title="Decrease quantity"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3 h-3 stroke-[2.5]" />
            </button>

            <span className="w-7 h-6 flex items-center justify-center rounded bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 border border-stone-200/60 dark:border-stone-600 text-xs font-mono font-black shadow-2xs">
              {qty}
            </span>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleAddToCart(item);
              }}
              className="w-6 h-6 flex items-center justify-center rounded bg-amber-500 hover:bg-amber-600 active:scale-90 text-stone-950 transition-all cursor-pointer font-bold shadow-2xs"
              title="Increase quantity"
              aria-label="Increase quantity"
            >
              <Plus className="w-3 h-3 stroke-[2.5]" />
            </button>
          </div>
        </div>
      );
    }

    // Subtle touch add cue on the right (when qty === 0)
    return (
      <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-400 group-hover:bg-amber-500 group-hover:text-stone-950 flex items-center justify-center transition-all duration-150 shadow-2xs shrink-0">
        <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2.5]" />
      </span>
    );
  }
};
