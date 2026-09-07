import React from 'react';
import { useApp } from '../../context/AppContext';
import { usePOS } from '../../context/POSContext';
import { StatCards } from './StatCards';
import { RevenueChart } from './RevenueChart';
import { QuickActions } from './QuickActions';
import { LayoutDashboard } from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { appData } = useApp();
  const { tableOrders, tablePrinted, cart, selectedTableId } = usePOS();

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const todayOrders = (appData.orders || []).filter(
    (o: any) => new Date(o.date).toDateString() === today.toDateString()
  );
  const yesterdayOrders = (appData.orders || []).filter(
    (o: any) => new Date(o.date).toDateString() === yesterday.toDateString()
  );

  const ordersTodayCount = todayOrders.length;
  const ordersYesterdayCount = yesterdayOrders.length;
  const ordersTrend =
    ordersYesterdayCount === 0
      ? ordersTodayCount > 0
        ? 100
        : 0
      : Math.round(((ordersTodayCount - ordersYesterdayCount) / ordersYesterdayCount) * 100);

  const revenueToday = todayOrders.reduce((sum: number, o: any) => sum + (o.total || 0), 0);
  const revenueYesterday = yesterdayOrders.reduce((sum: number, o: any) => sum + (o.total || 0), 0);
  const revenueTrend =
    revenueYesterday === 0
      ? revenueToday > 0
        ? 100
        : 0
      : Math.round(((revenueToday - revenueYesterday) / revenueYesterday) * 100);

  // Helper to determine if a table is currently occupied / dining
  const isTableOccupied = (table: any) => {
    const key = String(table.id);
    const orderData = tableOrders[key] || tableOrders[table.id];

    // 1. Check if currently selected table has active cart items
    const isCurrentTable = selectedTableId === key || selectedTableId === String(table.id);
    const hasActiveCart =
      (isCurrentTable && cart && cart.length > 0) ||
      Boolean(orderData?.activeCart && orderData.activeCart.length > 0);

    // 2. Check if table has saved KDS tickets / running food orders
    let hasSavedOrders = false;
    if (orderData?.savedOrders && Array.isArray(orderData.savedOrders)) {
      hasSavedOrders = orderData.savedOrders.some((so: any) => {
        if (Array.isArray(so?.items)) return so.items.length > 0;
        if (Array.isArray(so)) return so.length > 0;
        return Boolean(so && (so.name || so.id));
      });
    }

    // 3. Check if table has a printed bill awaiting payment settlement
    const isPrinted = Boolean(tablePrinted[key] || tablePrinted[table.id]);

    // 4. Check backend status if explicitly marked Occupied / Dining / Billed
    const isBackendOccupied =
      typeof table.status === 'string' &&
      table.status.trim() !== '' &&
      ['OCCUPIED', 'DINING', 'BILLED', 'BUSY'].includes(table.status.trim().toUpperCase());

    return hasActiveCart || hasSavedOrders || isPrinted || isBackendOccupied;
  };

  const activeTablesCount = (appData.tables || []).filter(isTableOccupied).length;
  const totalTables = appData.tables?.length || 0;

  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  const revenueByDay = last7Days.map((d) => {
    const dayOrders = (appData.orders || []).filter(
      (o: any) => new Date(o.date).toDateString() === d.toDateString()
    );
    return dayOrders.reduce((sum: number, o: any) => sum + (o.total || 0), 0);
  });
  const maxRev = Math.max(...revenueByDay, 1);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-amber-500" />
            <span>Store Performance & Overview</span>
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Real-time daily revenue, order velocity, and live dine-in table occupancy.
          </p>
        </div>
      </div>

      {/* 1. Stat Summary Cards */}
      <StatCards
        ordersTodayCount={ordersTodayCount}
        ordersTrend={ordersTrend}
        revenueToday={revenueToday}
        revenueTrend={revenueTrend}
        activeTablesCount={activeTablesCount}
        totalTables={totalTables}
      />

      {/* 2. Main Analytics & Quick Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 xl:col-span-8">
          <RevenueChart last7Days={last7Days} revenueByDay={revenueByDay} maxRev={maxRev} />
        </div>

        <div className="lg:col-span-5 xl:col-span-4 flex flex-col">
          <QuickActions />
        </div>
      </div>
    </div>
  );
};
