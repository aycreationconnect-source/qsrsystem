import React from 'react';
import { Link } from 'react-router-dom';
import type { Order } from '../../types/app.types';
import { useApp } from '../../context/AppContext';
import { buildDailyOrderNumberMap } from '../../lib/orderUtils';
import { History, ArrowRight, Wallet, QrCode, CreditCard, CheckCircle2 } from 'lucide-react';

interface RecentActivityProps {
  recentOrders: Order[];
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ recentOrders }) => {
  const { appData } = useApp();
  const dailyNumMap = buildDailyOrderNumberMap(appData.orders || []);

  const getPaymentIcon = (method: string) => {
    const m = (method || '').toLowerCase();
    if (m.includes('cash')) return <Wallet className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />;
    if (m.includes('upi') || m.includes('online') || m.includes('qr'))
      return <QrCode className="w-3 h-3 text-sky-600 dark:text-sky-400" />;
    return <CreditCard className="w-3 h-3 text-violet-600 dark:text-violet-400" />;
  };

  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 hover:border-amber-400/80 dark:hover:border-amber-500/60 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between transition-all">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-stone-900 dark:text-stone-100">
              Recent Completed Orders
            </h3>
            <p className="text-[11px] text-stone-400 dark:text-stone-500">
              Live sequence of recent customer sales
            </p>
          </div>
        </div>

        <Link
          to="/reports"
          className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-700 dark:text-amber-400 hover:underline"
        >
          <span>All Orders</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Orders List */}
      <div className="my-3 divide-y divide-stone-100 dark:divide-stone-800/80">
        {recentOrders.length > 0 ? (
          recentOrders.map((o: any, i: number) => {
            const dailySeq = o.dailyOrderNumber || dailyNumMap.get(o.id) || o.id;
            const itemCount = o.items?.reduce((s: number, it: any) => s + (Number(it.quantity) || 1), 0) || 0;
            const timeStr = o.date
              ? new Date(o.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : 'Just now';

            return (
              <div key={i} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-7 h-7 rounded-xl bg-stone-100 dark:bg-stone-800 font-mono font-bold text-stone-700 dark:text-stone-200 flex items-center justify-center text-[11px] shrink-0">
                    #{dailySeq}
                  </span>

                  <div className="truncate">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-800 dark:text-stone-200">
                        Order #{dailySeq}
                      </span>
                      <span className="text-[11px] text-stone-400">{timeStr}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-stone-400">
                      <span>{itemCount > 0 ? `${itemCount} items` : 'Dine-In/Takeaway'}</span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1 text-stone-600 dark:text-stone-300 font-medium">
                        {getPaymentIcon(o.paymentMethod)}
                        <span>{o.paymentMethod || 'Cash'}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="font-mono font-black text-stone-900 dark:text-stone-100 text-xs">
                    ₹{o.total?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    Paid
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-8 text-center text-xs text-stone-400">
            No completed orders recorded today.
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="pt-3 border-t border-stone-100 dark:border-stone-800 text-[11px] text-stone-400 flex items-center justify-between">
        <span>Click 'All Orders' to view or reprint receipts</span>
        <span className="font-semibold text-stone-500">Live POS Stream</span>
      </div>
    </div>
  );
};
