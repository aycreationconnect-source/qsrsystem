import React, { useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { usePOS } from '../../context/POSContext';
import { CafeBrandBadge, Button, Tooltip } from '../ui';
import { cn } from '../../lib/utils';
import {
  ShoppingBag,
  History,
  Search,
  X,
  LayoutGrid,
  List,
} from 'lucide-react';

export interface POSTopNavProps {
  onOpenMobileCart?: () => void;
  onOpenPackageDetails?: () => void;
  onOpenStoreProfile?: () => void;
}

export const POSTopNav: React.FC<POSTopNavProps> = ({
  onOpenMobileCart,
  onOpenStoreProfile,
}) => {
  const { posMode, storeProfile } = useApp();
  const {
    selectedTableId,
    cart,
    setShowOrderHistoryModal,
    posSearchQuery,
    setPosSearchQuery,
    dietFilter,
    setDietFilter,
    viewMode,
    setViewMode,
  } = usePOS();

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Global hotkey: '/' or 'Ctrl+K' focuses search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === '/' || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')) &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA' &&
        document.activeElement?.tagName !== 'SELECT'
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const isFloorView = posMode === 'table' && !selectedTableId;

  return (
    <header className="h-16 px-4 sm:px-6 bg-white dark:bg-stone-900 border-b border-stone-200/80 dark:border-stone-800 flex items-center justify-between gap-3 shrink-0 z-30 select-none">
      {/* Left: Brand Badge & Mode Title */}
      <div className="flex items-center min-w-0">
        <CafeBrandBadge
          name={storeProfile?.businessName || 'The Urban Bistro'}
          cafeCode={storeProfile?.cafeCode || 'CF-NAG-001'}
          logoUrl={storeProfile?.logoUrl}
          size="md"
          onClick={onOpenStoreProfile}
          className={onOpenStoreProfile ? 'cursor-pointer hover:opacity-90 transition-opacity' : undefined}
          subtext={
            <span className="text-[11px] font-extrabold text-stone-600 dark:text-stone-300 uppercase tracking-wider mt-0.5">
              {posMode === 'table' ? 'Table Order' : 'Quick Order'}
            </span>
          }
        />
      </div>

      {/* Center: Filters & Search (Contextual) */}
      <div className="flex-1 flex items-center justify-center min-w-0 mx-2 sm:mx-4">
        {isFloorView ? (
          <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg relative group">
            <Search className="w-4 h-4 text-stone-400 group-focus-within:text-amber-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search tables, areas or guest... /"
              value={posSearchQuery}
              onChange={(e) => setPosSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setPosSearchQuery('');
                  searchInputRef.current?.blur();
                }
              }}
              className="w-full bg-stone-100/90 dark:bg-stone-800/90 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 text-xs sm:text-sm pl-10 pr-9 py-2 rounded-2xl border border-stone-200/80 dark:border-stone-700/80 focus:border-amber-500 dark:focus:border-amber-500 focus:bg-white dark:focus:bg-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all shadow-2xs"
            />
            {posSearchQuery ? (
              <button
                type="button"
                onClick={() => {
                  setPosSearchQuery('');
                  searchInputRef.current?.focus();
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-stone-700/60 transition-colors cursor-pointer"
                title="Clear search (Esc)"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-stone-400 bg-stone-200/50 dark:bg-stone-700/50 rounded border border-stone-300 dark:border-stone-600 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none select-none">
                /
              </kbd>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-4 w-full justify-center">
            {/* Dietary Filter Pills */}
            <div className="hidden md:flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setDietFilter('ALL')}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-[11px] font-black transition-all cursor-pointer shadow-2xs shrink-0',
                  dietFilter === 'ALL'
                    ? 'bg-amber-500 text-stone-950 shadow-sm'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-750'
                )}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setDietFilter('Veg')}
                className={cn(
                  'px-2 py-1 rounded-lg text-[11px] font-black transition-all cursor-pointer flex items-center gap-1.5 border shrink-0',
                  dietFilter === 'Veg'
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-800 dark:text-emerald-300 shadow-2xs ring-1 ring-emerald-500'
                    : 'bg-white dark:bg-stone-850 border-stone-200 dark:border-stone-750 text-stone-700 dark:text-stone-300 hover:border-emerald-400'
                )}
              >
                <span className="badge-diet-veg" />
                <span>Veg</span>
              </button>
              <button
                type="button"
                onClick={() => setDietFilter('Non-Veg')}
                className={cn(
                  'px-2 py-1 rounded-lg text-[11px] font-black transition-all cursor-pointer flex items-center gap-1.5 border shrink-0',
                  dietFilter === 'Non-Veg'
                    ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-500 text-rose-800 dark:text-rose-300 shadow-2xs ring-1 ring-rose-500'
                    : 'bg-white dark:bg-stone-850 border-stone-200 dark:border-stone-750 text-stone-700 dark:text-stone-300 hover:border-rose-400'
                )}
              >
                <span className="badge-diet-nonveg" />
                <span>Non-Veg</span>
              </button>
              <button
                type="button"
                onClick={() => setDietFilter('Egg')}
                className={cn(
                  'px-2 py-1 rounded-lg text-[11px] font-black transition-all cursor-pointer flex items-center gap-1.5 border shrink-0',
                  dietFilter === 'Egg'
                    ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-500 text-amber-900 dark:text-amber-300 shadow-2xs ring-1 ring-amber-500'
                    : 'bg-white dark:bg-stone-850 border-stone-200 dark:border-stone-750 text-stone-700 dark:text-stone-300 hover:border-amber-400'
                )}
              >
                <span className="inline-flex items-center justify-center w-3 h-3 border-[1.5px] border-amber-500 rounded-[3px] p-[1.5px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                </span>
                <span>Egg</span>
              </button>
              <button
                type="button"
                onClick={() => setDietFilter('Vegan')}
                className={cn(
                  'px-2 py-1 rounded-lg text-[11px] font-black transition-all cursor-pointer flex items-center gap-1.5 border shrink-0',
                  dietFilter === 'Vegan'
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-600 text-emerald-900 dark:text-emerald-300 shadow-2xs ring-1 ring-emerald-600'
                    : 'bg-white dark:bg-stone-850 border-stone-200 dark:border-stone-750 text-stone-700 dark:text-stone-300 hover:border-emerald-400'
                )}
              >
                <span className="text-emerald-600 text-[10px] leading-none">🌱</span>
                <span>Vegan</span>
              </button>
            </div>

            {/* Menu Search */}
            <div className="relative w-full max-w-[200px] lg:max-w-[260px]">
              <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search items... /"
                value={posSearchQuery}
                onChange={(e) => setPosSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setPosSearchQuery('');
                }}
                className="w-full bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 text-[11px] sm:text-xs pl-8 pr-7 py-1.5 rounded-xl border border-stone-200 dark:border-stone-750 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all shadow-2xs"
              />
              {posSearchQuery && (
                <button
                  type="button"
                  onClick={() => setPosSearchQuery('')}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5 rounded-md text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
                >
                  <X className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </button>
              )}
            </div>

            {/* View Mode Toggle */}
            <div className="hidden md:flex items-center gap-1 p-1 bg-stone-100 dark:bg-stone-800 rounded-xl border border-stone-200/80 dark:border-stone-750 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={cn(
                  'p-1.5 rounded-lg transition-all cursor-pointer',
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-stone-700 text-amber-600 shadow-xs'
                    : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
                )}
                title="Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={cn(
                  'p-1.5 rounded-lg transition-all cursor-pointer',
                  viewMode === 'list'
                    ? 'bg-white dark:bg-stone-700 text-amber-600 shadow-xs'
                    : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
                )}
                title="List View"
              >
                <List className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right Controls: Order History */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {onOpenMobileCart && !isFloorView && (
          <button
            type="button"
            onClick={onOpenMobileCart}
            className="lg:hidden relative p-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold transition-all active:scale-95 shadow-sm cursor-pointer"
            aria-label="View Cart"
          >
            <ShoppingBag className="w-4 h-4" />
            {totalCartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] font-extrabold flex items-center justify-center ring-2 ring-white dark:ring-stone-900">
                {totalCartCount}
              </span>
            )}
          </button>
        )}

        <Tooltip content="Terminal Order History & Reprint Bills" position="bottom">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowOrderHistoryModal(true)}
            leftIcon={<History className="w-4 h-4 text-amber-500" />}
            className="font-bold cursor-pointer rounded-2xl"
          >
            <span className="hidden xl:inline">Order History</span>
            <span className="xl:hidden">History</span>
          </Button>
        </Tooltip>
      </div>
    </header>
  );
};
