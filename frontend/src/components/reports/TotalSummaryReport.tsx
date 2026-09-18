import React from 'react';
import type { Order } from '../../types/app.types';
import { useApp } from '../../context/AppContext';
import { roundPOSAmount } from '../../lib/orderUtils';
import { ReportPagination } from './ReportPagination';
import {
  DollarSign,
  ShoppingBag,
  Percent,
  Receipt,
  Wallet,
  CreditCard,
  QrCode,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RotateCcw,
} from 'lucide-react';

interface TotalSummaryReportProps {
  orders: Order[];
  dateRangeText: string;
}

type SummarySortField =
  | 'date'
  | 'orders'
  | 'subtotal'
  | 'tax'
  | 'cash'
  | 'card'
  | 'upi'
  | 'other'
  | 'net'
  | 'aov';
type SummarySortDirection = 'asc' | 'desc';

export interface DaySummaryData {
  dateStr: string;
  displayDate: string;
  orderCount: number;
  subtotal: number;
  tax: number;
  cashTotal: number;
  cardTotal: number;
  upiTotal: number;
  otherTotal: number;
  netTotal: number;
  aov: number;
}

export const TotalSummaryReport: React.FC<TotalSummaryReportProps> = ({
  orders,
}) => {
  const { storeProfile } = useApp();
  const currency = storeProfile?.currencySymbol || '₹';

  // 1. Group orders by calendar date
  const ordersByDay = React.useMemo(() => {
    const map = new Map<string, Order[]>();

    orders.forEach((o) => {
      const d = o.date ? new Date(o.date) : new Date();
      const dayKey = d.toLocaleDateString('en-CA'); // YYYY-MM-DD
      const list = map.get(dayKey) || [];
      list.push(o);
      map.set(dayKey, list);
    });

    // Sort days descending (latest first)
    const sortedKeys = Array.from(map.keys()).sort((a, b) => b.localeCompare(a));

    const dayRows: DaySummaryData[] = sortedKeys.map((dayKey) => {
      const dayOrders = map.get(dayKey) || [];
      let subtotal = 0;
      let tax = 0;
      let cashTotal = 0;
      let cardTotal = 0;
      let upiTotal = 0;
      let otherTotal = 0;
      let netTotal = 0;

      const activeDayOrders = dayOrders.filter((o) => o.status !== 'Cancelled');

      activeDayOrders.forEach((o) => {
        const orderSub = o.subtotal || 0;
        const orderTax = o.tax || 0;
        const orderTot = roundPOSAmount(o.total || 0);

        subtotal += orderSub;
        tax += orderTax;
        netTotal += orderTot;

        // Tender calculation
        if (o.payments && o.payments.length > 0) {
          o.payments.forEach((p) => {
            const m = (p.paymentMethod || '').toLowerCase();
            const amt = p.amount || 0;
            if (m.includes('cash')) cashTotal += amt;
            else if (m.includes('card')) cardTotal += amt;
            else if (m.includes('upi')) upiTotal += amt;
            else otherTotal += amt;
          });
        } else {
          const m = (o.paymentMethod || '').toLowerCase();
          if (m.includes('cash')) cashTotal += orderTot;
          else if (m.includes('card')) cardTotal += orderTot;
          else if (m.includes('upi')) upiTotal += orderTot;
          else otherTotal += orderTot;
        }
      });

      const orderCount = activeDayOrders.length;
      const aov = orderCount > 0 ? netTotal / orderCount : 0;
      const d = new Date(`${dayKey}T00:00:00`);
      const displayDate = d.toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });

      return {
        dateStr: dayKey,
        displayDate,
        orderCount,
        subtotal,
        tax,
        cashTotal,
        cardTotal,
        upiTotal,
        otherTotal,
        netTotal,
        aov,
      };
    });

    return dayRows;
  }, [orders]);

  // Overall Totals
  const overall = React.useMemo(() => {
    let ordersCount = 0;
    let subtotal = 0;
    let tax = 0;
    let cash = 0;
    let card = 0;
    let upi = 0;
    let other = 0;
    let net = 0;

    ordersByDay.forEach((r) => {
      ordersCount += r.orderCount;
      subtotal += r.subtotal;
      tax += r.tax;
      cash += r.cashTotal;
      card += r.cardTotal;
      upi += r.upiTotal;
      other += r.otherTotal;
      net += r.netTotal;
    });

    const aov = ordersCount > 0 ? net / ordersCount : 0;

    return {
      ordersCount,
      subtotal,
      tax,
      cash,
      card,
      upi,
      other,
      net,
      aov,
    };
  }, [ordersByDay]);

  // Sorting state for table
  const [sortField, setSortField] = React.useState<SummarySortField | null>(null);
  const [sortDirection, setSortDirection] = React.useState<SummarySortDirection>('desc');

  const handleSort = (field: SummarySortField) => {
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

  const sortedDays = React.useMemo(() => {
    if (!sortField) return ordersByDay;

    return [...ordersByDay].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'date':
          comparison = a.dateStr.localeCompare(b.dateStr);
          break;
        case 'orders':
          comparison = a.orderCount - b.orderCount;
          break;
        case 'subtotal':
          comparison = a.subtotal - b.subtotal;
          break;
        case 'tax':
          comparison = a.tax - b.tax;
          break;
        case 'cash':
          comparison = a.cashTotal - b.cashTotal;
          break;
        case 'card':
          comparison = a.cardTotal - b.cardTotal;
          break;
        case 'upi':
          comparison = a.upiTotal - b.upiTotal;
          break;
        case 'other':
          comparison = a.otherTotal - b.otherTotal;
          break;
        case 'net':
          comparison = a.netTotal - b.netTotal;
          break;
        case 'aov':
          comparison = a.aov - b.aov;
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [ordersByDay, sortField, sortDirection]);

  // Pagination State
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(15);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [sortField, sortDirection, orders]);

  const totalPages = Math.max(1, Math.ceil(sortedDays.length / pageSize));
  const paginatedDays = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedDays.slice(start, start + pageSize);
  }, [sortedDays, currentPage, pageSize]);

  const renderSortIcon = (field: SummarySortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-stone-400 group-hover:text-stone-600 transition-colors" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-amber-500 font-bold" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-amber-500 font-bold" />
    );
  };

  // Tender Breakdown Metrics
  const tenderBreakdown = [
    {
      name: 'Cash',
      amount: overall.cash,
      count: orders.filter((o) => (o.paymentMethod || '').toLowerCase() === 'cash').length,
      icon: Wallet,
      color: 'text-emerald-600 bg-emerald-500/10',
    },
    {
      name: 'UPI / Online',
      amount: overall.upi,
      count: orders.filter((o) => (o.paymentMethod || '').toLowerCase() === 'upi').length,
      icon: QrCode,
      color: 'text-amber-600 bg-amber-500/10',
    },
    {
      name: 'Card',
      amount: overall.card,
      count: orders.filter((o) => (o.paymentMethod || '').toLowerCase() === 'card').length,
      icon: CreditCard,
      color: 'text-sky-600 bg-sky-500/10',
    },
    {
      name: 'Split / Other',
      amount: overall.other,
      count: orders.filter((o) => {
        const m = (o.paymentMethod || '').toLowerCase();
        return m === 'split' || (!m.includes('cash') && !m.includes('card') && !m.includes('upi'));
      }).length,
      icon: Receipt,
      color: 'text-purple-600 bg-purple-500/10',
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. KPI Summary Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-2xl p-4 sm:p-5 shadow-sm min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 dark:text-stone-400">Total Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-lg sm:text-2xl font-black text-stone-900 dark:text-stone-100 font-mono truncate">
            {currency}{overall.net.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-stone-400 mt-1">Gross sales including taxes</p>
        </div>

        <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-2xl p-4 sm:p-5 shadow-sm min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 dark:text-stone-400">Total Orders</span>
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-lg sm:text-2xl font-black text-stone-900 dark:text-stone-100 font-mono truncate">
            {overall.ordersCount}
          </div>
          <p className="text-[11px] text-stone-400 mt-1">Processed orders in period</p>
        </div>

        <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-2xl p-4 sm:p-5 shadow-sm min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 dark:text-stone-400">Total Tax / GST</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-lg sm:text-2xl font-black text-stone-900 dark:text-stone-100 font-mono truncate">
            {currency}{overall.tax.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-stone-400 mt-1">Accumulated tax collections</p>
        </div>

        <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-2xl p-4 sm:p-5 shadow-sm min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 dark:text-stone-400">Avg Order Value</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-lg sm:text-2xl font-black text-stone-900 dark:text-stone-100 font-mono truncate">
            {currency}{overall.aov.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-stone-400 mt-1">Average ticket size per order</p>
        </div>
      </div>

      {/* 2. Tender Mode Breakdown Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        {tenderBreakdown.map((t) => {
          const Icon = t.icon;
          const percentage = overall.net > 0 ? ((t.amount / overall.net) * 100).toFixed(1) : '0.0';
          return (
            <div
              key={t.name}
              className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-2xl p-3.5 sm:p-4 shadow-sm"
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${t.color}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-stone-700 dark:text-stone-300">{t.name}</span>
              </div>
              <div className="mt-2 text-base sm:text-lg font-black font-mono text-stone-900 dark:text-stone-100">
                {currency}{t.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="flex items-center justify-between text-[11px] text-stone-400 mt-1">
                <span>{t.count} orders</span>
                <span className="font-semibold text-amber-600">{percentage}%</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Main Daily Aggregated Breakdown Table */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <h3 className="text-sm sm:text-base font-extrabold text-stone-900 dark:text-stone-100">
              Date-wise Sales & Tender Summary
            </h3>
            <span className="text-xs font-bold text-stone-400">
              ({sortedDays.length} {sortedDays.length === 1 ? 'day' : 'days'})
            </span>
          </div>

          <div className="flex items-center gap-2">
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

        {/* Constrained Table Container */}
        <div className="w-full overflow-x-auto rounded-2xl border border-stone-200/80 dark:border-stone-800">
          <table className="w-full text-left border-collapse text-xs sm:text-sm min-w-[760px]">
            <thead>
              <tr className="bg-stone-50 dark:bg-stone-850/70 border-b border-stone-200/80 dark:border-stone-800 text-stone-400 font-bold uppercase tracking-wider text-[10px]">
                <th
                  onClick={() => handleSort('date')}
                  className="py-3 px-4 cursor-pointer hover:text-stone-700 dark:hover:text-stone-200 select-none group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Date</span>
                    {renderSortIcon('date')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('orders')}
                  className="py-3 px-4 text-center cursor-pointer hover:text-stone-700 dark:hover:text-stone-200 select-none group"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span>Orders</span>
                    {renderSortIcon('orders')}
                  </div>
                </th>
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
                  onClick={() => handleSort('cash')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-stone-700 dark:hover:text-stone-200 select-none group"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Cash</span>
                    {renderSortIcon('cash')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('card')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-stone-700 dark:hover:text-stone-200 select-none group"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Card</span>
                    {renderSortIcon('card')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('upi')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-stone-700 dark:hover:text-stone-200 select-none group"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>UPI</span>
                    {renderSortIcon('upi')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('other')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-stone-700 dark:hover:text-stone-200 select-none group"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Split/Other</span>
                    {renderSortIcon('other')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('net')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-stone-700 dark:hover:text-stone-200 select-none group"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Net Sales</span>
                    {renderSortIcon('net')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('aov')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-stone-700 dark:hover:text-stone-200 select-none group"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>AOV</span>
                    {renderSortIcon('aov')}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {sortedDays.length > 0 ? (
                paginatedDays.map((row) => (
                  <tr
                    key={row.dateStr}
                    className="hover:bg-stone-50/70 dark:hover:bg-stone-800/40 transition-colors"
                  >
                    <td className="py-3 px-4 font-bold text-stone-900 dark:text-stone-100 whitespace-nowrap">
                      {row.displayDate}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-stone-700 dark:text-stone-300">
                      {row.orderCount}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-stone-600 dark:text-stone-400">
                      {currency}{row.subtotal.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-stone-600 dark:text-stone-400">
                      {currency}{row.tax.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-600 dark:text-emerald-400">
                      {currency}{row.cashTotal.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-sky-600 dark:text-sky-400">
                      {currency}{row.cardTotal.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-amber-600 dark:text-amber-400">
                      {currency}{row.upiTotal.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-purple-600 dark:text-purple-400">
                      {currency}{row.otherTotal.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-black text-stone-900 dark:text-stone-100">
                      {currency}{row.netTotal.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-stone-500">
                      {currency}{row.aov.toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-stone-400 text-xs">
                    No order transactions recorded for the selected date period.
                  </td>
                </tr>
              )}
            </tbody>

            {/* Grand Total Summary Row */}
            {ordersByDay.length > 0 && (
              <tfoot>
                <tr className="bg-amber-500/10 dark:bg-amber-500/15 border-t-2 border-amber-500/30 font-black text-xs sm:text-sm text-stone-900 dark:text-stone-100">
                  <td className="py-3.5 px-4 uppercase tracking-wider text-amber-700 dark:text-amber-300">
                    Grand Total
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono text-amber-700 dark:text-amber-300">
                    {overall.ordersCount}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono">
                    {currency}{overall.subtotal.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono">
                    {currency}{overall.tax.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-emerald-600 dark:text-emerald-400">
                    {currency}{overall.cash.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-sky-600 dark:text-sky-400">
                    {currency}{overall.card.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-amber-600 dark:text-amber-400">
                    {currency}{overall.upi.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-purple-600 dark:text-purple-400">
                    {currency}{overall.other.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-amber-700 dark:text-amber-300 text-sm font-black">
                    {currency}{overall.net.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-stone-600 dark:text-stone-300">
                    {currency}{overall.aov.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Table Pagination */}
        <ReportPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={sortedDays.length}
          pageSize={pageSize}
          pageSizeOptions={[10, 15, 25, 50]}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
          itemLabel="days"
        />
      </div>
    </div>
  );
};
