import React from 'react';
import { useApp } from '../../context/AppContext';
import { usePOS } from '../../context/POSContext';
import { Button, Tooltip, Modal, ConfirmModal } from '../ui';
import { cn } from '../../lib/utils';
import type { Table, CartItem } from '../../types/app.types';
import {
  roundPOSAmount,
  getStoreGlobalTaxRate,
  getItemTaxBadge,
  formatTaxLabel,
} from '../../lib/orderUtils';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRightLeft,
  IndianRupee,
  Utensils,
  X,
  Ban,
  AlertTriangle,
  Edit2,
  Check,
  Armchair,
} from 'lucide-react';

export interface POSCartSidebarProps {
  onCloseMobileDrawer?: () => void;
}

interface CartItemQtyInputProps {
  quantity: number;
  itemKey: string;
  onUpdateExact: (key: string, qty: number) => void;
}

const CartItemQtyInput: React.FC<CartItemQtyInputProps> = ({
  quantity,
  itemKey,
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
      onUpdateExact(itemKey, parsed);
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
      aria-label={`Quantity for ${itemKey}`}
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
    cancelKOTItem,
    cancelKOTBatch,
    updateKOTBatch,
    shiftKOTBatch,
    cancelTableOrder,
    saveTableOrder,
    getCartTotals,
    setShowCheckoutModal,
    setShowShiftTableModal,
  } = usePOS();

  const [showCancelModal, setShowCancelModal] = React.useState(false);
  const [cancellationReason, setCancellationReason] = React.useState('Customer Left');
  const [customReasonNote, setCustomReasonNote] = React.useState('');
  const [isCancelling, setIsCancelling] = React.useState(false);

  const [editingKOTBatch, setEditingKOTBatch] = React.useState<{
    orderIdx: number;
    items: CartItem[];
    note?: string;
  } | null>(null);

  const [shiftingKOTBatch, setShiftingKOTBatch] = React.useState<{
    orderIdx: number;
    order: any;
  } | null>(null);

  const [cancellingKOTBatchIdx, setCancellingKOTBatchIdx] = React.useState<number | null>(null);

  const CANCELLATION_REASONS = [
    'Customer Left',
    'Order Placed by Mistake',
    'Change of Mind',
    'Duplicate Order',
    'Table Swapped / Merged',
    'Other',
  ];

  const targetTablesByArea = React.useMemo(() => {
    if (!shiftingKOTBatch || !selectedTableId) return {};
    const otherTables = (appData.tables || []).filter(
      (t: Table) => String(t.id) !== selectedTableId
    );
    const areas = appData.areas || [];
    return otherTables.reduce((acc: any, table: Table) => {
      const area = areas.find((a: any) => a.id === table.areaId) || { name: 'Main Area' };
      if (!acc[area.name]) acc[area.name] = [];
      acc[area.name].push(table);
      return acc;
    }, {});
  }, [shiftingKOTBatch, selectedTableId, appData.tables, appData.areas]);

  const { subtotal, tax, total } = getCartTotals();
  const roundedTotal = roundPOSAmount(total);
  const storeGlobalTaxRate = getStoreGlobalTaxRate(appData.settings);
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
      <div className="px-3.5 py-2 sm:px-4 sm:py-2.5 border-b border-stone-200/80 dark:border-stone-800 flex items-center justify-between gap-2 shrink-0 bg-stone-50/50 dark:bg-stone-900/50">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <IndianRupee className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-extrabold text-stone-900 dark:text-stone-100 truncate" style={{ marginBottom: '-8px' }}>
              {posMode === 'table' && selectedTable
                ? `${selectedTable.name} Ticket`
                : 'Current Ticket'}
            </h3>
            <span className="text-[10px] sm:text-[11px] text-stone-400 font-medium">
              {cart.reduce((s, c) => s + c.quantity, 0)} items in bill
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {posMode === 'table' && selectedTableId && (
            <Tooltip content="Shift / Transfer Order to Another Table" position="bottom" align="end">
              <button
                type="button"
                onClick={() => setShowShiftTableModal(true)}
                className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-all cursor-pointer"
                title="Shift Table"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
              </button>
            </Tooltip>
          )}

          <Tooltip content="Clear All Items" position="bottom" align="end">
            <button
              type="button"
              disabled={cart.length === 0 && !hasSavedOrders}
              onClick={handleClearCart}
              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
              title="Clear All Items"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </Tooltip>

          {onCloseMobileDrawer && (
            <button
              type="button"
              onClick={onCloseMobileDrawer}
              className="lg:hidden p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              title="Close Drawer"
              aria-label="Close cart drawer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Bill Table Column Headers (Item Name | Quantity | Price | Actions) */}
      {(cart.length > 0 || hasSavedOrders) && (
        <div className="flex items-center gap-2 px-3 sm:px-4 py-1.5 text-[10px] font-black uppercase tracking-wider text-stone-400 dark:text-stone-500 border-b border-stone-200/80 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-900/80 shrink-0 select-none">
          <span className="flex-1 min-w-0">Item Name</span>
          <span className="w-24 sm:w-26 text-center shrink-0">Quantity</span>
          <span className="w-20 sm:w-24 text-right shrink-0">Price</span>
          <span className="w-16 text-right shrink-0">Action</span>
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
              <div className="flex items-center justify-between gap-1 text-xs font-bold pb-1.5 border-b border-stone-200/60 dark:border-stone-700/60">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className="w-5 h-5 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <Utensils className="w-3 h-3" />
                  </div>
                  <span className="font-black text-stone-800 dark:text-stone-200 text-xs">
                    KOT #{orderIdx + 1}
                  </span>
                  {order.time && (
                    <span className="text-[10px] font-mono text-stone-400 shrink-0">
                      {new Date(order.time).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  )}
                </div>

                {/* Quick Batch Actions: Edit, Shift, Cancel Batch */}
                <div className="flex items-center gap-1 shrink-0">
                  <Tooltip content="Edit items & quantities in this KOT" position="bottom" align="end">
                    <button
                      type="button"
                      onClick={() => {
                        const raw = order.items || (Array.isArray(order) ? order : []);
                        setEditingKOTBatch({
                          orderIdx,
                          items: raw.map((it: any) => ({ ...it })),
                          note: order.note || '',
                        });
                      }}
                      className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-white dark:bg-stone-700 text-amber-600 dark:text-amber-400 border border-stone-200 dark:border-stone-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:border-amber-400 transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                  </Tooltip>

                  <Tooltip content="Shift this KOT to another table" position="bottom" align="end">
                    <button
                      type="button"
                      onClick={() => setShiftingKOTBatch({ orderIdx, order })}
                      className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-white dark:bg-stone-700 text-sky-600 dark:text-sky-400 border border-stone-200 dark:border-stone-600 hover:bg-sky-50 dark:hover:bg-sky-950/40 hover:border-sky-400 transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                    >
                      <ArrowRightLeft className="w-3 h-3" />
                      <span>Shift</span>
                    </button>
                  </Tooltip>

                  <Tooltip content="Cancel entire KOT batch" position="bottom" align="end">
                    <button
                      type="button"
                      onClick={() => setCancellingKOTBatchIdx(orderIdx)}
                      className="p-1 rounded-md text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      aria-label="Cancel KOT batch"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </Tooltip>
                </div>
              </div>

              <div className="space-y-1">
                {(order.items || (Array.isArray(order) ? order : [])).map((item: any, i: number) => {
                  const unitPrice = parseFloat(String(item.price).replace('₹', '')) || 0;
                  const itemTotal = unitPrice * item.quantity;
                  const taxBadge = getItemTaxBadge(item, appData.menu, storeGlobalTaxRate);
                  return (
                    <div key={i} className="flex items-start gap-2 py-1.5 px-1 text-xs border-b border-stone-100 dark:border-stone-800/50 last:border-0">
                      <div className="flex-1 min-w-0 pr-1">
                        <span className="font-semibold text-stone-800 dark:text-stone-200 truncate block">
                          {item.name}
                        </span>

                        {/* Sub-item Addons Display */}
                        {item.selectedAddons && item.selectedAddons.length > 0 && (
                          <div className="mt-1 pl-2 border-l-2 border-amber-400/50 dark:border-amber-600/50 space-y-0.5">
                            {item.selectedAddons.map((addon: any, aIdx: number) => (
                              <div
                                key={aIdx}
                                className="text-[11px] text-stone-600 dark:text-stone-300 flex items-center justify-between gap-1"
                              >
                                <span className="truncate">+ {addon.name}</span>
                                <span className="font-mono text-stone-400 dark:text-stone-500 shrink-0 text-[10px]">
                                  {(addon.quantity || 1) > 1 ? `${addon.quantity} × ` : ''}₹{(Number(addon.price) || 0).toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                          <span className="text-[10px] font-mono text-stone-400">
                            ₹{unitPrice.toFixed(2)} each
                          </span>
                          {taxBadge && (
                            <span
                              className={cn(
                                'text-[9px] font-semibold px-1.5 py-0.2 rounded leading-tight border',
                                taxBadge.variant === 'exempt' &&
                                'text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 border-stone-200/80 dark:border-stone-700',
                                taxBadge.variant === 'applicable' &&
                                'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border-amber-200/80 dark:border-amber-800/60',
                                taxBadge.variant === 'custom' &&
                                'text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/40 border-sky-200/80 dark:border-sky-800/60'
                              )}
                            >
                              {taxBadge.text}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="w-24 sm:w-26 flex items-center justify-center shrink-0 pt-0.5">
                        <span className="px-2 py-0.5 rounded-md bg-stone-200/70 dark:bg-stone-700 text-stone-800 dark:text-stone-200 font-mono font-bold text-xs">
                          Qty: {item.quantity}
                        </span>
                      </div>

                      <div className="w-20 sm:w-24 text-right shrink-0 pt-0.5">
                        <span className="font-mono font-bold text-stone-700 dark:text-stone-300">
                          ₹{itemTotal.toFixed(2)}
                        </span>
                      </div>

                      <div className="w-16 flex items-center justify-end gap-1 shrink-0 pt-0.5">
                        <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded">
                          KOT
                        </span>
                        <Tooltip content="Cancel item from kitchen KOT" position="left">
                          <button
                            type="button"
                            onClick={() => cancelKOTItem(selectedTableId!, orderIdx, i)}
                            className="w-5 h-5 flex items-center justify-center text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 rounded hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                            title="Cancel item"
                            aria-label={`Cancel ${item.name} from KOT`}
                          >
                            <X className="w-3.5 h-3.5 stroke-[2.5]" />
                          </button>
                        </Tooltip>
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
              const taxBadge = getItemTaxBadge(item, appData.menu, storeGlobalTaxRate);
              const itemIdentifier = item.cartKey || item.name;

              return (
                <div
                  key={item.cartKey || `${item.id || item.name}-${i}`}
                  className="flex items-start gap-2 py-2 px-2.5 sm:px-3 rounded-xl bg-white dark:bg-stone-850 hover:bg-stone-50 dark:hover:bg-stone-800/80 border border-stone-200/80 dark:border-stone-750 shadow-2xs transition-all group"
                >
                  {/* 1. Item Name Column */}
                  <div className="flex-1 min-w-0 pr-1">
                    <h5
                      className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 truncate leading-tight"
                      title={item.name}
                    >
                      {item.name}
                    </h5>

                    {/* Sub-item Addons Display */}
                    {item.selectedAddons && item.selectedAddons.length > 0 && (
                      <div className="mt-1 pl-2 border-l-2 border-amber-400/50 dark:border-amber-600/50 space-y-0.5">
                        {item.selectedAddons.map((addon: any, aIdx: number) => (
                          <div
                            key={aIdx}
                            className="text-[11px] text-stone-600 dark:text-stone-300 flex items-center justify-between gap-1"
                          >
                            <span className="truncate">+ {addon.name}</span>
                            <span className="font-mono text-stone-400 dark:text-stone-500 shrink-0 text-[10px]">
                              {(addon.quantity || 1) > 1 ? `${addon.quantity} × ` : ''}₹{(Number(addon.price) || 0).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                      <span className="text-[10px] font-mono text-stone-400 dark:text-stone-500">
                        ₹{unitPrice.toFixed(2)} each
                      </span>
                      {taxBadge && (
                        <span
                          className={cn(
                            'text-[9px] font-semibold px-1.5 py-0.2 rounded leading-tight border',
                            taxBadge.variant === 'exempt' &&
                            'text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 border-stone-200/80 dark:border-stone-700',
                            taxBadge.variant === 'applicable' &&
                            'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border-amber-200/80 dark:border-amber-800/60',
                            taxBadge.variant === 'custom' &&
                            'text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/40 border-sky-200/80 dark:border-sky-800/60'
                          )}
                        >
                          {taxBadge.text}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 2. Quantity Column (Compact Stepper) */}
                  <div className="w-24 sm:w-26 flex items-center justify-center gap-1 shrink-0 bg-stone-100/90 dark:bg-stone-800/90 p-0.5 rounded-lg border border-stone-200/60 dark:border-stone-700/60 pt-0.5">
                    <button
                      type="button"
                      onClick={() => updateCartQty(itemIdentifier, -1)}
                      className="w-6 h-6 flex items-center justify-center rounded bg-white dark:bg-stone-700 text-stone-700 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-600 active:scale-90 transition-all cursor-pointer font-bold shadow-2xs"
                      title="Decrease quantity by 1"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3 h-3 stroke-[2.5]" />
                    </button>

                    <CartItemQtyInput
                      quantity={item.quantity}
                      itemKey={itemIdentifier}
                      onUpdateExact={updateCartQtyExact}
                    />

                    <button
                      type="button"
                      onClick={() => updateCartQty(itemIdentifier, 1)}
                      className="w-6 h-6 flex items-center justify-center rounded bg-amber-500 hover:bg-amber-600 text-stone-950 active:scale-90 transition-all cursor-pointer font-bold shadow-2xs"
                      title="Increase quantity by 1"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3 h-3 stroke-[2.5]" />
                    </button>
                  </div>

                  {/* 3. Price Column */}
                  <div className="w-20 sm:w-24 text-right shrink-0 pt-0.5">
                    <span className="font-mono font-black text-xs sm:text-sm text-amber-600 dark:text-amber-400">
                      ₹{itemTotal.toFixed(2)}
                    </span>
                  </div>

                  {/* 4. Actions Column */}
                  <div className="w-16 flex items-center justify-end shrink-0 pt-0.5">
                    <button
                      type="button"
                      onClick={() => cancelCartItem(itemIdentifier)}
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
              {formatTaxLabel(appData.settings, storeGlobalTaxRate, tax)}
              {appData.settings?.taxCalculationType === 'reverse' && (
                <span className="ml-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  (Incl.)
                </span>
              )}
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
          {/* Table Mode Action Row: Cancel Order and/or Send KOT */}
          {posMode === 'table' && selectedTableId && (
            <>
              {cart.length > 0 ? (
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    leftIcon={<Ban className="w-4 h-4 text-rose-500 shrink-0" />}
                    onClick={() => setShowCancelModal(true)}
                    className="flex-1 font-bold border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 whitespace-nowrap"
                  >
                    Cancel Order
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="md"
                    leftIcon={<Utensils className="w-4 h-4 shrink-0" />}
                    onClick={saveTableOrder}
                    className="flex-1 font-extrabold shadow-sm shadow-amber-500/20 whitespace-nowrap"
                  >
                    Send KOT ({cart.reduce((s, c) => s + c.quantity, 0)})
                  </Button>
                </div>
              ) : hasSavedOrders ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  leftIcon={<Ban className="w-3.5 h-3.5 text-rose-500 shrink-0" />}
                  onClick={() => setShowCancelModal(true)}
                  className="w-full font-bold border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 whitespace-nowrap py-2 text-xs"
                >
                  Cancel Table Order
                </Button>
              ) : null}
            </>
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

      {/* Cancel Table Order Confirmation Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => !isCancelling && setShowCancelModal(false)}
        title={
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
            <AlertTriangle className="w-5 h-5" />
            <span>Cancel Table Order</span>
          </div>
        }
        description={`Are you sure you want to cancel the order for ${selectedTable?.name || 'this table'}? This will clear all items from the table and record a Cancelled entry in reports.`}
        maxWidth="md"
      >
        <div className="space-y-4 py-2">
          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-2">
              Select Reason for Cancellation
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CANCELLATION_REASONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setCancellationReason(r)}
                  className={cn(
                    'px-3 py-2 text-xs font-bold rounded-xl border text-left transition-all cursor-pointer',
                    cancellationReason === r
                      ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-700 dark:text-rose-300 ring-1 ring-rose-500'
                      : 'bg-stone-50 dark:bg-stone-850 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-stone-400'
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
              Additional Notes (Optional)
            </label>
            <input
              type="text"
              value={customReasonNote}
              onChange={(e) => setCustomReasonNote(e.target.value)}
              placeholder="e.g. Guest had an urgent call, wrong item ordered..."
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="ghost"
              size="md"
              disabled={isCancelling}
              onClick={() => setShowCancelModal(false)}
              className="flex-1"
            >
              Go Back
            </Button>
            <Button
              variant="danger"
              size="md"
              disabled={isCancelling}
              isLoading={isCancelling}
              onClick={async () => {
                if (!selectedTableId) return;
                setIsCancelling(true);
                try {
                  const finalReason = [cancellationReason, customReasonNote.trim()].filter(Boolean).join(' - ');
                  await cancelTableOrder(selectedTableId, finalReason);
                  setShowCancelModal(false);
                  setCustomReasonNote('');
                  setCancellationReason('Customer Left');
                  if (onCloseMobileDrawer) onCloseMobileDrawer();
                } finally {
                  setIsCancelling(false);
                }
              }}
              className="flex-1 font-bold bg-rose-600 hover:bg-rose-700 text-white"
            >
              Confirm Cancel Order
            </Button>
          </div>
        </div>
      </Modal>

      {/* Cancel KOT Batch Direct Confirmation Modal */}
      <ConfirmModal
        isOpen={cancellingKOTBatchIdx !== null}
        onClose={() => setCancellingKOTBatchIdx(null)}
        onConfirm={() => {
          if (cancellingKOTBatchIdx !== null && selectedTableId) {
            cancelKOTBatch(selectedTableId, cancellingKOTBatchIdx);
            setCancellingKOTBatchIdx(null);
          }
        }}
        title={`Cancel KOT Batch #${(cancellingKOTBatchIdx ?? 0) + 1}?`}
        message="Are you sure you want to cancel this entire KOT batch? All items in this batch will be removed from the running ticket and kitchen."
        confirmText="Cancel Batch"
        cancelText="Keep Batch"
        variant="danger"
      />

      {/* Edit KOT Batch Modal */}
      <Modal
        isOpen={editingKOTBatch !== null}
        onClose={() => setEditingKOTBatch(null)}
        title={
          <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100">
            <Edit2 className="w-5 h-5 text-amber-500" />
            <span>Edit KOT Batch #{((editingKOTBatch?.orderIdx ?? 0) + 1)}</span>
            {selectedTable && (
              <span className="text-xs font-mono font-normal text-stone-400">
                ({selectedTable.name})
              </span>
            )}
          </div>
        }
        description="Adjust item quantities or remove items, then send the update to the kitchen."
        maxWidth="lg"
      >
        {editingKOTBatch && (
          <div className="space-y-4 py-1">
            <div className="max-h-72 overflow-y-auto space-y-2 pr-1 divide-y divide-stone-100 dark:divide-stone-800">
              {editingKOTBatch.items.map((item, itIdx) => {
                const unitPrice = parseFloat(String(item.price).replace('₹', '')) || 0;
                const itemTotal = unitPrice * item.quantity;
                return (
                  <div
                    key={itIdx}
                    className="pt-2.5 first:pt-0 flex items-start justify-between gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <h5 className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 truncate">
                        {item.name}
                      </h5>
                      {item.selectedAddons && item.selectedAddons.length > 0 && (
                        <div className="mt-1 pl-2 border-l-2 border-amber-400/50 space-y-0.5">
                          {item.selectedAddons.map((addon: any, aIdx: number) => (
                            <div
                              key={aIdx}
                              className="text-[11px] text-stone-500 dark:text-stone-400 flex items-center justify-between"
                            >
                              <span>+ {addon.name}</span>
                              <span className="font-mono text-[10px]">
                                {(addon.quantity || 1) > 1 ? `${addon.quantity} × ` : ''}₹{(Number(addon.price) || 0).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="text-[11px] font-mono text-stone-400 mt-0.5">
                        ₹{unitPrice.toFixed(2)} each
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 pt-0.5">
                      <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-0.5 rounded-lg border border-stone-200 dark:border-stone-700">
                        <button
                          type="button"
                          onClick={() => {
                            const next = [...editingKOTBatch.items];
                            next[itIdx] = { ...next[itIdx], quantity: Math.max(0, next[itIdx].quantity - 1) };
                            setEditingKOTBatch({ ...editingKOTBatch, items: next });
                          }}
                          className="w-6 h-6 flex items-center justify-center rounded bg-white dark:bg-stone-700 text-stone-700 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-600 active:scale-90 font-bold transition-all cursor-pointer shadow-2xs"
                        >
                          <Minus className="w-3 h-3 stroke-[2.5]" />
                        </button>
                        <span className="w-8 text-center text-xs font-mono font-black text-stone-800 dark:text-stone-200">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const next = [...editingKOTBatch.items];
                            next[itIdx] = { ...next[itIdx], quantity: next[itIdx].quantity + 1 };
                            setEditingKOTBatch({ ...editingKOTBatch, items: next });
                          }}
                          className="w-6 h-6 flex items-center justify-center rounded bg-amber-500 hover:bg-amber-600 text-stone-950 active:scale-90 font-bold transition-all cursor-pointer shadow-2xs"
                        >
                          <Plus className="w-3 h-3 stroke-[2.5]" />
                        </button>
                      </div>

                      <span className="w-16 text-right font-mono font-bold text-xs text-stone-800 dark:text-stone-200">
                        ₹{itemTotal.toFixed(2)}
                      </span>

                      <button
                        type="button"
                        onClick={() => {
                          const next = editingKOTBatch.items.filter((_, idx) => idx !== itIdx);
                          setEditingKOTBatch({ ...editingKOTBatch, items: next });
                        }}
                        className="w-7 h-7 flex items-center justify-center text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                Kitchen Update Note (Optional)
              </label>
              <input
                type="text"
                value={editingKOTBatch.note || ''}
                onChange={(e) =>
                  setEditingKOTBatch({ ...editingKOTBatch, note: e.target.value })
                }
                placeholder="e.g. Customer modified order, less spicy, make 1 parcel..."
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>

            <div className="flex gap-2 pt-2 border-t border-stone-200 dark:border-stone-800">
              <Button
                variant="ghost"
                size="md"
                onClick={() => setEditingKOTBatch(null)}
                className="flex-1"
              >
                Discard
              </Button>
              <Button
                variant="primary"
                size="md"
                leftIcon={<Check className="w-4 h-4 shrink-0" />}
                onClick={() => {
                  if (!selectedTableId) return;
                  updateKOTBatch(
                    selectedTableId,
                    editingKOTBatch.orderIdx,
                    editingKOTBatch.items,
                    editingKOTBatch.note
                  );
                  setEditingKOTBatch(null);
                }}
                className="flex-1 font-bold shadow-md shadow-amber-500/20"
              >
                Update & Notify Kitchen
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Shift KOT Batch to Another Table Modal */}
      <Modal
        isOpen={shiftingKOTBatch !== null}
        onClose={() => setShiftingKOTBatch(null)}
        title={
          <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100">
            <ArrowRightLeft className="w-5 h-5 text-sky-500" />
            <span>Shift KOT Batch #{((shiftingKOTBatch?.orderIdx ?? 0) + 1)}</span>
          </div>
        }
        description={`Select a destination table to transfer this KOT batch from ${selectedTable?.name || 'Table'}.`}
        maxWidth="lg"
      >
        {shiftingKOTBatch && (
          <div className="space-y-4 py-1">
            {/* Batch Info Banner */}
            {(() => {
              const raw =
                shiftingKOTBatch.order.items ||
                (Array.isArray(shiftingKOTBatch.order) ? shiftingKOTBatch.order : []);
              const count = raw.reduce((s: number, it: any) => s + (it.quantity || 1), 0);
              const bTotal = raw.reduce((s: number, it: any) => {
                const p = parseFloat(String(it.price).replace('₹', '')) || 0;
                return s + p * (it.quantity || 1);
              }, 0);
              return (
                <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Utensils className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span className="font-bold text-stone-800 dark:text-stone-200">
                      {count} item{count > 1 ? 's' : ''} in Batch #{shiftingKOTBatch.orderIdx + 1}
                    </span>
                  </div>
                  <span className="font-mono font-black text-amber-700 dark:text-amber-300">
                    ₹{bTotal.toFixed(2)}
                  </span>
                </div>
              );
            })()}

            {Object.keys(targetTablesByArea).length === 0 ? (
              <div className="p-6 text-center text-xs text-stone-400">
                No other tables found to transfer this KOT batch to.
              </div>
            ) : (
              <div className="max-h-72 overflow-y-auto space-y-3 pr-1">
                {Object.entries(targetTablesByArea).map(([areaName, tbls]: [string, any]) => (
                  <div key={areaName}>
                    <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400 mb-1.5">
                      {areaName}
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {tbls.map((t: Table) => {
                        const hasExisting = Boolean(
                          tableOrders[t.id]?.savedOrders?.length > 0 ||
                          tableOrders[t.id]?.activeCart?.length > 0
                        );
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => {
                              if (!selectedTableId) return;
                              shiftKOTBatch(selectedTableId, shiftingKOTBatch.orderIdx, t.id);
                              setShiftingKOTBatch(null);
                            }}
                            className="p-3 rounded-xl border border-stone-200 dark:border-stone-750 bg-white dark:bg-stone-850 hover:border-amber-500 dark:hover:border-amber-500 hover:bg-amber-50/50 dark:hover:bg-amber-950/20 text-left transition-all group cursor-pointer shadow-2xs flex flex-col justify-between gap-2"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-stone-900 dark:text-stone-100 group-hover:text-amber-600 dark:group-hover:text-amber-400">
                                {t.name}
                              </span>
                              <Armchair className="w-3.5 h-3.5 text-stone-400 group-hover:text-amber-500" />
                            </div>
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="text-stone-400">
                                {t.seats ? `${t.seats} Seats` : 'Table'}
                              </span>
                              <span
                                className={cn(
                                  'px-1.5 py-0.5 rounded font-bold text-[9px]',
                                  hasExisting
                                    ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                                    : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                                )}
                              >
                                {hasExisting ? 'Merge KOT' : 'Available'}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-stone-200 dark:border-stone-800">
              <Button
                variant="ghost"
                size="md"
                onClick={() => setShiftingKOTBatch(null)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </aside>
  );
};
