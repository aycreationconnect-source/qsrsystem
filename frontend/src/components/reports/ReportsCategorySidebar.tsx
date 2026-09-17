import React from 'react';
import {
  FileSpreadsheet,
  Receipt,
  Boxes,
  UtensilsCrossed,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { cn } from '../../lib/utils';

export type ReportType = 'summary' | 'history' | 'inventory' | 'menuItems';

interface ReportsCategorySidebarProps {
  activeReport: ReportType;
  onSelectReport: (report: ReportType) => void;
}

export const ReportsCategorySidebar: React.FC<ReportsCategorySidebarProps> = ({
  activeReport,
  onSelectReport,
}) => {
  const reportCategories = [
    {
      id: 'summary' as ReportType,
      title: 'Total Summary',
      icon: FileSpreadsheet,
    },
    {
      id: 'history' as ReportType,
      title: 'Order History',
      icon: Receipt,
    },
    {
      id: 'inventory' as ReportType,
      title: 'Stock & Inventory',
      icon: Boxes,
    },
    {
      id: 'menuItems' as ReportType,
      title: 'Menu Item Wise',
      icon: UtensilsCrossed,
    },
  ];

  return (
    <div className="w-full md:w-60 lg:w-64 shrink-0 bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-3 sm:p-3.5 shadow-sm flex flex-col gap-2 select-none h-full">
      {/* Category Header */}
      <div className="px-2 py-1 flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-2.5 gap-2 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Layers className="w-4 h-4 text-amber-500 shrink-0" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 whitespace-nowrap">
            Reports Modules
          </span>
        </div>
        <span className="text-[11px] font-black w-5 h-5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 flex items-center justify-center shrink-0">
          4
        </span>
      </div>

      {/* Reports List - Clean title only with lighter font weight */}
      <div className="flex flex-col gap-1.5 flex-1 min-h-0 overflow-y-auto">
        {reportCategories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeReport === cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectReport(cat.id)}
              className={cn(
                'w-full text-left px-3.5 py-2.5 rounded-2xl transition-all cursor-pointer flex items-center justify-between gap-3 group relative',
                isActive
                  ? 'bg-amber-500/10 dark:bg-amber-500/15 border-2 border-amber-500/50 text-stone-900 dark:text-stone-100 shadow-xs'
                  : 'bg-transparent border-2 border-transparent hover:bg-stone-100/80 dark:hover:bg-stone-800/60 text-stone-700 dark:text-stone-300'
              )}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={cn(
                    'w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105',
                    isActive
                      ? 'bg-amber-500 text-stone-950 shadow-xs shadow-amber-500/30'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 group-hover:text-amber-600'
                  )}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <span
                  className={cn(
                    'text-xs sm:text-sm whitespace-nowrap transition-colors',
                    isActive
                      ? 'font-semibold text-stone-950 dark:text-white'
                      : 'font-normal text-stone-600 dark:text-stone-300 group-hover:text-stone-900 dark:group-hover:text-stone-100'
                  )}
                >
                  {cat.title}
                </span>
              </div>

              <ChevronRight
                className={cn(
                  'w-3.5 h-3.5 transition-transform text-stone-400 shrink-0',
                  isActive
                    ? 'text-amber-500 translate-x-0.5'
                    : 'group-hover:translate-x-0.5 opacity-50 group-hover:opacity-100'
                )}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};
