import React, { useState, useMemo } from 'react';
import type { Order } from '../../types/app.types';
import { useApp } from '../../context/AppContext';
import { buildDailyOrderNumberMap, roundPOSAmount } from '../../lib/orderUtils';
import { Search, Eye, Filter, CheckCircle2, Clock, CreditCard } from 'lucide-react';

interface OrderHistoryReportProps {
  orders: Order[];
  onSelectOrder: (order: Order & { dailySeq: number }) => void;
}

export const OrderHistoryReport: React.FC<OrderHistoryReportProps> = ({
  orders,
  onSelectOrder,
}) => {
  const { appData, storeProfile } = useApp();
  const currency = storeProfile?.currencySymbol || '₹';

  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Compute daily sequential order numbers (#1, #2, #3...)
  const dailyNumMap = useMemo(() => {
    return buildDailyOrderNumberMap(appData.orders || orders);
  }, [appData.orders, orders]);

  // Filter orders by query, payment, and status
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const dailySeq = o.dailyOrderNumber || dailyNumMap.get(o.id) || o.id;
      const q = searchQuery.toLowerCase().trim();

      // Search match: daily #, system ID, payment method, or item names
      const matchesSearch =
        !q ||
        `order #${dailySeq}`.toLowerCase().includes(q) ||
        `#${dailySeq}`.toLowerCase().includes(q) ||
        String(dailySeq) === q ||
        String(o.id) === q ||
        (o.paymentMethod || '').toLowerCase().includes(q) ||
        (o.items || []).some((it: any) =>
          (it.menuItem?.name || '').toLowerCase().includes(q)
        );

      // Payment match
      const m = (o.paymentMethod || '').toUpperCase();
      const matchesPayment =
        paymentFilter === 'ALL' ||
        (paymentFilter === 'CASH' && m.includes('CASH')) ||
        (paymentFilter === 'CARD' && m.includes('CARD')) ||
        (paymentFilter === 'UPI' && m.includes('UPI')) ||
        (paymentFilter === 'SPLIT' && (m.includes('SPLIT') || (o.payments && o.payments.length > 1)));

      // Status match
      const s = (o.status || 'Completed').toUpperCase();
      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'COMPLETED' && s === 'COMPLETED') ||
        (statusFilter === 'PARTIAL' && (s.includes('PARTIAL') || (o.balanceAmount || 0) > 0));

      return matchesSearch && matchesPayment && matchesStatus;
    });
  }, [orders, searchQuery, paymentFilter, statusFilter, dailyNumMap]);

  // Filtered Totals
  const filteredTotals = useMemo(() => {
    return filteredOrders.reduce(
      (acc, o) => {
        acc.subtotal += o.subtotal || 0;
        acc.tax += o.tax || 0;
        acc.total += roundPOSAmount(o.total || 0);
        return acc;
      },
      { subtotal: 0, tax: 0, total: 0 }
    );
  }, [filteredOrders]);

  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
      {/* Top Search & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Order #, Dish, or ID..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-850 text-xs sm:text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Payment Method Filter */}
          <div className="flex items-center gap-1.5 bg-stone-50 dark:bg-stone-850 p-1 rounded-2xl border border-stone-200/80 dark:border-stone-800 text-xs">
            <span className="text-[10px] font-bold uppercase text-stone-400 pl-2">Mode:</span>
            {['ALL', 'CASH', 'UPI', 'CARD', 'SPLIT'].map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setPaymentFilter(mode)}
                className={`px-2.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  paymentFilter === mode
                    ? 'bg-amber-500 text-stone-950 shadow-sm shadow-amber-500/20'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                {mode === 'ALL' ? 'All' : mode}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-stone-50 dark:bg-stone-850 p-1 rounded-2xl border border-stone-200/80 dark:border-stone-800 text-xs">
            <Filter className="w-3.5 h-3.5 text-stone-400 ml-2" />
            {['ALL', 'COMPLETED', 'PARTIAL'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-amber-500 text-stone-950 shadow-sm shadow-amber-500/20'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                {st === 'ALL' ? 'All' : st === 'COMPLETED' ? 'Completed' : 'Partial'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Count Summary Header */}
      <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 pt-1">
        <span>
          Showing <strong className="text-stone-900 dark:text-stone-100">{filteredOrders.length}</strong> of {orders.length} orders
        </span>
        <span>Click on any order row to inspect full itemized details.</span>
      </div>

      {/* Constrained Table Container (Horizontal scrollbar strictly inside table container) */}
      <div className="w-full overflow-x-auto rounded-2xl border border-stone-200/80 dark:border-stone-800">
        <table className="w-full text-left border-collapse text-xs sm:text-sm min-w-[800px]">
          <thead>
            <tr className="bg-stone-50 dark:bg-stone-850/70 border-b border-stone-200/80 dark:border-stone-800 text-stone-400 font-bold uppercase tracking-wider text-[10px]">
              <th className="py-3 px-4">Order #</th>
              <th className="py-3 px-4">Date & Time</th>
              <th className="py-3 px-4">Items Summary</th>
              <th className="py-3 px-4">Tender</th>
              <th className="py-3 px-4 text-right">Subtotal</th>
              <th className="py-3 px-4 text-right">Tax</th>
              <th className="py-3 px-4 text-right">Total</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
            {filteredOrders.length > 0 ? (
              filteredOrders.map((o) => {
                const dailySeq = o.dailyOrderNumber || dailyNumMap.get(o.id) || o.id;
                const d = o.date ? new Date(o.date) : new Date();
                const dateStr = d.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
                const timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

                const totalItemsCount = (o.items || []).reduce(
                  (sum: number, it: any) => sum + (it.quantity || 1),
                  0
                );

                const itemsPreview = (o.items || [])
                  .slice(0, 2)
                  .map((it: any) => `${it.menuItem?.name || 'Dish'} x${it.quantity || 1}`)
                  .join(', ');
                const itemsDisplayText = totalItemsCount > 2
                  ? `${itemsPreview} (+${totalItemsCount - 2} more)`
                  : itemsPreview || `${totalItemsCount} item(s)`;

                const isPartiallyPaid = o.status === 'Partially Paid' || (o.balanceAmount || 0) > 0;

                return (
                  <tr
                    key={o.id}
                    onClick={() => onSelectOrder({ ...o, dailySeq })}
                    className="hover:bg-amber-500/5 dark:hover:bg-amber-500/10 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4 font-bold whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-400 font-extrabold font-mono text-xs">
                          #{dailySeq}
                        </span>
                        <span className="text-[11px] text-stone-400 font-mono">
                          (ID #{o.id})
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-stone-600 dark:text-stone-300">
                      <div className="font-semibold text-stone-900 dark:text-stone-100">{dateStr}</div>
                      <div className="text-[11px] text-stone-400 inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {timeStr}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs truncate text-stone-600 dark:text-stone-300">
                      <span className="font-medium">{itemsDisplayText}</span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
                        <CreditCard className="w-3 h-3 text-amber-500" />
                        {o.paymentMethod || 'Cash'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono text-stone-600 dark:text-stone-400">
                      {currency}{(o.subtotal || 0).toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono text-stone-600 dark:text-stone-400">
                      {currency}{(o.tax || 0).toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-black text-stone-900 dark:text-stone-100">
                      {currency}{roundPOSAmount(o.total || 0).toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          isPartiallyPaid
                            ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                            : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        {o.status || 'Completed'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectOrder({ ...o, dailySeq });
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-750 text-stone-700 dark:text-stone-300 bg-white dark:bg-stone-850 hover:bg-amber-500 hover:text-stone-950 hover:border-amber-500 font-bold text-xs transition-all shadow-sm cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={9} className="py-12 text-center text-stone-400 text-xs">
                  No orders match your filter criteria.
                </td>
              </tr>
            )}
          </tbody>

          {/* Table Footer with Filtered Totals */}
          {filteredOrders.length > 0 && (
            <tfoot>
              <tr className="bg-amber-500/10 dark:bg-amber-500/15 border-t-2 border-amber-500/30 font-black text-xs sm:text-sm text-stone-900 dark:text-stone-100">
                <td colSpan={4} className="py-3.5 px-4 uppercase tracking-wider text-amber-700 dark:text-amber-300">
                  Total ({filteredOrders.length} Orders)
                </td>
                <td className="py-3.5 px-4 text-right font-mono">
                  {currency}{filteredTotals.subtotal.toFixed(2)}
                </td>
                <td className="py-3.5 px-4 text-right font-mono">
                  {currency}{filteredTotals.tax.toFixed(2)}
                </td>
                <td className="py-3.5 px-4 text-right font-mono text-amber-700 dark:text-amber-300 text-sm font-black">
                  {currency}{filteredTotals.total.toFixed(2)}
                </td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};
