import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext';
import { usePOS } from '../../context/POSContext';
import { inventoryApi } from '../../api/inventoryApi';
import { TablePaxIcon, type TableStatus } from './TablePaxIcon';
import { POSReserveTableModal } from './POSReserveTableModal';
import { Button, Tooltip } from '../ui';
import {
  Map,
  MoreHorizontal,
  Clock,
  Calendar,
  Sparkles,
  Utensils,
  ArrowRightLeft,
  Trash2,
  Edit2,
  CheckCircle2,
  Search,
  FilterX,
  Plus,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Table } from '../../types/app.types';
import { toast } from '../../context/ToastContext';

type StatusFilterType = 'ALL' | 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'CLEANING';

export const POSTableTerminalView: React.FC = () => {
  const { appData, refreshInventory } = useApp();
  const {
    setCart,
    tableOrders,
    setTableOrders,
    tableStartTimes,
    setTableStartTimes,
    tablePrinted,
    setTablePrinted,
    tableReservations,
    tableCleaningStatus,
    reserveTable,
    cancelReservation,
    markTableCleaning,
    setSelectedTableId,
    now,
    posSearchQuery,
    setPosSearchQuery,
    setShowShiftTableModal,
    setShowAddTableModal,
  } = usePOS();

  const [selectedAreaId, setSelectedAreaId] = useState<string | number>('ALL');
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>('ALL');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('pos_table_areas_collapsed');
      return saved === 'true';
    } catch {
      return false;
    }
  });

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('pos_table_areas_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  // Table card action dropdown state
  const [activeDropdownTableId, setActiveDropdownTableId] = useState<string | number | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Reservation modal state
  const [reservingTable, setReservingTable] = useState<Table | null>(null);
  const [isReserveModalOpen, setIsReserveModalOpen] = useState(false);

  // Close dropdown on outside click, scroll, resize or Escape
  useEffect(() => {
    if (!activeDropdownTableId) return;

    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setActiveDropdownTableId(null);
        setDropdownPosition(null);
      }
    };

    const handleScrollOrResize = () => {
      setActiveDropdownTableId(null);
      setDropdownPosition(null);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveDropdownTableId(null);
        setDropdownPosition(null);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeDropdownTableId]);

  const areas = appData.areas || [];
  const tables = appData.tables || [];

  // Helper: compute effective table status
  const getEffectiveTableStatus = (table: Table): TableStatus => {
    const key = String(table.id);

    // 1. Check if occupied (has active cart items or saved KOT orders)
    const orderData = tableOrders[key] || tableOrders[table.id];
    const hasActiveItems = orderData?.activeCart && orderData.activeCart.length > 0;
    const hasSavedOrders = orderData?.savedOrders && orderData.savedOrders.length > 0;
    if (hasActiveItems || hasSavedOrders) {
      return 'OCCUPIED';
    }

    // 2. Check if reserved in local state or database
    if (tableReservations[key] || table.status === 'Reserved') {
      return 'RESERVED';
    }

    // 3. Check if marked as cleaning
    if (tableCleaningStatus[key] || table.status === 'Cleaning') {
      return 'CLEANING';
    }

    // 4. Default to available
    return 'AVAILABLE';
  };

  const activeDropdownTable = useMemo(() => {
    if (!activeDropdownTableId) return null;
    return tables.find((t) => t.id === activeDropdownTableId) || null;
  }, [tables, activeDropdownTableId]);

  const activeTableStatus = useMemo(() => {
    if (!activeDropdownTable) return null;
    return getEffectiveTableStatus(activeDropdownTable);
  }, [activeDropdownTable, tableOrders, tableReservations, tableCleaningStatus]);

  // Helper: get elapsed dining time formatted
  const getTableDuration = (tableId: string | number): string => {
    const startTime = tableStartTimes[String(tableId)] || tableStartTimes[tableId];
    if (!startTime) return 'Just seated';
    const diffSecs = Math.max(0, Math.floor((now - startTime) / 1000));
    const mins = Math.floor(diffSecs / 60);
    const hours = Math.floor(mins / 60);

    if (hours > 0) {
      const remainingMins = mins % 60;
      return `${hours} hr ${remainingMins} min`;
    }
    return `${mins} min`;
  };

  // Floor stats telemetry
  const stats = useMemo(() => {
    let available = 0;
    let occupied = 0;
    let reserved = 0;
    let cleaning = 0;

    tables.forEach((t) => {
      const st = getEffectiveTableStatus(t);
      if (st === 'AVAILABLE') available++;
      else if (st === 'OCCUPIED') occupied++;
      else if (st === 'RESERVED') reserved++;
      else if (st === 'CLEANING') cleaning++;
    });

    return {
      total: tables.length,
      available,
      occupied,
      reserved,
      cleaning,
    };
  }, [tables, tableOrders, tableReservations, tableCleaningStatus]);

  // Area table counts
  const areaCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: tables.length };
    areas.forEach((a) => {
      counts[String(a.id)] = tables.filter((t) => String(t.areaId) === String(a.id)).length;
    });
    return counts;
  }, [tables, areas]);

  // Filtered tables
  const filteredTables = useMemo(() => {
    const query = posSearchQuery.trim().toLowerCase();

    return tables.filter((t) => {
      // 1. Area filter
      if (selectedAreaId !== 'ALL' && String(t.areaId) !== String(selectedAreaId)) {
        return false;
      }

      // 2. Status filter
      const st = getEffectiveTableStatus(t);
      if (statusFilter !== 'ALL' && st !== statusFilter) {
        return false;
      }

      // 3. Search query filter
      if (query) {
        const nameMatch = t.name.toLowerCase().includes(query);
        const areaObj = areas.find((a) => String(a.id) === String(t.areaId));
        const areaMatch = areaObj?.name.toLowerCase().includes(query);
        const seatMatch =
          `${t.seats || 4} pax`.includes(query) ||
          `${t.seats || 4} seats`.includes(query) ||
          String(t.seats || 4) === query;

        const reservation = tableReservations[String(t.id)];
        const guestMatch = reservation?.guestName?.toLowerCase().includes(query);

        return nameMatch || !!areaMatch || seatMatch || !!guestMatch;
      }

      return true;
    });
  }, [tables, areas, selectedAreaId, statusFilter, posSearchQuery, tableOrders, tableReservations, tableCleaningStatus]);

  // Action: Select table to start or resume order
  const handleSelectTable = (table: Table) => {
    const key = String(table.id);
    const effectiveStatus = getEffectiveTableStatus(table);

    // If cleaning, confirm if ready
    if (effectiveStatus === 'CLEANING') {
      markTableCleaning(table.id, false);
      toast.success(`Table "${table.name}" marked as clean and ready!`);
    }

    // Set active table in context
    setSelectedTableId(key);
    const orderData = tableOrders[key] || tableOrders[table.id];
    setCart(orderData?.activeCart || []);

    // Set dining start time if first opening
    if (effectiveStatus === 'AVAILABLE') {
      setTableStartTimes((prev) => ({ ...prev, [key]: Date.now() }));
    }
  };

  // Action: Clear running table session
  const handleClearTable = async (tableId: string | number, tableName: string) => {
    const key = String(tableId);
    const orderData = tableOrders[key] || tableOrders[tableId];

    if (orderData?.savedOrders) {
      const itemsToRevert: Array<{ menuItemId: number; quantity: number }> = [];
      orderData.savedOrders.forEach((o: any) => {
        if (o.kotDeducted !== false) {
          const items = o.items || (Array.isArray(o) ? o : []);
          items.forEach((it: any) => {
            itemsToRevert.push({
              menuItemId: Number(it.id || it.menuItemId),
              quantity: Number(it.quantity) || 1,
            });
          });
        }
      });

      if (itemsToRevert.length > 0) {
        try {
          await inventoryApi.revertStock(
            itemsToRevert,
            `Table Cleared: ${tableName}`
          );
          await refreshInventory();
        } catch (err) {
          console.error('Failed to revert inventory on table clear:', err);
        }
      }
    }

    setTableOrders((prev) => {
      const copy = { ...prev };
      delete copy[key];
      delete copy[tableId];
      return copy;
    });
    setTableStartTimes((prev) => {
      const copy = { ...prev };
      delete copy[key];
      delete copy[tableId];
      return copy;
    });
    setTablePrinted((prev) => {
      const copy = { ...prev };
      delete copy[key];
      delete copy[tableId];
      return copy;
    });
    setActiveDropdownTableId(null);
    toast.success(`Table "${tableName}" cleared.`);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#faf8f5] dark:bg-[#0c0f17] select-none">
      {/* Mobile Horizontal Areas Strip (< 768px) */}
      <div className="md:hidden px-4 py-2.5 bg-white dark:bg-stone-900 border-b border-stone-200/80 dark:border-stone-800 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
        <button
          type="button"
          onClick={() => setSelectedAreaId('ALL')}
          className={cn(
            'px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0',
            selectedAreaId === 'ALL'
              ? 'bg-amber-500 text-stone-950 shadow-xs'
              : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
          )}
        >
          All Areas ({areaCounts.ALL || 0})
        </button>
        {areas.map((area) => {
          const isSelected = String(selectedAreaId) === String(area.id);
          const count = areaCounts[String(area.id)] || 0;
          return (
            <button
              key={area.id}
              type="button"
              onClick={() => setSelectedAreaId(area.id)}
              className={cn(
                'px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0',
                isSelected
                  ? 'bg-amber-500 text-stone-950 shadow-xs'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
              )}
            >
              {area.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Main Floor Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Areas / Sections Navigation Sidebar (Desktop & Tablet) */}
        <aside
          className={cn(
            'hidden md:flex flex-col bg-white dark:bg-stone-900 border-r border-stone-200/80 dark:border-stone-800 shrink-0 select-none transition-all duration-300 ease-in-out relative z-10 overflow-hidden',
            isSidebarCollapsed ? 'w-16' : 'w-56 lg:w-64'
          )}
        >
          {/* Areas Header with Collapse Button */}
          <div className="h-14 px-3 border-b border-stone-200/80 dark:border-stone-800 flex items-center justify-between shrink-0 overflow-hidden">
            <div
              className={cn(
                'flex items-center gap-2.5 min-w-0 transition-all duration-300 ease-in-out overflow-hidden',
                isSidebarCollapsed ? 'opacity-0 max-w-0 pointer-events-none' : 'opacity-100 max-w-[180px]'
              )}
            >
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Map className="w-4 h-4" />
              </div>
              <div className="flex flex-col min-w-0">
                <h3 className="text-xs font-extrabold text-stone-900 dark:text-stone-100 truncate tracking-tight">
                  Areas / Sections
                </h3>
                <span className="text-[10px] text-stone-400 font-medium truncate">
                  {areas.length} {areas.length === 1 ? 'section' : 'sections'}
                </span>
              </div>
            </div>

            <Tooltip
              content={isSidebarCollapsed ? 'Expand Areas' : 'Collapse Areas'}
              position="right"
              offset={12}
            >
              <button
                type="button"
                onClick={toggleSidebar}
                className={cn(
                  'w-9 h-9 rounded-xl flex items-center justify-center text-stone-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 dark:hover:text-amber-400 border border-stone-200/70 dark:border-stone-800 transition-all duration-200 cursor-pointer click-bubble active:scale-90 active:ring-4 active:ring-amber-400/30 group shrink-0',
                  isSidebarCollapsed && 'mx-auto'
                )}
                aria-label={isSidebarCollapsed ? 'Expand areas sidebar' : 'Collapse areas sidebar'}
              >
                {isSidebarCollapsed ? (
                  <PanelLeftOpen className="w-4.5 h-4.5 text-amber-500 transition-transform duration-200 group-hover:scale-110" />
                ) : (
                  <PanelLeftClose className="w-4.5 h-4.5 transition-transform duration-200 group-hover:scale-110" />
                )}
              </button>
            </Tooltip>
          </div>

          {/* Areas List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5 custom-scrollbar">
            {/* All Areas Option */}
            <Tooltip
              content={isSidebarCollapsed ? `All Areas (${areaCounts.ALL || 0})` : null}
              position="right"
              offset={12}
              wrapperClassName="w-full block"
            >
              <button
                type="button"
                onClick={() => setSelectedAreaId('ALL')}
                className={cn(
                  'w-full h-11 rounded-xl font-bold text-xs flex items-center transition-all cursor-pointer select-none group overflow-hidden click-bubble active:scale-95',
                  selectedAreaId === 'ALL'
                    ? 'bg-[#fff5ea] dark:bg-amber-950/40 text-amber-950 dark:text-amber-200 shadow-2xs border border-amber-300/70 dark:border-amber-800/80 font-extrabold'
                    : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100/80 dark:hover:bg-stone-850 hover:text-stone-900 dark:hover:text-stone-100 border border-transparent'
                )}
              >
                <div className="w-12 shrink-0 flex items-center justify-center">
                  <span
                    className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
                      selectedAreaId === 'ALL'
                        ? 'text-amber-600 dark:text-amber-400 bg-amber-500/10'
                        : 'text-stone-400 group-hover:text-stone-600 dark:group-hover:text-stone-300 group-hover:bg-stone-200/50 dark:group-hover:bg-stone-800'
                    )}
                  >
                    <Map className="w-4 h-4" />
                  </span>
                </div>

                <div
                  className={cn(
                    'flex-1 flex items-center justify-between min-w-0 pr-2.5 whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out text-left',
                    isSidebarCollapsed ? 'opacity-0 max-w-0 pointer-events-none' : 'opacity-100 max-w-[180px]'
                  )}
                >
                  <span className="truncate">All Areas</span>
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded-full text-[11px] font-mono font-black shrink-0 transition-colors',
                      selectedAreaId === 'ALL'
                        ? 'bg-amber-500 text-stone-950'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 group-hover:bg-stone-200 dark:group-hover:bg-stone-700'
                    )}
                  >
                    {areaCounts.ALL || 0}
                  </span>
                </div>
              </button>
            </Tooltip>

            {/* Dynamic Areas */}
            {areas.map((area) => {
              const isSelected = String(selectedAreaId) === String(area.id);
              const count = areaCounts[String(area.id)] || 0;

              return (
                <Tooltip
                  key={area.id}
                  content={isSidebarCollapsed ? `${area.name} (${count})` : null}
                  position="right"
                  offset={12}
                  wrapperClassName="w-full block"
                >
                  <button
                    type="button"
                    onClick={() => setSelectedAreaId(area.id)}
                    className={cn(
                      'w-full h-11 rounded-xl font-bold text-xs flex items-center transition-all cursor-pointer select-none group overflow-hidden click-bubble active:scale-95',
                      isSelected
                        ? 'bg-[#fff5ea] dark:bg-amber-950/40 text-amber-950 dark:text-amber-200 shadow-2xs border border-amber-300/70 dark:border-amber-800/80 font-extrabold'
                        : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100/80 dark:hover:bg-stone-850 hover:text-stone-900 dark:hover:text-stone-100 border border-transparent'
                    )}
                  >
                    <div className="w-12 shrink-0 flex items-center justify-center">
                      <span
                        className={cn(
                          'w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black transition-colors',
                          isSelected
                            ? 'bg-amber-500 text-stone-950 shadow-xs'
                            : 'text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 group-hover:bg-stone-200 dark:group-hover:bg-stone-750'
                        )}
                      >
                        {area.name.charAt(0).toUpperCase()}
                      </span>
                    </div>

                    <div
                      className={cn(
                        'flex-1 flex items-center justify-between min-w-0 pr-2.5 whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out text-left',
                        isSidebarCollapsed ? 'opacity-0 max-w-0 pointer-events-none' : 'opacity-100 max-w-[180px]'
                      )}
                    >
                      <span className="truncate pr-2">{area.name}</span>
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded-full text-[11px] font-mono font-black shrink-0 transition-colors',
                          isSelected
                            ? 'bg-amber-500 text-stone-950'
                            : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 group-hover:bg-stone-200 dark:group-hover:bg-stone-700'
                        )}
                      >
                        {count}
                      </span>
                    </div>
                  </button>
                </Tooltip>
              );
            })}
          </div>
        </aside>

        {/* Center Column: Top Filter Pills + Table Cards Grid */}
        <main className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
          {/* Top Status Filter Pills Bar (Figure 2 Center Top - Clean, Floor Plan Removed) */}
          <div className="px-4 sm:px-6 py-3 bg-white dark:bg-stone-900 border-b border-stone-200/80 dark:border-stone-800 flex items-center justify-between gap-3 shrink-0 overflow-x-auto no-scrollbar">
            {/* Status Filter Tabs */}
            <div className="flex items-center gap-2 shrink-0 text-xs font-bold">
              {/* All */}
              <button
                type="button"
                onClick={() => setStatusFilter('ALL')}
                className={cn(
                  'px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap',
                  statusFilter === 'ALL'
                    ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs font-extrabold'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200/80 dark:hover:bg-stone-750'
                )}
              >
                All ({stats.total})
              </button>

              {/* Available */}
              <button
                type="button"
                onClick={() => setStatusFilter('AVAILABLE')}
                className={cn(
                  'px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5',
                  statusFilter === 'AVAILABLE'
                    ? 'bg-emerald-600 text-white shadow-xs font-extrabold'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200/80'
                )}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Available ({stats.available})</span>
              </button>

              {/* Occupied */}
              <button
                type="button"
                onClick={() => setStatusFilter('OCCUPIED')}
                className={cn(
                  'px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5',
                  statusFilter === 'OCCUPIED'
                    ? 'bg-amber-500 text-stone-950 shadow-xs font-extrabold'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200/80'
                )}
              >
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Occupied ({stats.occupied})</span>
              </button>

              {/* Reserved */}
              <button
                type="button"
                onClick={() => setStatusFilter('RESERVED')}
                className={cn(
                  'px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5',
                  statusFilter === 'RESERVED'
                    ? 'bg-rose-600 text-white shadow-xs font-extrabold'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200/80'
                )}
              >
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>Reserved ({stats.reserved})</span>
              </button>

              {/* Cleaning */}
              <button
                type="button"
                onClick={() => setStatusFilter('CLEANING')}
                className={cn(
                  'px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5',
                  statusFilter === 'CLEANING'
                    ? 'bg-sky-600 text-white shadow-xs font-extrabold'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200/80'
                )}
              >
                <span className="w-2 h-2 rounded-full bg-sky-500" />
                <span>Cleaning ({stats.cleaning})</span>
              </button>
            </div>
          </div>

          {/* Table Cards Scrollable Grid */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {filteredTables.length === 0 ? (
              <div className="h-72 flex flex-col items-center justify-center text-center p-6 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-3">
                  <Search className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-extrabold text-stone-800 dark:text-stone-200">
                  No dining tables found
                </h4>
                <p className="text-xs text-stone-400 mt-1 max-w-sm">
                  {posSearchQuery
                    ? `No tables match "${posSearchQuery}". Try another keyword or seat count.`
                    : 'No tables match the active area or status filter.'}
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setPosSearchQuery('');
                      setSelectedAreaId('ALL');
                      setStatusFilter('ALL');
                    }}
                    leftIcon={<FilterX className="w-4 h-4" />}
                  >
                    Reset Filters
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => setShowAddTableModal(true)}
                    leftIcon={<Plus className="w-4 h-4" />}
                  >
                    Add Extra Table
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-3 sm:gap-3.5">
                {filteredTables.map((table) => {
                  const status = getEffectiveTableStatus(table);
                  const key = String(table.id);
                  const isOccupied = status === 'OCCUPIED';
                  const isReserved = status === 'RESERVED';
                  const isCleaning = status === 'CLEANING';
                  const isAvailable = status === 'AVAILABLE';

                  const duration = isOccupied ? getTableDuration(table.id) : null;
                  const reservation = isReserved ? tableReservations[key] : null;
                  const isPrinted = !!(tablePrinted[key] || tablePrinted[Number(key)]);
                  const isMenuOpen = activeDropdownTableId === table.id;

                  return (
                    <div
                      key={table.id}
                      onClick={() => handleSelectTable(table)}
                      className={cn(
                        'relative rounded-3xl p-4 border transition-all duration-200 cursor-pointer select-none flex flex-col justify-between group shadow-2xs hover:shadow-md hover:-translate-y-0.5',
                        isOccupied
                          ? 'bg-[#fff9f2] dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/60 hover:border-amber-500'
                          : isReserved
                            ? 'bg-[#fff5f5] dark:bg-rose-950/20 border-rose-300 dark:border-rose-800/60 hover:border-rose-500'
                            : isCleaning
                              ? 'bg-sky-50/40 dark:bg-sky-950/20 border-sky-300 dark:border-sky-800/60 hover:border-sky-500'
                              : 'bg-white dark:bg-stone-850 border-stone-200/90 dark:border-stone-750 hover:border-stone-400 dark:hover:border-stone-600'
                      )}
                    >
                      {/* 1. Card Top Header: Table Name & 3-Dots Action Menu */}
                      <div className="flex items-start justify-between gap-2 shrink-0">
                        <div className="flex flex-col gap-1 min-w-0">
                          <h4 className="text-sm font-extrabold text-stone-900 dark:text-stone-100 truncate tracking-tight">
                            {table.name}
                          </h4>
                          {isPrinted && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-black bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 w-max mt-0.5">
                              <CheckCircle2 className="w-2.5 h-2.5 text-blue-500" />
                              Bill Printed
                            </span>
                          )}
                        </div>

                        {/* Three Dots Action Dropdown Trigger */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (activeDropdownTableId === table.id) {
                                setActiveDropdownTableId(null);
                                setDropdownPosition(null);
                              } else {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const menuWidth = 196;
                                const menuHeight = 220;
                                const minLeft = 16;
                                let left = rect.right - menuWidth;
                                if (left < minLeft) {
                                  left = Math.max(minLeft, rect.left);
                                }
                                if (left + menuWidth > window.innerWidth - 16) {
                                  left = window.innerWidth - menuWidth - 16;
                                }
                                const spaceBelow = window.innerHeight - rect.bottom;
                                const spaceAbove = rect.top;
                                let top = rect.bottom + 6;
                                if (spaceBelow < menuHeight && spaceAbove > spaceBelow) {
                                  top = Math.max(16, rect.top - menuHeight - 6);
                                }
                                setActiveDropdownTableId(table.id);
                                setDropdownPosition({ top, left });
                              }
                            }}
                            className={cn(
                              'p-1.5 rounded-xl transition-colors cursor-pointer',
                              isMenuOpen
                                ? 'bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200'
                                : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-stone-700/60'
                            )}
                            aria-label={`Actions for ${table.name}`}
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* 2. Card Center: Dynamic Seating Illustration (Pax Icon) */}
                      <div className="py-4 flex items-center justify-center">
                        <TablePaxIcon
                          seats={table.seats || 4}
                          status={status}
                          size="md"
                        />
                      </div>

                      {/* 3. Card Sub-Row: Pax / Duration / Reservation */}
                      <div className="flex flex-col items-center justify-center gap-1.5 mb-2.5 text-center">
                        {isOccupied && (
                          <div className="flex items-center gap-1 text-xs font-extrabold text-amber-700 dark:text-amber-400">
                            <Clock className="w-3.5 h-3.5 text-amber-500" />
                            <span>{duration}</span>
                          </div>
                        )}

                        {isReserved && (
                          <div className="flex items-center gap-1 text-xs font-extrabold text-rose-700 dark:text-rose-400">
                            <Calendar className="w-3.5 h-3.5 text-rose-500" />
                            <span>Res. {reservation?.time || 'Booked'}</span>
                          </div>
                        )}

                        {isCleaning && (
                          <div className="flex items-center gap-1 text-xs font-bold text-sky-700 dark:text-sky-400">
                            <Sparkles className="w-3.5 h-3.5 text-sky-500" />
                            <span>Sanitizing</span>
                          </div>
                        )}

                        {isAvailable && (
                          <div className="flex items-center gap-1 text-xs font-bold text-stone-500 dark:text-stone-400">
                            <span>{table.seats || 4} Pax</span>
                          </div>
                        )}
                      </div>

                      {/* 4. Card Bottom: Status Pill Badge */}
                      <div className="flex items-center justify-center">
                        {isAvailable && (
                          <span className="w-full text-center py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>Available</span>
                          </span>
                        )}

                        {isOccupied && (
                          <span className="w-full text-center py-1 rounded-full text-[11px] font-extrabold bg-amber-100/80 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300/80 dark:border-amber-800/60 flex items-center justify-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            <span>Occupied</span>
                          </span>
                        )}

                        {isReserved && (
                          <span className="w-full text-center py-1 rounded-full text-[11px] font-extrabold bg-rose-100/80 dark:bg-rose-950/60 text-rose-900 dark:text-rose-300 border border-rose-300/80 dark:border-rose-800/60 flex items-center justify-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            <span>Reserved</span>
                          </span>
                        )}

                        {isCleaning && (
                          <span className="w-full text-center py-1 rounded-full text-[11px] font-bold bg-sky-100/80 dark:bg-sky-950/60 text-sky-900 dark:text-sky-300 border border-sky-300/80 dark:border-sky-800/60 flex items-center justify-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                            <span>Cleaning</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Extra Table Card (Temporary Table) */}
                <div
                  onClick={() => setShowAddTableModal(true)}
                  className="relative rounded-3xl p-3.5 sm:p-4 border-2 border-dashed border-stone-300 dark:border-stone-700 hover:border-amber-500 dark:hover:border-amber-500 bg-stone-50/50 dark:bg-stone-850/30 hover:bg-amber-50/40 dark:hover:bg-amber-950/20 transition-all duration-200 cursor-pointer select-none flex flex-col justify-between items-center text-center group min-h-[200px] shadow-2xs hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="w-full flex items-center justify-center">
                    <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-100/70 dark:bg-amber-950/50 px-2.5 py-0.5 rounded-full border border-amber-300/60 dark:border-amber-800/40 uppercase tracking-wider">
                      Temporary
                    </span>
                  </div>

                  <div className="py-3 flex flex-col items-center justify-center">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:bg-amber-500 group-hover:text-stone-950 flex items-center justify-center transition-all duration-200 border border-dashed border-amber-500/30 group-hover:border-transparent shadow-xs">
                      <Plus className="w-6 h-6 stroke-[2.5]" />
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center mb-1">
                    <h4 className="text-xs sm:text-sm font-extrabold text-stone-900 dark:text-stone-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      Extra Table
                    </h4>
                    <p className="text-[10px] text-stone-400 dark:text-stone-500 mt-0.5 max-w-[130px] truncate">
                      Add temporary dining table
                    </p>
                  </div>

                  <div className="h-1" />
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Portaled Table Actions Dropdown (Positioned cleanly in viewport, immune to parent clipping) */}
      {activeDropdownTable && dropdownPosition && createPortal(
        <div
          ref={dropdownRef}
          style={{
            position: 'fixed',
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            zIndex: 99999,
          }}
          onClick={(e) => e.stopPropagation()}
          className="w-48 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl py-1.5 animate-in fade-in zoom-in-95 duration-100 text-xs font-semibold select-none"
        >
          {/* Option 1: Take Order / Open Table */}
          <button
            type="button"
            onClick={() => {
              const tbl = activeDropdownTable;
              setActiveDropdownTableId(null);
              setDropdownPosition(null);
              handleSelectTable(tbl);
            }}
            className="w-full px-3 py-2 text-left text-stone-700 dark:text-stone-300 hover:bg-amber-50 dark:hover:bg-amber-950/30 hover:text-amber-600 flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Utensils className="w-3.5 h-3.5 text-amber-500" />
            <span>{activeTableStatus === 'OCCUPIED' ? 'Open Order' : 'Take Order'}</span>
          </button>

          {/* Option 2: Reserve Table */}
          {activeTableStatus === 'AVAILABLE' && (
            <button
              type="button"
              onClick={() => {
                const tbl = activeDropdownTable;
                setActiveDropdownTableId(null);
                setDropdownPosition(null);
                setReservingTable(tbl);
                setIsReserveModalOpen(true);
              }}
              className="w-full px-3 py-2 text-left text-stone-700 dark:text-stone-300 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-600 flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Calendar className="w-3.5 h-3.5 text-rose-500" />
              <span>Reserve Table</span>
            </button>
          )}

          {/* Option: If Reserved, Edit or Cancel */}
          {activeTableStatus === 'RESERVED' && (
            <>
              <button
                type="button"
                onClick={() => {
                  const tbl = activeDropdownTable;
                  setActiveDropdownTableId(null);
                  setDropdownPosition(null);
                  setReservingTable(tbl);
                  setIsReserveModalOpen(true);
                }}
                className="w-full px-3 py-2 text-left text-stone-700 dark:text-stone-300 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-600 flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5 text-rose-500" />
                <span>Manage Booking</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const tbl = activeDropdownTable;
                  setActiveDropdownTableId(null);
                  setDropdownPosition(null);
                  cancelReservation(tbl.id);
                  toast.info(`Reservation cancelled for ${tbl.name}`);
                }}
                className="w-full px-3 py-2 text-left text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                <span>Cancel Reservation</span>
              </button>
            </>
          )}

          {/* Option: Shift Table if Occupied */}
          {activeTableStatus === 'OCCUPIED' && (
            <button
              type="button"
              onClick={() => {
                const tbl = activeDropdownTable;
                setActiveDropdownTableId(null);
                setDropdownPosition(null);
                setSelectedTableId(String(tbl.id));
                setShowShiftTableModal(true);
              }}
              className="w-full px-3 py-2 text-left text-stone-700 dark:text-stone-300 hover:bg-amber-50 dark:hover:bg-amber-950/30 hover:text-amber-600 flex items-center gap-2 cursor-pointer transition-colors"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-amber-500" />
              <span>Shift Table</span>
            </button>
          )}

          {/* Option: Mark as Cleaning / Mark as Cleaned */}
          {activeTableStatus !== 'CLEANING' && (
            <button
              type="button"
              onClick={() => {
                const tbl = activeDropdownTable;
                setActiveDropdownTableId(null);
                setDropdownPosition(null);
                markTableCleaning(tbl.id, true);
                toast.info(`Table "${tbl.name}" marked as cleaning.`);
              }}
              className="w-full px-3 py-2 text-left text-stone-700 dark:text-stone-300 hover:bg-sky-50 dark:hover:bg-sky-950/30 hover:text-sky-600 flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-500" />
              <span>Mark as Cleaning</span>
            </button>
          )}

          {activeTableStatus === 'CLEANING' && (
            <button
              type="button"
              onClick={() => {
                const tbl = activeDropdownTable;
                setActiveDropdownTableId(null);
                setDropdownPosition(null);
                markTableCleaning(tbl.id, false);
                toast.success(`Table "${tbl.name}" marked as ready.`);
              }}
              className="w-full px-3 py-2 text-left text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 flex items-center gap-2 cursor-pointer transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Mark Clean / Ready</span>
            </button>
          )}

          {/* Option: Clear Table if Occupied */}
          {activeTableStatus === 'OCCUPIED' && (
            <button
              type="button"
              onClick={() => {
                const tbl = activeDropdownTable;
                setActiveDropdownTableId(null);
                setDropdownPosition(null);
                handleClearTable(tbl.id, tbl.name);
              }}
              className="w-full px-3 py-2 text-left text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2 cursor-pointer transition-colors border-t border-stone-100 dark:border-stone-800"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear / Reset Table</span>
            </button>
          )}
        </div>,
        document.body
      )}

      {/* Table Reservation Modal */}
      <POSReserveTableModal
        isOpen={isReserveModalOpen}
        onClose={() => {
          setIsReserveModalOpen(false);
          setReservingTable(null);
        }}
        table={reservingTable}
        existingReservation={reservingTable ? tableReservations[String(reservingTable.id)] : null}
        onSaveReservation={(tId, data) => reserveTable(tId, data)}
        onCancelReservation={(tId) => cancelReservation(tId)}
        onSeatGuest={() => {
          if (reservingTable) {
            handleSelectTable(reservingTable);
          }
        }}
      />
    </div>
  );
};
