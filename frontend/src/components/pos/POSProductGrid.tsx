import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { usePOS } from '../../context/POSContext';
import type { MenuItem } from '../../types/app.types';
import { X, Utensils } from 'lucide-react';
import { cn } from '../../lib/utils';

export const POSProductGrid: React.FC = () => {
  const { appData } = useApp();
  const {
    posCategory,
    posSearchQuery,
    setPosSearchQuery,
    dietFilter,
    cart,
    handleAddToCart,
  } = usePOS();

  const [catSubcategoryMap, setCatSubcategoryMap] = useState<Record<string, string | null>>({});

  // Set of inactive category names to completely exclude from POS terminal
  const inactiveCategoryNames = new Set(
    (appData.categories || [])
      .filter((c: any) => typeof c !== 'string' && (c.status === 'Inactive' || c.isActive === false))
      .map((c: any) => c.name)
  );

  const activeCategories = (appData.categories || []).filter((c: any) => {
    if (typeof c === 'string') return true;
    return c.status !== 'Inactive' && c.isActive !== false;
  });

  const isPosCategoryInactive = inactiveCategoryNames.has(posCategory);

  const categoriesToRender = isPosCategoryInactive
    ? []
    : posCategory === 'All Items'
    ? ['Uncategorized', ...activeCategories.map((c: any) => (typeof c === 'string' ? c : c.name))]
    : [posCategory];

  // Calculate total items matching active filters across all rendered categories
  // Note: Only items with status === 'Active' are included.
  // Items with available === false (paused by admin) ARE included, but styled as Sold Out!
  const allFilteredItems = appData.menu.filter((m: any) => {
    if (m.isAddon || m.status !== 'Active') return false;
    if (inactiveCategoryNames.has(m.category)) return false;
    if (posCategory !== 'All Items' && m.category !== posCategory) return false;
    if (dietFilter !== 'ALL' && m.type !== dietFilter) return false;
    if (posSearchQuery && !m.name.toLowerCase().includes(posSearchQuery.toLowerCase()))
      return false;
    return true;
  });

  return (
    <main className="flex-1 flex flex-col overflow-hidden bg-stone-50/50 dark:bg-stone-950/20">
      {/* Food Items Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
        {/* Active Search Query Feedback Strip */}
        {posSearchQuery && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs text-stone-600 dark:text-stone-300">
                Search results for: <span className="font-extrabold text-stone-950 dark:text-stone-50">"{posSearchQuery}"</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200/80 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200">
                {allFilteredItems.length} {allFilteredItems.length === 1 ? 'item' : 'items'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setPosSearchQuery('')}
              className="text-xs text-amber-700 dark:text-amber-300 hover:text-amber-800 dark:hover:text-amber-200 font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Clear Search
            </button>
          </div>
        )}
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
              {/* Category Title Header */}
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-200 dark:border-stone-800">
                <h3 className="text-sm font-extrabold text-stone-800 dark:text-stone-200 uppercase tracking-wider">
                  {catName}
                </h3>
                <span className="text-xs font-semibold text-stone-400">
                  {itemsInCat.length} {itemsInCat.length === 1 ? 'item' : 'items'}
                </span>
              </div>

              {/* Subcategories Filter Chips (if category has subcategories) */}
              {catSubcats.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap mb-3">
                  <button
                    type="button"
                    onClick={() => setCatSubcategoryMap((prev) => ({ ...prev, [catName]: null }))}
                    className={cn(
                      'px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer select-none',
                      !activeSub
                        ? 'bg-amber-500 text-stone-950 shadow-xs ring-1 ring-amber-400'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-750'
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
                            ? 'bg-amber-500 text-stone-950 shadow-xs ring-1 ring-amber-400'
                            : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-750'
                        )}
                      >
                        <span>{sub}</span>
                        <span className={cn('text-[10px]', isSelected ? 'text-stone-900 font-extrabold' : 'text-stone-400')}>
                          ({subCount})
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Ultra-Compact Responsive Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 min-[1920px]:grid-cols-7 gap-2 sm:gap-2.5">
                {itemsInCat.map((item: MenuItem, i: number) => {
                  const qty = cart
                    .filter((c) => c.id === item.id)
                    .reduce((sum, c) => sum + c.quantity, 0);

                  return (
                    <div
                      key={item.id || i}
                      onClick={() => handleAddToCart(item)}
                      className={cn(
                        'relative bg-white dark:bg-stone-900 border rounded-xl p-2.5 flex flex-col justify-between transition-all duration-150 select-none cursor-pointer',
                        'border-stone-200/80 dark:border-stone-800 hover:shadow-md hover:border-amber-500/60 active:scale-[0.98]',
                        qty > 0
                          ? 'ring-2 ring-amber-500 border-amber-500 bg-amber-50/25 dark:bg-amber-950/20'
                          : 'hover:bg-stone-50/60 dark:hover:bg-stone-850/60'
                      )}
                    >
                      {/* Top Header Row: Dietary Icon Only & Subcategory / Custom Tag */}
                      <div className="flex items-center justify-between gap-1 mb-1.5 min-w-0">
                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* Dietary Icon only (FSSAI standard symbols, zero text) */}
                          {item.type === 'Non-Veg' ? (
                            <span className="badge-diet-nonveg shrink-0" title="Non-Veg" />
                          ) : item.type === 'Egg' ? (
                            <span
                              className="inline-flex items-center justify-center w-3.5 h-3.5 border-[1.5px] border-amber-500 rounded-[3px] p-[1.5px] shrink-0"
                              title="Egg"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            </span>
                          ) : item.type === 'Vegan' ? (
                            <span
                              className="inline-flex items-center justify-center w-3.5 h-3.5 border-[1.5px] border-emerald-600 rounded-[3px] p-[1px] shrink-0 text-[9px] leading-none"
                              title="Vegan"
                            >
                              🌱
                            </span>
                          ) : (
                            <span className="badge-diet-veg shrink-0" title="Veg" />
                          )}

                          {item.subcategory && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 truncate max-w-[70px]">
                              {item.subcategory}
                            </span>
                          )}

                          {item.addonIds && item.addonIds.trim() !== '' && (
                            <span className="text-[9px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-950/60 px-1 py-0.2 rounded">
                              Custom
                            </span>
                          )}
                        </div>

                        {/* In-Cart Quantity Indicator */}
                        {qty > 0 && (
                          <span className="inline-flex items-center px-1.5 py-0.2 rounded-md text-[11px] font-black bg-amber-500 text-stone-950 font-mono shadow-2xs">
                            x{qty}
                          </span>
                        )}
                      </div>

                      {/* Item Details */}
                      <div className="flex-1 min-w-0 mb-2">
                        <h4 className="text-xs sm:text-sm font-extrabold text-stone-900 dark:text-stone-100 line-clamp-2 leading-tight">
                          {item.name}
                        </h4>
                        {item.description && (
                          <p className="text-[10px] text-stone-400 dark:text-stone-500 truncate mt-0.5">
                            {item.description}
                          </p>
                        )}
                      </div>

                      {/* Bottom Price & Subtotal Row */}
                      <div className="flex items-center justify-between gap-1 pt-1.5 border-t border-stone-100 dark:border-stone-800 shrink-0">
                        <span className="text-xs sm:text-sm font-extrabold font-mono text-amber-600 dark:text-amber-400">
                          ₹{parseFloat(item.price.toString().replace('₹', '')).toFixed(2)}
                        </span>
                        {qty > 1 && (
                          <span
                            title={`Total: ₹${(parseFloat(item.price.toString().replace('₹', '')) * qty).toFixed(2)}`}
                            className="text-[11px] sm:text-xs font-black text-amber-700 dark:text-amber-400 font-mono"
                          >
                            ₹{(parseFloat(item.price.toString().replace('₹', '')) * qty).toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Empty State when no active dishes exist or category is hidden */}
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
};
