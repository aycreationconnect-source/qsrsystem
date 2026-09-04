import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, IndianRupee, Armchair, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StatCardsProps {
  ordersTodayCount: number;
  ordersTrend: number;
  revenueToday: number;
  revenueTrend: number;
  activeTablesCount: number;
  totalTables: number;
}

export const StatCards: React.FC<StatCardsProps> = ({
  ordersTodayCount,
  ordersTrend,
  revenueToday,
  revenueTrend,
  activeTablesCount,
  totalTables,
}) => {
  const navigate = useNavigate();
  const occupancyRate = totalTables > 0 ? Math.round((activeTablesCount / totalTables) * 100) : 0;
  const availableTables = Math.max(0, totalTables - activeTablesCount);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {/* 1. Total Orders */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
            Orders Today
          </span>
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
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
      <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
            Today's Gross
          </span>
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
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

      {/* 3. Active Floor Tables */}
      <div
        onClick={() => navigate('/pos')}
        role="button"
        tabIndex={0}
        title="Click to view live floor & table terminal"
        className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 hover:border-amber-400/80 dark:hover:border-amber-500/60 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer group select-none relative overflow-hidden"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 flex items-center gap-1.5">
            <span>Occupied Tables</span>
            {totalTables > 0 && (
              <span className="text-[10px] font-mono font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded">
                {occupancyRate}%
              </span>
            )}
          </span>
          <div className="w-10 h-10 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-amber-500/15 group-hover:text-amber-500 transition-all duration-200">
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
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <span>View Tables</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </span>
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
