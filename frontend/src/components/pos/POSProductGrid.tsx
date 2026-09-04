import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { usePOS } from '../../context/POSContext';
import type { MenuItem } from '../../types/app.types';
import { Badge } from '../ui';
import { Search, Plus, Minus, X, AlertCircle, Utensils } from 'lucide-react';
import { cn } from '../../lib/utils';

export const POSProductGrid: React.FC = () => {
  const { appData } = useApp();
  const {
    posCategory,
    posSearchQuery,
    setPosSearchQuery,
    cart,
    handleAddToCart,
    updateCartQty,
  } = usePOS();

  const [dietFilter, setDietFilter] = useState<'ALL' | 'Veg' | 'Non-Veg' | 'Egg'>('ALL');
  const [stockWarning, setStockWarning] = useState<string | null>(null);

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
      {/* Search & Dietary Filter Header */}
      <div className="p-3 sm:p-4 bg-white dark:bg-stone-900 border-b border-stone-200/80 dark:border-stone-800 flex flex-col sm:flex-row items-center gap-3 shrink-0">
        {/* Search Bar */}
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search food & beverage..."
            value={posSearchQuery}
            onChange={(e) => setPosSearchQuery(e.target.value)}
            className="w-full bg-stone-100 dark:bg-stone-800/80 text-stone-900 dark:text-stone-100 placeholder-stone-400 text-xs sm:text-sm pl-10 pr-8 py-2.5 rounded-xl border border-transparent focus:border-amber-500 focus:bg-white dark:focus:bg-stone-900 focus:outline-none transition-all"
          />
          {posSearchQuery && (
            <button
              onClick={() => setPosSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dietary Filters */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto no-scrollbar">
          {(['ALL', 'Veg', 'Non-Veg', 'Egg'] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setDietFilter(filter)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer select-none',
                dietFilter === filter
                  ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-sm'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
              )}
            >
              {filter === 'ALL'
                ? 'All Diets'
                : filter === 'Veg'
                ? '🟢 Veg'
                : filter === 'Non-Veg'
                ? '🔴 Non-Veg'
                : '🟡 Egg'}
            </button>
          ))}
        </div>
      </div>

      {/* Food Items Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {categoriesToRender.map((catName: string) => {
          const itemsInCat = appData.menu.filter((m: any) => {
            if (m.isAddon || m.status !== 'Active') return false;
            if (inactiveCategoryNames.has(m.category)) return false;
            if (m.category !== catName) return false;
            if (dietFilter !== 'ALL' && m.type !== dietFilter) return false;
            if (posSearchQuery && !m.name.toLowerCase().includes(posSearchQuery.toLowerCase()))
              return false;
            return true;
          });

          if (itemsInCat.length === 0) return null;

          return (
            <div key={catName}>
              {/* Category Title Header */}
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-stone-200 dark:border-stone-800">
                <h3 className="text-sm font-extrabold text-stone-800 dark:text-stone-200 uppercase tracking-wider">
                  {catName}
                </h3>
                <span className="text-xs font-semibold text-stone-400">{itemsInCat.length} items</span>
              </div>

              {/* Responsive Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                {itemsInCat.map((item: MenuItem, i: number) => {
                  const qty = cart
                    .filter((c) => c.id === item.id)
                    .reduce((sum, c) => sum + c.quantity, 0);

                  // Calculate stock
                  let isLowStock = false;
                  const availableStock = (() => {
                    if (!item.ingredients || item.ingredients.length === 0) return '∞';
                    let minPortions = Infinity;
                    for (const ing of item.ingredients) {
                      const invItem = appData.inventory.find(
                        (inv: any) => (inv.item || inv.name) === ing.name
                      );
                      if (!invItem) return 0;
                      const reqQty = parseFloat(String(ing.quantity));
                      if (reqQty <= 0) continue;
                      const portions = Math.floor(invItem.stock / reqQty);
                      if (portions < minPortions) minPortions = portions;
                    }
                    if (minPortions !== Infinity && minPortions <= 5) isLowStock = true;
                    return minPortions === Infinity ? '∞' : minPortions;
                  })();

                  const isUnavailable = item.available === false;
                  const isOutOfStock = typeof availableStock === 'number' && availableStock <= 0;
                  const isSoldOut = isUnavailable || isOutOfStock;

                  return (
                    <div
                      key={item.id || i}
                      onClick={() => {
                        if (isSoldOut) {
                          setStockWarning(
                            isUnavailable
                              ? `"${item.name}" is paused and marked Sold Out by admin.`
                              : `"${item.name}" is currently out of stock (depleted inventory).`
                          );
                          setTimeout(() => setStockWarning(null), 3000);
                          return;
                        }
                        if (qty === 0 || (item.addonIds && item.addonIds.trim() !== '')) {
                          handleAddToCart(item);
                        }
                      }}
                      className={cn(
                        'relative bg-white dark:bg-stone-900 border rounded-2xl p-3 flex flex-col justify-between transition-all duration-150 select-none',
                        isSoldOut
                          ? 'opacity-70 bg-stone-100/90 dark:bg-stone-900/70 border-stone-300 dark:border-stone-800 cursor-not-allowed shadow-none'
                          : 'border-stone-200/80 dark:border-stone-800 cursor-pointer hover:shadow-md hover:border-amber-500/40 hover:-translate-y-0.5',
                        qty > 0 && !isSoldOut && 'ring-2 ring-amber-500 border-amber-500 bg-amber-50/20 dark:bg-amber-950/10'
                      )}
                    >
                      {/* Top Header Row: Dietary Badge + Stock */}
                      <div className="flex items-center justify-between gap-1 mb-2">
                        {item.type === 'Non-Veg' ? (
                          <Badge variant="nonveg" size="sm">Non-Veg</Badge>
                        ) : item.type === 'Egg' ? (
                          <Badge variant="egg" size="sm">Egg</Badge>
                        ) : (
                          <Badge variant="veg" size="sm">Veg</Badge>
                        )}

                        {isUnavailable ? (
                          <span className="text-[10px] font-extrabold uppercase tracking-wide text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-950/80 px-2 py-0.5 rounded-lg border border-rose-200 dark:border-rose-900/60 shadow-xs">
                            Sold Out
                          </span>
                        ) : isOutOfStock ? (
                          <span className="text-[10px] font-extrabold uppercase tracking-wide text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-950/80 px-2 py-0.5 rounded-lg border border-rose-200 dark:border-rose-900/60 shadow-xs">
                            Out of Stock
                          </span>
                        ) : isLowStock ? (
                          <span className="text-[10px] font-bold text-amber-600 bg-amber-100 dark:bg-amber-950/60 px-1.5 py-0.5 rounded">
                            {availableStock} left
                          </span>
                        ) : null}
                      </div>

                      {/* Item Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 line-clamp-1">
                          {item.name}
                        </h4>
                        {item.description && (
                          <p className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-2 mt-0.5">
                            {item.description}
                          </p>
                        )}
                        {item.addonIds && item.addonIds.trim() !== '' && (
                          <span className="inline-block text-[9px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/50 px-1.5 py-0.5 rounded mt-1.5">
                            Customizable
                          </span>
                        )}
                      </div>

                      {/* Bottom Price & Add/Qty Row */}
                      <div
                        className="flex items-center justify-between pt-3 mt-2 border-t border-stone-100 dark:border-stone-800"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span
                          className={cn(
                            'text-sm font-extrabold font-mono',
                            isSoldOut
                              ? 'text-stone-400 dark:text-stone-500'
                              : 'text-amber-600 dark:text-amber-400'
                          )}
                        >
                          ₹{parseFloat(item.price.toString().replace('₹', '')).toFixed(2)}
                        </span>

                        {isSoldOut ? (
                          <span className="inline-flex items-center px-2.5 py-1.5 rounded-xl bg-stone-200/90 dark:bg-stone-800 text-stone-500 dark:text-stone-400 font-extrabold text-[11px] select-none border border-stone-300/80 dark:border-stone-750 cursor-not-allowed">
                            Sold Out
                          </span>
                        ) : qty === 0 ? (
                          <button
                            type="button"
                            onClick={() => handleAddToCart(item)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs shadow-sm shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add</span>
                          </button>
                        ) : (
                          /* Quantity Stepper */
                          <div className="flex items-center gap-1.5 bg-stone-100 dark:bg-stone-800 p-0.5 rounded-xl">
                            <button
                              type="button"
                              onClick={() => {
                                if (item.addonIds && item.addonIds.trim() !== '') {
                                  const firstConfig = cart.find((c) => c.id === item.id);
                                  if (firstConfig) updateCartQty(firstConfig.name, -1);
                                } else {
                                  updateCartQty(item, -1);
                                }
                              }}
                              className="w-7 h-7 flex items-center justify-center rounded-lg bg-white dark:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold hover:bg-stone-200 active:scale-90 transition-all cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>

                            <span className="w-6 text-center text-xs font-extrabold text-stone-900 dark:text-stone-100 font-mono">
                              {qty}
                            </span>

                            <button
                              type="button"
                              disabled={isOutOfStock}
                              onClick={() => {
                                if (item.addonIds && item.addonIds.trim() !== '') {
                                  handleAddToCart(item);
                                } else {
                                  updateCartQty(item, 1);
                                }
                              }}
                              className="w-7 h-7 flex items-center justify-center rounded-lg bg-amber-500 text-stone-950 font-bold hover:bg-amber-600 active:scale-90 transition-all cursor-pointer shadow-sm"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
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
          </div>
        )}
      </div>

      {/* Out of Stock Floating Toast Alert */}
      {stockWarning && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 font-bold text-xs px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <AlertCircle className="w-4 h-4 text-amber-500" />
          <span>{stockWarning}</span>
          <button
            onClick={() => setStockWarning(null)}
            className="ml-2 opacity-60 hover:opacity-100 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </main>
  );
};
