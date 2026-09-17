import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, X, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

interface CustomDateRangePickerProps {
  customFrom: string;
  customTo: string;
  onChange: (from: string, to: string) => void;
  className?: string;
}

export const CustomDateRangePicker: React.FC<CustomDateRangePickerProps> = ({
  customFrom,
  customTo,
  onChange,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Today reference for validation & restrictions
  const today = new Date();
  const todayY = today.getFullYear();
  const todayM = today.getMonth();
  const todayD = today.getDate();

  const formatYMD = (year: number, month: number, day: number) => {
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  const todayStr = formatYMD(todayY, todayM, todayD);

  // Active viewing month in calendar
  const initialDate = customFrom ? new Date(`${customFrom}T00:00:00`) : today;
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth()); // 0-indexed

  // Local selection state while picking
  const [tempFrom, setTempFrom] = useState(customFrom);
  const [tempTo, setTempTo] = useState(customTo);
  const [selectingStep, setSelectingStep] = useState<'from' | 'to'>('from');

  // Sync temp state with props when opened
  useEffect(() => {
    if (isOpen) {
      setTempFrom(customFrom);
      setTempTo(customTo);
      setSelectingStep(customFrom && !customTo ? 'to' : 'from');
      if (customFrom) {
        const d = new Date(`${customFrom}T00:00:00`);
        if (!isNaN(d.getTime())) {
          setViewYear(d.getFullYear());
          setViewMonth(d.getMonth());
        }
      } else {
        setViewYear(todayY);
        setViewMonth(todayM);
      }
    }
  }, [isOpen, customFrom, customTo, todayY, todayM]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  // Next month is disabled if viewing current or future month
  const isNextMonthDisabled =
    viewYear > todayY || (viewYear === todayY && viewMonth >= todayM);

  const handleNextMonth = () => {
    if (isNextMonthDisabled) return;
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sun

  const formatDisplay = (isoStr: string) => {
    if (!isoStr) return 'dd-mm-yyyy';
    const d = new Date(`${isoStr}T00:00:00`);
    if (isNaN(d.getTime())) return 'dd-mm-yyyy';
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const handleDayClick = (day: number) => {
    const clickedStr = formatYMD(viewYear, viewMonth, day);

    // Strictly prevent clicking future dates
    if (clickedStr > todayStr) return;

    if (selectingStep === 'from') {
      setTempFrom(clickedStr);
      // If previous tempTo is now before new tempFrom, clear it
      if (tempTo && clickedStr > tempTo) {
        setTempTo('');
      }
      setSelectingStep('to');
    } else {
      // Selecting 'to'
      if (clickedStr < tempFrom) {
        // User clicked earlier date: make it from, keep previous as to
        setTempTo(tempFrom);
        setTempFrom(clickedStr);
        setSelectingStep('from');
      } else {
        setTempTo(clickedStr);
        setSelectingStep('from');
      }
    }
  };

  const handleApply = () => {
    let finalFrom = tempFrom;
    let finalTo = tempTo || tempFrom;

    if (!finalFrom) return;

    // Disallow future
    if (finalFrom > todayStr) finalFrom = todayStr;
    if (finalTo > todayStr) finalTo = todayStr;

    // Ensure order
    if (finalFrom > finalTo) {
      const t = finalFrom;
      finalFrom = finalTo;
      finalTo = t;
    }

    onChange(finalFrom, finalTo);
    setIsOpen(false);
  };

  const handleClear = () => {
    setTempFrom('');
    setTempTo('');
    onChange('', '');
    setIsOpen(false);
  };

  // Quick Presets inside custom picker (all guaranteed <= today)
  const setQuickRange = (daysAgo: number) => {
    const past = new Date(today);
    past.setDate(past.getDate() - daysAgo);

    const fromStr = formatYMD(past.getFullYear(), past.getMonth(), past.getDate());
    const toStr = todayStr;

    setTempFrom(fromStr);
    setTempTo(toStr);
    onChange(fromStr, toStr);
    setIsOpen(false);
  };

  const isSelectedDate = (dateStr: string) => dateStr === tempFrom || dateStr === tempTo;
  const isInRange = (dateStr: string) =>
    tempFrom && tempTo && dateStr > tempFrom && dateStr < tempTo;

  // Compute selected days summary
  const selectedDaysCount = () => {
    if (!tempFrom) return 0;
    const to = tempTo || tempFrom;
    const diff = Math.round(
      (new Date(`${to}T00:00:00`).getTime() - new Date(`${tempFrom}T00:00:00`).getTime()) /
        (1000 * 3600 * 24)
    );
    return diff + 1;
  };

  const isRangeValid = Boolean(
    tempFrom &&
    tempFrom <= todayStr &&
    (!tempTo || (tempTo <= todayStr && tempTo >= tempFrom))
  );

  return (
    <div ref={containerRef} className={cn('relative inline-block', className)}>
      {/* Trigger Button Display */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-white dark:bg-stone-850 border border-stone-200/90 dark:border-stone-750 hover:border-amber-400 dark:hover:border-amber-500 shadow-xs cursor-pointer transition-all select-none group"
      >
        <Calendar className="w-4 h-4 text-amber-500 shrink-0 group-hover:scale-110 transition-transform" />

        <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 dark:text-stone-300">
          <span className="text-stone-400 font-normal">From:</span>
          <span
            className={cn(
              'font-mono font-bold',
              tempFrom ? 'text-stone-900 dark:text-stone-100' : 'text-stone-400'
            )}
          >
            {tempFrom ? formatDisplay(tempFrom) : 'dd-mm-yyyy'}
          </span>
          <span className="text-stone-300 dark:text-stone-600 px-0.5">→</span>
          <span className="text-stone-400 font-normal">To:</span>
          <span
            className={cn(
              'font-mono font-bold',
              tempTo ? 'text-stone-900 dark:text-stone-100' : 'text-stone-400'
            )}
          >
            {tempTo ? formatDisplay(tempTo) : 'dd-mm-yyyy'}
          </span>
        </div>

        {(customFrom || customTo) && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
            className="p-1 rounded-full hover:bg-stone-100 dark:hover:bg-stone-750 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors ml-1 cursor-pointer"
            title="Clear date filter"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Calendar Dropdown Modal / Popover */}
      {isOpen && (
        <div className="absolute left-0 mt-2 z-50 w-80 sm:w-88 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-2xl p-4 sm:p-4.5 space-y-3 animate-in fade-in zoom-in-95 duration-150">
          {/* Header Month / Year Navigation */}
          <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-extrabold text-stone-900 dark:text-stone-100">
                {monthNames[viewMonth]}
              </span>
              <span className="text-sm font-bold text-amber-600 dark:text-amber-400 font-mono">
                {viewYear}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="w-7 h-7 rounded-xl flex items-center justify-center text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                disabled={isNextMonthDisabled}
                className={cn(
                  'w-7 h-7 rounded-xl flex items-center justify-center text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer',
                  isNextMonthDisabled && 'opacity-25 cursor-not-allowed hover:bg-transparent pointer-events-none'
                )}
                title={isNextMonthDisabled ? 'Future months restricted' : 'Next Month'}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setQuickRange(0)}
              className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-amber-100 hover:text-amber-800 dark:hover:bg-amber-950/50 dark:hover:text-amber-300 text-stone-600 dark:text-stone-400 transition-all cursor-pointer"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setQuickRange(6)}
              className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-amber-100 hover:text-amber-800 dark:hover:bg-amber-950/50 dark:hover:text-amber-300 text-stone-600 dark:text-stone-400 transition-all cursor-pointer"
            >
              Past 7 Days
            </button>
            <button
              type="button"
              onClick={() => setQuickRange(29)}
              className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-amber-100 hover:text-amber-800 dark:hover:bg-amber-950/50 dark:hover:text-amber-300 text-stone-600 dark:text-stone-400 transition-all cursor-pointer"
            >
              Past 30 Days
            </button>
          </div>

          {/* Step Guidance & Range Status Bar */}
          <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-stone-50 dark:bg-stone-850 border border-stone-200/60 dark:border-stone-800 text-[11px]">
            <button
              type="button"
              onClick={() => setSelectingStep('from')}
              className={cn(
                'flex-1 text-left px-2 py-1 rounded-lg transition-colors cursor-pointer',
                selectingStep === 'from'
                  ? 'bg-amber-500/15 border border-amber-500/40 text-amber-900 dark:text-amber-300 font-bold'
                  : 'text-stone-600 dark:text-stone-400'
              )}
            >
              <div className="text-[9px] uppercase tracking-wider text-stone-400">From</div>
              <div className="font-mono font-semibold truncate">{tempFrom ? formatDisplay(tempFrom) : 'Pick start'}</div>
            </button>

            <span className="text-stone-400">→</span>

            <button
              type="button"
              onClick={() => setSelectingStep('to')}
              className={cn(
                'flex-1 text-left px-2 py-1 rounded-lg transition-colors cursor-pointer',
                selectingStep === 'to'
                  ? 'bg-amber-500/15 border border-amber-500/40 text-amber-900 dark:text-amber-300 font-bold'
                  : 'text-stone-600 dark:text-stone-400'
              )}
            >
              <div className="text-[9px] uppercase tracking-wider text-stone-400">To</div>
              <div className="font-mono font-semibold truncate">{tempTo ? formatDisplay(tempTo) : 'Pick end'}</div>
            </button>
          </div>

          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 text-center text-[10px] font-bold uppercase tracking-wider text-stone-400">
            <span>Su</span>
            <span>Mo</span>
            <span>Tu</span>
            <span>We</span>
            <span>Th</span>
            <span>Fr</span>
            <span>Sa</span>
          </div>

          {/* Calendar Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty slots before first day of month */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="h-8" />
            ))}

            {/* Days in Month */}
            {Array.from({ length: daysInMonth(viewYear, viewMonth) }).map((_, i) => {
              const day = i + 1;
              const dateStr = formatYMD(viewYear, viewMonth, day);
              const isSelected = isSelectedDate(dateStr);
              const inRange = isInRange(dateStr);
              const isCurrentDay = dateStr === todayStr;
              const isFuture = dateStr > todayStr;

              return (
                <button
                  key={dateStr}
                  type="button"
                  onClick={() => handleDayClick(day)}
                  disabled={isFuture}
                  title={isFuture ? 'Future dates are restricted' : undefined}
                  className={cn(
                    'h-8 text-xs font-bold rounded-xl flex items-center justify-center transition-all select-none relative',
                    isFuture && 'text-stone-300 dark:text-stone-700 cursor-not-allowed pointer-events-none opacity-30',
                    !isFuture && !isSelected && !inRange && 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer',
                    isSelected && 'bg-amber-500 text-stone-950 font-black shadow-xs cursor-pointer z-10',
                    inRange && 'bg-amber-100/80 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 rounded-none cursor-pointer',
                    isCurrentDay && !isSelected && 'border-2 border-amber-500/80 text-amber-600 dark:text-amber-400 font-black'
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Selection helper note */}
          <div className="text-[10px] text-stone-400 dark:text-stone-500 flex items-center justify-between px-1">
            <span>
              {tempFrom && tempTo
                ? `${selectedDaysCount()} day(s) selected`
                : tempFrom
                ? 'Select end date (or Apply for 1 day)'
                : 'Choose a start date'}
            </span>
            <span className="text-stone-400">Future dates restricted</span>
          </div>

          {/* Footer Selection Info & Apply / Clear Buttons */}
          <div className="pt-2.5 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleClear}
              className="text-xs font-bold text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 px-2 py-1 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            >
              Clear
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-xs font-bold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApply}
                disabled={!isRangeValid}
                className="text-xs font-extrabold text-stone-950 bg-amber-500 hover:bg-amber-400 active:scale-95 disabled:opacity-40 disabled:pointer-events-none px-4 py-1.5 rounded-xl shadow-xs shadow-amber-500/20 transition-all cursor-pointer flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Apply</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
