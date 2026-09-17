import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ReportPagination } from './ReportPagination';
import { ReportCategoryDropdown } from './ReportCategoryDropdown';
import {
  Boxes,
  Search,
  AlertTriangle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type { InventoryItem } from '../../types/app.types';

type SortField = 'name' | 'category' | 'stock' | 'threshold' | 'status' | 'valuation';
type SortDirection = 'asc' | 'desc';

export const InventoryReport: React.FC = () => {
  const { appData, storeProfile } = useApp();
  const currency = storeProfile?.currencySymbol || '₹';

  const inventory: InventoryItem[] = useMemo(() => appData.inventory || [], [appData.inventory]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'GOOD' | 'LOW' | 'OUT'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Sorting state
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // Extract unique categories for filter
  const categories = useMemo(() => {
    const set = new Set<string>();
    inventory.forEach((i) => {
      if (i.category) set.add(i.category);
    });
    return Array.from(set).sort();
  }, [inventory]);

  // Inventory count per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    inventory.forEach((i) => {
      const cat = i.category || 'General';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [inventory]);

  // Handle column header sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        // Reset sort to default
        setSortField(null);
        setSortDirection('asc');
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const resetSort = () => {
    setSortField(null);
    setSortDirection('asc');
  };

  // KPI Metrics
  const metrics = useMemo(() => {
    let totalItems = inventory.length;
    let goodStock = 0;
    let lowStock = 0;
    let outOfStock = 0;
    let totalValuation = 0;

    inventory.forEach((item) => {
      const stock = Number(item.stock) || 0;
      const thresh = Number(item.threshold) || 0;
      const cost = Number(item.costPerUnit || item.price || 0);
      totalValuation += stock * cost;

      if (stock <= 0) {
        outOfStock++;
      } else if (stock <= thresh) {
        lowStock++;
      } else {
        goodStock++;
      }
    });

    return { totalItems, goodStock, lowStock, outOfStock, totalValuation };
  }, [inventory]);

  // Filtered & Sorted items
  const processedItems = useMemo(() => {
    // 1. Filter
    const filtered = inventory.filter((item) => {
      const name = (item.name || (item as any).item || '').toLowerCase();
      const cat = (item.category || '').toLowerCase();
      const q = searchQuery.toLowerCase().trim();

      const matchesSearch = !q || name.includes(q) || cat.includes(q);
      const matchesCategory = categoryFilter === 'ALL' || item.category === categoryFilter;

      const stock = Number(item.stock) || 0;
      const thresh = Number(item.threshold) || 0;

      let itemStatus: 'GOOD' | 'LOW' | 'OUT' = 'GOOD';
      if (stock <= 0) itemStatus = 'OUT';
      else if (stock <= thresh) itemStatus = 'LOW';

      const matchesStatus = statusFilter === 'ALL' || statusFilter === itemStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });

    // 2. Sort
    return [...filtered].sort((a, b) => {
      if (!sortField) {
        // Default Sort: Out of stock first, then Low stock, then alphabetically
        const aStock = Number(a.stock) || 0;
        const bStock = Number(b.stock) || 0;
        const aThresh = Number(a.threshold) || 0;
        const bThresh = Number(b.threshold) || 0;

        const aUrgency = aStock <= 0 ? 0 : aStock <= aThresh ? 1 : 2;
        const bUrgency = bStock <= 0 ? 0 : bStock <= bThresh ? 1 : 2;

        if (aUrgency !== bUrgency) return aUrgency - bUrgency;
        const aName = a.item || a.name || '';
        const bName = b.item || b.name || '';
        return aName.localeCompare(bName);
      }

      let comparison = 0;
      switch (sortField) {
        case 'name': {
          const aName = a.item || a.name || '';
          const bName = b.item || b.name || '';
          comparison = aName.localeCompare(bName);
          break;
        }
        case 'category':
          comparison = (a.category || '').localeCompare(b.category || '');
          break;
        case 'stock':
          comparison = (Number(a.stock) || 0) - (Number(b.stock) || 0);
          break;
        case 'threshold':
          comparison = (Number(a.threshold) || 0) - (Number(b.threshold) || 0);
          break;
        case 'status': {
          const aS = Number(a.stock) || 0;
          const bS = Number(b.stock) || 0;
          comparison = aS - bS;
          break;
        }
        case 'valuation': {
          const aVal = (Number(a.stock) || 0) * (Number(a.costPerUnit || a.price || 0));
          const bVal = (Number(b.stock) || 0) * (Number(b.costPerUnit || b.price || 0));
          comparison = aVal - bVal;
          break;
        }
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [inventory, searchQuery, categoryFilter, statusFilter, sortField, sortDirection]);

  // Reset page to 1 on filter or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter, statusFilter, sortField, sortDirection]);

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

  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
      {/* 1. KPI Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-stone-50 dark:bg-stone-850 p-3.5 rounded-2xl border border-stone-200/60 dark:border-stone-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
            <Boxes className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
              Total Items
            </span>
            <span className="text-base font-extrabold text-stone-900 dark:text-stone-100 font-mono">
              {metrics.totalItems}
            </span>
          </div>
        </div>

        <div className="bg-stone-50 dark:bg-stone-850 p-3.5 rounded-2xl border border-stone-200/60 dark:border-stone-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
              Good Stock
            </span>
            <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
              {metrics.goodStock}
            </span>
          </div>
        </div>

        <div className="bg-stone-50 dark:bg-stone-850 p-3.5 rounded-2xl border border-stone-200/60 dark:border-stone-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
              Low Stock
            </span>
            <span className="text-base font-extrabold text-amber-600 dark:text-amber-400 font-mono">
              {metrics.lowStock}
            </span>
          </div>
        </div>

        <div className="bg-stone-50 dark:bg-stone-850 p-3.5 rounded-2xl border border-stone-200/60 dark:border-stone-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0">
            <XCircle className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
              Out of Stock
            </span>
            <span className="text-base font-extrabold text-rose-600 dark:text-rose-400 font-mono">
              {metrics.outOfStock}
            </span>
          </div>
        </div>

        <div className="bg-stone-50 dark:bg-stone-850 p-3.5 rounded-2xl border border-stone-200/60 dark:border-stone-800 col-span-2 lg:col-span-1 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
            <span className="text-sm font-black font-mono">{currency}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
              Est. Valuation
            </span>
            <span className="text-base font-extrabold text-stone-900 dark:text-stone-100 font-mono">
              {currency}{metrics.totalValuation.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Search, Status & Sorting Filter Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search raw material name or category..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-850 text-xs sm:text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-stone-50 dark:bg-stone-850 p-1 rounded-2xl border border-stone-200/80 dark:border-stone-800 text-xs">
            {(['ALL', 'GOOD', 'LOW', 'OUT'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                className={cn(
                  'px-2.5 py-1 rounded-xl font-bold transition-all cursor-pointer text-[11px]',
                  statusFilter === s
                    ? 'bg-amber-500 text-stone-950 shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                )}
              >
                {s === 'ALL' ? 'All Status' : s === 'GOOD' ? 'Good' : s === 'LOW' ? 'Low' : 'Out'}
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
              totalCount={inventory.length}
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

      {/* 3. Direct Report Table */}
      <div className="w-full overflow-x-auto rounded-2xl border border-stone-200/80 dark:border-stone-800">
        <table className="w-full text-left border-collapse text-xs sm:text-sm min-w-[760px]">
          <thead>
            <tr className="bg-stone-50 dark:bg-stone-850/70 border-b border-stone-200/80 dark:border-stone-800 text-stone-400 font-bold uppercase tracking-wider text-[10px]">
              <th
                onClick={() => handleSort('name')}
                className="py-3 px-4 cursor-pointer hover:text-stone-700 dark:hover:text-stone-200 select-none group"
              >
                <div className="flex items-center gap-1.5">
                  <span>Item Name</span>
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
                onClick={() => handleSort('stock')}
                className="py-3 px-4 text-right cursor-pointer hover:text-stone-700 dark:hover:text-stone-200 select-none group"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Current Stock</span>
                  {renderSortIcon('stock')}
                </div>
              </th>

              <th
                onClick={() => handleSort('threshold')}
                className="py-3 px-4 text-right cursor-pointer hover:text-stone-700 dark:hover:text-stone-200 select-none group"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Threshold</span>
                  {renderSortIcon('threshold')}
                </div>
              </th>

              <th
                onClick={() => handleSort('status')}
                className="py-3 px-4 text-center cursor-pointer hover:text-stone-700 dark:hover:text-stone-200 select-none group"
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span>Health Status</span>
                  {renderSortIcon('status')}
                </div>
              </th>

              <th className="py-3 px-4 text-right">Unit Cost</th>

              <th
                onClick={() => handleSort('valuation')}
                className="py-3 px-4 text-right cursor-pointer hover:text-stone-700 dark:hover:text-stone-200 select-none group"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Valuation</span>
                  {renderSortIcon('valuation')}
                </div>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
            {processedItems.length > 0 ? (
              paginatedItems.map((item) => {
                const stock = Number(item.stock) || 0;
                const thresh = Number(item.threshold) || 0;
                const cost = Number(item.costPerUnit || item.price || 0);
                const val = stock * cost;

                const isOut = stock <= 0;
                const isLow = !isOut && stock <= thresh;

                return (
                  <tr
                    key={item.id || item.item || item.name}
                    className="hover:bg-stone-50/70 dark:hover:bg-stone-800/40 transition-colors"
                  >
                    <td className="py-3 px-4 font-bold text-stone-900 dark:text-stone-100">
                      {item.item || item.name || 'Unnamed Material'}
                    </td>

                    <td className="py-3 px-4 text-stone-500 dark:text-stone-400">
                      <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-[11px] font-semibold">
                        {item.category || 'General'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-stone-800 dark:text-stone-200">
                      {stock} <span className="text-stone-400 text-xs font-normal">{item.unit || 'units'}</span>
                    </td>

                    <td className="py-3 px-4 text-right font-mono text-stone-500 dark:text-stone-400">
                      {thresh} <span className="text-stone-400 text-xs font-normal">{item.unit || 'units'}</span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      {isOut ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
                          <XCircle className="w-3 h-3" />
                          Out of Stock
                        </span>
                      ) : isLow ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
                          <AlertTriangle className="w-3 h-3" />
                          Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                          <CheckCircle2 className="w-3 h-3" />
                          Good Stock
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right font-mono text-stone-500">
                      {cost > 0 ? `${currency}${cost.toFixed(2)}` : '—'}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-stone-900 dark:text-stone-100">
                      {val > 0 ? `${currency}${val.toFixed(2)}` : '—'}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="py-8 text-center text-stone-400 text-xs">
                  No inventory items match the current filters.
                </td>
              </tr>
            )}
          </tbody>

          {processedItems.length > 0 && (
            <tfoot>
              <tr className="bg-amber-500/10 dark:bg-amber-500/15 border-t-2 border-amber-500/30 font-black text-xs sm:text-sm text-stone-900 dark:text-stone-100">
                <td className="py-3.5 px-4 uppercase tracking-wider text-amber-700 dark:text-amber-300">
                  Total Valuation
                </td>
                <td className="py-3.5 px-4 font-mono text-stone-500 text-xs">
                  {processedItems.length} items
                </td>
                <td colSpan={4} className="py-3.5 px-4 text-right font-bold text-stone-400 text-xs">
                  Combined Total:
                </td>
                <td className="py-3.5 px-4 text-right font-mono text-amber-700 dark:text-amber-300">
                  {currency}{metrics.totalValuation.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
        itemLabel="items"
      />
    </div>
  );
};
