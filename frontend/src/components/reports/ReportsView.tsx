import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { TotalSummaryReport } from './TotalSummaryReport';
import { OrderHistoryReport } from './OrderHistoryReport';
import { InventoryReport } from './InventoryReport';
import { MenuItemWiseReport } from './MenuItemWiseReport';
import { ReportsCategorySidebar, type ReportType } from './ReportsCategorySidebar';
import { CustomDateRangePicker } from './CustomDateRangePicker';
import { OrderDetailsModal } from './OrderDetailsModal';
import { printReportToPdf, exportReportToXls, type ReportColumn } from '../../lib/reportExportUtils';
import { buildDailyOrderNumberMap, roundPOSAmount } from '../../lib/orderUtils';
import type { Order } from '../../types/app.types';
import {
  Calendar,
  Download,
  Printer,
  RotateCw,
} from 'lucide-react';

type DatePreset = 'TODAY' | 'YESTERDAY' | 'LAST_7' | 'LAST_30' | 'THIS_MONTH' | 'ALL' | 'CUSTOM';

export const ReportsView: React.FC = () => {
  const { appData, refreshOrders, storeProfile } = useApp();

  const [activeReport, setActiveReport] = useState<ReportType>('summary');
  const [datePreset, setDatePreset] = useState<DatePreset>('TODAY');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<(Order & { dailySeq: number }) | null>(null);

  const allOrders = useMemo(() => appData.orders || [], [appData.orders]);
  const inventory = useMemo(() => appData.inventory || [], [appData.inventory]);

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
        const past = new Date(today);
        past.setDate(past.getDate() - 6);
        return `Past 7 Days (${formatD(past)} - ${formatD(today)})`;
      }
      case 'LAST_30': {
        const past = new Date(today);
        past.setDate(past.getDate() - 29);
        return `Past 30 Days (${formatD(past)} - ${formatD(today)})`;
      }
      case 'THIS_MONTH': {
        const monthName = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        return `This Month (${monthName})`;
      }
      case 'CUSTOM': {
        if (customFrom && customTo) {
          return `${customFrom} to ${customTo}`;
        }
        if (customFrom) return `From ${customFrom}`;
        if (customTo) return `Up to ${customTo}`;
        return 'Custom Range';
      }
      case 'ALL':
      default:
        return 'All Time History';
    }
  }, [datePreset, customFrom, customTo]);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await refreshOrders();
    } catch (e) {
      console.error('Failed to refresh orders:', e);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  // Build export payload for Total Summary
  const getSummaryExportData = () => {
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

      const activeDayOrders = dayOrders.filter((o) => o.status !== 'Cancelled');

      activeDayOrders.forEach((o) => {
        const orderSub = o.subtotal || 0;
        const orderTax = o.tax || 0;
        const orderTot = roundPOSAmount(o.total || 0);

        sub += orderSub;
        tax += orderTax;
        net += orderTot;

        if (o.payments && Array.isArray(o.payments) && o.payments.length > 0) {
          o.payments.forEach((p: any) => {
            const m = (p.paymentMethod || '').toLowerCase();
            const amt = Number(p.amount) || 0;
            if (m.includes('cash')) cash += amt;
            else if (m.includes('card')) card += amt;
            else if (m.includes('upi') || m.includes('online') || m.includes('qr')) upi += amt;
            else other += amt;
          });
        } else {
          const m = (o.paymentMethod || '').toLowerCase();
          if (m.includes('cash')) cash += orderTot;
          else if (m.includes('card')) card += orderTot;
          else if (m.includes('upi') || m.includes('online') || m.includes('qr')) upi += orderTot;
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

  // Build export payload for Order History
  const getHistoryExportData = () => {
    const dailyNumMap = buildDailyOrderNumberMap(allOrders);

    let totSub = 0;
    let totTax = 0;
    let totNet = 0;

    const rows = filteredOrders.map((o) => {
      const dailySeq = o.dailyOrderNumber || dailyNumMap.get(o.id) || o.id;
      const d = o.date ? new Date(o.date) : new Date();
      const dateFormatted = d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
      const timeFormatted = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

      const itemsSummary = (o.items || [])
        .map((it: any) => `${it.menuItem?.name || 'Item'} (x${it.quantity || 1})`)
        .join('; ');

      const sub = o.subtotal || 0;
      const tax = o.tax || 0;
      const total = roundPOSAmount(o.total || 0);

      if (o.status !== 'Cancelled') {
        totSub += sub;
        totTax += tax;
        totNet += total;
      }

      return {
        orderId: `#${dailySeq} (ID ${o.id})`,
        dateTime: `${dateFormatted} ${timeFormatted}`,
        items: itemsSummary || 'No items recorded',
        tender: o.paymentMethod || 'Cash',
        subtotal: `₹${sub.toFixed(2)}`,
        tax: `₹${tax.toFixed(2)}`,
        total: `₹${total.toFixed(2)}`,
        status: o.status || 'Completed',
      };
    });

    const summaryRow = {
      orderId: `TOTAL (${filteredOrders.length} ORDERS)`,
      dateTime: '',
      items: '',
      tender: '',
      subtotal: `₹${totSub.toFixed(2)}`,
      tax: `₹${totTax.toFixed(2)}`,
      total: `₹${totNet.toFixed(2)}`,
      status: '',
    };

    const columns: ReportColumn[] = [
      { header: 'Order #', key: 'orderId', align: 'left' },
      { header: 'Date & Time', key: 'dateTime', align: 'left' },
      { header: 'Items Ordered', key: 'items', align: 'left' },
      { header: 'Payment Tender', key: 'tender', align: 'center' },
      { header: 'Subtotal', key: 'subtotal', align: 'right' },
      { header: 'Tax', key: 'tax', align: 'right' },
      { header: 'Total Amount', key: 'total', align: 'right' },
      { header: 'Status', key: 'status', align: 'center' },
    ];

    return { columns, rows, summaryRow };
  };

  // Build export payload for Inventory Report
  const getInventoryExportData = () => {
    let grandValuation = 0;

    const rows = inventory.map((item) => {
      const stock = Number(item.stock) || 0;
      const thresh = Number(item.threshold) || 0;
      const cost = Number(item.costPerUnit || item.price || 0);
      const val = stock * cost;
      grandValuation += val;

      const statusText = stock <= 0 ? 'Out of Stock' : stock <= thresh ? 'Low Stock' : 'Good Stock';

      return {
        name: item.item || item.name || 'Unnamed item',
        category: item.category || 'General',
        stock: `${stock} ${item.unit || 'units'}`,
        threshold: `${thresh} ${item.unit || 'units'}`,
        status: statusText,
        unitCost: cost > 0 ? `₹${cost.toFixed(2)}` : '—',
        valuation: val > 0 ? `₹${val.toFixed(2)}` : '—',
      };
    });

    const summaryRow = {
      name: `TOTAL (${inventory.length} ITEMS)`,
      category: '',
      stock: '',
      threshold: '',
      status: '',
      unitCost: 'Total Valuation:',
      valuation: `₹${grandValuation.toFixed(2)}`,
    };

    const columns: ReportColumn[] = [
      { header: 'Item Name', key: 'name', align: 'left' },
      { header: 'Category', key: 'category', align: 'left' },
      { header: 'Current Stock', key: 'stock', align: 'right' },
      { header: 'Threshold', key: 'threshold', align: 'right' },
      { header: 'Health Status', key: 'status', align: 'center' },
      { header: 'Unit Cost', key: 'unitCost', align: 'right' },
      { header: 'Valuation', key: 'valuation', align: 'right' },
    ];

    return { columns, rows, summaryRow };
  };

  // Build export payload for Menu Item Wise Report
  const getMenuItemsExportData = () => {
    const aggregated = new Map<string, { name: string; category: string; qty: number; revenue: number }>();
    const activeOrders = filteredOrders.filter((o) => o.status !== 'Cancelled');

    activeOrders.forEach((o) => {
      (o.items || []).forEach((it: any) => {
        const name = it.menuItem?.name || it.name || `Dish #${it.menuItemId || it.id}`;
        const cat = it.menuItem?.category || it.category || 'General';
        const qty = Number(it.quantity) || 1;
        const price = Number(it.price) || Number(it.menuItem?.price) || 0;
        const lineTot = price * qty;
        const key = name.toLowerCase().trim();

        const existing = aggregated.get(key);
        if (existing) {
          existing.qty += qty;
          existing.revenue += lineTot;
        } else {
          aggregated.set(key, { name, category: cat, qty, revenue: lineTot });
        }
      });
    });

    const items = Array.from(aggregated.values()).sort((a, b) => b.qty - a.qty || b.revenue - a.revenue);
    const grandQty = items.reduce((s, it) => s + it.qty, 0);
    const grandRev = items.reduce((s, it) => s + it.revenue, 0);

    const rows = items.map((it) => {
      const avgPrice = it.qty > 0 ? it.revenue / it.qty : 0;
      const share = grandRev > 0 ? (it.revenue / grandRev) * 100 : 0;

      return {
        name: it.name,
        category: it.category,
        qty: it.qty,
        avgPrice: `₹${avgPrice.toFixed(2)}`,
        revenue: `₹${it.revenue.toFixed(2)}`,
        share: `${share.toFixed(1)}%`,
      };
    });

    const summaryRow = {
      name: `TOTAL (${items.length} DISHES)`,
      category: '',
      qty: grandQty,
      avgPrice: '—',
      revenue: `₹${grandRev.toFixed(2)}`,
      share: '100%',
    };

    const columns: ReportColumn[] = [
      { header: 'Dish / Item Name', key: 'name', align: 'left' },
      { header: 'Category', key: 'category', align: 'left' },
      { header: 'Units Sold', key: 'qty', align: 'right' },
      { header: 'Avg Selling Price', key: 'avgPrice', align: 'right' },
      { header: 'Total Revenue', key: 'revenue', align: 'right' },
      { header: 'Revenue Share', key: 'share', align: 'right' },
    ];

    return { columns, rows, summaryRow };
  };

  const getActiveExportPayload = () => {
    switch (activeReport) {
      case 'history':
        return {
          title: 'Order History Detailed Report',
          payload: getHistoryExportData(),
          fileSuffix: 'Order_History',
        };
      case 'inventory':
        return {
          title: 'Stock & Inventory Detailed Report',
          payload: getInventoryExportData(),
          fileSuffix: 'Stock_Inventory',
        };
      case 'menuItems':
        return {
          title: 'Menu Item Sales & Performance Report',
          payload: getMenuItemsExportData(),
          fileSuffix: 'Menu_Item_Sales',
        };
      case 'summary':
      default:
        return {
          title: 'Total Summary & Sales Report',
          payload: getSummaryExportData(),
          fileSuffix: 'Total_Summary',
        };
    }
  };

  // Handler for Print PDF
  const handlePrintPdf = () => {
    const { title, payload } = getActiveExportPayload();

    printReportToPdf({
      fileName: `${storeProfile?.businessName || 'Cafe'}_${activeReport}_${new Date().toISOString().slice(0, 10)}`,
      reportTitle: title,
      dateRangeText,
      storeProfile,
      columns: payload.columns,
      rows: payload.rows,
      summaryRow: payload.summaryRow,
    });
  };

  // Handler for Export XLS
  const handleExportXls = () => {
    const { title, payload, fileSuffix } = getActiveExportPayload();
    const safeName = (storeProfile?.businessName || 'Cafe').replace(/[^a-zA-Z0-9_-]/g, '_');

    exportReportToXls({
      fileName: `${safeName}_${fileSuffix}_${new Date().toISOString().slice(0, 10)}.xls`,
      reportTitle: title,
      dateRangeText,
      storeProfile,
      columns: payload.columns,
      rows: payload.rows,
      summaryRow: payload.summaryRow,
    });
  };

  return (
    <div className="p-4 sm:p-5 lg:p-6 flex flex-col h-full min-h-0 overflow-hidden w-full select-none gap-4">
      {/* 1. Fixed Top Filter & Actions Card (Spacing matching uploaded image) */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-3 sm:p-3.5 shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-3 shrink-0">
        {/* Left: Quick Date Presets & Custom Calendar Picker */}
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

          {/* Custom Date Range Picker Component */}
          {datePreset === 'CUSTOM' && (
            <CustomDateRangePicker
              customFrom={customFrom}
              customTo={customTo}
              onChange={(from, to) => {
                setCustomFrom(from);
                setCustomTo(to);
              }}
              className="ml-1"
            />
          )}
        </div>

        {/* Right: Actions (Refresh, Print PDF, Print XLS) in same row */}
        <div className="flex items-center gap-2 self-end xl:self-auto shrink-0">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl border border-stone-200 dark:border-stone-750 bg-stone-50 dark:bg-stone-850 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold text-xs transition-all cursor-pointer active:scale-95"
            title="Refresh latest orders"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-500' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={handlePrintPdf}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl border border-stone-200 dark:border-stone-750 bg-white dark:bg-stone-850 hover:bg-amber-50 dark:hover:bg-amber-950/30 hover:border-amber-400 text-stone-800 dark:text-stone-200 font-bold text-xs transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <Printer className="w-3.5 h-3.5 text-amber-500" />
            <span>Print PDF</span>
          </button>

          <button
            type="button"
            onClick={handleExportXls}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-amber-500 text-stone-950 font-bold text-xs hover:bg-amber-400 active:scale-95 transition-all shadow-xs shadow-amber-500/20 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Print XLS</span>
          </button>
        </div>
      </div>

      {/* 2. Main Operational Area: Left Reports Module Sidebar (Fixed, fulfills height) + Right Report Details (Internal scroll only) */}
      <div className="flex-1 flex flex-col md:flex-row items-stretch gap-4 min-h-0 overflow-hidden">
        {/* Reports Module Sidebar */}
        <ReportsCategorySidebar
          activeReport={activeReport}
          onSelectReport={setActiveReport}
        />

        {/* Right Side Report Details Card Container (Fixed main div, only internal details scroll) */}
        <div className="flex-1 min-w-0 h-full overflow-y-auto min-h-0 pr-1 space-y-4">
          {activeReport === 'summary' && (
            <TotalSummaryReport orders={filteredOrders} dateRangeText={dateRangeText} />
          )}

          {activeReport === 'history' && (
            <OrderHistoryReport
              orders={filteredOrders}
              onSelectOrder={(order) => setSelectedOrder(order)}
            />
          )}

          {activeReport === 'inventory' && <InventoryReport />}

          {activeReport === 'menuItems' && <MenuItemWiseReport orders={filteredOrders} />}
        </div>
      </div>

      {/* 3. Complete Order Details Modal */}
      <OrderDetailsModal
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
      />
    </div>
  );
};
