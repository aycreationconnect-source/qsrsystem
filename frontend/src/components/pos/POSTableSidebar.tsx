import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { usePOS } from '../../context/POSContext';
import type { Table } from '../../types/app.types';
import { Button, Tooltip } from '../ui';
import {
  Plus,
  Armchair,
  Clock,
  Search,
  X,
  Users,
  ArrowUpDown,
  CheckCircle2,
  FilterX,
} from 'lucide-react';
import { cn } from '../../lib/utils';

type StatusFilterType = 'ALL' | 'AVAILABLE' | 'OCCUPIED' | 'BILLED' | 'PARTIAL';
type SortByType = 'default' | 'occupied' | 'name' | 'seats';

export const POSTableSidebar: React.FC = () => {
  const { appData } = useApp();
  const {
    cart,
    tableOrders,
    tablePayments,
    tableStartTimes,
    tablePrinted,
    selectedTableId,
    setSelectedTableId,
    setCart,
    now,
    setShowAddTableModal,
  } = usePOS();

  const [selectedAreaId, setSelectedAreaId] = useState<string | number>('ALL');
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortByType>('default');
  const [showSortMenu, setShowSortMenu] = useState(false);

  const areas = appData.areas || [];
  const tables = appData.tables || [];

  // Helper: Extract running order total and item count
  const getTableOrderSummary = (tableId: string | number) => {
    const key = String(tableId);
    const orderData = tableOrders[key] || tableOrders[tableId];

    // If currently selected table, use active `cart` state if it has newer items
    const isCurrentTable = selectedTableId === key;
    const activeItems =
      isCurrentTable && cart && cart.length > 0 ? cart : orderData?.activeCart || [];

    const savedItems: any[] = [];
    if (orderData?.savedOrders && Array.isArray(orderData.savedOrders)) {
      orderData.savedOrders.forEach((so: any) => {
        if (so && Array.isArray(so.items)) {
          savedItems.push(...so.items);
        } else if (Array.isArray(so)) {
          savedItems.push(...so);
        } else if (so && typeof so === 'object' && so.name) {
          savedItems.push(so);
        }
      });
    }

    const allItems = [...activeItems, ...savedItems];

    const payments = tablePayments[key] || tablePayments[tableId] || [];
    const paidAmount = payments.reduce(
      (sum: number, p: any) => sum + (parseFloat(String(p.amount ?? '').replace(/[^0-9.]/g, '')) || 0),
      0
    );

    if (allItems.length === 0) {
      return {
        total: 0,
        subtotal: 0,
        tax: 0,
        itemCount: 0,
        paidAmount,
        balanceDue: 0,
        hasOrder: false,
      };
    }

    let subtotal = 0;
    let tax = 0;
    let itemCount = 0;

    allItems.forEach((item: any) => {
      if (!item) return;
      // Strip currency symbols (e.g. ₹, $, commas, etc.)
      const cleanPrice = String(item.price ?? '').replace(/[^0-9.]/g, '');
      const price = parseFloat(cleanPrice) || 0;
      const qty = typeof item.quantity === 'number' ? item.quantity : parseInt(String(item.quantity || 1), 10) || 1;
      const itemSubtotal = price * qty;
      subtotal += itemSubtotal;
      itemCount += qty;

      let itemTaxRate = 0;
      if (item.taxes && Array.isArray(item.taxes) && item.taxes.length > 0) {
        itemTaxRate = item.taxes.reduce(
          (sum: number, t: any) => sum + (parseFloat(String(t.rate ?? '').replace(/[^0-9.]/g, '')) || 0),
          0
        );
      } else if (item.tax) {
        itemTaxRate = parseFloat(String(item.tax).replace(/[^0-9.]/g, '')) || 0;
      }
      tax += itemSubtotal * (itemTaxRate / 100);
    });

    let globalTaxRate = 0;
    if (appData.settings && appData.settings.globalTaxRate) {
      globalTaxRate = parseFloat(String(appData.settings.globalTaxRate).replace(/[^0-9.]/g, '')) || 0;
    }
    tax += subtotal * (globalTaxRate / 100);

    const total = subtotal + tax;
    const balanceDue = Math.max(0, parseFloat((total - paidAmount).toFixed(2)));

    return {
      subtotal,
      tax,
      total,
      paidAmount,
      balanceDue,
      itemCount,
      hasOrder: true,
    };
  };

  // Helper: Get table live status
  const getTableStatus = (tableId: string | number): 'AVAILABLE' | 'DINING' | 'BILLED' | 'PARTIAL' => {
    const key = String(tableId);
    const summary = getTableOrderSummary(tableId);
    if (summary.paidAmount > 0 && summary.balanceDue > 0) return 'PARTIAL';
    const isPrinted = tablePrinted[key] || tablePrinted[tableId];
    if (isPrinted) return 'BILLED';
    if (summary.hasOrder) return 'DINING';
    return 'AVAILABLE';
  };

  // Helper: Smart table initials/monogram (Fixes "T-12" being cut off as "T-1")
  const getTableInitials = (name: string): string => {
    if (!name) return 'T';
    const clean = name.trim();

    // Match patterns like "T-12", "Table 12", "T12"
    const tableNumMatch = clean.match(/^(?:T|Table|Tab)[-\s]?(\d+[a-zA-Z]?)$/i);
    if (tableNumMatch) {
      return tableNumMatch[1];
    }

    // Short table identifiers: "d1", "T4", "B2", "V1"
    if (clean.length <= 3) {
      return clean.toUpperCase();
    }

    // Two-word names: "Couple A" => "CA", "VIP 1" => "V1"
    const words = clean.split(/[\s-]+/).filter(Boolean);
    if (words.length >= 2) {
      if (words[1].length <= 2) {
        return (words[0][0] + words[1]).toUpperCase();
      }
      return (words[0][0] + words[1][0]).toUpperCase();
    }

    return clean.substring(0, 3).toUpperCase();
  };

  // Overall Floor Statistics
  const stats = useMemo(() => {
    let available = 0;
    let dining = 0;
    let billed = 0;
    let partial = 0;

    tables.forEach((t: Table) => {
      const st = getTableStatus(t.id);
      if (st === 'AVAILABLE') available++;
      else if (st === 'PARTIAL') partial++;
      else if (st === 'DINING') dining++;
      else if (st === 'BILLED') billed++;
    });

    return {
      total: tables.length,
      available,
      dining,
      billed,
      partial,
      occupied: dining + billed + partial,
    };
  }, [tables, tableOrders, tablePayments, tablePrinted, cart, selectedTableId]);

  // Filtered & Sorted Table List
  const filteredTables = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return tables
      .filter((t: Table) => {
        // 1. Area filter
        if (selectedAreaId !== 'ALL' && String(t.areaId) !== String(selectedAreaId)) {
          return false;
        }

        // 2. Status filter
        const status = getTableStatus(t.id);
        if (statusFilter === 'AVAILABLE' && status !== 'AVAILABLE') return false;
        if (statusFilter === 'OCCUPIED' && status === 'AVAILABLE') return false;
        if (statusFilter === 'BILLED' && status !== 'BILLED') return false;
        if (statusFilter === 'PARTIAL' && status !== 'PARTIAL') return false;

        // 3. Search filter
        if (query) {
          const nameMatch = t.name.toLowerCase().includes(query);
          const areaObj = areas.find((a: any) => a.id === t.areaId);
          const areaMatch = areaObj?.name.toLowerCase().includes(query);
          const seatMatch =
            `${t.seats || 4} seats`.includes(query) ||
            String(t.seats || 4) === query ||
            `${t.seats || 4}s`.includes(query);

          return nameMatch || !!areaMatch || seatMatch;
        }

        return true;
      })
      .sort((a: Table, b: Table) => {
        if (sortBy === 'occupied') {
          const aOcc = getTableStatus(a.id) !== 'AVAILABLE' ? 1 : 0;
          const bOcc = getTableStatus(b.id) !== 'AVAILABLE' ? 1 : 0;
          if (bOcc !== aOcc) return bOcc - aOcc;
        } else if (sortBy === 'name') {
          return a.name.localeCompare(b.name, undefined, { numeric: true });
        } else if (sortBy === 'seats') {
          return (b.seats || 4) - (a.seats || 4);
        }
        return 0;
      });
  }, [tables, areas, selectedAreaId, statusFilter, searchQuery, sortBy, tableOrders, tablePrinted, cart, selectedTableId]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedAreaId('ALL');
    setStatusFilter('ALL');
  };

  return (
    <aside className="w-72 sm:w-80 lg:w-84 h-full flex flex-col bg-white dark:bg-stone-900 border-r border-stone-200/80 dark:border-stone-800 shrink-0 select-none">
      {/* 1. Top Header */}
      <div className="p-3.5 sm:p-4 border-b border-stone-200/80 dark:border-stone-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
            <Armchair className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-stone-900 dark:text-stone-100 leading-tight flex items-center gap-1.5">
              <span>Floor & Tables</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 font-bold">
                {tables.length}
              </span>
            </h3>
            <div className="flex items-center gap-1.5 text-[11px] text-stone-500 dark:text-stone-400 font-medium mt-0.5">
              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {stats.available} Free
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                {stats.occupied} Busy
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Sort Menu Button */}
          <div className="relative">
            <Tooltip content="Sort Tables" position="bottom">
              <button
                type="button"
                onClick={() => setShowSortMenu((prev) => !prev)}
                className={cn(
                  'p-2 rounded-xl text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer',
                  sortBy !== 'default' && 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30'
                )}
                aria-label="Sort Tables"
              >
                <ArrowUpDown className="w-4 h-4" />
              </button>
            </Tooltip>

            {showSortMenu && (
              <div
                className="absolute right-0 top-full mt-1.5 w-44 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xl z-30 p-1.5 space-y-1 animate-in fade-in duration-100"
                onMouseLeave={() => setShowSortMenu(false)}
              >
                <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider px-2 py-1">
                  Sort By
                </div>
                {[
                  { id: 'default', label: 'Default Order' },
                  { id: 'occupied', label: 'Occupied First' },
                  { id: 'name', label: 'Name (A - Z)' },
                  { id: 'seats', label: 'Capacity (Seats)' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setSortBy(s.id as SortByType);
                      setShowSortMenu(false);
                    }}
                    className={cn(
                      'w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-between cursor-pointer',
                      sortBy === s.id
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold'
                        : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                    )}
                  >
                    <span>{s.label}</span>
                    {sortBy === s.id && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddTableModal(true)}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            className="text-xs py-1.5 px-3 font-bold"
          >
            Add
          </Button>
        </div>
      </div>

      {/* 2. Interactive Search Bar */}
      <div className="px-3 py-2.5 border-b border-stone-200/60 dark:border-stone-800 shrink-0">
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setSearchQuery('');
            }}
            placeholder="Search table or seats (e.g. VIP, 12, 4 seats)..."
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-stone-100/80 dark:bg-stone-800/80 border border-transparent focus:border-amber-500 focus:bg-white dark:focus:bg-stone-900 text-xs font-medium text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-700 cursor-pointer"
              aria-label="Clear Search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 3. Area Filter Tabs */}
      {areas.length > 0 && (
        <div className="px-3 py-2 border-b border-stone-100 dark:border-stone-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          <button
            type="button"
            onClick={() => setSelectedAreaId('ALL')}
            className={cn(
              'px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer',
              selectedAreaId === 'ALL'
                ? 'bg-amber-500 text-stone-950 shadow-sm'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200/80 dark:hover:bg-stone-750'
            )}
          >
            All ({tables.length})
          </button>

          {areas.map((area: any) => {
            const count = tables.filter((t: Table) => t.areaId === area.id).length;
            const isSelected = String(selectedAreaId) === String(area.id);
            return (
              <button
                key={area.id}
                type="button"
                onClick={() => setSelectedAreaId(area.id)}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer',
                  isSelected
                    ? 'bg-amber-500 text-stone-950 shadow-sm'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200/80 dark:hover:bg-stone-750'
                )}
              >
                {area.name} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* 4. Occupancy Status Quick Filter Chips */}
      <div className="px-3 py-1.5 bg-stone-50/50 dark:bg-stone-950/30 border-b border-stone-100 dark:border-stone-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 text-[11px]">
        <button
          type="button"
          onClick={() => setStatusFilter('ALL')}
          className={cn(
            'px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer whitespace-nowrap',
            statusFilter === 'ALL'
              ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
              : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
          )}
        >
          All ({stats.total})
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('AVAILABLE')}
          className={cn(
            'px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1',
            statusFilter === 'AVAILABLE'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
          )}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Available ({stats.available})
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('OCCUPIED')}
          className={cn(
            'px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1',
            statusFilter === 'OCCUPIED'
              ? 'bg-amber-500 text-stone-950 shadow-sm'
              : 'text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
          )}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          Occupied ({stats.occupied})
        </button>

        {stats.partial > 0 && (
          <button
            type="button"
            onClick={() => setStatusFilter('PARTIAL')}
            className={cn(
              'px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1',
              statusFilter === 'PARTIAL'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-violet-700 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/40'
            )}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
            Partial ({stats.partial})
          </button>
        )}

        {stats.billed > 0 && (
          <button
            type="button"
            onClick={() => setStatusFilter('BILLED')}
            className={cn(
              'px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1',
              statusFilter === 'BILLED'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-sky-700 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/40'
            )}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
            Billed ({stats.billed})
          </button>
        )}
      </div>

      {/* 5. Tables List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filteredTables.length === 0 ? (
          <div className="h-56 flex flex-col items-center justify-center text-center p-4">
            <div className="w-12 h-12 rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-400 flex items-center justify-center mb-2.5">
              {searchQuery ? (
                <Search className="w-5 h-5 opacity-60" />
              ) : (
                <Armchair className="w-6 h-6 opacity-60" />
              )}
            </div>

            <h4 className="text-xs font-bold text-stone-700 dark:text-stone-300">
              {searchQuery ? `No tables matching "${searchQuery}"` : 'No tables found'}
            </h4>
            <p className="text-[11px] text-stone-400 mt-0.5 max-w-[200px]">
              {searchQuery
                ? 'Try searching with another table number, seat count or area.'
                : 'No tables match the selected area or status filter.'}
            </p>

            {(searchQuery || selectedAreaId !== 'ALL' || statusFilter !== 'ALL') && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-3 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <FilterX className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>
            )}
          </div>
        ) : (
          filteredTables.map((t: Table) => {
            const orderSummary = getTableOrderSummary(t.id);
            const status = getTableStatus(t.id);
            const isSelected = selectedTableId === String(t.id);
            const isPartial = status === 'PARTIAL';
            const isPrinted = status === 'BILLED';
            const isDining = status === 'DINING';
            const isAvailable = status === 'AVAILABLE';

            const initials = getTableInitials(t.name);
            const areaObj = areas.find((a: any) => a.id === t.areaId);

            return (
              <div
                key={t.id}
                onClick={() => {
                  setSelectedTableId(String(t.id));
                  const key = String(t.id);
                  const orderData = tableOrders[key] || tableOrders[t.id];
                  setCart(orderData?.activeCart || []);
                }}
                className={cn(
                  'p-3 rounded-2xl border transition-all duration-150 flex items-center justify-between cursor-pointer select-none relative group',
                  isSelected
                    ? 'ring-2 ring-amber-500 border-amber-500 bg-amber-50/60 dark:bg-amber-950/25 shadow-sm'
                    : isPartial
                      ? 'bg-violet-50/40 dark:bg-violet-950/20 border-violet-200/90 dark:border-violet-800/60 hover:border-violet-400'
                      : isDining
                        ? 'bg-amber-50/30 dark:bg-amber-950/15 border-amber-200/90 dark:border-amber-800/60 hover:border-amber-400 hover:bg-amber-50/50'
                        : isPrinted
                          ? 'bg-sky-50/30 dark:bg-sky-950/15 border-sky-200/90 dark:border-sky-800/60 hover:border-sky-400'
                          : 'bg-white dark:bg-stone-850 border-stone-200/80 dark:border-stone-750 hover:border-stone-300 dark:hover:border-stone-700 hover:shadow-xs'
                )}
              >
                {/* Left: Monogram Badge & Table Details */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-xs shrink-0 tracking-tight transition-all',
                      isSelected
                        ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-stone-950 shadow-sm shadow-amber-500/20'
                        : isPartial
                          ? 'bg-violet-100 text-violet-950 dark:bg-violet-950 dark:text-violet-300 border border-violet-300/60 dark:border-violet-800/60'
                          : isDining
                            ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300/60 dark:border-amber-800/60'
                            : isPrinted
                              ? 'bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-300 border border-sky-300/60 dark:border-sky-800/60'
                              : 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300'
                    )}
                  >
                    {initials}
                  </div>

                  <div className="min-w-0 flex flex-col">
                    <h4 className="text-xs sm:text-sm font-extrabold text-stone-900 dark:text-stone-100 leading-tight truncate">
                      {t.name}
                    </h4>

                    <div className="flex items-center gap-1.5 text-[10px] text-stone-400 dark:text-stone-500 mt-0.5">
                      <span className="inline-flex items-center gap-0.5">
                        <Users className="w-2.5 h-2.5" />
                        {t.seats || 4} Seats
                      </span>
                      {selectedAreaId === 'ALL' && areaObj && (
                        <>
                          <span>•</span>
                          <span className="truncate max-w-[80px]">{areaObj.name}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Running Bill Amount, Timer & Status Badge */}
                <div className="flex flex-col items-end gap-1 shrink-0">
                  {isAvailable ? (
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/40">
                      Available
                    </span>
                  ) : (
                    <>
                      {/* Running Order Value */}
                      {isPartial ? (
                        <div className="flex flex-col items-end leading-tight">
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] font-bold text-rose-500">Due:</span>
                            <span className="font-mono font-black text-xs text-rose-600 dark:text-rose-400">
                              ₹{orderSummary.balanceDue.toFixed(2)}
                            </span>
                            <span className="text-[10px] font-bold text-stone-400 dark:text-stone-500">
                              ({orderSummary.itemCount})
                            </span>
                          </div>
                          <span className="text-[9px] font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                            Paid: ₹{orderSummary.paidAmount.toFixed(2)}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <span
                            className={cn(
                              'font-mono font-black text-xs tracking-tight',
                              isPrinted
                                ? 'text-sky-600 dark:text-sky-400'
                                : isSelected
                                  ? 'text-amber-800 dark:text-amber-300'
                                  : 'text-amber-600 dark:text-amber-400'
                            )}
                          >
                            ₹{orderSummary.total.toFixed(2)}
                          </span>
                          <span className="text-[10px] font-bold text-stone-400 dark:text-stone-500">
                            ({orderSummary.itemCount})
                          </span>
                        </div>
                      )}

                      {/* Status Tag + Timer */}
                      <div className="flex items-center gap-1.5">
                        {tableStartTimes[t.id] && (
                          <div className="flex items-center gap-0.5 text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400">
                            <Clock className="w-2.5 h-2.5" />
                            <span>
                              {(() => {
                                const diffSecs = Math.max(
                                  0,
                                  Math.floor((now - tableStartTimes[t.id]) / 1000)
                                );
                                const m = Math.floor(diffSecs / 60)
                                  .toString()
                                  .padStart(2, '0');
                                const s = (diffSecs % 60).toString().padStart(2, '0');
                                return `${m}:${s}`;
                              })()}
                            </span>
                          </div>
                        )}

                        <span
                          className={cn(
                            'text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider',
                            isPartial
                              ? 'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300 border border-violet-300/40'
                              : isPrinted
                                ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                                : 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300'
                          )}
                        >
                          {isPartial ? 'Partial' : isPrinted ? 'Billed' : 'Dining'}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 6. Footer Floor Summary */}
      <div className="p-2.5 px-3.5 bg-stone-50/80 dark:bg-stone-950/40 border-t border-stone-200/80 dark:border-stone-800 text-[11px] text-stone-500 dark:text-stone-400 flex items-center justify-between shrink-0">
        <span>
          Showing <strong className="text-stone-800 dark:text-stone-200">{filteredTables.length}</strong> of{' '}
          {tables.length} tables
        </span>
        {stats.total > 0 && (
          <span className="font-mono font-bold text-[10px] text-amber-600 dark:text-amber-400">
            {Math.round((stats.occupied / stats.total) * 100)}% Occupancy
          </span>
        )}
      </div>
    </aside>
  );
};
