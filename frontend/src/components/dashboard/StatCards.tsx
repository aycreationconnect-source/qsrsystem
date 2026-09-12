import React from 'react';
import { ShoppingBag, IndianRupee, Armchair, TrendingUp, TrendingDown, Receipt } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StatCardsProps {
  ordersTodayCount: number;
  ordersTrend: number;
  revenueToday: number;
  revenueTrend: number;
  activeTablesCount: number;
  totalTables: number;
  avgOrderValue?: number;
}

export const StatCards: React.FC<StatCardsProps> = ({
  ordersTodayCount,
  ordersTrend,
  revenueToday,
  revenueTrend,
  activeTablesCount,
  totalTables,
  avgOrderValue = 0,
}) => {
  const occupancyRate = totalTables > 0 ? Math.round((activeTablesCount / totalTables) * 100) : 0;
  const availableTables = Math.max(0, totalTables - activeTablesCount);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {/* 1. Total Orders */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 hover:border-amber-400/80 dark:hover:border-amber-500/60 rounded-3xl p-5 shadow-xs flex flex-col justify-between group transition-all">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Orders Today
            </span>
            <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-0.5">
              Completed tickets
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-4">
          <div className="text-3xl font-extrabold text-stone-900 dark:text-stone-100 font-mono">
            {ordersTodayCount}
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <span
              className={cn(
                'inline-flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-md',
                ordersTrend >= 0
                  ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40'
                  : 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40'
              )}
            >
              {ordersTrend >= 0 ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              {Math.abs(ordersTrend)}%
            </span>
            <span className="text-[11px] text-stone-400">vs yesterday</span>
          </div>
        </div>
      </div>

      {/* 2. Total Revenue */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 hover:border-amber-400/80 dark:hover:border-amber-500/60 rounded-3xl p-5 shadow-xs flex flex-col justify-between group transition-all">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Today's Gross
            </span>
            <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-0.5">
              Total sales revenue
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
            <IndianRupee className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-4">
          <div className="text-3xl font-extrabold text-stone-900 dark:text-stone-100 font-mono">
            ₹{revenueToday.toFixed(2)}
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <span
              className={cn(
                'inline-flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-md',
                revenueTrend >= 0
                  ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40'
                  : 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40'
              )}
            >
              {revenueTrend >= 0 ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              {Math.abs(revenueTrend)}%
            </span>
            <span className="text-[11px] text-stone-400">vs yesterday</span>
          </div>
        </div>
      </div>

      {/* 3. Average Bill Value */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 hover:border-amber-400/80 dark:hover:border-amber-500/60 rounded-3xl p-5 shadow-xs flex flex-col justify-between group transition-all">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Avg Bill Value
            </span>
            <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-0.5">
              Average spend / order
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Receipt className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-4">
          <div className="text-3xl font-extrabold text-stone-900 dark:text-stone-100 font-mono">
            ₹{avgOrderValue.toFixed(2)}
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-md bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300">
              Ticket Size
            </span>
            <span className="text-[11px] text-stone-400">per order</span>
          </div>
        </div>
      </div>

      {/* 4. Active Floor Tables */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 hover:border-amber-400/80 dark:hover:border-amber-500/60 rounded-3xl p-5 shadow-xs flex flex-col justify-between group transition-all">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
              <span>Occupied Tables</span>
              {totalTables > 0 && (
                <span className="text-[10px] font-mono font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded">
                  {occupancyRate}%
                </span>
              )}
            </span>
            <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-0.5">
              Live floor occupancy
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Armchair className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-baseline justify-between">
            <div className="text-3xl font-extrabold text-stone-900 dark:text-stone-100 font-mono">
              {activeTablesCount}{' '}
              <span className="text-base text-stone-400 dark:text-stone-500 font-sans">
                / {totalTables}
              </span>
            </div>
          </div>

          {/* Mini Capacity Progress Bar */}
          <div className="w-full bg-stone-100 dark:bg-stone-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                occupancyRate >= 90
                  ? 'bg-rose-500'
                  : occupancyRate >= 50
                    ? 'bg-amber-500'
                    : activeTablesCount > 0
                      ? 'bg-sky-500'
                      : 'bg-stone-300 dark:bg-stone-700'
              )}
              style={{ width: `${Math.min(100, Math.max(0, occupancyRate))}%` }}
            />
          </div>

          <div className="flex items-center justify-between gap-1.5 mt-2.5">
            {activeTablesCount > 0 ? (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs font-bold border border-amber-200/50 dark:border-amber-800/40">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                Live Floor: {activeTablesCount} Busy
              </span>
            ) : totalTables > 0 ? (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-200/50 dark:border-emerald-800/40">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                All Tables Free
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] text-stone-400 font-medium">
                No tables set up
              </span>
            )}

            <span className="text-[11px] text-stone-400 dark:text-stone-500 font-medium">
              {availableTables} available
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
