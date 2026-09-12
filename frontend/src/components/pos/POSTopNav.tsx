import React from 'react';
import { useApp } from '../../context/AppContext';
import { usePOS } from '../../context/POSContext';
import { CafeBrandBadge, Button, Tooltip } from '../ui';
import { ShoppingBag, Utensils, Zap, History, Search, X } from 'lucide-react';

export interface POSTopNavProps {
  onOpenMobileCart?: () => void;
}

export const POSTopNav: React.FC<POSTopNavProps> = ({ onOpenMobileCart }) => {
  const { posMode, appData, storeProfile } = useApp();
  const {
    selectedTableId,
    cart,
    setShowOrderHistoryModal,
    posSearchQuery,
    setPosSearchQuery,
  } = usePOS();
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  // Global hotkey: '/' or 'Ctrl+K' focuses the search input
  React.useEffect(() => {
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

  const selectedTable = selectedTableId
    ? appData.tables.find((t: any) => t.id === selectedTableId)
    : null;

  return (
    <header className="h-16 px-4 sm:px-6 bg-white dark:bg-stone-900 border-b border-stone-200/80 dark:border-stone-800 flex items-center justify-between gap-3 shrink-0 z-20">
      {/* Left: Cafe Brand Badge & Mode */}
      <div className="flex items-center gap-3 min-w-0">
        <CafeBrandBadge
          name={storeProfile?.businessName || 'Velora Cafe'}
          cafeCode={storeProfile?.cafeCode}
          logoUrl={storeProfile?.logoUrl}
          size="sm"
        />

        {/* Desktop Title and Description */}
        <div className="hidden md:flex flex-col min-w-0 pl-3 border-l border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-extrabold text-stone-900 dark:text-stone-100 leading-tight">
              {posMode === 'table' ? 'POS - Table Service' : 'POS - Quick Order'}
            </h2>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800/60">
              {posMode === 'table' ? (
                <>
                  <Utensils className="w-2.5 h-2.5 text-amber-600" />
                  Table Mode
                </>
              ) : (
                <>
                  <Zap className="w-2.5 h-2.5 text-amber-600" />
                  Quick Mode
                </>
              )}
            </span>
            {posMode === 'table' && selectedTable && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/60">
                {selectedTable.name}
              </span>
            )}
          </div>
          <p className="hidden xl:block text-[11px] text-stone-500 dark:text-stone-400 font-medium truncate">
            {posMode === 'table'
              ? 'Dine-in floor orders, table booking & live billing'
              : 'Fast counter sales, express checkout & takeaway billing'}
          </p>
        </div>

        {/* Mobile Compact Pill */}
        <div className="flex md:hidden items-center gap-1.5 pl-2 border-l border-stone-200 dark:border-stone-800">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800/60">
            {posMode === 'table' ? (
              <>
                <Utensils className="w-3 h-3 text-amber-600" />
                Table POS
              </>
            ) : (
              <>
                <Zap className="w-3 h-3 text-amber-600" />
                Quick POS
              </>
            )}
          </span>
          {posMode === 'table' && selectedTable && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/60">
              {selectedTable.name}
            </span>
          )}
        </div>
      </div>

      {/* Center: Search Food & Beverage Input */}
      <div className="flex-1 max-w-sm sm:max-w-md lg:max-w-lg mx-2 sm:mx-4 min-w-0">
        <div className="relative w-full group">
          <Search className="w-4 h-4 text-stone-400 group-focus-within:text-amber-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search food & beverages..."
            value={posSearchQuery}
            onChange={(e) => setPosSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setPosSearchQuery('');
                searchInputRef.current?.blur();
              }
            }}
            className="w-full bg-stone-100/90 dark:bg-stone-800/90 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 text-xs sm:text-sm pl-10 pr-9 py-2 rounded-xl border border-stone-200/80 dark:border-stone-700/80 focus:border-amber-500 dark:focus:border-amber-500 focus:bg-white dark:focus:bg-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all shadow-2xs"
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
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-stone-400 bg-stone-200/50 dark:bg-stone-700/50 rounded border border-stone-300 dark:border-stone-600 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none select-none">
              /
            </kbd>
          )}
        </div>
      </div>

      {/* Right: Mobile Cart Trigger & Order History */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Mobile Cart Trigger Button */}
        {onOpenMobileCart && (
          <button
            type="button"
            onClick={onOpenMobileCart}
            className="lg:hidden relative p-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold transition-all active:scale-95 shadow-sm cursor-pointer"
            aria-label="View Cart"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalCartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] font-extrabold flex items-center justify-center ring-2 ring-white dark:ring-stone-900">
                {totalCartCount}
              </span>
            )}
          </button>
        )}

        {/* Order History Button (Available in Quick and Table POS) */}
        <Tooltip content="Terminal Order History & Reprint Bills" position="bottom">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowOrderHistoryModal(true)}
            leftIcon={<History className="w-4 h-4 text-amber-500" />}
            className="font-bold cursor-pointer"
          >
            <span className="hidden sm:inline">Order History</span>
            <span className="sm:hidden">History</span>
          </Button>
        </Tooltip>
      </div>
    </header>
  );
};
