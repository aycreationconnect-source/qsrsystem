import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { usePOS } from '../../context/POSContext';
import { CafeBrandBadge, Button, Tooltip } from '../ui';
import { LayoutDashboard, ShoppingBag, Utensils, Zap } from 'lucide-react';

export interface POSTopNavProps {
  onOpenMobileCart?: () => void;
}

export const POSTopNav: React.FC<POSTopNavProps> = ({ onOpenMobileCart }) => {
  const { posMode, appData, storeProfile } = useApp();
  const { selectedTableId, cart } = usePOS();

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const selectedTable = selectedTableId
    ? appData.tables.find((t: any) => t.id === selectedTableId)
    : null;

  return (
    <header className="h-16 px-4 sm:px-6 bg-white dark:bg-stone-900 border-b border-stone-200/80 dark:border-stone-800 flex items-center justify-between gap-3 shrink-0 z-20">
      {/* Left: Cafe Brand Badge & Mode */}
      <div className="flex items-center gap-3 min-w-0">
        <CafeBrandBadge
          name={storeProfile?.businessName || 'Vidhara Cafe'}
          cafeCode={storeProfile?.cafeCode}
          logoUrl={storeProfile?.logoUrl}
          size="sm"
        />

        <div className="hidden sm:flex items-center gap-1.5 pl-3 border-l border-stone-200 dark:border-stone-800">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800/60">
            {posMode === 'table' ? (
              <>
                <Utensils className="w-3 h-3 text-amber-600" />
                Table POS
              </>
            ) : (
              <>
                <Zap className="w-3 h-3 text-amber-600" />
                Counter QSR
              </>
            )}
          </span>

          {posMode === 'table' && selectedTable && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/60">
              {selectedTable.name}
            </span>
          )}
        </div>
      </div>

      {/* Right: Date, Mobile Cart Trigger & Back to Admin */}
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

        <Tooltip content="Return to Management Dashboard" position="bottom">
          <Link to="/dashboard">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<LayoutDashboard className="w-4 h-4" />}
              className="font-bold cursor-pointer"
            >
              <span className="hidden sm:inline">Admin Panel</span>
              <span className="sm:hidden">Admin</span>
            </Button>
          </Link>
        </Tooltip>
      </div>
    </header>
  );
};
