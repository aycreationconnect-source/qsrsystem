import React, { useState, useMemo, useEffect } from 'react';
import type { Order } from '../../types/app.types';
import { useApp } from '../../context/AppContext';
import { buildDailyOrderNumberMap, roundPOSAmount } from '../../lib/orderUtils';
import { ReportPagination } from './ReportPagination';
import {
  Search,
  Eye,
  Filter,
  CheckCircle2,
  Clock,
  CreditCard,
  XCircle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RotateCcw,
} from 'lucide-react';

interface OrderHistoryReportProps {
  orders: Order[];
  onSelectOrder: (order: Order & { dailySeq: number }) => void;
}

type OrderSortField = 'orderNo' | 'date' | 'subtotal' | 'tax' | 'total' | 'status';
type OrderSortDirection = 'asc' | 'desc';

export const OrderHistoryReport: React.FC<OrderHistoryReportProps> = ({
  orders,
  onSelectOrder,
}) => {
  const { appData, storeProfile } = useApp();
  const currency = storeProfile?.currencySymbol || '₹';

  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Sorting state
  const [sortField, setSortField] = useState<OrderSortField | null>(null);
  const [sortDirection, setSortDirection] = useState<OrderSortDirection>('desc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // Compute daily sequential order numbers (#1, #2, #3...)
  const dailyNumMap = useMemo(() => {
    return buildDailyOrderNumberMap(appData.orders || orders);
  }, [appData.orders, orders]);

  const handleSort = (field: OrderSortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortField(null);
        setSortDirection('desc');
      }
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const resetSort = () => {
    setSortField(null);
    setSortDirection('desc');
  };

  // Filter orders by query, payment, and status, and sort
  const processedOrders = useMemo(() => {
    const filtered = orders.filter((o) => {
      const dailySeq = o.dailyOrderNumber || dailyNumMap.get(o.id) || o.id;
      const q = searchQuery.toLowerCase().trim();

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

      const m = (o.paymentMethod || '').toUpperCase();
      const matchesPayment =
        paymentFilter === 'ALL' ||
        (paymentFilter === 'CASH' && m.includes('CASH')) ||
        (paymentFilter === 'CARD' && m.includes('CARD')) ||
        (paymentFilter === 'UPI' && m.includes('UPI')) ||
        (paymentFilter === 'SPLIT' && (m.includes('SPLIT') || (o.payments && o.payments.length > 1)));

      const s = (o.status || 'Completed').toUpperCase();
      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'COMPLETED' && s === 'COMPLETED') ||
        (statusFilter === 'PARTIAL' && (s.includes('PARTIAL') || (o.balanceAmount || 0) > 0)) ||
        (statusFilter === 'CANCELLED' && s === 'CANCELLED');

      return matchesSearch && matchesPayment && matchesStatus;
    });

    return [...filtered].sort((a, b) => {
      const aSeq = a.dailyOrderNumber || dailyNumMap.get(a.id) || a.id;
      const bSeq = b.dailyOrderNumber || dailyNumMap.get(b.id) || b.id;
      const aDate = new Date(a.date || 0).getTime();
      const bDate = new Date(b.date || 0).getTime();

      if (!sortField) {
        // Default: newest orders first
        return bDate - aDate;
      }

      let comparison = 0;
      switch (sortField) {
        case 'orderNo':
          comparison = Number(aSeq) - Number(bSeq);
          break;
        case 'date':
          comparison = aDate - bDate;
          break;
        case 'subtotal':
          comparison = (a.subtotal || 0) - (b.subtotal || 0);
          break;
        case 'tax':
          comparison = (a.tax || 0) - (b.tax || 0);
          break;
        case 'total':
          comparison = (a.total || 0) - (b.total || 0);
          break;
        case 'status':
          comparison = (a.status || '').localeCompare(b.status || '');
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [orders, searchQuery, paymentFilter, statusFilter, dailyNumMap, sortField, sortDirection]);

  // Filtered Totals
  const filteredTotals = useMemo(() => {
    return processedOrders.reduce(
      (acc, o) => {
        if (o.status !== 'Cancelled') {
          acc.subtotal += o.subtotal || 0;
          acc.tax += o.tax || 0;
          acc.total += roundPOSAmount(o.total || 0);
        }
        return acc;
      },
      { subtotal: 0, tax: 0, total: 0 }
    );
  }, [processedOrders]);

  // Reset page to 1 when filters or sorting change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, paymentFilter, statusFilter, sortField, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(processedOrders.length / pageSize));
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedOrders.slice(start, start + pageSize);
  }, [processedOrders, currentPage, pageSize]);

  const renderSortIcon = (field: OrderSortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-stone-400 group-hover:text-stone-600 transition-colors" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-amber-500 font-bold" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-amber-500 font-bold" />
    );
  };

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
            {['ALL', 'COMPLETED', 'PARTIAL', 'CANCELLED'].map((st) => (
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
                {st === 'ALL' ? 'All' : st === 'COMPLETED' ? 'Completed' : st === 'PARTIAL' ? 'Partial' : 'Cancelled'}
              </button>
            ))}
          </div>

          {/* Reset Sort Button */}
          {sortField !== null && (
            <button
              type="button"
              onClick={resetSort}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs font-bold hover:bg-amber-100 transition-all cursor-pointer"
              title="Reset sorting to default"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Sort</span>
            </button>
          )}
        </div>
      </div>

      {/* Orders Count Summary Header */}
      <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 pt-1">
        <span>
          Showing <strong className="text-stone-900 dark:text-stone-100">{processedOrders.length}</strong> of {orders.length} orders
        </span>
        <span className="hidden sm:inline">Click on any order row to inspect full itemized details.</span>
      </div>

      {/* Constrained Table Container */}
      <div className="w-full overflow-x-auto rounded-2xl border border-stone-200/80 dark:border-stone-800">
        <table className="w-full text-left border-collapse text-xs sm:text-sm min-w-[800px]">
          <thead>
            <tr className="bg-stone-50 dark:bg-stone-850/70 border-b border-stone-200/80 dark:border-stone-800 text-stone-400 font-bold uppercase tracking-wider text-[10px]">
              <th
                onClick={() => handleSort('orderNo')}
                className="py-3 px-4 cursor-pointer hover:text-stone-700 dark:hover:text-stone-200 select-none group"
              >
                <div className="flex items-center gap-1.5">
                  <span>Order #</span>
                  {renderSortIcon('orderNo')}
                </div>
              </th>

              <th
                onClick={() => handleSort('date')}
                className="py-3 px-4 cursor-pointer hover:text-stone-700 dark:hover:text-stone-200 select-none group"
              >
                <div className="flex items-center gap-1.5">
                  <span>Date & Time</span>
                  {renderSortIcon('date')}
                </div>
              </th>

              <th className="py-3 px-4">Tender</th>

              <th
                onClick={() => handleSort('subtotal')}
                className="py-3 px-4 text-right cursor-pointer hover:text-stone-700 dark:hover:text-stone-200 select-none group"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Subtotal</span>
                  {renderSortIcon('subtotal')}
                </div>
              </th>

              <th
                onClick={() => handleSort('tax')}
                className="py-3 px-4 text-right cursor-pointer hover:text-stone-700 dark:hover:text-stone-200 select-none group"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Tax</span>
                  {renderSortIcon('tax')}
                </div>
              </th>

              <th
                onClick={() => handleSort('total')}
                className="py-3 px-4 text-right cursor-pointer hover:text-stone-700 dark:hover:text-stone-200 select-none group"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Total</span>
                  {renderSortIcon('total')}
                </div>
              </th>

              <th
                onClick={() => handleSort('status')}
                className="py-3 px-4 text-center cursor-pointer hover:text-stone-700 dark:hover:text-stone-200 select-none group"
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span>Status</span>
                  {renderSortIcon('status')}
                </div>
              </th>

              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
            {processedOrders.length > 0 ? (
              paginatedOrders.map((o) => {
                const dailySeq = o.dailyOrderNumber || dailyNumMap.get(o.id) || o.id;
                const d = o.date ? new Date(o.date) : new Date();
                const dateStr = d.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
                const timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

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
                      {o.status === 'Cancelled' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30">
                          <XCircle className="w-3 h-3" />
                          Cancelled
                        </span>
                      ) : isPartiallyPaid ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                          <CheckCircle2 className="w-3 h-3" />
                          {o.status || 'Partially Paid'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" />
                          {o.status || 'Completed'}
                        </span>
                      )}
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
                <td colSpan={8} className="py-12 text-center text-stone-400 text-xs">
                  No orders match your filter criteria.
                </td>
              </tr>
            )}
          </tbody>

          {/* Table Footer with Filtered Totals */}
          {processedOrders.length > 0 && (
            <tfoot>
              <tr className="bg-amber-500/10 dark:bg-amber-500/15 border-t-2 border-amber-500/30 font-black text-xs sm:text-sm text-stone-900 dark:text-stone-100">
                <td colSpan={3} className="py-3.5 px-4 uppercase tracking-wider text-amber-700 dark:text-amber-300">
                  Total ({processedOrders.length} Orders)
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

      {/* Pagination Controls */}
      <ReportPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={processedOrders.length}
        pageSize={pageSize}
        pageSizeOptions={[10, 15, 25, 50]}
        onPageChange={setCurrentPage}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setCurrentPage(1);
        }}
        itemLabel="orders"
      />
    </div>
  );
};
