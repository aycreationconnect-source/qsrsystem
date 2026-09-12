import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { usePOS } from '../../context/POSContext';
import { StatCards } from './StatCards';
import { RevenueChart } from './RevenueChart';
import { PaymentBreakdownCard } from './PaymentBreakdownCard';
import { TopSellingCard } from './TopSellingCard';
import { InventoryAlertCard } from './InventoryAlertCard';
import { RecentActivity } from './RecentActivity';

export const DashboardView: React.FC = () => {
  const { appData } = useApp();
  const { tableOrders, tablePrinted, cart, selectedTableId } = usePOS();

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const todayOrders = useMemo(
    () =>
      (appData.orders || []).filter(
        (o: any) => new Date(o.date).toDateString() === today.toDateString()
      ),
    [appData.orders]
  );

  const yesterdayOrders = useMemo(
    () =>
      (appData.orders || []).filter(
        (o: any) => new Date(o.date).toDateString() === yesterday.toDateString()
      ),
    [appData.orders]
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

  const avgOrderValue = ordersTodayCount > 0 ? revenueToday / ordersTodayCount : 0;

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

  // 7-day revenue velocity
  const last7Days = useMemo(
    () =>
      Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d;
      }),
    []
  );

  const revenueByDay = useMemo(() => {
    return last7Days.map((d) => {
      const dayOrders = (appData.orders || []).filter(
        (o: any) => new Date(o.date).toDateString() === d.toDateString()
      );
      return dayOrders.reduce((sum: number, o: any) => sum + (o.total || 0), 0);
    });
  }, [last7Days, appData.orders]);

  const maxRev = Math.max(...revenueByDay, 1);

  // Payment breakdown for today (Cash vs UPI vs Card/Other)
  const paymentBreakdown = useMemo(() => {
    let cash = 0;
    let upi = 0;
    let card = 0;
    let other = 0;

    todayOrders.forEach((o: any) => {
      const orderTot = Number(o.total) || 0;
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

    const total = cash + upi + card + other;
    const cashPercent = total > 0 ? Math.round((cash / total) * 100) : 0;
    const upiPercent = total > 0 ? Math.round((upi / total) * 100) : 0;
    const cardPercent = total > 0 ? Math.round((card / total) * 100) : 0;
    const otherPercent =
      total > 0 ? Math.max(0, 100 - (cashPercent + upiPercent + cardPercent)) : 0;

    return {
      cash,
      upi,
      card,
      other,
      total,
      cashPercent,
      upiPercent,
      cardPercent,
      otherPercent,
    };
  }, [todayOrders]);

  // Menu items lookup map for best sellers
  const menuMap = useMemo(() => {
    const map = new Map<number, any>();
    (appData.menu || []).forEach((m: any) => {
      if (m.id) map.set(m.id, m);
    });
    return map;
  }, [appData.menu]);

  // Top selling dishes today (with fallback to recent orders if today is fresh)
  const topSellingDishes = useMemo(() => {
    const dishCounts = new Map<
      string,
      { id: number; name: string; type?: string; count: number; revenue: number }
    >();

    const ordersToAnalyze =
      todayOrders.length > 0 ? todayOrders : (appData.orders || []).slice(-50);

    ordersToAnalyze.forEach((order: any) => {
      (order.items || []).forEach((it: any) => {
        const menuItem = it.menuItem || (it.menuItemId ? menuMap.get(it.menuItemId) : null);
        const name = menuItem?.name || it.name || `Dish #${it.menuItemId || it.id}`;
        const type = menuItem?.type || it.type;
        const qty = Number(it.quantity) || 1;
        const price = Number(it.price) || Number(menuItem?.price) || 0;
        const lineRev = price * qty;
        const key = name.toLowerCase();

        const existing = dishCounts.get(key);
        if (existing) {
          existing.count += qty;
          existing.revenue += lineRev;
        } else {
          dishCounts.set(key, {
            id: it.menuItemId || it.id || 0,
            name,
            type,
            count: qty,
            revenue: lineRev,
          });
        }
      });
    });

    return Array.from(dishCounts.values())
      .sort((a, b) => b.count - a.count || b.revenue - a.revenue)
      .slice(0, 5);
  }, [todayOrders, appData.orders, menuMap]);

  // Low stock inventory items
  const lowStockItems = useMemo(() => {
    return (appData.inventory || []).filter((item: any) => {
      const stock = Number(item.stock) || 0;
      const thresh = Number(item.threshold) || 0;
      const status = (item.status || '').toLowerCase();
      return stock <= thresh || status.includes('low') || status.includes('out');
    });
  }, [appData.inventory]);

  // Recent completed orders
  const recentOrders = useMemo(() => {
    return [...(appData.orders || [])]
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 6);
  }, [appData.orders]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* 1. Core Stat Summary Cards (Orders Today, Today's Gross, Avg Bill Value, Occupied Tables) */}
      <StatCards
        ordersTodayCount={ordersTodayCount}
        ordersTrend={ordersTrend}
        revenueToday={revenueToday}
        revenueTrend={revenueTrend}
        activeTablesCount={activeTablesCount}
        totalTables={totalTables}
        avgOrderValue={avgOrderValue}
      />

      {/* 2. Revenue Velocity & Payment Collection Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 flex flex-col">
          <RevenueChart last7Days={last7Days} revenueByDay={revenueByDay} maxRev={maxRev} />
        </div>
        <div className="lg:col-span-5 flex flex-col">
          <PaymentBreakdownCard data={paymentBreakdown} />
        </div>
      </div>

      {/* 3. Operational Insights: Best Sellers & Kitchen Pantry Stock Health */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-6 flex flex-col">
          <TopSellingCard items={topSellingDishes} />
        </div>
        <div className="lg:col-span-6 flex flex-col">
          <InventoryAlertCard
            lowStockItems={lowStockItems}
            totalInventoryCount={appData.inventory?.length || 0}
          />
        </div>
      </div>

      {/* 4. Live Stream: Recent Completed Orders */}
      <div className="w-full">
        <RecentActivity recentOrders={recentOrders} />
      </div>
    </div>
  );
};
