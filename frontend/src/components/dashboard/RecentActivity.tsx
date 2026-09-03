import React from 'react';
import type { Order } from '../../types/app.types';
import { History } from 'lucide-react';

interface RecentActivityProps {
  recentOrders: Order[];
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ recentOrders }) => {
  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col flex-1">
      <div className="flex items-center gap-2 pb-3 border-b border-stone-100 dark:border-stone-800">
        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
          <History className="w-4 h-4" />
        </div>
        <h3 className="text-sm font-extrabold text-stone-900 dark:text-stone-100">
          Recent Completed Orders
        </h3>
      </div>

      <div className="mt-3 divide-y divide-stone-100 dark:divide-stone-800/80">
        {recentOrders.length > 0 ? (
          recentOrders.map((o: any, i: number) => (
            <div key={i} className="py-3 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <div>
                  <span className="font-bold text-stone-800 dark:text-stone-200">
                    Order #{o.id}
                  </span>
                  <span className="text-[11px] text-stone-400 ml-2">
                    {o.date ? new Date(o.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                  </span>
                </div>
              </div>

              <span className="font-mono font-bold text-stone-900 dark:text-stone-100">
                ₹{o.total?.toFixed(2)}
              </span>
            </div>
          ))
        ) : (
          <div className="py-8 text-center text-xs text-stone-400">
            No recent orders recorded today.
          </div>
        )}
      </div>
    </div>
  );
};
