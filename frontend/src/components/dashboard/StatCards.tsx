import React from 'react';
import { ShoppingBag, IndianRupee, Armchair, TrendingUp, TrendingDown } from 'lucide-react';
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
      <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
            Occupied Tables
          </span>
          <div className="w-10 h-10 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
            <Armchair className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-4">
          <div className="text-3xl font-extrabold text-stone-900 dark:text-stone-100 font-mono">
            {activeTablesCount} <span className="text-base text-stone-400">/ {totalTables}</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Live Floor
            </span>
            <span className="text-[11px] text-stone-400">
              {totalTables - activeTablesCount} available
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
