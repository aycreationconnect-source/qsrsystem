import React from 'react';
import { Flame, Utensils } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface TopSellingItem {
  id: number;
  name: string;
  type?: string;
  count: number;
  revenue: number;
}

interface TopSellingCardProps {
  items: TopSellingItem[];
}

export const TopSellingCard: React.FC<TopSellingCardProps> = ({ items }) => {
  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 hover:border-amber-400/80 dark:hover:border-amber-500/60 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between transition-all">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-stone-900 dark:text-stone-100">
              Today's Best Sellers
            </h3>
            <p className="text-[11px] text-stone-400 dark:text-stone-500">
              Top menu dishes by order volume
            </p>
          </div>
        </div>

        {items.length > 0 && (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/40">
            Top {items.length} Dishes
          </span>
        )}
      </div>

      {/* Dishes List */}
      <div className="my-3 divide-y divide-stone-100 dark:divide-stone-800/80">
        {items.length > 0 ? (
          items.map((it, idx) => {
            const isVeg = (it.type || '').toLowerCase() === 'veg';
            const isNonVeg = (it.type || '').toLowerCase() === 'non-veg';
            const isEgg = (it.type || '').toLowerCase() === 'egg';

            return (
              <div key={idx} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Rank Badge */}
                  <span
                    className={cn(
                      'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-black shrink-0',
                      idx === 0
                        ? 'bg-amber-500 text-stone-950'
                        : idx === 1
                          ? 'bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-200'
                          : idx === 2
                            ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300'
                            : 'bg-stone-100 dark:bg-stone-800 text-stone-400'
                    )}
                  >
                    {idx + 1}
                  </span>

                  {/* Veg / Non-Veg Indicator Dot */}
                  {isVeg ? (
                    <span
                      title="Vegetarian"
                      className="w-3.5 h-3.5 border border-emerald-600 dark:border-emerald-500 flex items-center justify-center rounded-[3px] p-[2px] shrink-0"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-500" />
                    </span>
                  ) : isNonVeg ? (
                    <span
                      title="Non-Vegetarian"
                      className="w-3.5 h-3.5 border border-rose-600 dark:border-rose-500 flex items-center justify-center rounded-[3px] p-[2px] shrink-0"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-600 dark:rose-500" />
                    </span>
                  ) : isEgg ? (
                    <span
                      title="Contains Egg"
                      className="w-3.5 h-3.5 border border-amber-600 dark:border-amber-500 flex items-center justify-center rounded-[3px] p-[2px] shrink-0"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600 dark:bg-amber-500" />
                    </span>
                  ) : null}

                  {/* Dish Name */}
                  <span className="font-bold text-stone-800 dark:text-stone-200 truncate">
                    {it.name}
                  </span>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                    {it.count} sold
                  </span>
                  <span className="font-mono font-extrabold text-stone-900 dark:text-stone-100 text-xs w-16 text-right">
                    ₹{it.revenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-8 text-center flex flex-col items-center justify-center text-stone-400">
            <Utensils className="w-8 h-8 stroke-1 text-stone-300 dark:text-stone-600 mb-2" />
            <p className="text-xs font-semibold text-stone-500 dark:text-stone-400">
              No dish sales recorded yet today
            </p>
            <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-0.5">
              Completed POS orders will automatically display top items here.
            </p>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="pt-3 border-t border-stone-100 dark:border-stone-800 text-[11px] text-stone-400 flex items-center justify-between">
        <span>Portions & revenue calculated live</span>
        <span className="font-semibold text-stone-500">POS Sales Data</span>
      </div>
    </div>
  );
};
