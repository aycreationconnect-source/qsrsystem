import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { AreaModal, type AreaFormData } from './AreaModal';
import { TableModal } from './TableModal';
import { Button } from '../ui';
import {
  Plus,
  Armchair,
  Edit2,
  Layers,
  MapPin,
  Users,
  Search,
  X,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { getAreaColorTheme, getNextAvailableColor } from '../../utils/areaColors';

export const FloorManagement: React.FC = () => {
  const { appData } = useApp();

  // Area Modal State
  const [showAddAreaModal, setShowAddAreaModal] = useState(false);
  const [editingAreaId, setEditingAreaId] = useState<number | null>(null);
  const [newArea, setNewArea] = useState<AreaFormData>({
    name: '',
    description: '',
    color: '',
  });

  const handleOpenAddArea = () => {
    setEditingAreaId(null);
    const suggestedColor = getNextAvailableColor(appData.areas || []);
    setNewArea({ name: '', description: '', color: suggestedColor });
    setShowAddAreaModal(true);
  };

  // Table Modal State
  const [showAddTableConfigModal, setShowAddTableConfigModal] = useState(false);
  const [editingTableId, setEditingTableId] = useState<number | string | null>(null);
  const [newTableConfig, setNewTableConfig] = useState<any>({
    name: '',
    seats: 4,
    status: 'Available',
    areaId: '',
  });

  // Filtering & Search states
  const [selectedAreaFilter, setSelectedAreaFilter] = useState<number | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Overview metrics
  const totalAreas = appData.areas?.length || 0;
  const totalTables = appData.tables?.length || 0;

  const totalSeats = useMemo(() => {
    return (appData.tables || []).reduce(
      (sum: number, t: any) => sum + (Number(t.seats) || 4),
      0
    );
  }, [appData.tables]);

  const statusCounts = useMemo(() => {
    const counts = { Available: 0, Occupied: 0, Reserved: 0 };
    (appData.tables || []).forEach((t: any) => {
      const s = t.status || 'Available';
      if (s === 'Occupied') counts.Occupied++;
      else if (s === 'Reserved') counts.Reserved++;
      else counts.Available++;
    });
    return counts;
  }, [appData.tables]);

  // Areas to render based on active filter
  const visibleAreas = useMemo(() => {
    if (selectedAreaFilter === 'ALL') {
      return appData.areas || [];
    }
    return (appData.areas || []).filter((a: any) => a.id === selectedAreaFilter);
  }, [appData.areas, selectedAreaFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Occupied':
        return {
          label: 'Occupied',
          dot: 'bg-rose-500',
          badge:
            'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50',
          iconBg: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400',
        };
      case 'Reserved':
        return {
          label: 'Reserved',
          dot: 'bg-amber-500',
          badge:
            'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50',
          iconBg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400',
        };
      default:
        return {
          label: 'Available',
          dot: 'bg-emerald-500',
          badge:
            'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50',
          iconBg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400',
        };
    }
  };

  const handleOpenAddTableForArea = (areaId: number) => {
    setEditingTableId(null);
    setNewTableConfig({
      name: '',
      seats: 4,
      status: 'Available',
      areaId: areaId,
    });
    setShowAddTableConfigModal(true);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Summary KPI Strip */}
      {totalAreas > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Total Sections */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-2xl p-4 shadow-sm flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                Sections
              </span>
              <span className="text-lg font-extrabold text-stone-900 dark:text-stone-100">
                {totalAreas} {totalAreas === 1 ? 'Area' : 'Areas'}
              </span>
            </div>
          </div>

          {/* Total Tables */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-2xl p-4 shadow-sm flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
              <Armchair className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                Total Tables
              </span>
              <span className="text-lg font-extrabold text-stone-900 dark:text-stone-100">
                {totalTables} {totalTables === 1 ? 'Table' : 'Tables'}
              </span>
            </div>
          </div>

          {/* Seating Capacity */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-2xl p-4 shadow-sm flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                Seating Capacity
              </span>
              <span className="text-lg font-extrabold text-stone-900 dark:text-stone-100">
                {totalSeats} Guests
              </span>
            </div>
          </div>

          {/* Live Table Availability Status */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-2xl p-4 shadow-sm flex flex-col justify-center gap-1.5">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
              Table Status
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>{statusCounts.Available} Available</span>
              </span>
              <span className="text-stone-300 dark:text-stone-700">•</span>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 dark:text-rose-400">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>{statusCounts.Occupied} Occupied</span>
              </span>
              <span className="text-stone-300 dark:text-stone-700">•</span>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>{statusCounts.Reserved} Reserved</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      {totalAreas > 0 && (
        <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-2xl p-3 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          {/* Section Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <button
              type="button"
              onClick={() => setSelectedAreaFilter('ALL')}
              className={cn(
                'px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer select-none flex items-center gap-1.5',
                selectedAreaFilter === 'ALL'
                  ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-sm'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-750'
              )}
            >
              <span>All Sections</span>
              <span
                className={cn(
                  'text-[10px] px-1.5 py-0.2 rounded-full font-bold',
                  selectedAreaFilter === 'ALL'
                    ? 'bg-stone-800 dark:bg-stone-200 text-stone-100 dark:text-stone-900'
                    : 'bg-stone-200 dark:bg-stone-700 text-stone-500 dark:text-stone-300'
                )}
              >
                {totalTables}
              </span>
            </button>

            {appData.areas?.map((area: any, idx: number) => {
              const count = (appData.tables || []).filter((t: any) => t.areaId === area.id).length;
              const isSelected = selectedAreaFilter === area.id;
              const theme = getAreaColorTheme(area, idx);
              return (
                <button
                  key={area.id}
                  type="button"
                  onClick={() => setSelectedAreaFilter(isSelected ? 'ALL' : area.id)}
                  className={cn(
                    'px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer select-none flex items-center gap-2',
                    isSelected
                      ? theme.filterActive
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-750'
                  )}
                >
                  <span className={cn('w-2 h-2 rounded-full shrink-0 shadow-xs', theme.dot)} />
                  <span>{area.name}</span>
                  <span
                    className={cn(
                      'text-[10px] px-1.5 py-0.2 rounded-full font-bold',
                      isSelected
                        ? 'bg-black/20 text-white dark:text-stone-900'
                        : 'bg-stone-200 dark:bg-stone-700 text-stone-500 dark:text-stone-300'
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Controls: Quick Search & Add Section */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
            <div className="relative flex-1 sm:w-60 shrink-0">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search tables..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 bg-stone-50 dark:bg-stone-800/80 text-stone-900 dark:text-stone-100 placeholder-stone-400 text-xs sm:text-sm pl-9 pr-8 rounded-xl border border-stone-200 dark:border-stone-700 focus:border-amber-500 focus:bg-white dark:focus:bg-stone-900 focus:outline-none transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-0.5"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenAddArea}
              leftIcon={<Plus className="w-4 h-4" />}
              className="font-bold cursor-pointer shrink-0 whitespace-nowrap"
            >
              Add Section / Area
            </Button>
          </div>
        </div>
      )}

      {/* Areas & Tables Container */}
      {appData.areas?.length === 0 ? (
        <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-12 text-center text-stone-400 text-xs">
          <Layers className="w-12 h-12 mx-auto mb-3 opacity-30 stroke-1" />
          <h4 className="font-bold text-sm text-stone-700 dark:text-stone-300">
            No Floor Areas Configured
          </h4>
          <p className="mt-1 max-w-xs mx-auto">
            Create your first area (such as "Main Dining", "AC Hall", or "Outdoor Patio") to begin setting up tables.
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenAddArea}
            className="mt-4 font-bold cursor-pointer"
          >
            Create Area First
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {visibleAreas.map((area: any, idx: number) => {
            const allAreaTables = (appData.tables || []).filter(
              (t: any) => t.areaId === area.id
            );
            const areaCapacity = allAreaTables.reduce(
              (sum: number, t: any) => sum + (Number(t.seats) || 4),
              0
            );
            const theme = getAreaColorTheme(area, idx);

            // Filter tables by search query
            const filteredAreaTables = searchQuery.trim()
              ? allAreaTables.filter(
                  (t: any) =>
                    t.name.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
                    String(t.seats).includes(searchQuery.trim())
                )
              : allAreaTables;

            return (
              <div
                key={area.id}
                className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4"
              >
                {/* Area Header with Theme Tint */}
                  <div
                    className={cn(
                      'flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl border border-stone-100 dark:border-stone-800/80 transition-all',
                      theme.headerBg
                    )}
                  >
                    <div className="flex items-start sm:items-center gap-3">
                      <div
                        className={cn(
                          'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs',
                          theme.iconBg
                        )}
                      >
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-extrabold text-stone-900 dark:text-stone-100">
                            {area.name}
                          </h3>
                          <span
                            className={cn(
                              'text-[11px] font-bold px-2.5 py-0.5 rounded-md shadow-xs',
                              theme.badge
                            )}
                          >
                            {allAreaTables.length} {allAreaTables.length === 1 ? 'Table' : 'Tables'}
                          </span>
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                            {areaCapacity} Seats
                          </span>
                        </div>
                        {area.description && (
                          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                            {area.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Section Actions: Edit Section */}
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingAreaId(area.id);
                          setNewArea({
                            name: area.name,
                            description: area.description || '',
                            color: area.color || theme.id,
                          });
                          setShowAddAreaModal(true);
                        }}
                        leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                        className="text-xs cursor-pointer bg-white/80 dark:bg-stone-900/80 backdrop-blur-xs"
                      >
                        Edit Section
                      </Button>
                    </div>
                  </div>

                  {/* Table Cards Grid */}
                  {allAreaTables.length === 0 ? (
                    <div className="p-8 rounded-2xl border border-dashed border-stone-200 dark:border-stone-800 text-center text-stone-400 text-xs">
                      <Armchair className="w-8 h-8 mx-auto mb-2 opacity-30 stroke-1" />
                      <span className="font-semibold text-stone-600 dark:text-stone-300 block">
                        No tables registered in "{area.name}" yet.
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenAddTableForArea(area.id)}
                        leftIcon={<Plus className="w-3.5 h-3.5" />}
                        className="mt-3 font-bold cursor-pointer"
                      >
                        Add First Table to {area.name}
                      </Button>
                    </div>
                  ) : filteredAreaTables.length === 0 && searchQuery.trim() ? (
                    <div className="p-6 rounded-2xl border border-stone-100 dark:border-stone-800/80 text-center text-stone-400 text-xs">
                      <span>No tables matching "{searchQuery}" in {area.name}.</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {filteredAreaTables.map((t: any) => {
                        const statusInfo = getStatusBadge(t.status || 'Available');
                        return (
                          <div
                            key={t.id}
                            onClick={() => {
                              setEditingTableId(t.id);
                              setNewTableConfig({
                                name: t.name,
                                seats: t.seats,
                                status: t.status,
                                areaId: t.areaId,
                              });
                              setShowAddTableConfigModal(true);
                            }}
                            className={cn(
                              'relative p-4 pt-5 pb-4 rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-850 hover:shadow-md transition-all flex flex-col items-center justify-center gap-3 cursor-pointer group active:scale-98 select-none min-h-[140px]',
                              theme.tableCardHover
                            )}
                          >
                            {/* Table Chair Icon - Color Decides Availability Status */}
                            <div
                              className={cn(
                                'w-12 h-12 rounded-2xl shadow-xs flex items-center justify-center group-hover:scale-105 transition-transform',
                                statusInfo.iconBg
                              )}
                            >
                              <Armchair className="w-6 h-6" />
                            </div>

                            {/* Table Details */}
                            <div className="text-center w-full">
                              <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 truncate">
                                {t.name}
                              </h4>
                              <span className="inline-flex items-center gap-1 text-[11px] text-stone-500 dark:text-stone-400 font-semibold mt-0.5">
                                <Users className="w-3 h-3 text-stone-400" />
                                <span>{t.seats || 4} Guests</span>
                              </span>
                            </div>
                          </div>
                        );
                      })}

                      {/* Add Table Quick Tile */}
                      <button
                        type="button"
                        onClick={() => handleOpenAddTableForArea(area.id)}
                        className={cn(
                          'p-4 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all cursor-pointer min-h-[140px] group',
                          theme.newTableBorder
                        )}
                      >
                        <div className="w-9 h-9 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-400 group-hover:scale-110 transition-transform">
                          <Plus className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold">+ New Table</span>
                      </button>
                    </div>
                  )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <AreaModal
        show={showAddAreaModal}
        onClose={() => setShowAddAreaModal(false)}
        editingAreaId={editingAreaId}
        newArea={newArea}
        setNewArea={setNewArea}
      />

      <TableModal
        show={showAddTableConfigModal}
        onClose={() => setShowAddTableConfigModal(false)}
        editingTableId={editingTableId}
        newTableConfig={newTableConfig}
        setNewTableConfig={setNewTableConfig}
      />
    </div>
  );
};
