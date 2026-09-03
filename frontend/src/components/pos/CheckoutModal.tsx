import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { usePOS } from '../../context/POSContext';
import { Modal, Button } from '../ui';
import {
  CreditCard,
  Banknote,
  QrCode,
  Printer,
  Tag,
} from 'lucide-react';
import { cn } from '../../lib/utils';

export const CheckoutModal: React.FC = () => {
  const { posMode } = useApp();
  const {
    showCheckoutModal,
    setShowCheckoutModal,
    selectedTableId,
    setTablePrinted,
    getCartTotals,
    discountType,
    setDiscountType,
    discountValue,
    setDiscountValue,
    paymentType,
    setPaymentType,
    confirmPaymentAndOrder,
  } = usePOS();

  const [tenderCash, setTenderCash] = useState('');

  if (!showCheckoutModal) return null;

  const { subtotal, tax, total: baseTotal } = getCartTotals();
  const dVal = parseFloat(discountValue) || 0;
  let discountAmount = 0;
  if (discountType === 'percent') {
    discountAmount = (baseTotal * dVal) / 100;
  } else {
    discountAmount = dVal;
  }
  const finalTotal = Math.max(0, baseTotal - discountAmount);

  const tenderedAmount = parseFloat(tenderCash) || 0;
  const changeDue = Math.max(0, tenderedAmount - finalTotal);

  return (
    <Modal
      isOpen={showCheckoutModal}
      onClose={() => setShowCheckoutModal(false)}
      title="Settlement & Payment"
      description="Select settlement method and apply discounts"
      maxWidth="2xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 py-1">
        {/* Left Column: Bill Breakdown */}
        <div className="md:col-span-6 space-y-4 border-b md:border-b-0 md:border-r border-stone-200/80 dark:border-stone-800 pb-4 md:pb-0 md:pr-4">
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/60 dark:border-stone-700/60 space-y-2">
            <div className="flex justify-between text-xs text-stone-500 dark:text-stone-400">
              <span>Subtotal</span>
              <span className="font-mono font-semibold text-stone-800 dark:text-stone-200">
                ₹{subtotal.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between text-xs text-stone-500 dark:text-stone-400">
              <span>Taxes & Charges</span>
              <span className="font-mono font-semibold text-stone-800 dark:text-stone-200">
                ₹{tax.toFixed(2)}
              </span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <span>Discount Applied</span>
                <span className="font-mono">-₹{discountAmount.toFixed(2)}</span>
              </div>
            )}

            <div className="pt-2 border-t border-stone-200 dark:border-stone-700 flex justify-between items-baseline">
              <span className="text-sm font-extrabold text-stone-900 dark:text-stone-100">
                Final Total
              </span>
              <span className="text-xl font-extrabold text-amber-600 dark:text-amber-400 font-mono">
                ₹{finalTotal.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Discount Section */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-amber-500" />
              <span>Discount / Promo</span>
            </label>

            <div className="flex items-center gap-2">
              <div className="flex p-1 bg-stone-100 dark:bg-stone-800 rounded-xl shrink-0">
                <button
                  type="button"
                  onClick={() => setDiscountType('fixed')}
                  className={cn(
                    'px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer',
                    discountType === 'fixed'
                      ? 'bg-white dark:bg-stone-900 shadow-sm text-stone-900 dark:text-stone-100'
                      : 'text-stone-500'
                  )}
                >
                  ₹ Fixed
                </button>
                <button
                  type="button"
                  onClick={() => setDiscountType('percent')}
                  className={cn(
                    'px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer',
                    discountType === 'percent'
                      ? 'bg-white dark:bg-stone-900 shadow-sm text-stone-900 dark:text-stone-100'
                      : 'text-stone-500'
                  )}
                >
                  % Off
                </button>
              </div>

              <input
                type="number"
                min="0"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder="Discount value"
                className="flex-1 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl px-3 py-2 text-xs font-mono focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Print Action */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              window.print();
              if (posMode === 'table' && selectedTableId) {
                setTablePrinted((prev) => ({ ...prev, [selectedTableId]: true }));
              }
            }}
            leftIcon={<Printer className="w-4 h-4" />}
            className="w-full font-bold"
          >
            Print Thermal Receipt
          </Button>
        </div>

        {/* Right Column: Payment Method Selection */}
        <div className="md:col-span-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider block mb-2">
              Payment Method
            </label>

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'Cash', label: 'Cash', icon: Banknote },
                { id: 'UPI', label: 'UPI / QR', icon: QrCode },
                { id: 'Card', label: 'Card / POS', icon: CreditCard },
              ].map((m) => {
                const isSelected = paymentType === m.id;
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentType(m.id)}
                    className={cn(
                      'p-3 rounded-2xl border transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer active:scale-95',
                      isSelected
                        ? 'bg-amber-500 text-stone-950 border-amber-600 shadow-md shadow-amber-500/20 font-bold'
                        : 'bg-stone-50 dark:bg-stone-850 border-stone-200 dark:border-stone-750 text-stone-700 dark:text-stone-300 hover:bg-stone-100'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cash Tender Calculation (If Cash Selected) */}
          {paymentType === 'Cash' && (
            <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/80 dark:border-stone-700/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-700 dark:text-stone-300">
                  Cash Tendered (₹)
                </span>
                <span className="text-xs text-stone-500">Change: <strong className="text-emerald-600 font-mono">₹{changeDue.toFixed(2)}</strong></span>
              </div>

              <input
                type="number"
                placeholder={finalTotal.toFixed(0)}
                value={tenderCash}
                onChange={(e) => setTenderCash(e.target.value)}
                className="w-full bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl px-3 py-2 text-sm font-mono font-bold focus:border-amber-500 focus:outline-none"
              />

              <div className="flex gap-1.5 pt-1">
                {[50, 100, 200, 500].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setTenderCash(amt.toString())}
                    className="flex-1 py-1 text-[11px] font-bold rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-stone-700 dark:text-stone-300 transition-colors"
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Settle Order Action */}
          <Button
            type="button"
            variant="success"
            size="touch"
            onClick={confirmPaymentAndOrder}
            className="w-full font-extrabold text-base mt-4 shadow-lg shadow-emerald-600/20"
          >
            Confirm & Settle ₹{finalTotal.toFixed(2)}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
