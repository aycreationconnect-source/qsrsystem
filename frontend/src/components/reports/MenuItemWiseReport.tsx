import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ReportPagination } from './ReportPagination';
import { ReportCategoryDropdown } from './ReportCategoryDropdown';
import {
  UtensilsCrossed,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Order } from '../../types/app.types';

interface MenuItemWiseReportProps {
  orders: Order[];
}

export interface MenuItemSaleRecord {
  id: number | string;
  name: string;
  category: string;
  type?: string;
  quantitySold: number;
  totalRevenue: number;
  avgPrice: number;
  revenueSharePercent: number;
}

type SortField = 'name' | 'category' | 'quantity' | 'revenue' | 'avgPrice' | 'share';
type SortDirection = 'asc' | 'desc';

export const MenuItemWiseReport: React.FC<MenuItemWiseReportProps> = ({ orders }) => {
  const { appData, storeProfile } = useApp();
  const currency = storeProfile?.currencySymbol || '₹';

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  // Sorting state
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // Map menu catalog by ID for fast name/category/type lookup
  const menuMap = useMemo(() => {
    const map = new Map<number | string, any>();
    (appData.menu || []).forEach((m: any) => {
      if (m.id) map.set(m.id, m);
    });
    return map;
  }, [appData.menu]);

  // Aggregate dish sales across active filtered orders
  const dishSales = useMemo(() => {
    const aggregated = new Map<
      string,
      {
        id: number | string;
        name: string;
        category: string;
        type?: string;
        quantitySold: number;
        totalRevenue: number;
      }
    >();

    const activeOrders = orders.filter((o) => o.status !== 'Cancelled');

    activeOrders.forEach((order) => {
      (order.items || []).forEach((it: any) => {
        const menuItem = it.menuItem || (it.menuItemId ? menuMap.get(it.menuItemId) : null);
        const name = menuItem?.name || it.name || `Dish #${it.menuItemId || it.id}`;
        const category = menuItem?.category || it.category || 'General';
        const type = menuItem?.type || it.type;
        const qty = Number(it.quantity) || 1;
        const price = Number(it.price) || Number(menuItem?.price) || 0;
        const lineTotal = price * qty;

        const key = name.toLowerCase().trim();
        const existing = aggregated.get(key);

        if (existing) {
          existing.quantitySold += qty;
          existing.totalRevenue += lineTotal;
        } else {
          aggregated.set(key, {
            id: it.menuItemId || it.id || key,
            name,
            category,
            type,
            quantitySold: qty,
            totalRevenue: lineTotal,
          });
        }
      });
    });

    const items = Array.from(aggregated.values());
    const grandRevenue = items.reduce((sum, item) => sum + item.totalRevenue, 0);

    return items.map((item) => {
      const avgPrice = item.quantitySold > 0 ? item.totalRevenue / item.quantitySold : 0;
      const revenueSharePercent = grandRevenue > 0 ? (item.totalRevenue / grandRevenue) * 100 : 0;

      return {
        ...item,
        avgPrice,
        revenueSharePercent,
      };
    });
  }, [orders, menuMap]);

  // Unique categories in sales
  const categories = useMemo(() => {
    const set = new Set<string>();
    dishSales.forEach((d) => {
      if (d.category) set.add(d.category);
    });
    return Array.from(set).sort();
  }, [dishSales]);

  // Dish count per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    dishSales.forEach((d) => {
      const cat = d.category || 'General';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [dishSales]);

  // Summary Metrics
  const metrics = useMemo(() => {
    let totalQty = 0;
    let totalRevenue = 0;
    let topSeller: MenuItemSaleRecord | null = null;

    dishSales.forEach((item) => {
      totalQty += item.quantitySold;
      totalRevenue += item.totalRevenue;
      if (!topSeller || item.quantitySold > topSeller.quantitySold) {
        topSeller = item;
      }
    });

    return {
      distinctCount: dishSales.length,
      totalQty,
      totalRevenue,
      topSeller,
    };
  }, [dishSales]);

  // Column sort toggle
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'desc') {
        setSortDirection('asc');
      } else {
        // Reset to default sort (revenue desc)
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

  // Filtered & Sorted items
  const processedItems = useMemo(() => {
    // 1. Filter
    const filtered = dishSales.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);

      const matchesCategory = categoryFilter === 'ALL' || item.category === categoryFilter;

      const t = (item.type || '').toUpperCase();
      const matchesType =
        typeFilter === 'ALL' ||
        (typeFilter === 'VEG' && t.includes('VEG') && !t.includes('NON')) ||
        (typeFilter === 'NONVEG' && t.includes('NON')) ||
        (typeFilter === 'DRINK' && (t.includes('DRINK') || t.includes('BEVERAGE')));

      return matchesSearch && matchesCategory && matchesType;
    });

    // 2. Sort
    return [...filtered].sort((a, b) => {
      if (!sortField) {
        // Default Sort: Quantity Sold descending, then Revenue descending
        return b.quantitySold - a.quantitySold || b.totalRevenue - a.totalRevenue;
      }

      let comparison = 0;
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
        case 'quantity':
          comparison = a.quantitySold - b.quantitySold;
          break;
        case 'revenue':
          comparison = a.totalRevenue - b.totalRevenue;
          break;
        case 'avgPrice':
          comparison = a.avgPrice - b.avgPrice;
          break;
        case 'share':
          comparison = a.revenueSharePercent - b.revenueSharePercent;
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [dishSales, searchQuery, categoryFilter, typeFilter, sortField, sortDirection]);

  // Reset page to 1 on filter, search, sort, or orders change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter, typeFilter, sortField, sortDirection, orders]);

  const totalPages = Math.max(1, Math.ceil(processedItems.length / pageSize));
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedItems.slice(start, start + pageSize);
  }, [processedItems, currentPage, pageSize]);

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-stone-400 group-hover:text-stone-600 transition-colors" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-amber-500 font-bold" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-amber-500 font-bold" />
    );
  };

  const renderTypeDot = (type?: string) => {
    const t = (type || '').toLowerCase();
    if (t.includes('non')) {
      return (
        <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-xs border border-rose-600 bg-white dark:bg-stone-850">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
        </span>
      );
    }
    if (t.includes('egg')) {
      return (
        <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-xs border border-amber-500 bg-white dark:bg-stone-850">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        </span>
      );
    }
    return (
      <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-xs border border-emerald-600 bg-white dark:bg-stone-850">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
      </span>
    );
  };

  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
      {/* 1. Summary Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-stone-50 dark:bg-stone-850 p-3.5 rounded-2xl border border-stone-200/60 dark:border-stone-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
            <UtensilsCrossed className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
              Units Sold
            </span>
            <span className="text-base font-extrabold text-stone-900 dark:text-stone-100 font-mono">
              {metrics.totalQty} items
            </span>
          </div>
        </div>

        <div className="bg-stone-50 dark:bg-stone-850 p-3.5 rounded-2xl border border-stone-200/60 dark:border-stone-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
              Dish Revenue
            </span>
            <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
              {currency}{metrics.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <div className="bg-stone-50 dark:bg-stone-850 p-3.5 rounded-2xl border border-stone-200/60 dark:border-stone-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
              Dishes Active
            </span>
            <span className="text-base font-extrabold text-stone-900 dark:text-stone-100 font-mono">
              {metrics.distinctCount} varieties
            </span>
          </div>
        </div>

        <div className="bg-stone-50 dark:bg-stone-850 p-3.5 rounded-2xl border border-stone-200/60 dark:border-stone-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
            <span className="text-xs font-black">★</span>
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block truncate">
              Top Seller
            </span>
            <span className="text-sm font-extrabold text-stone-900 dark:text-stone-100 truncate block">
              {metrics.topSeller ? (metrics.topSeller as any).name : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Search, Type & Sorting Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search dish name or category..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-850 text-xs sm:text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Food Type Filter */}
          <div className="flex items-center gap-1 bg-stone-50 dark:bg-stone-850 p-1 rounded-2xl border border-stone-200/80 dark:border-stone-800 text-xs">
            {(['ALL', 'VEG', 'NONVEG'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTypeFilter(t)}
                className={cn(
                  'px-2.5 py-1 rounded-xl font-bold transition-all cursor-pointer text-[11px]',
                  typeFilter === t
                    ? 'bg-amber-500 text-stone-950 shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                )}
              >
                {t === 'ALL' ? 'All Types' : t === 'VEG' ? 'Pure Veg' : 'Non-Veg'}
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          {categories.length > 0 && (
            <ReportCategoryDropdown
              value={categoryFilter}
              onChange={setCategoryFilter}
              categories={categories}
              counts={categoryCounts}
              totalCount={dishSales.length}
            />
          )}

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

      {/* 3. Direct Menu Items Report Table */}
      <div className="w-full overflow-x-auto rounded-2xl border border-stone-200/80 dark:border-stone-800">
        <table className="w-full text-left border-collapse text-xs sm:text-sm min-w-[760px]">
          <thead>
            <tr className="bg-stone-50 dark:bg-stone-850/70 border-b border-stone-200/80 dark:border-stone-800 text-stone-400 font-bold uppercase tracking-wider text-[10px]">
              <th
                onClick={() => handleSort('name')}
                className="py-3 px-4 cursor-pointer hover:text-stone-700 dark:hover:text-stone-200 select-none group"
              >
                <div className="flex items-center gap-1.5">
                  <span>Dish / Item Name</span>
                  {renderSortIcon('name')}
                </div>
              </th>

              <th
                onClick={() => handleSort('category')}
                className="py-3 px-4 cursor-pointer hover:text-stone-700 dark:hover:text-stone-200 select-none group"
              >
                <div className="flex items-center gap-1.5">
                  <span>Category</span>
                  {renderSortIcon('category')}
                </div>
              </th>

              <th
                onClick={() => handleSort('quantity')}
                className="py-3 px-4 text-right cursor-pointer hover:text-stone-700 dark:hover:text-stone-200 select-none group"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Units Sold</span>
                  {renderSortIcon('quantity')}
                </div>
              </th>

              <th
                onClick={() => handleSort('avgPrice')}
                className="py-3 px-4 text-right cursor-pointer hover:text-stone-700 dark:hover:text-stone-200 select-none group"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Avg Price</span>
                  {renderSortIcon('avgPrice')}
                </div>
              </th>

              <th
                onClick={() => handleSort('revenue')}
                className="py-3 px-4 text-right cursor-pointer hover:text-stone-700 dark:hover:text-stone-200 select-none group"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Total Revenue</span>
                  {renderSortIcon('revenue')}
                </div>
              </th>

              <th
                onClick={() => handleSort('share')}
                className="py-3 px-4 text-right cursor-pointer hover:text-stone-700 dark:hover:text-stone-200 select-none group"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Revenue Share</span>
                  {renderSortIcon('share')}
                </div>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
            {processedItems.length > 0 ? (
              paginatedItems.map((item) => (
                <tr
                  key={item.id || item.name}
                  className="hover:bg-stone-50/70 dark:hover:bg-stone-800/40 transition-colors"
                >
                  <td className="py-3 px-4 font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    {renderTypeDot(item.type)}
                    <span>{item.name}</span>
                  </td>

                  <td className="py-3 px-4 text-stone-500 dark:text-stone-400">
                    <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-[11px] font-semibold">
                      {item.category || 'General'}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right font-mono font-bold text-stone-800 dark:text-stone-200">
                    {item.quantitySold}
                  </td>

                  <td className="py-3 px-4 text-right font-mono text-stone-500">
                    {currency}{item.avgPrice.toFixed(2)}
                  </td>

                  <td className="py-3 px-4 text-right font-mono font-black text-stone-900 dark:text-stone-100">
                    {currency}{item.totalRevenue.toFixed(2)}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 bg-stone-100 dark:bg-stone-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-amber-500 h-1.5 rounded-full"
                          style={{ width: `${Math.min(100, item.revenueSharePercent)}%` }}
                        />
                      </div>
                      <span className="font-mono text-xs text-stone-500">
                        {item.revenueSharePercent.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-8 text-center text-stone-400 text-xs">
                  No menu items sold in the selected period.
                </td>
              </tr>
            )}
          </tbody>

          {processedItems.length > 0 && (
            <tfoot>
              <tr className="bg-amber-500/10 dark:bg-amber-500/15 border-t-2 border-amber-500/30 font-black text-xs sm:text-sm text-stone-900 dark:text-stone-100">
                <td className="py-3.5 px-4 uppercase tracking-wider text-amber-700 dark:text-amber-300">
                  Total
                </td>
                <td className="py-3.5 px-4 font-mono text-stone-500 text-xs">
                  {processedItems.length} items
                </td>
                <td className="py-3.5 px-4 text-right font-mono text-amber-700 dark:text-amber-300">
                  {metrics.totalQty}
                </td>
                <td className="py-3.5 px-4 text-right font-mono text-stone-500 text-xs">
                  —
                </td>
                <td className="py-3.5 px-4 text-right font-mono text-amber-700 dark:text-amber-300">
                  {currency}{metrics.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="py-3.5 px-4 text-right font-mono text-amber-700 dark:text-amber-300">
                  100%
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
        totalItems={processedItems.length}
        pageSize={pageSize}
        pageSizeOptions={[10, 15, 25, 50]}
        onPageChange={setCurrentPage}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setCurrentPage(1);
        }}
        itemLabel="dishes"
      />
    </div>
  );
};
