import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Check, Tag, X, Search } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ReportCategoryDropdownProps {
  value: string;
  onChange: (category: string) => void;
  categories: string[];
  counts?: Record<string, number>;
  totalCount?: number;
  allLabel?: string;
  placeholder?: string;
  className?: string;
  align?: 'left' | 'right' | 'auto';
}

export const ReportCategoryDropdown: React.FC<ReportCategoryDropdownProps> = ({
  value,
  onChange,
  categories,
  counts,
  totalCount,
  allLabel = 'All Categories',
  className,
  align = 'auto',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [effectiveAlign, setEffectiveAlign] = useState<'left' | 'right'>('right');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Auto-detect optimal horizontal alignment to avoid screen or card edge clipping
  useEffect(() => {
    if (!isOpen) return;

    if (align === 'left' || align === 'right') {
      setEffectiveAlign(align);
      return;
    }

    if (dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      // If button is on the right side of the screen/container, align right so menu opens inwards
      if (rect.right + 20 > window.innerWidth || rect.left > window.innerWidth / 2) {
        setEffectiveAlign('right');
      } else if (rect.left < 20) {
        setEffectiveAlign('left');
      } else {
        // Default to right alignment for toolbar filter placement
        setEffectiveAlign('right');
      }
    }
  }, [isOpen, align]);

  // Close on outside click or Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && categories.length > 5 && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, categories.length]);

  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return categories;
    const term = searchTerm.toLowerCase().trim();
    return categories.filter((c) => c.toLowerCase().includes(term));
  }, [categories, searchTerm]);

  const isAllSelected = value === 'ALL';
  const showSearch = categories.length > 5;

  const handleSelect = (category: string) => {
    onChange(category);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('ALL');
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div ref={dropdownRef} className={cn('relative inline-block text-left', className)}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={cn(
          'inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl text-xs font-bold transition-all cursor-pointer select-none',
          !isAllSelected
            ? 'border border-amber-400/90 dark:border-amber-500/80 bg-amber-50/80 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 shadow-2xs ring-1 ring-amber-500/20'
            : isOpen
            ? 'border border-amber-400 dark:border-amber-500 bg-stone-50 dark:bg-stone-850 text-stone-900 dark:text-stone-100 ring-2 ring-amber-500/20'
            : 'border border-stone-200/90 dark:border-stone-800 bg-stone-50 dark:bg-stone-850 text-stone-700 dark:text-stone-300 hover:border-amber-400/80 dark:hover:border-amber-500/60'
        )}
        title={!isAllSelected ? `Filtered by category: ${value}` : 'Filter by category'}
      >
        <Tag
          className={cn(
            'w-3.5 h-3.5 shrink-0 transition-colors',
            !isAllSelected ? 'text-amber-600 dark:text-amber-400' : 'text-amber-500'
          )}
        />

        <span className="truncate max-w-[130px] font-bold">
          {isAllSelected ? allLabel : value}
        </span>

        {/* Count Badge for filtered category */}
        {!isAllSelected && counts && counts[value] !== undefined && (
          <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-amber-200/80 dark:bg-amber-900/60 text-amber-950 dark:text-amber-200 font-mono font-bold">
            {counts[value]}
          </span>
        )}

        {/* Quick clear button when a category is selected */}
        {!isAllSelected && (
          <span
            onClick={handleClear}
            className="p-0.5 rounded-full hover:bg-amber-200/90 dark:hover:bg-amber-800/80 text-amber-800 dark:text-amber-300 transition-colors cursor-pointer"
            title="Clear category filter"
          >
            <X className="w-3 h-3" />
          </span>
        )}

        <ChevronDown
          className={cn(
            'w-3.5 h-3.5 transition-transform duration-200 shrink-0',
            isOpen && 'rotate-180',
            !isAllSelected
              ? 'text-amber-700 dark:text-amber-300'
              : 'text-stone-400 group-hover:text-stone-600'
          )}
        />
      </button>

      {/* Dropdown Menu Popover */}
      {isOpen && (
        <div
          role="listbox"
          className={cn(
            'absolute top-full mt-1.5 min-w-[210px] w-max max-w-[280px] bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 flex flex-col select-none',
            effectiveAlign === 'right' ? 'right-0 left-auto' : 'left-0 right-auto'
          )}
        >
          {/* Optional Search Filter inside dropdown */}
          {showSearch && (
            <div className="px-1.5 pt-1 pb-1.5 border-b border-stone-100 dark:border-stone-800 shrink-0">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filter categories..."
                  className="w-full pl-8 pr-6 py-1.5 text-xs rounded-xl bg-stone-100 dark:bg-stone-850 border border-transparent focus:border-amber-500 focus:bg-white dark:focus:bg-stone-900 focus:outline-none text-stone-900 dark:text-stone-100 placeholder-stone-400 transition-all"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Categories Options List */}
          <div className="max-h-60 overflow-y-auto space-y-0.5 p-0.5 custom-scrollbar mt-0.5">
            {/* All Categories Option */}
            {(!searchTerm || allLabel.toLowerCase().includes(searchTerm.toLowerCase())) && (
              <button
                type="button"
                role="option"
                aria-selected={isAllSelected}
                onClick={() => handleSelect('ALL')}
                className={cn(
                  'w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-colors cursor-pointer text-left',
                  isAllSelected
                    ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 font-bold'
                    : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 font-medium'
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="truncate">{allLabel}</span>
                  {totalCount !== undefined && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400">
                      {totalCount}
                    </span>
                  )}
                </div>
                {isAllSelected && (
                  <Check className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 ml-2" />
                )}
              </button>
            )}

            {/* Subtle Divider if All Categories is visible */}
            {(!searchTerm || allLabel.toLowerCase().includes(searchTerm.toLowerCase())) &&
              filteredCategories.length > 0 && (
                <div className="border-b border-stone-100 dark:border-stone-800/80 my-0.5" />
              )}

            {/* Filtered Dynamic Categories */}
            {filteredCategories.map((cat) => {
              const isSelected = value === cat;
              const count = counts?.[cat];

              return (
                <button
                  key={cat}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(cat)}
                  className={cn(
                    'w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-colors cursor-pointer text-left',
                    isSelected
                      ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 font-bold'
                      : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 font-medium'
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="truncate">{cat}</span>
                    {count !== undefined && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 shrink-0">
                        {count}
                      </span>
                    )}
                  </div>
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 ml-2" />
                  )}
                </button>
              );
            })}

            {/* No matches empty state */}
            {filteredCategories.length === 0 &&
              searchTerm &&
              !allLabel.toLowerCase().includes(searchTerm.toLowerCase()) && (
                <div className="py-4 text-center text-xs text-stone-400">
                  No category matching &quot;{searchTerm}&quot;
                </div>
              )}
          </div>
        </div>
      )}
    </div>
  );
};
