import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { ChevronDown, Check, X, Search } from 'lucide-react';

export interface SelectOption {
  label: string;
  value: string | number;
  badge?: string;
  icon?: React.ReactNode;
}

export interface SelectProps {
  label?: string;
  options: SelectOption[];
  value?: string | number | (string | number)[];
  onChange: (val: any) => void;
  placeholder?: string;
  isMulti?: boolean;
  searchable?: boolean;
  error?: string;
  className?: string;
  disabled?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select option...',
  isMulti = false,
  searchable = true,
  error,
  className,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto focus search input when opened
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
    if (!isOpen) {
      setSearchTerm('');
    }
  }, [isOpen, searchable]);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isSelected = (val: string | number) => {
    if (isMulti) {
      return Array.isArray(value) && value.includes(val);
    }
    return value === val;
  };

  const handleSelect = (val: string | number) => {
    if (isMulti) {
      const arr = Array.isArray(value) ? [...value] : [];
      if (arr.includes(val)) {
        onChange(arr.filter((v) => v !== val));
      } else {
        onChange([...arr, val]);
      }
    } else {
      onChange(val);
      setIsOpen(false);
    }
  };

  const handleRemoveItem = (e: React.MouseEvent, val: string | number) => {
    e.stopPropagation();
    if (isMulti && Array.isArray(value)) {
      onChange(value.filter((v) => v !== val));
    }
  };

  // Label display
  const getSelectedDisplay = () => {
    if (isMulti) {
      if (!Array.isArray(value) || value.length === 0) {
        return <span className="text-stone-400">{placeholder}</span>;
      }
      return (
        <div className="flex flex-wrap gap-1.5 py-0.5">
          {value.map((val) => {
            const opt = options.find((o) => o.value === val);
            return (
              <span
                key={val}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 text-xs font-semibold border border-amber-300 dark:border-amber-800"
              >
                {opt ? opt.label : val}
                <span
                  onClick={(e) => handleRemoveItem(e, val)}
                  className="hover:text-amber-700 dark:hover:text-amber-100 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </span>
              </span>
            );
          })}
        </div>
      );
    }

    const selectedOpt = options.find((o) => o.value === value);
    if (!selectedOpt) {
      return <span className="text-stone-400">{placeholder}</span>;
    }

    return (
      <div className="flex items-center gap-2">
        {selectedOpt.icon}
        <span className="font-semibold text-stone-800 dark:text-stone-100">{selectedOpt.label}</span>
      </div>
    );
  };

  return (
    <div ref={containerRef} className={cn('relative w-full flex flex-col gap-1.5', className)}>
      {label && (
        <label className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider select-none">
          {label}
        </label>
      )}

      {/* Select Box Trigger */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          'w-full min-h-[44px] bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl px-4 py-2 text-sm flex items-center justify-between cursor-pointer transition-all duration-150 select-none',
          'hover:border-stone-400 dark:hover:border-stone-600',
          isOpen && 'ring-2 ring-amber-500/20 border-amber-500',
          disabled && 'opacity-60 cursor-not-allowed bg-stone-100 dark:bg-stone-800',
          error && 'border-rose-500 ring-rose-500/20'
        )}
      >
        <div className="flex-1 overflow-hidden">{getSelectedDisplay()}</div>
        <ChevronDown
          className={cn(
            'w-4 h-4 text-stone-400 transition-transform duration-200 shrink-0 ml-2',
            isOpen && 'rotate-180 text-amber-500'
          )}
        />
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {searchable && (
            <div className="p-2.5 border-b border-stone-100 dark:border-stone-800 flex items-center gap-2">
              <Search className="w-4 h-4 text-stone-400 shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="w-full text-xs bg-transparent text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="text-stone-400 hover:text-stone-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          <div className="max-h-56 overflow-y-auto p-1.5">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-center text-xs text-stone-400 font-medium">No options found</div>
            ) : (
              filteredOptions.map((opt) => {
                const selected = isSelected(opt.value);
                return (
                  <div
                    key={opt.value}
                    onClick={() => handleSelect(opt.value)}
                    className={cn(
                      'flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all',
                      selected
                        ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 font-bold'
                        : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {opt.icon}
                      <span>{opt.label}</span>
                      {opt.badge && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-500">
                          {opt.badge}
                        </span>
                      )}
                    </div>
                    {selected && <Check className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
    </div>
  );
};
