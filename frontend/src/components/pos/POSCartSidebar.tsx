import React from 'react';
import { useApp } from '../../context/AppContext';
import { usePOS } from '../../context/POSContext';
import { Button, Tooltip } from '../ui';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRightLeft,
  Receipt,
  Utensils,
} from 'lucide-react';

export interface POSCartSidebarProps {
  onCloseMobileDrawer?: () => void;
}

export const POSCartSidebar: React.FC<POSCartSidebarProps> = ({ onCloseMobileDrawer }) => {
  const { posMode, appData } = useApp();
  const {
    cart,
    setCart,
    tableOrders,
    setTableOrders,
    setTableStartTimes,
    setTablePrinted,
    selectedTableId,
    updateCartQty,
    updateCartQtyExact,
    cancelCartItem,
    saveTableOrder,
    getCartTotals,
    setShowCheckoutModal,
    setShowShiftTableModal,
  } = usePOS();

  const { subtotal, tax, total } = getCartTotals();
  const selectedTable = selectedTableId
    ? appData.tables.find((t: any) => t.id === selectedTableId)
    : null;

  const handleClearCart = () => {
    setCart([]);
    if (posMode === 'table' && selectedTableId) {
      setTableOrders((t) => {
        const nt = { ...t };
        delete nt[selectedTableId];
        return nt;
      });
      setTableStartTimes((t) => {
        const nt = { ...t };
        delete nt[selectedTableId];
        return nt;
      });
      setTablePrinted((t) => {
        const nt = { ...t };
        delete nt[selectedTableId];
        return nt;
      });
    }
  };

  const hasSavedOrders =
    posMode === 'table' &&
    selectedTableId &&
    tableOrders[selectedTableId]?.savedOrders?.length > 0;

  return (
    <aside className="h-full w-full flex flex-col bg-white dark:bg-stone-900 border-l border-stone-200/80 dark:border-stone-800 select-none">
      {/* Top Header Row */}
      <div className="p-4 border-b border-stone-200/80 dark:border-stone-800 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
            <Receipt className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-extrabold text-stone-900 dark:text-stone-100 truncate">
              {posMode === 'table' && selectedTable
                ? `${selectedTable.name} Ticket`
                : 'Current Ticket'}
            </h3>
            <span className="text-[11px] text-stone-400 font-medium">
              {cart.reduce((s, c) => s + c.quantity, 0)} items in bill
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {posMode === 'table' && selectedTableId && (
            <Tooltip content="Shift / Transfer Order to Another Table" position="bottom">
              <button
                type="button"
                onClick={() => setShowShiftTableModal(true)}
                className="p-2 rounded-xl text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-all cursor-pointer"
              >
                <ArrowRightLeft className="w-4 h-4" />
              </button>
            </Tooltip>
          )}

          <Tooltip content="Clear All Items" position="bottom">
            <button
              type="button"
              disabled={cart.length === 0 && !hasSavedOrders}
              onClick={handleClearCart}
              className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Cart Items List Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Saved Table Orders (KOT sent to kitchen) */}
        {hasSavedOrders &&
          tableOrders[selectedTableId]?.savedOrders.map((order, orderIdx) => (
            <div
              key={orderIdx}
              className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/60 dark:border-stone-700/60 space-y-2"
            >
              <div className="flex items-center justify-between text-xs font-bold text-stone-500 dark:text-stone-400 pb-1.5 border-b border-stone-200/60 dark:border-stone-700/60">
                <span className="flex items-center gap-1">
                  <Utensils className="w-3 h-3 text-amber-500" />
                  KOT Batch #{orderIdx + 1}
                </span>
                {order.time && (
                  <span className="text-[10px] font-mono text-stone-400">
                    {new Date(order.time).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                )}
              </div>

              {(order.items || (Array.isArray(order) ? order : [])).map((item: any, i: number) => (
                <div key={i} className="flex items-center justify-between text-xs py-1">
                  <div className="min-w-0 flex-1 pr-2">
                    <span className="font-semibold text-stone-800 dark:text-stone-200 truncate block">
                      {item.name}
                    </span>
                    <span className="text-[10px] text-stone-400">Qty: {item.quantity}</span>
                  </div>
                  <span className="font-mono font-bold text-stone-700 dark:text-stone-300">
                    ₹{(parseFloat(String(item.price).replace('₹', '')) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          ))}

        {/* Current Active Order */}
        {cart.length > 0 && (
          <div className="space-y-2.5">
            {hasSavedOrders && (
              <div className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider px-1">
                New Items to Add
              </div>
            )}

            {cart.map((item, i) => (
              <div
                key={i}
                className="p-3 rounded-2xl bg-white dark:bg-stone-850 border border-stone-200/80 dark:border-stone-750 shadow-sm flex flex-col gap-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 truncate">
                      {item.name}
                    </h5>
                    <span className="text-[11px] font-mono font-bold text-amber-600 dark:text-amber-400">
                      ₹{parseFloat(String(item.price).replace('₹', '')).toFixed(2)} each
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => cancelCartItem(item.name)}
                    className="text-stone-400 hover:text-rose-500 p-1 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Quantity Stepper & Subtotal Row */}
                <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800">
                  <div className="flex items-center gap-1.5 bg-stone-100 dark:bg-stone-800 p-0.5 rounded-xl">
                    <button
                      type="button"
                      onClick={() => updateCartQty(item.name, -1)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-white dark:bg-stone-700 text-stone-800 dark:text-stone-200 hover:bg-stone-200 active:scale-90 transition-all cursor-pointer font-bold"
                    >
                      <Minus className="w-3 h-3" />
                    </button>

                    <input
                      type="number"
                      min="0"
                      value={item.quantity === 0 ? '' : item.quantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val)) updateCartQtyExact(item.name, val);
                        else if (e.target.value === '') updateCartQtyExact(item.name, 0);
                      }}
                      className="w-8 text-center text-xs font-mono font-extrabold bg-transparent text-stone-900 dark:text-stone-100 focus:outline-none"
                    />

                    <button
                      type="button"
                      onClick={() => updateCartQty(item.name, 1)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-amber-500 text-stone-950 hover:bg-amber-600 active:scale-90 transition-all cursor-pointer font-bold"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <span className="text-sm font-mono font-extrabold text-stone-900 dark:text-stone-100">
                    ₹{(parseFloat(String(item.price).replace('₹', '')) * item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {cart.length === 0 && !hasSavedOrders && (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-stone-400 dark:text-stone-500">
            <ShoppingBag className="w-12 h-12 mb-3 opacity-30 stroke-1" />
            <h4 className="font-bold text-sm text-stone-600 dark:text-stone-400">Cart is empty</h4>
            <p className="text-xs mt-1">Tap items from the menu to build the order</p>
          </div>
        )}
      </div>

      {/* Cart Summary & Checkout Footer */}
      <div className="p-4 bg-stone-50/80 dark:bg-stone-950/60 border-t border-stone-200/80 dark:border-stone-800 shrink-0 space-y-3">
        {/* Subtotal & Tax Breakdown */}
        <div className="space-y-1.5 text-xs text-stone-600 dark:text-stone-400">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-mono font-semibold text-stone-800 dark:text-stone-200">
              ₹{subtotal.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between">
            <span>
              Tax {appData.settings?.globalTaxName ? `(${appData.settings.globalTaxName})` : ''}
            </span>
            <span className="font-mono font-semibold text-stone-800 dark:text-stone-200">
              ₹{tax.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between text-base font-extrabold text-stone-900 dark:text-stone-100 pt-2 border-t border-stone-200 dark:border-stone-800">
            <span>Total Amount</span>
            <span className="font-mono text-amber-600 dark:text-amber-400">
              ₹{total.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 pt-1">
          {/* Send KOT Order for Table Mode */}
          {posMode === 'table' && selectedTableId && cart.length > 0 && (
            <Button
              variant="outline"
              size="md"
              onClick={saveTableOrder}
              className="w-full font-bold border-amber-500/50 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/30"
            >
              Send KOT to Kitchen
            </Button>
          )}

          {/* Checkout / Pay Button */}
          <Button
            variant="primary"
            size="touch"
            disabled={total === 0}
            onClick={() => {
              if (onCloseMobileDrawer) onCloseMobileDrawer();
              setShowCheckoutModal(true);
            }}
            className="w-full text-base font-extrabold shadow-md shadow-amber-500/20"
          >
            Pay ₹{total.toFixed(2)}
          </Button>
        </div>
      </div>
    </aside>
  );
};
