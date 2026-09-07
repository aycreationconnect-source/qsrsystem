import type { Order } from '../types/app.types';

/**
 * Checks if a given date string or Date object falls on today in local calendar time.
 */
export function isToday(dateInput?: string | Date | null): boolean {
  if (!dateInput) return false;
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return false;
  const today = new Date();
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  );
}

/**
 * Builds a Map of orderId -> dailyOrderNumber for quick O(1) lookups.
 * Every day, the order sequence restarts at 1 (#1, #2, #3...).
 * It never accumulates or adds orders from previous days.
 */
export function buildDailyOrderNumberMap(allOrders: Order[] = []): Map<number, number> {
  const map = new Map<number, number>();

  // Group orders by local calendar date string (YYYY-MM-DD or toDateString)
  const ordersByDay = new Map<string, Order[]>();
  for (const order of allOrders) {
    const dayStr = order.date ? new Date(order.date).toDateString() : new Date().toDateString();
    const list = ordersByDay.get(dayStr) || [];
    list.push(order);
    ordersByDay.set(dayStr, list);
  }

  // For each day, sort ascending (oldest order first) and assign 1, 2, 3...
  ordersByDay.forEach((dayOrders) => {
    dayOrders.sort(
      (a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime() || (a.id || 0) - (b.id || 0)
    );
    dayOrders.forEach((o, index) => {
      const dailySeq = o.dailyOrderNumber || index + 1;
      map.set(o.id, dailySeq);
    });
  });

  return map;
}

/**
 * Calculates the daily order number for a single order given all orders.
 * If the order already has `dailyOrderNumber` populated, returns it immediately.
 * Otherwise, resolves the 1-based index within all orders on that same date.
 */
export function getDailyOrderNumber(
  order: Partial<Order> | null | undefined,
  allOrders: Order[] = []
): number {
  if (!order) return 1;
  if (typeof order.dailyOrderNumber === 'number' && order.dailyOrderNumber > 0) {
    return order.dailyOrderNumber;
  }

  const orderDate = order.date ? new Date(order.date) : new Date();
  const orderDateStr = orderDate.toDateString();

  // Find all orders on that same calendar day
  const sameDayOrders = allOrders
    .filter((o) => o.date && new Date(o.date).toDateString() === orderDateStr)
    .sort(
      (a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime() || (a.id || 0) - (b.id || 0)
    );

  if (sameDayOrders.length === 0) return 1;

  const idx = sameDayOrders.findIndex((o) => o.id === order.id);
  if (idx !== -1) {
    return idx + 1;
  }

  // If newly placed and not yet in allOrders list:
  return sameDayOrders.length + 1;
}

/**
 * POS Amount Rounding Rule:
 * If decimal part >= 0.50 -> rounds up to next integer (e.g. 1192.50 -> 1193)
 * If decimal part < 0.50 -> rounds down to previous integer (e.g. 1192.49 -> 1192)
 */
export function roundPOSAmount(amount: number): number {
  if (isNaN(amount) || !isFinite(amount)) return 0;
  const normalized = Math.round(amount * 100) / 100;
  return Math.round(normalized);
}

