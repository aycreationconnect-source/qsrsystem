import React from 'react';
import { Link } from 'react-router-dom';
import type { InventoryItem } from '../../types/app.types';
import { AlertTriangle, CheckCircle2, ArrowRight, Boxes } from 'lucide-react';
import { cn } from '../../lib/utils';

interface InventoryAlertCardProps {
  lowStockItems: InventoryItem[];
  totalInventoryCount: number;
}

export const InventoryAlertCard: React.FC<InventoryAlertCardProps> = ({
  lowStockItems,
  totalInventoryCount,
}) => {
  const hasLowStock = lowStockItems.length > 0;

  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 hover:border-amber-400/80 dark:hover:border-amber-500/60 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between transition-all">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              'w-9 h-9 rounded-2xl flex items-center justify-center',
              hasLowStock
                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
            )}
          >
            {hasLowStock ? (
              <AlertTriangle className="w-4 h-4" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-stone-900 dark:text-stone-100">
              Kitchen Pantry Health
            </h3>
            <p className="text-[11px] text-stone-400 dark:text-stone-500">
              Low-stock ingredient warnings & inventory
            </p>
          </div>
        </div>

        {hasLowStock ? (
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/40 animate-pulse">
            {lowStockItems.length} {lowStockItems.length === 1 ? 'Item Low' : 'Items Low'}
          </span>
        ) : (
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40">
            Healthy Stock
          </span>
        )}
      </div>

      {/* Items List or Healthy State */}
      <div className="my-3 divide-y divide-stone-100 dark:divide-stone-800/80">
        {hasLowStock ? (
          lowStockItems.slice(0, 4).map((item, idx) => {
            const isOutOfStock = (item.status || '').toLowerCase().includes('out') || Number(item.stock) <= 0;
            const itemName = item.item || item.name || `Item #${item.id}`;

            return (
              <div key={idx} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={cn(
                      'w-2 h-2 rounded-full shrink-0',
                      isOutOfStock ? 'bg-rose-500' : 'bg-amber-500'
                    )}
                  />
                  <div className="truncate">
                    <span className="font-bold text-stone-800 dark:text-stone-200 block truncate">
                      {itemName}
                    </span>
                    <span className="text-[11px] text-stone-400">
                      Min Alert: {item.threshold} {item.unit}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="font-mono font-bold text-stone-800 dark:text-stone-200 text-xs">
                    {item.stock} {item.unit} left
                  </span>
                  <span
                    className={cn(
                      'text-[10px] font-bold px-2 py-0.5 rounded-md',
                      isOutOfStock
                        ? 'bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300'
                        : 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300'
                    )}
                  >
                    {isOutOfStock ? 'Out of Stock' : 'Low Stock'}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-6 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2">
              <Boxes className="w-6 h-6 stroke-1" />
            </div>
            <p className="text-xs font-bold text-stone-800 dark:text-stone-200">
              All Ingredients Well-Stocked
            </p>
            <p className="text-[11px] text-stone-400 dark:text-stone-500 max-w-xs mt-0.5">
              All {totalInventoryCount} kitchen pantry items are safely above minimum warning thresholds.
            </p>
          </div>
        )}
      </div>

      {/* Footer Link */}
      <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
        <span className="text-[11px] text-stone-400">
          {totalInventoryCount} tracked ingredients
        </span>
        <Link
          to="/inventory"
          className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-700 dark:text-amber-400 hover:underline"
        >
          <span>{hasLowStock ? 'Restock in Inventory' : 'Manage Inventory'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
