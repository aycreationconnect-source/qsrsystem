import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { usePOS } from '../../context/POSContext';
import type { MenuItem } from '../../types/app.types';
import { Badge } from '../ui';
import { Search, Plus, Minus, X } from 'lucide-react';
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

  const categoriesToRender =
    posCategory === 'All Items'
      ? ['Uncategorized', ...appData.categories.map((c: any) => (typeof c === 'string' ? c : c.name))]
      : [posCategory];

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
            if (m.isAddon || m.available === false || m.status !== 'Active') return false;
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

                  const isOutOfStock = typeof availableStock === 'number' && availableStock <= 0;

                  return (
                    <div
                      key={item.id || i}
                      onClick={() => {
                        if (isOutOfStock) {
                          alert(`Warning: ${item.name} is currently out of stock!`);
                          return;
                        }
                        if (qty === 0 || (item.addonIds && item.addonIds.trim() !== '')) {
                          handleAddToCart(item);
                        }
                      }}
                      className={cn(
                        'relative bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-2xl p-3 flex flex-col justify-between transition-all duration-150 select-none cursor-pointer',
                        'hover:shadow-md hover:border-amber-500/40 hover:-translate-y-0.5',
                        qty > 0 && 'ring-2 ring-amber-500 border-amber-500 bg-amber-50/20 dark:bg-amber-950/10',
                        isOutOfStock && 'opacity-60 bg-stone-100 dark:bg-stone-900/60'
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

                        {isOutOfStock ? (
                          <span className="text-[10px] font-bold text-rose-600 bg-rose-100 dark:bg-rose-950/60 px-1.5 py-0.5 rounded">
                            Sold Out
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
                        <span className="text-sm font-extrabold text-amber-600 dark:text-amber-400 font-mono">
                          ₹{parseFloat(item.price.toString().replace('₹', '')).toFixed(2)}
                        </span>

                        {qty === 0 ? (
                          <button
                            type="button"
                            disabled={isOutOfStock}
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
      </div>
    </main>
  );
};
