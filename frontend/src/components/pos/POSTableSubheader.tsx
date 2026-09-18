import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { usePOS } from '../../context/POSContext';
import {
  ArrowLeft,
  Users,
  Clock,
  Utensils,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '../../lib/utils';

export const POSTableSubheader: React.FC = () => {
  const { appData } = useApp();
  const {
    selectedTableId,
    setSelectedTableId,
    tableOrders,
    tableStartTimes,
    tablePrinted,
  } = usePOS();

  const [now, setNow] = useState(Date.now());

  // Keep dining timer updated every 30s
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);

  if (!selectedTableId) return null;

  const currentTable = (appData.tables || []).find(
    (t: any) => String(t.id) === String(selectedTableId)
  );

  const currentArea = currentTable
    ? (appData.areas || []).find((a: any) => String(a.id) === String(currentTable.areaId))
    : null;

  const activeOrder = tableOrders[String(selectedTableId)] || tableOrders[Number(selectedTableId)];
  const hasItems =
    activeOrder &&
    ((activeOrder.activeCart && activeOrder.activeCart.length > 0) ||
      (activeOrder.savedOrders && activeOrder.savedOrders.length > 0));

  // Elapsed duration
  const startTime =
    tableStartTimes[String(selectedTableId)] || tableStartTimes[Number(selectedTableId)];

  let durationText = 'Just seated';
  if (startTime) {
    const diffSecs = Math.max(0, Math.floor((now - startTime) / 1000));
    const mins = Math.floor(diffSecs / 60);
    const hours = Math.floor(mins / 60);
    if (hours > 0) {
      durationText = `${hours}h ${mins % 60}m`;
    } else {
      durationText = `${mins} min`;
    }
  }

  const tableName = currentTable?.name || `Table ${selectedTableId}`;
  const paxCount = currentTable?.seats || 4;
  const isPrinted = !!(tablePrinted[String(selectedTableId)] || tablePrinted[Number(selectedTableId)]);

  return (
    <div className="h-13 px-3 sm:px-6 bg-white dark:bg-stone-900 border-b border-stone-200/80 dark:border-stone-800 flex items-center justify-between gap-2 sm:gap-4 shrink-0 z-20 select-none overflow-hidden">
      {/* Left: Change Table / Table Button */}
      <button
        type="button"
        onClick={() => setSelectedTableId(null)}
        className="inline-flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-750 bg-stone-50 hover:bg-stone-100 dark:bg-stone-800 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-200 font-bold text-xs shadow-2xs cursor-pointer transition-all active:scale-95 shrink-0 whitespace-nowrap"
        title="Return to floor tables grid"
      >
        <ArrowLeft className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
        <span>
          <span className="hidden md:inline">Change </span>Table
        </span>
      </button>

      {/* Right: Table Details Strip (Table Name, Persons, Time, Status) */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 md:gap-3 min-w-0 flex-nowrap overflow-x-auto no-scrollbar py-1 justify-end ml-auto">
        {/* Selected Table Pill Badge (No heavy solid background, distinguished border & accent text) */}
        <div className="inline-flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3 py-1.5 rounded-xl border border-amber-500/40 dark:border-amber-500/30 bg-transparent text-amber-700 dark:text-amber-400 font-extrabold text-xs sm:text-sm tracking-wide shrink-0 whitespace-nowrap">
          <div className="w-4 h-4 rounded-md bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center shrink-0">
            <Utensils className="w-3 h-3 text-amber-600 dark:text-amber-400" />
          </div>
          <span className="text-amber-800 dark:text-amber-300 font-black shrink-0">{tableName}</span>
          {currentArea && (
            <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 hidden md:inline shrink-0">
              ({currentArea.name})
            </span>
          )}
        </div>

        {/* Pax Capacity Chip */}
        <div className="inline-flex items-center gap-1.5 px-2 md:px-2.5 py-1 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200/80 dark:border-stone-750 text-stone-700 dark:text-stone-300 font-bold text-xs shrink-0 whitespace-nowrap">
          <Users className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500 shrink-0" />
          <span>
            {paxCount}
            <span className="hidden md:inline"> Pax</span>
          </span>
        </div>

        {/* Dining Duration Chip */}
        <div className="inline-flex items-center gap-1.5 px-2 md:px-2.5 py-1 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200/80 dark:border-stone-750 text-stone-700 dark:text-stone-300 font-bold text-xs shrink-0 whitespace-nowrap">
          <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>
            {startTime ? (
              durationText
            ) : (
              <>
                <span className="hidden md:inline">Just seated</span>
                <span className="md:hidden">0 min</span>
              </>
            )}
          </span>
        </div>

        {/* Status Pill */}
        <div
          className={cn(
            'inline-flex items-center gap-1.5 px-2 md:px-2.5 py-1 rounded-full text-xs font-black shrink-0 whitespace-nowrap',
            hasItems
              ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
              : 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
          )}
        >
          <span
            className={cn(
              'w-2 h-2 rounded-full shrink-0',
              hasItems ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
            )}
          />
          <span>
            {hasItems ? (
              'Occupied'
            ) : (
              <>
                <span className="hidden md:inline">Vacant / New</span>
                <span className="md:hidden">Vacant</span>
              </>
            )}
          </span>
        </div>

        {/* Bill Printed Indicator if applicable */}
        {isPrinted && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shrink-0 whitespace-nowrap">
            <CheckCircle2 className="w-3 h-3 text-blue-500 shrink-0" />
            Bill Printed
          </span>
        )}
      </div>
    </div>
  );
};
