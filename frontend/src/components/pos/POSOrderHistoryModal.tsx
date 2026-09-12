import React, { useState, useMemo } from 'react';
import type { Order } from '../../types/app.types';
import { useApp } from '../../context/AppContext';
import { usePOS } from '../../context/POSContext';
import { Modal } from '../ui/Modal';
import { Button, Tooltip } from '../ui';
import { OrderDetailsModal } from '../reports/OrderDetailsModal';
import { printThermalReceipt } from '../../lib/thermalPrintUtils';
import { buildDailyOrderNumberMap, roundPOSAmount } from '../../lib/orderUtils';
import {
  History,
  Search,
  RotateCw,
  Printer,
  Eye,
  Clock,
  CreditCard,
  CheckCircle2,
  X,
  ShoppingBag,
  FileText,
} from 'lucide-react';
import { cn } from '../../lib/utils';

type DatePreset = 'TODAY' | 'YESTERDAY' | 'LAST_7' | 'ALL';

export const POSOrderHistoryModal: React.FC = () => {
  const { appData, refreshOrders, storeProfile, currentUser } = useApp();
  const { showOrderHistoryModal, setShowOrderHistoryModal } = usePOS();

  const [searchQuery, setSearchQuery] = useState('');
  const [datePreset, setDatePreset] = useState<DatePreset>('TODAY');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [reprintingId, setReprintingId] = useState<number | null>(null);

  // Active selected order for viewing full itemized details
  const [selectedOrder, setSelectedOrder] = useState<(Order & { dailySeq: number }) | null>(null);

  const currency = storeProfile?.currencySymbol || '₹';

  // Compute daily sequential order numbers (#1, #2, #3...)
  const dailyNumMap = useMemo(() => {
    return buildDailyOrderNumberMap(appData.orders || []);
  }, [appData.orders]);

  // Filter orders by date preset
  const dateFilteredOrders = useMemo(() => {
    const today = new Date();
    const todayStr = today.toLocaleDateString('en-CA'); // YYYY-MM-DD

    const y = new Date(today);
    y.setDate(y.getDate() - 1);
    const yesterdayStr = y.toLocaleDateString('en-CA');

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    return (appData.orders || []).filter((o) => {
      const d = o.date ? new Date(o.date) : new Date();
      const orderDayKey = d.toLocaleDateString('en-CA');

      switch (datePreset) {
        case 'TODAY':
          return orderDayKey === todayStr;
        case 'YESTERDAY':
          return orderDayKey === yesterdayStr;
        case 'LAST_7':
          return d >= sevenDaysAgo;
        case 'ALL':
        default:
          return true;
      }
    });
  }, [appData.orders, datePreset]);

  // Filter orders by query, payment, and status
  const filteredOrders = useMemo(() => {
    return dateFilteredOrders.filter((o) => {
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
        (o.description || '').toLowerCase().includes(q) ||
        (o.items || []).some((it: any) =>
          (it.menuItem?.name || it.name || '').toLowerCase().includes(q)
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
  }, [dateFilteredOrders, searchQuery, paymentFilter, statusFilter, dailyNumMap]);

  // Aggregate metrics for currently filtered list
  const metrics = useMemo(() => {
    let ordersCount = filteredOrders.length;
    let totalSales = 0;

    filteredOrders.forEach((o) => {
      totalSales += roundPOSAmount(o.total || 0);
    });

    return {
      ordersCount,
      totalSales,
    };
  }, [filteredOrders]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshOrders();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleFastReprint = (e: React.MouseEvent, order: Order, dailySeq: number) => {
    e.stopPropagation();
    setReprintingId(order.id);
    try {
      printThermalReceipt({
        order,
        storeProfile,
        dailySeq,
        settings: appData.settings,
        currentUser,
      });
    } finally {
      setTimeout(() => setReprintingId(null), 1000);
    }
  };

  if (!showOrderHistoryModal) return null;

  return (
    <>
      <Modal
        isOpen={showOrderHistoryModal}
        onClose={() => setShowOrderHistoryModal(false)}
        maxWidth="5xl"
        className="h-[92vh] max-h-[780px] flex flex-col"
        headerClassName="py-3 px-5 sm:px-6"
        bodyClassName="p-0 overflow-hidden flex flex-col flex-1"
        title={
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-stone-900 dark:text-stone-100 leading-tight">
                Terminal Order History
              </h3>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 font-normal">
                Inspect past orders, view itemized bills & reprint receipts
              </p>
            </div>
          </div>
        }
      >
        <div className="flex flex-col h-full flex-1 overflow-hidden p-4 sm:p-5 gap-3.5">
          {/* Top Control Bar: Metrics, Date Presets & Refresh */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1 shrink-0">
            {/* Date Preset Tabs */}
            <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-2xl shrink-0 overflow-x-auto">
              {[
                { id: 'TODAY', label: 'Today' },
                { id: 'YESTERDAY', label: 'Yesterday' },
                { id: 'LAST_7', label: 'Last 7 Days' },
                { id: 'ALL', label: 'All Orders' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setDatePreset(p.id as DatePreset)}
                  className={cn(
                    'px-3 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer',
                    datePreset === p.id
                      ? 'bg-white dark:bg-stone-900 text-stone-950 dark:text-stone-100 shadow-xs font-extrabold'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Live Stats + Refresh Button */}
            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 text-xs font-bold text-amber-900 dark:text-amber-300">
                <ShoppingBag className="w-3.5 h-3.5 text-amber-600" />
                <span>{metrics.ordersCount} Orders</span>
                <span>•</span>
                <span className="font-mono font-extrabold">{currency}{metrics.totalSales}</span>
              </div>

              <Tooltip content="Refresh Orders List" position="bottom" align="end">
                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="p-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-all cursor-pointer"
                  aria-label="Refresh"
                >
                  <RotateCw className={cn('w-4 h-4', isRefreshing && 'animate-spin text-amber-500')} />
                </button>
              </Tooltip>
            </div>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 shrink-0">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Order #, Dish, or ID..."
                className="w-full pl-9 pr-8 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-850 text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Mode & Status Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Payment Filter */}
              <div className="flex items-center gap-1 bg-stone-50 dark:bg-stone-850 p-0.5 rounded-xl border border-stone-200/80 dark:border-stone-800 text-[11px]">
                <span className="text-[10px] font-bold uppercase text-stone-400 pl-2">Mode:</span>
                {['ALL', 'CASH', 'UPI', 'CARD', 'SPLIT'].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setPaymentFilter(m)}
                    className={cn(
                      'px-2 py-1 rounded-lg font-bold transition-all cursor-pointer',
                      paymentFilter === m
                        ? 'bg-amber-500 text-stone-950 shadow-xs'
                        : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                    )}
                  >
                    {m === 'ALL' ? 'All' : m}
                  </button>
                ))}
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1 bg-stone-50 dark:bg-stone-850 p-0.5 rounded-xl border border-stone-200/80 dark:border-stone-800 text-[11px]">
                {['ALL', 'COMPLETED', 'PARTIAL'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    className={cn(
                      'px-2 py-1 rounded-lg font-bold transition-all cursor-pointer',
                      statusFilter === st
                        ? 'bg-amber-500 text-stone-950 shadow-xs'
                        : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                    )}
                  >
                    {st === 'ALL' ? 'All' : st === 'COMPLETED' ? 'Completed' : 'Partial'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table Container (Strictly isolated horizontal and vertical scrolling) */}
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xs">
            <table className="w-full text-left border-collapse text-xs min-w-[700px]">
              <thead className="sticky top-0 z-10 bg-stone-50 dark:bg-stone-850 border-b border-stone-200/80 dark:border-stone-800 text-stone-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-3.5">Order #</th>
                  <th className="py-2.5 px-3.5">Date & Time</th>
                  <th className="py-2.5 px-3.5">Items Summary</th>
                  <th className="py-2.5 px-3.5">Payment</th>
                  <th className="py-2.5 px-3.5 text-right">Amount</th>
                  <th className="py-2.5 px-3.5 text-center">Status</th>
                  <th className="py-2.5 px-3.5 text-center">Actions</th>
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
                      .map((it: any) => `${it.menuItem?.name || it.name || 'Dish'} x${it.quantity || 1}`)
                      .join(', ');
                    const itemsDisplayText =
                      totalItemsCount > 2
                        ? `${itemsPreview} (+${totalItemsCount - 2} more)`
                        : itemsPreview || `${totalItemsCount} item(s)`;

                    const isPartiallyPaid = o.status === 'Partially Paid' || (o.balanceAmount || 0) > 0;
                    const roundedTotal = roundPOSAmount(o.total || 0);

                    return (
                      <tr
                        key={o.id}
                        onClick={() => setSelectedOrder({ ...o, dailySeq })}
                        className="hover:bg-amber-500/5 dark:hover:bg-amber-500/10 transition-colors cursor-pointer group"
                      >
                        {/* Order Number */}
                        <td className="py-2.5 px-3.5 font-bold whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-400 font-extrabold font-mono text-xs">
                              #{dailySeq}
                            </span>
                            <span className="text-[10px] text-stone-400 font-mono">
                              (#{o.id})
                            </span>
                          </div>
                        </td>

                        {/* Date & Time */}
                        <td className="py-2.5 px-3.5 whitespace-nowrap text-stone-600 dark:text-stone-300">
                          <div className="font-semibold text-stone-900 dark:text-stone-100">{dateStr}</div>
                          <div className="text-[10px] text-stone-400 inline-flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            {timeStr}
                          </div>
                        </td>

                        {/* Items Preview */}
                        <td className="py-2.5 px-3.5 max-w-[220px] text-stone-600 dark:text-stone-300">
                          <div className="font-medium truncate">{itemsDisplayText}</div>
                          {o.description && (
                            <div className="text-[10px] text-amber-600 dark:text-amber-400 truncate flex items-center gap-1 mt-0.5" title={o.description}>
                              <FileText className="w-2.5 h-2.5 shrink-0" />
                              <span className="truncate">{o.description}</span>
                            </div>
                          )}
                        </td>

                        {/* Payment Method */}
                        <td className="py-2.5 px-3.5 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
                            <CreditCard className="w-3 h-3 text-amber-500" />
                            {o.paymentMethod || 'Cash'}
                          </span>
                        </td>

                        {/* Total Amount */}
                        <td className="py-2.5 px-3.5 text-right font-mono font-black text-stone-900 dark:text-stone-100 whitespace-nowrap">
                          {currency}{roundedTotal}
                        </td>

                        {/* Status */}
                        <td className="py-2.5 px-3.5 text-center whitespace-nowrap">
                          <span
                            className={cn(
                              'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold',
                              isPartiallyPaid
                                ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                                : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                            )}
                          >
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            {o.status || 'Completed'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-2.5 px-3.5 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            {/* Fast Reprint Receipt Button */}
                            <Tooltip content="Reprint Receipt" position="bottom" align="end">
                              <button
                                type="button"
                                onClick={(e) => handleFastReprint(e, o, dailySeq)}
                                disabled={reprintingId === o.id}
                                className="p-1.5 rounded-lg border border-stone-200 dark:border-stone-750 text-stone-600 dark:text-stone-300 hover:bg-amber-500 hover:text-stone-950 hover:border-amber-500 transition-all cursor-pointer"
                                aria-label="Reprint Receipt"
                              >
                                <Printer className={cn('w-3.5 h-3.5', reprintingId === o.id && 'animate-pulse text-amber-500')} />
                              </button>
                            </Tooltip>

                            {/* View Details Button */}
                            <Tooltip content="View Order Details" position="bottom" align="end">
                              <button
                                type="button"
                                onClick={() => setSelectedOrder({ ...o, dailySeq })}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-stone-200 dark:border-stone-750 text-stone-700 dark:text-stone-300 bg-white dark:bg-stone-850 hover:bg-stone-100 dark:hover:bg-stone-800 text-[11px] font-bold transition-all cursor-pointer"
                              >
                                <Eye className="w-3 h-3 text-amber-500" />
                                <span>View</span>
                              </button>
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-stone-400 dark:text-stone-500">
                      <History className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <div className="font-bold text-xs">No orders found</div>
                      <div className="text-[11px] mt-0.5">
                        Try changing the search query, payment method, or date filter.
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Modal Footer Controls */}
          <div className="flex items-center justify-between pt-1 border-t border-stone-100 dark:border-stone-800 shrink-0 text-xs">
            <span className="text-stone-500 dark:text-stone-400 text-[11px]">
              Showing <strong className="text-stone-900 dark:text-stone-100">{filteredOrders.length}</strong> orders • Total Sales:{' '}
              <strong className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">{currency}{metrics.totalSales}</strong>
            </span>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowOrderHistoryModal(false)}
              className="font-bold cursor-pointer"
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Itemized Order Details Modal */}
      <OrderDetailsModal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
      />
    </>
  );
};
