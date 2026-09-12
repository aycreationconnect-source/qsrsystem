import React from 'react';
import { useApp } from '../../context/AppContext';
import { usePOS } from '../../context/POSContext';
import { Button, Tooltip } from '../ui';
import { roundPOSAmount } from '../../lib/orderUtils';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRightLeft,
  IndianRupee,
  Utensils,
  X,
} from 'lucide-react';

export interface POSCartSidebarProps {
  onCloseMobileDrawer?: () => void;
}

interface CartItemQtyInputProps {
  quantity: number;
  itemName: string;
  onUpdateExact: (name: string, qty: number) => void;
}

const CartItemQtyInput: React.FC<CartItemQtyInputProps> = ({
  quantity,
  itemName,
  onUpdateExact,
}) => {
  const [localVal, setLocalVal] = React.useState(String(quantity));
  const [isEditing, setIsEditing] = React.useState(false);

  React.useEffect(() => {
    if (!isEditing) {
      setLocalVal(String(quantity));
    }
  }, [quantity, isEditing]);

  const commit = (newValStr: string) => {
    setIsEditing(false);
    const parsed = parseInt(newValStr, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      onUpdateExact(itemName, parsed);
    } else {
      setLocalVal(String(quantity));
    }
  };

  return (
    <input
      type="number"
      min="0"
      max="999"
      value={localVal}
      onFocus={(e) => {
        setIsEditing(true);
        e.target.select();
      }}
      onChange={(e) => setLocalVal(e.target.value)}
      onBlur={(e) => commit(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          commit(localVal);
          e.currentTarget.blur();
        } else if (e.key === 'Escape') {
          setIsEditing(false);
          setLocalVal(String(quantity));
          e.currentTarget.blur();
        }
      }}
      className="w-10 h-6 text-center text-xs font-mono font-black bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 rounded-md border border-stone-300 dark:border-stone-600 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/25 focus:outline-none transition-all shadow-2xs cursor-text [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none no-spinner"
      title="Click or type custom quantity (Enter to set)"
      aria-label={`Quantity for ${itemName}`}
    />
  );
};

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
  const roundedTotal = roundPOSAmount(total);
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
      <div className="p-3.5 sm:p-4 border-b border-stone-200/80 dark:border-stone-800 flex items-center justify-between gap-2 shrink-0 bg-stone-50/50 dark:bg-stone-900/50">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <IndianRupee className="w-4 h-4" />
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
            <Tooltip content="Shift / Transfer Order to Another Table" position="bottom" align="end">
              <button
                type="button"
                onClick={() => setShowShiftTableModal(true)}
                className="p-2 rounded-xl text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-all cursor-pointer"
                title="Shift Table"
              >
                <ArrowRightLeft className="w-4 h-4" />
              </button>
            </Tooltip>
          )}

          <Tooltip content="Clear All Items" position="bottom" align="end">
            <button
              type="button"
              disabled={cart.length === 0 && !hasSavedOrders}
              onClick={handleClearCart}
              className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
              title="Clear All Items"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </Tooltip>

          {onCloseMobileDrawer && (
            <button
              type="button"
              onClick={onCloseMobileDrawer}
              className="lg:hidden p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              title="Close Drawer"
              aria-label="Close cart drawer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Bill Table Column Headers (Item Name | Quantity | Price | Actions) */}
      {(cart.length > 0 || hasSavedOrders) && (
        <div className="flex items-center gap-2 px-3 sm:px-4 py-2 text-[10px] font-black uppercase tracking-wider text-stone-400 dark:text-stone-500 border-b border-stone-200/80 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-900/80 shrink-0 select-none">
          <span className="flex-1 min-w-0">Item Name</span>
          <span className="w-24 sm:w-26 text-center shrink-0">Quantity</span>
          <span className="w-20 sm:w-24 text-right shrink-0">Price</span>
          <span className="w-8 text-right shrink-0">Action</span>
        </div>
      )}

      {/* Cart Items List Area */}
      <div className="flex-1 overflow-y-auto p-2.5 sm:p-3 space-y-1.5">
        {/* Saved Table Orders (KOT sent to kitchen) */}
        {hasSavedOrders &&
          tableOrders[selectedTableId]?.savedOrders.map((order, orderIdx) => (
            <div
              key={orderIdx}
              className="p-2.5 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/60 dark:border-stone-700/60 space-y-1.5"
            >
              <div className="flex items-center justify-between text-xs font-bold text-stone-500 dark:text-stone-400 pb-1.5 border-b border-stone-200/60 dark:border-stone-700/60">
                <span className="flex items-center gap-1.5">
                  <Utensils className="w-3.5 h-3.5 text-amber-500" />
                  <span>KOT Batch #{orderIdx + 1}</span>
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

              <div className="space-y-1">
                {(order.items || (Array.isArray(order) ? order : [])).map((item: any, i: number) => {
                  const unitPrice = parseFloat(String(item.price).replace('₹', '')) || 0;
                  const itemTotal = unitPrice * item.quantity;
                  return (
                    <div key={i} className="flex items-center gap-2 py-1 px-1 text-xs">
                      <div className="flex-1 min-w-0 pr-1">
                        <span className="font-semibold text-stone-800 dark:text-stone-200 truncate block">
                          {item.name}
                        </span>
                        <span className="text-[10px] font-mono text-stone-400">
                          ₹{unitPrice.toFixed(2)} each
                        </span>
                      </div>

                      <div className="w-24 sm:w-26 flex items-center justify-center shrink-0">
                        <span className="px-2 py-0.5 rounded-md bg-stone-200/70 dark:bg-stone-700 text-stone-800 dark:text-stone-200 font-mono font-bold text-xs">
                          Qty: {item.quantity}
                        </span>
                      </div>

                      <div className="w-20 sm:w-24 text-right shrink-0">
                        <span className="font-mono font-bold text-stone-700 dark:text-stone-300">
                          ₹{itemTotal.toFixed(2)}
                        </span>
                      </div>

                      <div className="w-8 flex items-center justify-end shrink-0">
                        <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded">
                          KOT
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

        {/* Current Active Order */}
        {cart.length > 0 && (
          <div className="space-y-1.5">
            {hasSavedOrders && (
              <div className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-wider px-1 pt-1">
                New Items to Add
              </div>
            )}

            {cart.map((item, i) => {
              const unitPrice = parseFloat(String(item.price).replace('₹', '')) || 0;
              const itemTotal = unitPrice * item.quantity;

              return (
                <div
                  key={i}
                  className="flex items-center gap-2 py-2 px-2.5 sm:px-3 rounded-xl bg-white dark:bg-stone-850 hover:bg-stone-50 dark:hover:bg-stone-800/80 border border-stone-200/80 dark:border-stone-750 shadow-2xs transition-all group"
                >
                  {/* 1. Item Name Column */}
                  <div className="flex-1 min-w-0 pr-1">
                    <h5
                      className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 truncate leading-tight"
                      title={item.name}
                    >
                      {item.name}
                    </h5>
                    <span className="text-[10px] font-mono text-stone-400 dark:text-stone-500">
                      ₹{unitPrice.toFixed(2)} each
                    </span>
                  </div>

                  {/* 2. Quantity Column (Compact Stepper) */}
                  <div className="w-24 sm:w-26 flex items-center justify-center gap-1 shrink-0 bg-stone-100/90 dark:bg-stone-800/90 p-0.5 rounded-lg border border-stone-200/60 dark:border-stone-700/60">
                    <button
                      type="button"
                      onClick={() => updateCartQty(item.name, -1)}
                      className="w-6 h-6 flex items-center justify-center rounded bg-white dark:bg-stone-700 text-stone-700 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-600 active:scale-90 transition-all cursor-pointer font-bold shadow-2xs"
                      title="Decrease quantity by 1"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3 h-3 stroke-[2.5]" />
                    </button>

                    <CartItemQtyInput
                      quantity={item.quantity}
                      itemName={item.name}
                      onUpdateExact={updateCartQtyExact}
                    />

                    <button
                      type="button"
                      onClick={() => updateCartQty(item.name, 1)}
                      className="w-6 h-6 flex items-center justify-center rounded bg-amber-500 hover:bg-amber-600 text-stone-950 active:scale-90 transition-all cursor-pointer font-bold shadow-2xs"
                      title="Increase quantity by 1"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3 h-3 stroke-[2.5]" />
                    </button>
                  </div>

                  {/* 3. Price Column */}
                  <div className="w-20 sm:w-24 text-right shrink-0">
                    <span className="font-mono font-black text-xs sm:text-sm text-amber-600 dark:text-amber-400">
                      ₹{itemTotal.toFixed(2)}
                    </span>
                  </div>

                  {/* 4. Actions Column */}
                  <div className="w-8 flex items-center justify-end shrink-0">
                    <button
                      type="button"
                      onClick={() => cancelCartItem(item.name)}
                      className="w-7 h-7 flex items-center justify-center text-stone-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                      title="Remove item"
                      aria-label={`Remove ${item.name} from ticket`}
                    >
                      <Trash2 className="w-3.5 h-3.5 stroke-[2]" />
                    </button>
                  </div>
                </div>
              );
            })}
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
      <div className="p-4 bg-stone-50/90 dark:bg-stone-950/80 border-t border-stone-200/80 dark:border-stone-800 shrink-0 space-y-3">
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

          <div className="flex justify-between items-start text-base font-extrabold text-stone-900 dark:text-stone-100 pt-2 border-t border-stone-200 dark:border-stone-800">
            <span>Total Amount</span>
            <div className="flex flex-col items-end">
              <span className="font-mono text-amber-600 dark:text-amber-400">
                ₹{roundedTotal}
              </span>
              {roundedTotal !== total && (
                <span className="text-[11px] font-mono font-normal text-stone-400">
                  (₹{total.toFixed(2)})
                </span>
              )}
            </div>
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
            Pay ₹{roundedTotal}
          </Button>
        </div>
      </div>
    </aside>
  );
};
