import React from 'react';
import { BarChart3 } from 'lucide-react';

interface RevenueChartProps {
  last7Days: Date[];
  revenueByDay: number[];
  maxRev: number;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({
  last7Days,
  revenueByDay,
  maxRev,
}) => {
  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 hover:border-amber-400/80 dark:hover:border-amber-500/60 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
            <BarChart3 className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-extrabold text-stone-900 dark:text-stone-100">
            Weekly Sales Velocity
          </h3>
        </div>
        <span className="text-xs font-semibold text-stone-400">Past 7 Days</span>
      </div>

      {/* Bar Chart Area */}
      <div className="h-48 sm:h-56 flex items-end justify-between gap-2 sm:gap-4 pt-8 pb-3 px-2">
        {revenueByDay.map((val, i) => {
          const heightPercent = Math.max(8, (val / maxRev) * 100);
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
              {/* Tooltip on hover */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 whitespace-nowrap mb-1">
                ₹{val.toFixed(0)}
              </div>

              {/* Bar Fill */}
              <div
                style={{ height: `${heightPercent}%` }}
                className="w-full max-w-[42px] bg-gradient-to-t from-amber-500 to-amber-400 rounded-t-xl transition-all duration-300 group-hover:from-amber-600 group-hover:to-amber-500 shadow-sm"
              />
            </div>
          );
        })}
      </div>

      {/* Days Row */}
      <div className="flex justify-between text-stone-400 text-xs font-bold pt-3 border-t border-stone-100 dark:border-stone-800 px-2">
        {last7Days.map((d, i) => (
          <span key={i} className="flex-1 text-center">
            {d.toLocaleDateString('en-US', { weekday: 'short' })}
          </span>
        ))}
      </div>
    </div>
  );
};
