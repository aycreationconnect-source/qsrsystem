import React from 'react';
import { cn } from '../../lib/utils';
import { Delete, Check } from 'lucide-react';

export interface NumpadProps {
  value: string;
  onChange: (val: string) => void;
  onEnter?: () => void;
  quickAmounts?: number[]; // e.g. [50, 100, 200, 500]
  showDecimal?: boolean;
  maxLength?: number;
  className?: string;
  enterLabel?: string;
  disabled?: boolean;
}

export const Numpad: React.FC<NumpadProps> = ({
  value,
  onChange,
  onEnter,
  quickAmounts = [100, 200, 500, 2000],
  showDecimal = true,
  maxLength = 10,
  className,
  enterLabel = 'Enter',
  disabled = false,
}) => {
  const handleDigit = (digit: string) => {
    if (disabled) return;
    if (value.length >= maxLength) return;
    if (digit === '.' && value.includes('.')) return;
    onChange(value === '0' && digit !== '.' ? digit : value + digit);
  };

  const handleBackspace = () => {
    if (disabled) return;
    onChange(value.slice(0, -1));
  };

  const handleClear = () => {
    if (disabled) return;
    onChange('');
  };

  const handleQuickAdd = (amt: number) => {
    if (disabled) return;
    const current = parseFloat(value) || 0;
    onChange((current + amt).toString());
  };

  return (
    <div className={cn('flex flex-col gap-2 w-full select-none', className)}>
      {/* Quick Denominations Row (India/QSR Cash Denominations) */}
      {quickAmounts && quickAmounts.length > 0 && (
        <div className="grid grid-cols-4 gap-1.5 mb-1">
          {quickAmounts.map((amt) => (
            <button
              key={amt}
              type="button"
              disabled={disabled}
              onClick={() => handleQuickAdd(amt)}
              className="py-2 px-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-bold text-xs border border-amber-200/80 dark:border-amber-800/50 hover:bg-amber-100 dark:hover:bg-amber-900/40 active:scale-95 transition-all cursor-pointer touch-manipulation"
            >
              +₹{amt}
            </button>
          ))}
        </div>
      )}

      {/* Main 4x3 Touch Grid */}
      <div className="grid grid-cols-3 gap-2">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
          <button
            key={digit}
            type="button"
            disabled={disabled}
            onClick={() => handleDigit(digit)}
            className="pos-keypad-btn h-14 text-xl font-bold bg-white dark:bg-stone-800/90 text-stone-900 dark:text-stone-100 border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-750 active:bg-amber-50 dark:active:bg-amber-950/50"
          >
            {digit}
          </button>
        ))}

        {/* Bottom row: Clear / Decimal, 0, Backspace */}
        {showDecimal ? (
          <button
            type="button"
            disabled={disabled}
            onClick={() => handleDigit('.')}
            className="pos-keypad-btn h-14 text-2xl font-bold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:bg-stone-200"
          >
            .
          </button>
        ) : (
          <button
            type="button"
            disabled={disabled}
            onClick={handleClear}
            className="pos-keypad-btn h-14 text-xs font-bold uppercase tracking-wider bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-700 hover:bg-stone-200 hover:text-stone-900"
          >
            C
          </button>
        )}

        <button
          type="button"
          disabled={disabled}
          onClick={() => handleDigit('0')}
          className="pos-keypad-btn h-14 text-xl font-bold bg-white dark:bg-stone-800/90 text-stone-900 dark:text-stone-100 border border-stone-200 dark:border-stone-700 hover:bg-stone-50 active:bg-amber-50"
        >
          0
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={handleBackspace}
          className="pos-keypad-btn h-14 text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50 dark:hover:text-rose-400 active:scale-95"
          aria-label="Backspace"
        >
          <Delete className="w-5 h-5" />
        </button>
      </div>

      {/* Action Enter / Confirm Button */}
      {onEnter && (
        <button
          type="button"
          disabled={disabled}
          onClick={onEnter}
          className="pos-keypad-btn mt-1 h-13 w-full bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-base flex items-center justify-center gap-2 shadow-sm shadow-amber-500/20 active:bg-amber-700"
        >
          <Check className="w-5 h-5" />
          <span>{enterLabel}</span>
        </button>
      )}
    </div>
  );
};
