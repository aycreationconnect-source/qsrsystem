import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/utils';
import { ChevronDown, Check, X, Search } from 'lucide-react';

export interface SelectOption {
  label: string;
  value: string | number;
  badge?: string;
  icon?: React.ReactNode;
  description?: string;
}

export interface SelectProps {
  label?: React.ReactNode;
  options: SelectOption[];
  value?: string | number | (string | number)[];
  onChange: (val: any) => void;
  placeholder?: string;
  isMulti?: boolean;
  searchable?: boolean;
  error?: string;
  className?: string;
  triggerClassName?: string;
  menuClassName?: string;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  dropdownDirection?: 'down' | 'up' | 'auto';
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
  triggerClassName,
  menuClassName,
  disabled = false,
  leftIcon,
  dropdownDirection = 'auto',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [menuPosition, setMenuPosition] = useState<{
    top?: number;
    bottom?: number;
    left: number;
    width: number;
    maxHeight: number;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Calculate precise fixed position for portal rendering
  const updatePosition = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    const shouldOpenUp =
      dropdownDirection === 'up'
        ? true
        : dropdownDirection === 'down'
        ? false
        : spaceBelow < 220 && spaceAbove > spaceBelow;

    const margin = 6;
    const availableHeight = shouldOpenUp ? spaceAbove - margin * 2 : spaceBelow - margin * 2;
    const maxHeight = Math.min(260, Math.max(120, availableHeight));

    if (shouldOpenUp) {
      setMenuPosition({
        bottom: viewportHeight - rect.top + margin,
        left: rect.left,
        width: rect.width,
        maxHeight,
      });
    } else {
      setMenuPosition({
        top: rect.bottom + margin,
        left: rect.left,
        width: rect.width,
        maxHeight,
      });
    }
  }, [dropdownDirection]);

  // Keep position updated on scroll and resize
  useEffect(() => {
    if (!isOpen) return;

    updatePosition();

    const handleScrollOrResize = () => {
      updatePosition();
    };

    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('scroll', handleScrollOrResize, true);

    return () => {
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
    };
  }, [isOpen, updatePosition]);

  // Close on outside click (checking both container and portaled menu)
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        menuRef.current &&
        !menuRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

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
      return Array.isArray(value) && (value.includes(val) || value.map(String).includes(String(val)));
    }
    return value === val || (typeof value !== 'undefined' && String(value) === String(val));
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
        return <span className="text-stone-400 dark:text-stone-500 font-normal text-sm">{placeholder}</span>;
      }
      return (
        <div className="flex flex-wrap gap-1.5 py-0.5">
          {value.map((val) => {
            const opt = options.find((o) => o.value === val || String(o.value) === String(val));
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

    const selectedOpt = options.find((o) => o.value === value || String(o.value) === String(value));
    if (!selectedOpt) {
      return <span className="text-stone-400 dark:text-stone-500 font-normal text-sm">{placeholder}</span>;
    }

    return (
      <div className="flex items-center gap-2.5 min-w-0">
        {!leftIcon && selectedOpt.icon && <span className="shrink-0">{selectedOpt.icon}</span>}
        <span className="font-medium text-stone-900 dark:text-stone-100 truncate text-sm">
          {selectedOpt.label}
        </span>
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
          'w-full min-h-[44px] bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 border border-stone-300 dark:border-stone-700 rounded-xl px-4 py-2.5 text-sm transition-all duration-150 flex items-center justify-between cursor-pointer select-none',
          'hover:border-stone-400 dark:hover:border-stone-600',
          isOpen && 'ring-2 ring-amber-500/20 border-amber-500',
          disabled && 'opacity-60 cursor-not-allowed bg-stone-100 dark:bg-stone-800/50',
          error && 'border-rose-500 ring-2 ring-rose-500/20 text-rose-950 dark:text-rose-200',
          triggerClassName
        )}
      >
        <div className="flex items-center gap-2.5 flex-1 min-w-0 overflow-hidden">
          {leftIcon && <div className="shrink-0 text-stone-400 dark:text-stone-500">{leftIcon}</div>}
          <div className="flex-1 min-w-0 overflow-hidden">{getSelectedDisplay()}</div>
        </div>
        <ChevronDown
          className={cn(
            'w-4 h-4 text-stone-400 transition-transform duration-200 shrink-0 ml-2',
            isOpen && 'rotate-180 text-amber-500'
          )}
        />
      </div>

      {/* Dropdown Menu Portaled to document.body at z-[120] to prevent any clipping from modal body or footer */}
      {isOpen &&
        menuPosition &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              position: 'fixed',
              top: menuPosition.top !== undefined ? `${menuPosition.top}px` : undefined,
              bottom: menuPosition.bottom !== undefined ? `${menuPosition.bottom}px` : undefined,
              left: `${menuPosition.left}px`,
              width: `${menuPosition.width}px`,
              maxHeight: `${menuPosition.maxHeight}px`,
              zIndex: 99999,
            }}
            className={cn(
              'bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-2xl overflow-hidden',
              'animate-in fade-in zoom-in-95 duration-150 flex flex-col select-none',
              menuClassName
            )}
          >
            {searchable && (
              <div className="p-2.5 border-b border-stone-100 dark:border-stone-800 flex items-center gap-2 shrink-0">
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
                  <button onClick={() => setSearchTerm('')} className="text-stone-400 hover:text-stone-600 cursor-pointer">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
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
                        'flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all',
                        selected
                          ? 'bg-amber-500/10 dark:bg-amber-500/15 text-amber-900 dark:text-amber-200 font-bold border border-amber-500/20'
                          : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                        <div className="min-w-0">
                          <span className="block truncate">{opt.label}</span>
                          {opt.description && (
                            <span className="text-[10px] text-stone-400 font-normal block">{opt.description}</span>
                          )}
                        </div>
                        {opt.badge && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 font-medium shrink-0">
                            {opt.badge}
                          </span>
                        )}
                      </div>
                      {selected && <Check className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 ml-2" />}
                    </div>
                  );
                })
              )}
            </div>
          </div>,
          document.body
        )}

      {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
    </div>
  );
};
