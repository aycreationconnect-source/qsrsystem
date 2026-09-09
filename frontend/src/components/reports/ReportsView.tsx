import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { TotalSummaryReport } from './TotalSummaryReport';
import { OrderHistoryReport } from './OrderHistoryReport';
import { OrderDetailsModal } from './OrderDetailsModal';
import { printReportToPdf, exportReportToXls, type ReportColumn } from '../../lib/reportExportUtils';
import { buildDailyOrderNumberMap, roundPOSAmount } from '../../lib/orderUtils';
import type { Order } from '../../types/app.types';
import {
  BarChart3,
  Calendar,
  Download,
  FileSpreadsheet,
  History,
  Printer,
  RotateCw,
} from 'lucide-react';

type ReportTab = 'summary' | 'history';
type DatePreset = 'TODAY' | 'YESTERDAY' | 'LAST_7' | 'LAST_30' | 'THIS_MONTH' | 'ALL' | 'CUSTOM';

export const ReportsView: React.FC = () => {
  const { appData, refreshOrders, storeProfile } = useApp();

  const [activeTab, setActiveTab] = useState<ReportTab>('summary');
  const [datePreset, setDatePreset] = useState<DatePreset>('TODAY');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<(Order & { dailySeq: number }) | null>(null);

  const allOrders = useMemo(() => appData.orders || [], [appData.orders]);

  // Filter orders by chosen date range
  const filteredOrders = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return allOrders.filter((order) => {
      if (!order.date) return true;
      const orderDate = new Date(order.date);
      const orderDay = new Date(orderDate);
      orderDay.setHours(0, 0, 0, 0);

      switch (datePreset) {
        case 'TODAY':
          return orderDay.getTime() === today.getTime();

        case 'YESTERDAY': {
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          return orderDay.getTime() === yesterday.getTime();
        }

        case 'LAST_7': {
          const sevenDaysAgo = new Date(today);
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
          return orderDay >= sevenDaysAgo && orderDay <= new Date();
        }

        case 'LAST_30': {
          const thirtyDaysAgo = new Date(today);
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
          return orderDay >= thirtyDaysAgo && orderDay <= new Date();
        }

        case 'THIS_MONTH': {
          return (
            orderDate.getFullYear() === today.getFullYear() &&
            orderDate.getMonth() === today.getMonth()
          );
        }

        case 'CUSTOM': {
          if (!customFrom && !customTo) return true;
          const from = customFrom ? new Date(`${customFrom}T00:00:00`) : null;
          const to = customTo ? new Date(`${customTo}T23:59:59`) : null;
          if (from && orderDate < from) return false;
          if (to && orderDate > to) return false;
          return true;
        }

        case 'ALL':
        default:
          return true;
      }
    });
  }, [allOrders, datePreset, customFrom, customTo]);

  // Date range description text for headers and exports
  const dateRangeText = useMemo(() => {
    const today = new Date();
    const formatD = (d: Date) =>
      d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });

    switch (datePreset) {
      case 'TODAY':
        return `Today (${formatD(today)})`;
      case 'YESTERDAY': {
        const y = new Date(today);
        y.setDate(y.getDate() - 1);
        return `Yesterday (${formatD(y)})`;
      }
      case 'LAST_7': {
        const start = new Date(today);
        start.setDate(start.getDate() - 6);
        return `${formatD(start)} - ${formatD(today)}`;
      }
      case 'LAST_30': {
        const start = new Date(today);
        start.setDate(start.getDate() - 29);
        return `${formatD(start)} - ${formatD(today)}`;
      }
      case 'THIS_MONTH':
        return today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      case 'CUSTOM':
        return `${customFrom || 'Start'} to ${customTo || 'End'}`;
      case 'ALL':
      default:
        return 'All Time History';
    }
  }, [datePreset, customFrom, customTo]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshOrders();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Build export payload for Total Summary Report
  const getSummaryExportData = () => {
    // Group by day
    const map = new Map<string, Order[]>();
    filteredOrders.forEach((o) => {
      const d = o.date ? new Date(o.date) : new Date();
      const dayKey = d.toLocaleDateString('en-CA');
      const list = map.get(dayKey) || [];
      list.push(o);
      map.set(dayKey, list);
    });

    const sortedKeys = Array.from(map.keys()).sort((a, b) => b.localeCompare(a));
    let grandOrders = 0;
    let grandSubtotal = 0;
    let grandTax = 0;
    let grandCash = 0;
    let grandCard = 0;
    let grandUpi = 0;
    let grandOther = 0;
    let grandNet = 0;

    const rows = sortedKeys.map((dayKey) => {
      const dayOrders = map.get(dayKey) || [];
      let sub = 0;
      let tax = 0;
      let cash = 0;
      let card = 0;
      let upi = 0;
      let other = 0;
      let net = 0;

      dayOrders.forEach((o) => {
        const orderTot = roundPOSAmount(o.total || 0);
        sub += o.subtotal || 0;
        tax += o.tax || 0;
        net += orderTot;

        if (o.payments && o.payments.length > 0) {
          o.payments.forEach((p) => {
            const m = (p.paymentMethod || '').toLowerCase();
            const amt = p.amount || 0;
            if (m.includes('cash')) cash += amt;
            else if (m.includes('card')) card += amt;
            else if (m.includes('upi')) upi += amt;
            else other += amt;
          });
        } else {
          const m = (o.paymentMethod || '').toLowerCase();
          if (m.includes('cash')) cash += orderTot;
          else if (m.includes('card')) card += orderTot;
          else if (m.includes('upi')) upi += orderTot;
          else other += orderTot;
        }
      });

      grandOrders += dayOrders.length;
      grandSubtotal += sub;
      grandTax += tax;
      grandCash += cash;
      grandCard += card;
      grandUpi += upi;
      grandOther += other;
      grandNet += net;

      const aov = dayOrders.length > 0 ? net / dayOrders.length : 0;
      const d = new Date(`${dayKey}T00:00:00`);
      const displayDate = d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });

      return {
        date: displayDate,
        orders: dayOrders.length,
        subtotal: `₹${sub.toFixed(2)}`,
        tax: `₹${tax.toFixed(2)}`,
        cash: `₹${cash.toFixed(2)}`,
        card: `₹${card.toFixed(2)}`,
        upi: `₹${upi.toFixed(2)}`,
        other: `₹${other.toFixed(2)}`,
        net: `₹${net.toFixed(2)}`,
        aov: `₹${aov.toFixed(2)}`,
      };
    });

    const grandAov = grandOrders > 0 ? grandNet / grandOrders : 0;
    const summaryRow = {
      date: 'GRAND TOTAL',
      orders: grandOrders,
      subtotal: `₹${grandSubtotal.toFixed(2)}`,
      tax: `₹${grandTax.toFixed(2)}`,
      cash: `₹${grandCash.toFixed(2)}`,
      card: `₹${grandCard.toFixed(2)}`,
      upi: `₹${grandUpi.toFixed(2)}`,
      other: `₹${grandOther.toFixed(2)}`,
      net: `₹${grandNet.toFixed(2)}`,
      aov: `₹${grandAov.toFixed(2)}`,
    };

    const columns: ReportColumn[] = [
      { header: 'Date', key: 'date', align: 'left' },
      { header: 'Orders', key: 'orders', align: 'center' },
      { header: 'Subtotal', key: 'subtotal', align: 'right' },
      { header: 'Tax / GST', key: 'tax', align: 'right' },
      { header: 'Cash Tender', key: 'cash', align: 'right' },
      { header: 'Card Tender', key: 'card', align: 'right' },
      { header: 'UPI Tender', key: 'upi', align: 'right' },
      { header: 'Split/Other', key: 'other', align: 'right' },
      { header: 'Net Sales', key: 'net', align: 'right' },
      { header: 'Avg Order Value', key: 'aov', align: 'right' },
    ];

    return { columns, rows, summaryRow };
  };

  // Build export payload for Order History Report
  const getHistoryExportData = () => {
    const dailyNumMap = buildDailyOrderNumberMap(allOrders);

    let totSub = 0;
    let totTax = 0;
    let totTotal = 0;

    const rows = filteredOrders.map((o) => {
      const dailySeq = o.dailyOrderNumber || dailyNumMap.get(o.id) || o.id;
      const d = o.date ? new Date(o.date) : new Date();
      const dtStr = `${d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}, ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`;

      const itemsSummary = (o.items || [])
        .map((it: any) => `${it.menuItem?.name || 'Dish'} x${it.quantity || 1}`)
        .join('; ');

      const orderTot = roundPOSAmount(o.total || 0);
      totSub += o.subtotal || 0;
      totTax += o.tax || 0;
      totTotal += orderTot;

      return {
        dailySeq: `#${dailySeq}`,
        orderId: `#${o.id}`,
        dateTime: dtStr,
        items: itemsSummary || 'N/A',
        paymentMethod: o.paymentMethod || 'Cash',
        subtotal: `₹${(o.subtotal || 0).toFixed(2)}`,
        tax: `₹${(o.tax || 0).toFixed(2)}`,
        total: `₹${orderTot.toFixed(2)}`,
        status: o.status || 'Completed',
      };
    });

    const summaryRow = {
      dailySeq: 'TOTAL',
      orderId: `${filteredOrders.length} Orders`,
      dateTime: '',
      items: '',
      paymentMethod: '',
      subtotal: `₹${totSub.toFixed(2)}`,
      tax: `₹${totTax.toFixed(2)}`,
      total: `₹${totTotal.toFixed(2)}`,
      status: '',
    };

    const columns: ReportColumn[] = [
      { header: 'Daily Order #', key: 'dailySeq', align: 'center' },
      { header: 'System Ref ID', key: 'orderId', align: 'center' },
      { header: 'Date & Time', key: 'dateTime', align: 'left' },
      { header: 'Items Purchased', key: 'items', align: 'left' },
      { header: 'Tender Mode', key: 'paymentMethod', align: 'center' },
      { header: 'Subtotal', key: 'subtotal', align: 'right' },
      { header: 'Tax', key: 'tax', align: 'right' },
      { header: 'Total Amount', key: 'total', align: 'right' },
      { header: 'Status', key: 'status', align: 'center' },
    ];

    return { columns, rows, summaryRow };
  };

  // Handler for Print PDF
  const handlePrintPdf = () => {
    const isSummary = activeTab === 'summary';
    const reportTitle = isSummary ? 'Total Summary & Sales Report' : 'Order History Detailed Report';
    const { columns, rows, summaryRow } = isSummary ? getSummaryExportData() : getHistoryExportData();

    printReportToPdf({
      fileName: `${storeProfile?.businessName || 'Cafe'}_${activeTab}_${new Date().toISOString().slice(0, 10)}`,
      reportTitle,
      dateRangeText,
      storeProfile,
      columns,
      rows,
      summaryRow,
    });
  };

  // Handler for Export XLS
  const handleExportXls = () => {
    const isSummary = activeTab === 'summary';
    const reportTitle = isSummary ? 'Total Summary & Sales Report' : 'Order History Detailed Report';
    const { columns, rows, summaryRow } = isSummary ? getSummaryExportData() : getHistoryExportData();
    const safeName = (storeProfile?.businessName || 'Cafe').replace(/[^a-zA-Z0-9_-]/g, '_');

    exportReportToXls({
      fileName: `${safeName}_${isSummary ? 'Total_Summary' : 'Order_History'}_${new Date().toISOString().slice(0, 10)}.xls`,
      reportTitle,
      dateRangeText,
      storeProfile,
      columns,
      rows,
      summaryRow,
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* 1. Top Header Card */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-500" />
            <span>Store Reports & Analytics</span>
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Audit daily sales revenue, tax breakdown, tender distributions, and complete order history.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border border-stone-200 dark:border-stone-750 bg-stone-50 dark:bg-stone-850 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold text-xs transition-all cursor-pointer"
            title="Refresh latest orders"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-500' : ''}`} />
            <span>Refresh</span>
          </button>

          {/* Print PDF Button */}
          <button
            type="button"
            onClick={handlePrintPdf}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl border border-stone-200 dark:border-stone-750 bg-white dark:bg-stone-850 hover:bg-amber-50 dark:hover:bg-amber-950/30 hover:border-amber-400 text-stone-800 dark:text-stone-200 font-bold text-xs transition-all shadow-sm cursor-pointer"
          >
            <Printer className="w-4 h-4 text-amber-500" />
            <span>Print PDF</span>
          </button>

          {/* Export XLS Button */}
          <button
            type="button"
            onClick={handleExportXls}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-500 text-stone-950 font-bold text-xs hover:bg-amber-400 active:scale-95 transition-all shadow-sm shadow-amber-500/20 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Print XLS</span>
          </button>
        </div>
      </div>

      {/* 2. Sub-Tabs & Date Filter Controls */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Sub-Tabs: Total Summary vs Order History */}
          <div className="flex items-center bg-stone-100 dark:bg-stone-850 p-1.5 rounded-2xl border border-stone-200/80 dark:border-stone-800 self-start">
            <button
              type="button"
              onClick={() => setActiveTab('summary')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                activeTab === 'summary'
                  ? 'bg-amber-500 text-stone-950 shadow-sm shadow-amber-500/20'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Total Summary</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-amber-500 text-stone-950 shadow-sm shadow-amber-500/20'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Order History</span>
            </button>
          </div>

          {/* Quick Date Presets */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <Calendar className="w-4 h-4 text-stone-400 mr-1 hidden sm:block" />
            {[
              { label: 'Today', value: 'TODAY' },
              { label: 'Yesterday', value: 'YESTERDAY' },
              { label: 'Last 7 Days', value: 'LAST_7' },
              { label: 'Last 30 Days', value: 'LAST_30' },
              { label: 'This Month', value: 'THIS_MONTH' },
              { label: 'All Time', value: 'ALL' },
              { label: 'Custom', value: 'CUSTOM' },
            ].map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setDatePreset(p.value as DatePreset)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  datePreset === p.value
                    ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-sm'
                    : 'bg-stone-50 dark:bg-stone-850 text-stone-600 dark:text-stone-400 border border-stone-200/80 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Date Pickers (Shown if Custom preset selected) */}
        {datePreset === 'CUSTOM' && (
          <div className="flex items-center gap-3 pt-3 border-t border-stone-100 dark:border-stone-800 flex-wrap text-xs">
            <span className="font-bold text-stone-500">Custom Date Range:</span>
            <div className="flex items-center gap-2">
              <label className="text-stone-400">From:</label>
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-750 bg-stone-50 dark:bg-stone-850 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-stone-400">To:</label>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-750 bg-stone-50 dark:bg-stone-850 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* 3. Active Report Content */}
      {activeTab === 'summary' ? (
        <TotalSummaryReport orders={filteredOrders} dateRangeText={dateRangeText} />
      ) : (
        <OrderHistoryReport
          orders={filteredOrders}
          onSelectOrder={(order) => setSelectedOrder(order)}
        />
      )}

      {/* 4. Complete Order Details Modal */}
      <OrderDetailsModal
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
      />
    </div>
  );
};
