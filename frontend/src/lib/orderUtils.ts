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

/**
 * Resolves the restaurant-wide global tax rate from settings.
 * Checks customTaxes first (summing rates), then falls back to globalTaxRate.
 */
export function getStoreGlobalTaxRate(settings?: any): number {
  if (!settings) return 0;
  if (settings.customTaxes) {
    try {
      const parsed =
        typeof settings.customTaxes === 'string'
          ? JSON.parse(settings.customTaxes)
          : settings.customTaxes;
      if (Array.isArray(parsed) && parsed.length > 0) {
        const sum = parsed.reduce(
          (acc: number, t: any) =>
            acc + (parseFloat(String(t.rate ?? '0').replace(/[^0-9.]/g, '')) || 0),
          0
        );
        if (sum > 0) return sum;
      }
    } catch {}
  }
  if (
    settings.globalTaxRate !== undefined &&
    settings.globalTaxRate !== null &&
    settings.globalTaxRate !== ''
  ) {
    return parseFloat(String(settings.globalTaxRate).replace(/[^0-9.]/g, '')) || 0;
  }
  return 0;
}

/**
 * Determine effective tax rate for an item based on its configuration:
 * 1. If Global Tax is explicitly disabled (`useGlobalTax === false`):
 *    - Uses manual taxes if present, otherwise returns 0% (Tax-Free).
 * 2. If item has manual taxes configured and `useGlobalTax !== true`:
 *    - Uses manual taxes.
 * 3. Otherwise:
 *    - Inherits store global tax rate.
 */
export function getItemTaxRate(item: any, menu: any[] = [], globalTaxRate: number = 0): number {
  if (!item) return 0;
  const menuItem = menu?.find(
    (m: any) =>
      (item.id && (m.id === item.id || String(m.id) === String(item.id))) ||
      (item.name && m.name?.toLowerCase().trim() === item.name?.toLowerCase().trim()) ||
      (item.menuItem && (item.menuItem.id === m.id || item.menuItem.name === m.name))
  );

  const useGlobalTax =
    item.useGlobalTax !== undefined
      ? item.useGlobalTax
      : menuItem?.useGlobalTax !== undefined
      ? menuItem.useGlobalTax
      : true;

  const itemTaxes =
    item.taxes && Array.isArray(item.taxes) && item.taxes.length > 0
      ? item.taxes
      : menuItem?.taxes && Array.isArray(menuItem.taxes) && menuItem.taxes.length > 0
      ? menuItem.taxes
      : [];

  const itemTax =
    item.tax !== undefined && item.tax !== null && item.tax !== ''
      ? item.tax
      : menuItem?.tax !== undefined && menuItem?.tax !== null && menuItem?.tax !== ''
      ? menuItem.tax
      : null;

  // 1. If Global Tax is explicitly disabled for this item:
  if (useGlobalTax === false) {
    if (itemTaxes.length > 0) {
      return itemTaxes.reduce(
        (sum: number, t: any) =>
          sum + (parseFloat(String(t.rate ?? '0').replace(/[^0-9.]/g, '')) || 0),
        0
      );
    }
    if (itemTax !== null && itemTax !== undefined && itemTax !== '') {
      return parseFloat(String(itemTax).replace(/[^0-9.]/g, '')) || 0;
    }
    // No manual taxes specified -> 0% tax (Tax Not Applicable)
    return 0;
  }

  // 2. If item has manual taxes specified and useGlobalTax is not explicitly true:
  if (useGlobalTax !== true && (itemTaxes.length > 0 || (itemTax !== null && itemTax !== 0))) {
    if (itemTaxes.length > 0) {
      return itemTaxes.reduce(
        (sum: number, t: any) =>
          sum + (parseFloat(String(t.rate ?? '0').replace(/[^0-9.]/g, '')) || 0),
        0
      );
    }
    return parseFloat(String(itemTax).replace(/[^0-9.]/g, '')) || 0;
  }

  // 3. Otherwise: Inherit restaurant global tax
  return globalTaxRate;
}

export interface ItemTaxBadgeInfo {
  show: boolean;
  text: string;
  variant: 'exempt' | 'applicable' | 'custom';
}

/**
 * Resolves the appropriate tax badge for an item in the cart or checkout:
 *
 * Scenario 1: Store Global Tax is 'No Tax' (globalTaxRate === 0):
 * - Default / 0% items: No badge (clean cart without redundant "Tax Not Applicable").
 * - Items with manual tax (> 0%): Display badge 'Tax Applicable (X%)'.
 *
 * Scenario 2: Store Global Tax is active (globalTaxRate > 0):
 * - Default items (inheriting global tax): No badge (clean cart).
 * - Items with manual tax set to 0% (Tax-Free): Display badge 'Tax Not Applicable'.
 * - Items with custom manual tax (> 0%): Display badge 'Custom Tax (X%)'.
 */
