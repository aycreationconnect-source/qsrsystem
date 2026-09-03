import React from 'react';
import { useApp } from '../../context/AppContext';
import { usePOS } from '../../context/POSContext';
import { StatCards } from './StatCards';
import { RevenueChart } from './RevenueChart';
import { QuickActions } from './QuickActions';
import { RecentActivity } from './RecentActivity';

export const DashboardView: React.FC = () => {
  const { appData } = useApp();
  const { tableOrders } = usePOS();

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

  const activeTablesCount = (appData.tables || []).filter(
    (t: any) =>
      tableOrders[t.id] &&
      (tableOrders[t.id].activeCart?.length > 0 || tableOrders[t.id].savedOrders?.length > 0)
  ).length;
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

  const recentOrders = [...(appData.orders || [])]
    .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
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

        <div className="lg:col-span-5 xl:col-span-4 space-y-6 flex flex-col">
          <QuickActions />
          <RecentActivity recentOrders={recentOrders} />
        </div>
      </div>
    </div>
  );
};
