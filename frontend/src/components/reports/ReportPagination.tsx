import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ReportPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange?: (newSize: number) => void;
  itemLabel?: string;
  className?: string;
}

export const ReportPagination: React.FC<ReportPaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  pageSizeOptions = [10, 15, 25, 50],
  onPageChange,
  onPageSizeChange,
  itemLabel = 'records',
  className,
}) => {
  if (totalItems <= 0) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers with smart ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) {
        pages.push('...');
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('....'); // unique key
      }
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 pb-1 text-xs text-stone-500 dark:text-stone-400 select-none border-t border-stone-100 dark:border-stone-800/80',
        className
      )}
    >
      {/* Left: Range and Item Count Summary + Page Size Dropdown */}
      <div className="flex items-center gap-3 flex-wrap">
        <span>
          Showing <strong className="text-stone-900 dark:text-stone-100">{startItem}</strong>–
          <strong className="text-stone-900 dark:text-stone-100">{endItem}</strong> of{' '}
          <strong className="text-stone-900 dark:text-stone-100">{totalItems}</strong> {itemLabel}
        </span>

        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 pl-2 sm:border-l border-stone-200 dark:border-stone-800">
            <span className="text-[11px] text-stone-400">Rows:</span>
            <div className="flex items-center gap-1">
              {pageSizeOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => onPageSizeChange(opt)}
                  className={cn(
                    'px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer',
                    pageSize === opt
                      ? 'bg-amber-500 text-stone-950 shadow-xs'
                      : 'bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-750 text-stone-600 dark:text-stone-300'
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right: Page Navigation Buttons */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1 self-end sm:self-auto">
          {/* First Page */}
          <button
            type="button"
            onClick={() => onPageChange(1)}
            disabled={currentPage <= 1}
            className="w-7 h-7 rounded-xl flex items-center justify-center border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-850 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
            title="First Page"
          >
            <ChevronsLeft className="w-3.5 h-3.5" />
          </button>

          {/* Previous Page */}
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="w-7 h-7 rounded-xl flex items-center justify-center border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-850 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
            title="Previous Page"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {/* Page Number Pills */}
          <div className="flex items-center gap-1 mx-0.5">
            {getPageNumbers().map((p, idx) => {
              if (typeof p === 'string') {
                return (
                  <span
                    key={`ellipsis-${idx}`}
                    className="w-6 text-center text-stone-400 select-none text-[11px]"
                  >
                    …
                  </span>
                );
              }

              const isCurrent = p === currentPage;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => onPageChange(p)}
                  className={cn(
                    'w-7 h-7 rounded-xl text-xs font-bold transition-all cursor-pointer select-none',
                    isCurrent
                      ? 'bg-amber-500 text-stone-950 shadow-xs shadow-amber-500/20 font-black'
                      : 'bg-stone-50 dark:bg-stone-850 text-stone-700 dark:text-stone-300 border border-stone-200/80 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800'
                  )}
                >
                  {p}
                </button>
              );
            })}
          </div>

          {/* Next Page */}
          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="w-7 h-7 rounded-xl flex items-center justify-center border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-850 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
            title="Next Page"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {/* Last Page */}
          <button
            type="button"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage >= totalPages}
            className="w-7 h-7 rounded-xl flex items-center justify-center border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-850 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
            title="Last Page"
          >
            <ChevronsRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