export function getItemTaxBadge(
  item: any,
  menu: any[] = [],
  globalTaxRate: number = 0
): ItemTaxBadgeInfo | null {
  if (!item) return null;

  const menuItem = menu?.find(
    (m: any) =>
      (item.id && (m.id === item.id || String(m.id) === String(item.id))) ||
      (item.name && m.name?.toLowerCase().trim() === item.name?.toLowerCase().trim()) ||
      (item.menuItem && (item.menuItem.id === m.id || item.menuItem.name === m.name))
  );

  const useGlobalTax =
    item.useGlobalTax !== undefined
      ? item.useGlobalTax
      : menuItem?.useGlobalTax !== undefined
      ? menuItem.useGlobalTax
      : true;

  const itemTaxes =
    item.taxes && Array.isArray(item.taxes) && item.taxes.length > 0
      ? item.taxes
      : menuItem?.taxes && Array.isArray(menuItem.taxes) && menuItem.taxes.length > 0
      ? menuItem.taxes
      : [];

  const itemTax =
    item.tax !== undefined && item.tax !== null && item.tax !== ''
      ? item.tax
      : menuItem?.tax !== undefined && menuItem?.tax !== null && menuItem?.tax !== ''
      ? menuItem.tax
      : null;

  // Compute manual tax rate if item configured its own taxes
  let manualRate = 0;
  if (itemTaxes.length > 0) {
    manualRate = itemTaxes.reduce(
      (sum: number, t: any) => sum + (parseFloat(String(t.rate ?? '0').replace(/[^0-9.]/g, '')) || 0),
      0
    );
  } else if (itemTax !== null && itemTax !== undefined && itemTax !== '') {
    manualRate = parseFloat(String(itemTax).replace(/[^0-9.]/g, '')) || 0;
  }

  const effectiveRate = getItemTaxRate(item, menu, globalTaxRate);
  const formattedRate = Number(effectiveRate.toFixed(2));

  // Scenario 1: Store Global Tax is 'No Tax' / 0%
  if (globalTaxRate <= 0) {
    // If the item has manual tax configured and rate > 0:
    if (useGlobalTax === false && manualRate > 0) {
      return {
        show: true,
        text: formattedRate > 0 ? `Tax Applicable (${formattedRate}%)` : 'Tax Applicable',
        variant: 'applicable',
      };
    }
    // Normal items or items with 0% tax show NO BADGE when store is No Tax
    return null;
  }

  // Scenario 2: Store Global Tax is active (> 0%)
  // If item inherits global tax: show NO BADGE
  if (useGlobalTax === true) {
    return null;
  }

  // If item disabled global tax:
  if (effectiveRate === 0) {
    return {
      show: true,
      text: 'Tax Not Applicable',
      variant: 'exempt',
    };
  }

  // Custom manual tax rate (> 0%)
  return {
    show: true,
    text: `Custom Tax (${formattedRate}%)`,
    variant: 'custom',
  };
}

/**
 * Checks if a menu item does not contain any tax (rate is 0%).
 */
export function isItemTaxNotApplicable(
  item: any,
  menu: any[] = [],
  globalTaxRate: number = 0
): boolean {
  return getItemTaxRate(item, menu, globalTaxRate) === 0;
}

/**
 * Formats the tax summary label to display the tax type name and rate percentage.
 * Example outputs:
 * - "Tax (CGST + SGST - 15%)"
 * - "Tax (GST - 5%)"
 * - "Item Taxes" (when global is No Tax but cart has manual taxes)
 * - "No Tax (0%)"
 */
export function formatTaxLabel(
  settings?: any,
  rate?: number,
  totalTaxAmount?: number
): string {
  const globalRate = rate !== undefined ? rate : getStoreGlobalTaxRate(settings);
  const taxName = settings?.globalTaxName?.trim() || '';
  const formattedRate = Number(globalRate.toFixed(2));
  const hasTaxAmount = totalTaxAmount !== undefined ? totalTaxAmount > 0 : false;

  // If global tax rate is 0 or named "No Tax":
  if (formattedRate <= 0 || taxName.toLowerCase() === 'no tax' || taxName.toLowerCase() === 'none') {
    // If cart has actual tax (from item-level manual taxes):
    if (hasTaxAmount) {
      return 'Item Taxes';
    }
    return 'No Tax (0%)';
  }

  if (taxName) {
    if (taxName.includes('%') || formattedRate <= 0) {
      return `Tax (${taxName})`;
    }
    return `Tax (${taxName} - ${formattedRate}%)`;
  }

  if (formattedRate > 0) {
    return `Tax (${formattedRate}%)`;
  }

  return hasTaxAmount ? 'Taxes' : 'No Tax (0%)';
}

