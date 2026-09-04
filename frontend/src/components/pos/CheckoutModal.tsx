import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { usePOS } from '../../context/POSContext';
import type { OrderPayment } from '../../types/app.types';
import { Modal, Button } from '../ui';
import {
  CreditCard,
  Banknote,
  QrCode,
  Printer,
  Tag,
  Split,
  Plus,
  Trash2,
  CheckCircle2,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { cn } from '../../lib/utils';

export const CheckoutModal: React.FC = () => {
  const { posMode, appData } = useApp();
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
    cart,
    tableOrders,
    tablePayments,
    addTablePayment,
    removeTablePayment,
  } = usePOS();

  // Mode Selection: 'single' (Full Payment) vs 'split' (Partial / Split Installments)
  const [settleTab, setSettleTab] = useState<'single' | 'split'>('single');

  // Single payment cash tendered state
  const [tenderCash, setTenderCash] = useState('');

  // Quick mode split payments staging
  const [quickSplitPayments, setQuickSplitPayments] = useState<OrderPayment[]>([]);

  // Split installment form states
  const [installmentAmount, setInstallmentAmount] = useState('');
  const [installmentMethod, setInstallmentMethod] = useState<'Cash' | 'UPI' | 'Card'>('Cash');
  const [installmentRef, setInstallmentRef] = useState('');

  // Extract cart items including saved table items
  let combinedItems: any[] = [...cart];
  if (posMode === 'table' && selectedTableId && tableOrders[selectedTableId]) {
    const tableData = tableOrders[selectedTableId];
    if (tableData.savedOrders && Array.isArray(tableData.savedOrders)) {
      tableData.savedOrders.forEach((so: any) => {
        if (so && Array.isArray(so.items)) {
          combinedItems = [...combinedItems, ...so.items];
        } else if (Array.isArray(so)) {
          combinedItems = [...combinedItems, ...so];
        }
      });
    }
  }

  // Calculate bill totals
  const { subtotal, tax, total: baseTotal } = getCartTotals();
  const dVal = parseFloat(discountValue) || 0;
  let discountAmount = 0;
  if (discountType === 'percent') {
    discountAmount = (baseTotal * dVal) / 100;
  } else {
    discountAmount = dVal;
  }
  const finalTotal = Math.max(0, baseTotal - discountAmount);

  // Active payments for current session
  const tableKey = selectedTableId ? String(selectedTableId) : '';
  const currentPayments: OrderPayment[] =
    posMode === 'table' && selectedTableId
      ? tablePayments[tableKey] || tablePayments[selectedTableId] || []
      : quickSplitPayments;

  const currentPaid = currentPayments.reduce(
    (sum, p) => sum + (parseFloat(String(p.amount ?? '').replace(/[^0-9.]/g, '')) || 0),
    0
  );
  const currentRemaining = Math.max(0, parseFloat((finalTotal - currentPaid).toFixed(2)));

  // Cash tender change calculation (for single payment tab)
  const tenderedAmount = parseFloat(tenderCash) || 0;
  const changeDue = Math.max(0, tenderedAmount - finalTotal);

  // When modal opens, auto-switch to split tab if table has recorded advance/payments
  useEffect(() => {
    if (showCheckoutModal) {
      if (currentPayments.length > 0) {
        setSettleTab('split');
      }
      setInstallmentAmount(currentRemaining > 0 ? currentRemaining.toFixed(2) : '');
      setInstallmentRef('');
    }
  }, [showCheckoutModal]);

  // Update prefilled installment amount when remaining changes
  useEffect(() => {
    if (currentRemaining > 0 && (!installmentAmount || parseFloat(installmentAmount) <= 0)) {
      setInstallmentAmount(currentRemaining.toFixed(2));
    }
  }, [currentRemaining]);

  if (!showCheckoutModal) return null;

  // Handler: Add Installment Payment
  const handleAddInstallment = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanAmt = String(installmentAmount).replace(/[^0-9.]/g, '');
    const amt = parseFloat(cleanAmt) || 0;
    if (amt <= 0) return;

    if (amt > currentRemaining + 0.05) {
      alert(`Installment amount (₹${amt.toFixed(2)}) cannot exceed remaining balance (₹${currentRemaining.toFixed(2)})`);
      return;
    }

    const newPayment: OrderPayment = {
      amount: amt,
      paymentMethod: installmentMethod,
      reference: installmentRef.trim() || undefined,
      date: new Date().toISOString(),
    };

    if (posMode === 'table' && selectedTableId) {
      addTablePayment(selectedTableId, newPayment);
    } else {
      setQuickSplitPayments((prev) => [...prev, newPayment]);
    }

    const nextRemaining = Math.max(0, parseFloat((currentRemaining - amt).toFixed(2)));
    setInstallmentAmount(nextRemaining > 0 ? nextRemaining.toFixed(2) : '');
    setInstallmentRef('');
  };

  // Handler: Remove Installment Payment
  const handleRemoveInstallment = (index: number) => {
    if (posMode === 'table' && selectedTableId) {
      removeTablePayment(selectedTableId, index);
    } else {
      setQuickSplitPayments((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // Helper: Quick Split Percent Calculator
  const handleQuickPreset = (fraction: number) => {
    if (currentRemaining <= 0) return;
    const splitVal = parseFloat((currentRemaining * fraction).toFixed(2));
    setInstallmentAmount(splitVal.toString());
  };

  const getMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case 'upi':
      case 'qr':
        return <QrCode className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'card':
      case 'pos':
        return <CreditCard className="w-4 h-4 text-sky-600 dark:text-sky-400" />;
      case 'cash':
      default:
        return <Banknote className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
    }
  };

  return (
    <>
      <Modal
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        title="Settlement & Payment"
        description="Select single full checkout or multi-tender partial split"
        maxWidth="2xl"
      >
        <div className="space-y-4 py-1">
          {/* Top Settlement Mode Switcher */}
          <div className="flex p-1 bg-stone-100 dark:bg-stone-800 rounded-2xl">
            <button
              type="button"
              onClick={() => setSettleTab('single')}
              className={cn(
                'flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2',
                settleTab === 'single'
                  ? 'bg-white dark:bg-stone-900 shadow-sm text-stone-950 dark:text-stone-100 font-extrabold'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              )}
            >
              <Banknote className="w-4 h-4" />
              <span>Single Full Payment</span>
            </button>

            <button
              type="button"
              onClick={() => setSettleTab('split')}
              className={cn(
                'flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 relative',
                settleTab === 'split'
                  ? 'bg-white dark:bg-stone-900 shadow-sm text-amber-600 dark:text-amber-400 font-extrabold'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              )}
            >
              <Split className="w-4 h-4" />
              <span>Split / Partial Payment</span>
              {currentPayments.length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-stone-950 font-black">
                  {currentPayments.length}
                </span>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left Column: Bill Breakdown & Live Balances */}
            <div className="md:col-span-5 space-y-4 border-b md:border-b-0 md:border-r border-stone-200/80 dark:border-stone-800 pb-4 md:pb-0 md:pr-4">
              {/* Bill Details Box */}
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/60 dark:border-stone-700/60 space-y-2">
                <div className="flex justify-between text-xs text-stone-500 dark:text-stone-400">
                  <span>Subtotal ({combinedItems.length} items)</span>
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
                  <span className="text-xs font-extrabold text-stone-900 dark:text-stone-100 uppercase tracking-wider">
                    Total Bill
                  </span>
                  <span className="text-lg font-black text-amber-600 dark:text-amber-400 font-mono">
                    ₹{finalTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Real-time Payment & Balance Box (Shown when split tab is active or payments exist) */}
              {(settleTab === 'split' || currentPaid > 0) && (
                <div className="p-3.5 rounded-2xl bg-stone-900 text-stone-100 dark:bg-stone-950 dark:border dark:border-stone-800 space-y-2">
                  <div className="text-[10px] uppercase font-bold text-stone-400 tracking-wider flex items-center justify-between">
                    <span>Settlement Status</span>
                    {currentRemaining <= 0.01 ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Fully Paid
                      </span>
                    ) : (
                      <span className="text-amber-400 font-bold">
                        {posMode === 'table' ? 'Running Deposit' : 'In Progress'}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="p-2 rounded-xl bg-stone-800/80 dark:bg-stone-900">
                      <div className="text-[10px] text-stone-400 font-semibold">Paid So Far</div>
                      <div className="text-sm font-black font-mono text-emerald-400">
                        ₹{currentPaid.toFixed(2)}
                      </div>
                    </div>

                    <div className="p-2 rounded-xl bg-stone-800/80 dark:bg-stone-900">
                      <div className="text-[10px] text-stone-400 font-semibold">Remaining Due</div>
                      <div
                        className={cn(
                          'text-sm font-black font-mono',
                          currentRemaining <= 0.01 ? 'text-stone-500' : 'text-rose-400'
                        )}
                      >
                        ₹{currentRemaining.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

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
                    placeholder="Value"
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

            {/* Right Column: Settlement Workspace */}
            <div className="md:col-span-7 space-y-4">
              {/* TAB 1: SINGLE FULL PAYMENT */}
              {settleTab === 'single' && (
                <div className="space-y-4">
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
                                : 'bg-stone-50 dark:bg-stone-850 border-stone-200 dark:border-stone-750 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
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
                        <span className="text-xs text-stone-500">
                          Change: <strong className="text-emerald-600 font-mono font-bold">₹{changeDue.toFixed(2)}</strong>
                        </span>
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
                    onClick={() => confirmPaymentAndOrder()}
                    className="w-full font-extrabold text-base mt-4 shadow-lg shadow-emerald-600/20"
                  >
                    Confirm & Settle ₹{finalTotal.toFixed(2)}
                  </Button>
                </div>
              )}

              {/* TAB 2: SPLIT / PARTIAL PAYMENT */}
              {settleTab === 'split' && (
                <div className="space-y-4">
                  {/* Quick Share Presets */}
                  {currentRemaining > 0 && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-bold text-stone-500 dark:text-stone-400">
                        <span>Quick Split Presets</span>
                        <span>Due: ₹{currentRemaining.toFixed(2)}</span>
                      </div>

                      <div className="grid grid-cols-4 gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleQuickPreset(1)}
                          className="py-1.5 px-2 rounded-xl text-xs font-bold bg-stone-100 dark:bg-stone-800 hover:bg-amber-100 dark:hover:bg-amber-950 text-stone-700 dark:text-stone-300 transition-colors"
                        >
                          Full Due
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickPreset(0.5)}
                          className="py-1.5 px-2 rounded-xl text-xs font-bold bg-stone-100 dark:bg-stone-800 hover:bg-amber-100 dark:hover:bg-amber-950 text-stone-700 dark:text-stone-300 transition-colors"
                        >
                          50% (2-Way)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickPreset(1 / 3)}
                          className="py-1.5 px-2 rounded-xl text-xs font-bold bg-stone-100 dark:bg-stone-800 hover:bg-amber-100 dark:hover:bg-amber-950 text-stone-700 dark:text-stone-300 transition-colors"
                        >
                          33% (3-Way)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickPreset(0.25)}
                          className="py-1.5 px-2 rounded-xl text-xs font-bold bg-stone-100 dark:bg-stone-800 hover:bg-amber-100 dark:hover:bg-amber-950 text-stone-700 dark:text-stone-300 transition-colors"
                        >
                          25% (4-Way)
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Add Installment Form */}
                  {currentRemaining > 0.01 ? (
                    <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/60 space-y-3">
                      <div className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Plus className="w-3.5 h-3.5 text-amber-600" />
                        <span>Record Installment Payment</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                        {/* Amount */}
                        <div className="sm:col-span-5">
                          <label className="text-[10px] font-bold text-stone-600 dark:text-stone-400 block mb-1">
                            Amount (₹)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="1"
                            max={currentRemaining}
                            value={installmentAmount}
                            onChange={(e) => setInstallmentAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl px-3 py-1.5 text-xs font-mono font-bold focus:border-amber-500 focus:outline-none"
                          />
                        </div>

                        {/* Method */}
                        <div className="sm:col-span-4">
                          <label className="text-[10px] font-bold text-stone-600 dark:text-stone-400 block mb-1">
                            Method
                          </label>
                          <div className="flex bg-white dark:bg-stone-900 p-0.5 rounded-xl border border-stone-300 dark:border-stone-700">
                            {(['Cash', 'UPI', 'Card'] as const).map((m) => (
                              <button
                                key={m}
                                type="button"
                                onClick={() => setInstallmentMethod(m)}
                                className={cn(
                                  'flex-1 py-1 text-[11px] font-bold rounded-lg transition-all',
                                  installmentMethod === m
                                    ? 'bg-amber-500 text-stone-950 shadow-xs'
                                    : 'text-stone-600 dark:text-stone-400'
                                )}
                              >
                                {m}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Ref / Note */}
                        <div className="sm:col-span-3">
                          <label className="text-[10px] font-bold text-stone-600 dark:text-stone-400 block mb-1">
                            Ref / Note
                          </label>
                          <input
                            type="text"
                            value={installmentRef}
                            onChange={(e) => setInstallmentRef(e.target.value)}
                            placeholder="Optional"
                            className="w-full bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl px-2.5 py-1.5 text-xs focus:border-amber-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={handleAddInstallment}
                        disabled={!installmentAmount || parseFloat(installmentAmount) <= 0}
                        leftIcon={<Plus className="w-3.5 h-3.5" />}
                        className="w-full font-bold text-xs"
                      >
                        + Add ₹{(parseFloat(installmentAmount) || 0).toFixed(2)} ({installmentMethod})
                      </Button>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center gap-2.5 text-emerald-800 dark:text-emerald-300">
                      <CheckCircle2 className="w-5 h-5 shrink-0" />
                      <div className="text-xs">
                        <strong>Bill is 100% Paid!</strong> You can now confirm and close the settlement below.
                      </div>
                    </div>
                  )}

                  {/* Recorded Payments Ledger */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                      <span className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-stone-400" />
                        <span>Recorded Installments ({currentPayments.length})</span>
                      </span>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400">
                        Total: ₹{currentPaid.toFixed(2)}
                      </span>
                    </div>

                    {currentPayments.length === 0 ? (
                      <div className="p-4 rounded-2xl border border-dashed border-stone-300 dark:border-stone-800 text-center text-xs text-stone-400">
                        No payments recorded yet. Enter an installment amount above.
                      </div>
                    ) : (
                      <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                        {currentPayments.map((p, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/70 dark:border-stone-700/60 flex items-center justify-between gap-2 text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <div className="p-1 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700">
                                {getMethodIcon(p.paymentMethod)}
                              </div>
                              <div>
                                <span className="font-extrabold text-stone-900 dark:text-stone-100">
                                  {p.paymentMethod}
                                </span>
                                {p.reference && (
                                  <span className="text-[10px] text-stone-400 ml-1.5">
                                    • {p.reference}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">
                                ₹{parseFloat(String(p.amount)).toFixed(2)}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveInstallment(idx)}
                                className="p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                                aria-label="Delete installment"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Split Actions */}
                  <div className="pt-2 space-y-2">
                    {currentRemaining <= 0.01 ? (
                      <Button
                        type="button"
                        variant="success"
                        size="touch"
                        onClick={() => confirmPaymentAndOrder(currentPayments)}
                        className="w-full font-extrabold text-base shadow-lg shadow-emerald-600/20"
                      >
                        Confirm & Settle Final Bill (₹{finalTotal.toFixed(2)})
                      </Button>
                    ) : posMode === 'table' && selectedTableId ? (
                      <Button
                        type="button"
                        variant="primary"
                        size="touch"
                        onClick={() => {
                          setShowCheckoutModal(false);
                        }}
                        className="w-full font-extrabold text-sm"
                        rightIcon={<ArrowRight className="w-4 h-4" />}
                      >
                        Save Partial Deposit & Keep Table Open
                      </Button>
                    ) : (
                      <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-[11px] text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40 text-center font-medium">
                        Remaining due: <strong>₹{currentRemaining.toFixed(2)}</strong>. Please add the balance to settle the quick bill.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* 🖨️ Thermal Receipt Printable Container (Rendered off-screen, visible only on print) */}
      <div id="thermal-receipt" className="hidden">
        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
          <div style={{ fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase' }}>
            {appData?.settings?.storeName || 'VELORA QSR'}
          </div>
          <div style={{ fontSize: '10px' }}>
            {appData?.settings?.address || 'Fresh Food & Artisan Kitchen'}
          </div>
          {appData?.settings?.phone && (
            <div style={{ fontSize: '10px' }}>Phone: {appData.settings.phone}</div>
          )}
          {appData?.settings?.taxNo && (
            <div style={{ fontSize: '10px' }}>GST/Tax: {appData.settings.taxNo}</div>
          )}
          <div style={{ borderBottom: '1px dashed #000', margin: '6px 0' }} />
        </div>

        <div style={{ fontSize: '10px', display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span>Date: {new Date().toLocaleDateString()}</span>
          <span>Time: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div style={{ fontSize: '10px', marginBottom: '6px' }}>
          <span>Mode: {posMode === 'table' ? `Table #${selectedTableId}` : 'Quick Counter'}</span>
        </div>

        <div style={{ borderBottom: '1px dashed #000', margin: '4px 0' }} />

        {/* Itemized Table */}
        <table style={{ width: '100%', fontSize: '10px', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #000', textAlign: 'left' }}>
              <th style={{ paddingBottom: '3px' }}>Item</th>
              <th style={{ textAlign: 'center', paddingBottom: '3px' }}>Qty</th>
              <th style={{ textAlign: 'right', paddingBottom: '3px' }}>Amt</th>
            </tr>
          </thead>
          <tbody>
            {combinedItems.map((it: any, i: number) => {
              const p = parseFloat(String(it.price).replace(/[^0-9.]/g, '')) || 0;
              const q = it.quantity || 1;
              return (
                <tr key={i}>
                  <td style={{ padding: '2px 0' }}>{it.name}</td>
                  <td style={{ textAlign: 'center' }}>{q}</td>
                  <td style={{ textAlign: 'right' }}>₹{(p * q).toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div style={{ borderBottom: '1px dashed #000', margin: '6px 0' }} />

        {/* Totals */}
        <div style={{ fontSize: '10px', lineHeight: '1.4' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Subtotal:</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Taxes & Charges:</span>
            <span>₹{tax.toFixed(2)}</span>
          </div>
          {discountAmount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
              <span>Discount:</span>
              <span>-₹{discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div style={{ borderBottom: '1px solid #000', margin: '4px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 'bold' }}>
            <span>TOTAL:</span>
            <span>₹{finalTotal.toFixed(2)}</span>
          </div>
        </div>

        <div style={{ borderBottom: '1px dashed #000', margin: '6px 0' }} />

        {/* Payment Breakdown */}
        <div style={{ fontSize: '10px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>PAYMENT BREAKDOWN:</div>
          {currentPayments.length > 0 ? (
            currentPayments.map((cp, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '1px 0' }}>
                <span>• {cp.paymentMethod}{cp.reference ? ` (${cp.reference})` : ''}:</span>
                <span>₹{parseFloat(String(cp.amount)).toFixed(2)}</span>
              </div>
            ))
          ) : (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>• {paymentType}:</span>
              <span>₹{finalTotal.toFixed(2)}</span>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3px', fontWeight: 'bold' }}>
            <span>Paid Amount:</span>
            <span>₹{currentPaid.toFixed(2)}</span>
          </div>
          {currentRemaining > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: '#000' }}>
              <span>Balance Due:</span>
              <span>₹{currentRemaining.toFixed(2)}</span>
            </div>
          )}
        </div>

        <div style={{ borderBottom: '1px dashed #000', margin: '6px 0' }} />

        <div style={{ textAlign: 'center', fontSize: '9px', marginTop: '6px' }}>
          <div>THANK YOU FOR DINING WITH US!</div>
          <div style={{ fontStyle: 'italic', marginTop: '2px' }}>Velora QSR POS Terminal</div>
        </div>
      </div>
    </>
  );
};

