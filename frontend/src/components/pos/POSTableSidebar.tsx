import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { usePOS } from '../../context/POSContext';
import type { Table } from '../../types/app.types';
import { Button } from '../ui';
import { Plus, Armchair, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';

export const POSTableSidebar: React.FC = () => {
  const { appData } = useApp();
  const {
    tableOrders,
    tableStartTimes,
    tablePrinted,
    selectedTableId,
    setSelectedTableId,
    setCart,
    now,
    setShowAddTableModal,
  } = usePOS();

  const [selectedAreaId, setSelectedAreaId] = useState<string | number>('ALL');

  const areas = appData.areas || [];
  const tables = appData.tables || [];

  const filteredTables =
    selectedAreaId === 'ALL'
      ? tables
      : tables.filter((t: Table) => String(t.areaId) === String(selectedAreaId));

  return (
    <aside className="w-72 sm:w-80 h-full flex flex-col bg-white dark:bg-stone-900 border-r border-stone-200/80 dark:border-stone-800 shrink-0 select-none">
      {/* Top Header */}
      <div className="p-4 border-b border-stone-200/80 dark:border-stone-800 flex items-center justify-between shrink-0">
        <div>
          <h3 className="text-sm font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
            <Armchair className="w-4 h-4 text-amber-500" />
            <span>Floor & Tables</span>
          </h3>
          <span className="text-[11px] text-stone-400 font-medium">
            {tables.length} Total Tables
          </span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAddTableModal(true)}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
          className="text-xs py-1 px-2.5 font-bold"
        >
          Add
        </Button>
      </div>

      {/* Area Filter Tabs */}
      {areas.length > 0 && (
        <div className="px-3 py-2 border-b border-stone-100 dark:border-stone-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          <button
            type="button"
            onClick={() => setSelectedAreaId('ALL')}
            className={cn(
              'px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer',
              selectedAreaId === 'ALL'
                ? 'bg-amber-500 text-stone-950 shadow-sm'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
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
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
                )}
              >
                {area.name} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Tables Grid / List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filteredTables.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-center text-stone-400 text-xs">
            <Armchair className="w-8 h-8 mb-2 opacity-30 stroke-1" />
            <span>No tables configured</span>
          </div>
        ) : (
          filteredTables.map((t: Table) => {
            const orderData = tableOrders[t.id];
            const hasOrder =
              orderData &&
              (orderData.activeCart.length > 0 || orderData.savedOrders.length > 0);
            const isSelected = selectedTableId === String(t.id);
            const isPrinted = tablePrinted[t.id];

            return (
              <div
                key={t.id}
                onClick={() => {
                  setSelectedTableId(String(t.id));
                  setCart(orderData?.activeCart || []);
                }}
                className={cn(
                  'p-3 rounded-2xl border transition-all duration-150 flex items-center justify-between cursor-pointer select-none',
                  isSelected
                    ? 'ring-2 ring-amber-500 border-amber-500 bg-amber-50/40 dark:bg-amber-950/20 shadow-sm'
                    : hasOrder
                    ? 'bg-amber-50/20 dark:bg-amber-950/10 border-amber-300 dark:border-amber-800/80 hover:border-amber-400'
                    : 'bg-white dark:bg-stone-850 border-stone-200/80 dark:border-stone-750 hover:border-stone-300 dark:hover:border-stone-700'
                )}
              >
                {/* Left: Table Name & Capacity */}
                <div className="flex items-center gap-2.5">
                  <div
                    className={cn(
                      'w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0',
                      isSelected
                        ? 'bg-amber-500 text-stone-950'
                        : hasOrder
                        ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300'
                    )}
                  >
                    {t.name.split(' ')[1] || t.name.substring(0, 3)}
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 leading-tight">
                      {t.name}
                    </h4>
                    <span className="text-[10px] text-stone-400">
                      {t.seats || 4} Seats
                    </span>
                  </div>
                </div>

                {/* Right: Dining Status & Timer */}
                <div className="flex flex-col items-end gap-1">
                  {hasOrder ? (
                    <>
                      <span
                        className={cn(
                          'text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider',
                          isPrinted
                            ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                            : 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300'
                        )}
                      >
                        {isPrinted ? 'Billed' : 'Dining'}
                      </span>

                      {tableStartTimes[t.id] && (
                        <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400">
                          <Clock className="w-3 h-3" />
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
                    </>
                  ) : (
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/40">
                      Available
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
