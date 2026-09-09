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
  Plus,
  Trash2,
  CheckCircle2,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { roundPOSAmount } from '../../lib/orderUtils';

export const CheckoutModal: React.FC = () => {
  const { posMode, appData, storeProfile, currentUser } = useApp();
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

  const tableKey = selectedTableId ? String(selectedTableId) : '';
  const tableData =
    posMode === 'table' && selectedTableId
      ? tableOrders[tableKey] || tableOrders[selectedTableId]
      : null;

  // Extract cart items including saved table items
  let combinedItems: any[] = [...cart];
  if (tableData && tableData.savedOrders && Array.isArray(tableData.savedOrders)) {
    tableData.savedOrders.forEach((so: any) => {
      if (so && Array.isArray(so.items)) {
        combinedItems = [...combinedItems, ...so.items];
      } else if (Array.isArray(so)) {
        combinedItems = [...combinedItems, ...so];
      }
    });
  }

  // Group items by KOT batches or active cart
  interface OrderGroup {
    id: string;
    title: string;
    time?: number | string;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
  }

  const orderGroups: OrderGroup[] = [];

  if (tableData?.savedOrders && Array.isArray(tableData.savedOrders) && tableData.savedOrders.length > 0) {
    tableData.savedOrders.forEach((so: any, idx: number) => {
      const itemsList = Array.isArray(so.items) ? so.items : Array.isArray(so) ? so : [];
      if (itemsList.length > 0) {
        orderGroups.push({
          id: `kot-${idx}`,
          title: `Order ${idx + 1}`,
          time: so.time || undefined,
          items: itemsList.map((it: any) => ({
            name: it.name,
            quantity: it.quantity || 1,
            price: parseFloat(String(it.price).replace(/[^0-9.]/g, '')) || 0,
          })),
        });
      }
    });

    if (cart.length > 0) {
      orderGroups.push({
        id: `kot-active`,
        title: `Order ${orderGroups.length + 1}`,
        time: Date.now(),
        items: cart.map((it) => ({
          name: it.name,
          quantity: it.quantity || 1,
          price: parseFloat(String(it.price).replace(/[^0-9.]/g, '')) || 0,
        })),
      });
    }
  } else if (cart.length > 0) {
    orderGroups.push({
      id: `kot-cart`,
      title: 'Order 1',
      time: Date.now(),
      items: cart.map((it) => ({
        name: it.name,
        quantity: it.quantity || 1,
        price: parseFloat(String(it.price).replace(/[^0-9.]/g, '')) || 0,
      })),
    });
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
  const roundedTotal = roundPOSAmount(finalTotal);

  // Active payments for current session
  const currentPayments: OrderPayment[] =
    posMode === 'table' && selectedTableId
      ? tablePayments[tableKey] || tablePayments[selectedTableId] || []
      : quickSplitPayments;

  const currentPaid = currentPayments.reduce(
    (sum, p) => sum + (parseFloat(String(p.amount ?? '').replace(/[^0-9.]/g, '')) || 0),
    0
  );
  const currentRemaining = Math.max(0, parseFloat((roundedTotal - currentPaid).toFixed(2)));

  // Cash tender change calculation (for single payment tab)
  const tenderedAmount = parseFloat(tenderCash) || 0;
  const changeDue = Math.max(0, tenderedAmount - roundedTotal);

  // When modal opens, auto-switch to split tab if table has recorded advance/payments
  useEffect(() => {
    if (showCheckoutModal) {
      if (currentPayments.length > 0) {
        setSettleTab('split');
      }
      setInstallmentAmount(currentRemaining > 0 ? currentRemaining.toFixed(2) : '');
      setInstallmentRef('');
    }
  }, [showCheckoutModal, currentPayments.length, currentRemaining]);

  // Update prefilled installment amount when remaining changes
  useEffect(() => {
    if (currentRemaining > 0 && (!installmentAmount || parseFloat(installmentAmount) <= 0)) {
      setInstallmentAmount(currentRemaining.toFixed(2));
    }
  }, [currentRemaining, installmentAmount]);

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

  // Handler: Thermal Receipt Printing for Settlement & Payment
  const handlePrintThermalReceipt = () => {
    if (posMode === 'table' && selectedTableId) {
      setTablePrinted((prev) => ({ ...prev, [selectedTableId]: true }));
    }

    const storeName = storeProfile?.businessName || appData?.settings?.storeName || 'Velora Cafe';
    const cafeCode = storeProfile?.cafeCode || '';
    const address = storeProfile?.address || appData?.settings?.address || '';
    const cityState = [storeProfile?.city, storeProfile?.state].filter(Boolean).join(', ');
    const phone = storeProfile?.phone || appData?.settings?.phone || '';
    const gstin = storeProfile?.gstin || appData?.settings?.taxNo || '';
    const receiptFooter = storeProfile?.receiptFooter || 'Thank you for dining with us! Please visit again.';

    const tableName = posMode === 'table'
      ? (appData.tables?.find((t) => String(t.id) === String(selectedTableId))?.name || `Table #${selectedTableId}`)
      : 'Quick POS / Counter';

    const orderDate = new Date();
    const dateFormatted = orderDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeFormatted = orderDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

    // Generate batches or items HTML
    let itemsHtml = '';
    if (orderGroups.length > 0) {
      itemsHtml = orderGroups.map((group) => {
        const groupHeader = orderGroups.length > 1
          ? `<tr><td colspan="3" style="padding: 4px 0 2px 0; font-weight: bold; border-bottom: 1px dotted #000; font-size: 10px; text-transform: uppercase;">${escapeXml(group.title)}${group.time ? ` (${new Date(group.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })})` : ''}</td></tr>`
          : '';
        const itemsList = group.items.map((it) => `
          <tr>
            <td style="padding: 2.5px 0; vertical-align: top;">${escapeXml(it.name)}</td>
            <td style="padding: 2.5px 0; text-align: center; vertical-align: top; white-space: nowrap;">x${it.quantity}</td>
            <td style="padding: 2.5px 0; text-align: right; vertical-align: top; font-weight: bold; white-space: nowrap;">₹${(it.price * it.quantity).toFixed(2)}</td>
          </tr>
        `).join('');
        return `${groupHeader}${itemsList}`;
      }).join('');
    } else {
      itemsHtml = combinedItems.map((it) => {
        const p = parseFloat(String(it.price).replace(/[^0-9.]/g, '')) || 0;
        const q = it.quantity || 1;
        return `
          <tr>
            <td style="padding: 2.5px 0; vertical-align: top;">${escapeXml(it.name)}</td>
            <td style="padding: 2.5px 0; text-align: center; vertical-align: top; white-space: nowrap;">x${q}</td>
            <td style="padding: 2.5px 0; text-align: right; vertical-align: top; font-weight: bold; white-space: nowrap;">₹${(p * q).toFixed(2)}</td>
          </tr>
        `;
      }).join('');
    }

    // Payment details HTML
    let paymentLinesHtml = '';
    if (currentPayments.length > 0) {
      paymentLinesHtml = currentPayments.map((p) => `
        <div style="display: flex; justify-content: space-between; padding: 1px 0;">
          <span>• ${escapeXml(p.paymentMethod)}${p.reference ? ` (${escapeXml(p.reference)})` : ''}:</span>
          <span style="font-weight: bold;">₹${parseFloat(String(p.amount)).toFixed(2)}</span>
        </div>
      `).join('');
    } else {
      paymentLinesHtml = `
        <div style="display: flex; justify-content: space-between; padding: 1px 0;">
          <span>• Mode: ${escapeXml(paymentType)}</span>
          <span style="font-weight: bold;">₹${roundedTotal}</span>
        </div>
      `;
      if (paymentType.toLowerCase() === 'cash' && tenderedAmount > 0) {
        paymentLinesHtml += `
          <div style="display: flex; justify-content: space-between; padding: 1px 0; color: #333;">
            <span>  Tendered:</span>
            <span>₹${tenderedAmount.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 1px 0; color: #333;">
            <span>  Change Return:</span>
            <span>₹${changeDue.toFixed(2)}</span>
          </div>
        `;
      }
    }

    const receiptHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Receipt - ${escapeXml(tableName)}</title>
        <style>
          @page {
            size: 80mm auto;
            margin: 0mm 2mm;
          }
          * {
            box-sizing: border-box;
          }
          body {
            font-family: 'JetBrains Mono', 'Courier New', Courier, monospace;
            width: 74mm;
            max-width: 74mm;
            margin: 0 auto;
            padding: 8px 2px 24px 2px;
            font-size: 11px;
            line-height: 1.35;
            color: #000;
            background: #fff;
          }
          .center { text-align: center; }
          .right { text-align: right; }
          .bold { font-weight: bold; }
          .store-name {
            font-size: 16px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 2px;
          }
          .store-info {
            font-size: 10px;
            color: #222;
            margin: 1px 0;
          }
          .divider {
            border-top: 1px dashed #000;
            margin: 6px 0;
          }
          .divider-double {
            border-top: 2px dashed #000;
            margin: 6px 0;
          }
          .order-meta {
            font-size: 10.5px;
            margin: 4px 0;
          }
          .order-meta div {
            display: flex;
            justify-content: space-between;
            padding: 1px 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
            margin: 4px 0;
          }
          th {
            font-size: 10px;
            font-weight: bold;
            text-align: left;
            padding-bottom: 3px;
            border-bottom: 1px dashed #000;
          }
          .calc-row {
            display: flex;
            justify-content: space-between;
            padding: 1.5px 0;
            font-size: 11px;
          }
          .total-banner {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 15px;
            font-weight: 900;
            padding: 4px 0;
          }
          .footer {
            margin-top: 10px;
            text-align: center;
            font-size: 10px;
            line-height: 1.4;
          }
        </style>
      </head>
      <body>
        <div class="center">
          <div class="store-name">${escapeXml(storeName)}</div>
          ${cafeCode ? `<div class="store-info">Code: ${escapeXml(cafeCode)}</div>` : ''}
          ${address ? `<div class="store-info">${escapeXml(address)}</div>` : ''}
          ${cityState ? `<div class="store-info">${escapeXml(cityState)}</div>` : ''}
          ${phone ? `<div class="store-info">Tel: ${escapeXml(phone)}</div>` : ''}
          ${gstin ? `<div class="store-info">GSTIN: ${escapeXml(gstin)}</div>` : ''}
        </div>

        <div class="divider-double"></div>

        <div class="order-meta">
          <div>
            <span>Order Type: <strong>${escapeXml(tableName)}</strong></span>
            <span>${timeFormatted}</span>
          </div>
          <div>
            <span>Date: ${dateFormatted}</span>
            <span>Staff: ${escapeXml(currentUser?.fullName || currentUser?.username || 'Counter')}</span>
          </div>
        </div>

        <div class="divider"></div>

        <table>
          <thead>
            <tr>
              <th style="width: 55%;">ITEM</th>
              <th style="width: 18%; text-align: center;">QTY</th>
              <th style="width: 27%; text-align: right;">AMT</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="divider"></div>

        <div class="calc-row">
          <span>Subtotal:</span>
          <span class="bold">₹${subtotal.toFixed(2)}</span>
        </div>

        <div class="calc-row">
          <span>Taxes & GST:</span>
          <span class="bold">₹${tax.toFixed(2)}</span>
        </div>

        ${discountAmount > 0 ? `
          <div class="calc-row bold" style="color: #000;">
            <span>Discount Applied${discountType === 'percent' ? ` (${dVal}%)` : ''}:</span>
            <span>-₹${discountAmount.toFixed(2)}</span>
          </div>
        ` : ''}

        ${roundedTotal !== finalTotal ? `
          <div class="calc-row" style="color: #222;">
            <span>Round Off:</span>
            <span>${roundedTotal > finalTotal ? '+' : ''}₹${(roundedTotal - finalTotal).toFixed(2)}</span>
          </div>
        ` : ''}

        <div class="divider-double"></div>

        <div class="total-banner">
          <span>NET PAYABLE:</span>
          <span>₹${roundedTotal}</span>
        </div>

        <div class="divider-double"></div>

        <div style="font-size: 10.5px; margin: 4px 0;">
          <div class="bold" style="margin-bottom: 2px;">PAYMENT DETAILS:</div>
          ${paymentLinesHtml}
          <div style="display: flex; justify-content: space-between; margin-top: 3px; font-weight: bold; border-top: 1px dotted #000; padding-top: 2px;">
            <span>Paid Amount:</span>
            <span>₹${currentPaid.toFixed(2)}</span>
          </div>
          ${currentRemaining > 0 ? `
            <div style="display: flex; justify-content: space-between; font-weight: bold; color: #000;">
              <span>Balance Due:</span>
              <span>₹${currentRemaining.toFixed(2)}</span>
            </div>
          ` : ''}
        </div>

        <div class="divider"></div>

        <div class="footer">
          <div class="bold">${escapeXml(receiptFooter)}</div>
          <div style="margin-top: 4px; font-size: 9px; opacity: 0.7;">*** Velora QSR POS ***</div>
        </div>
      </body>
      </html>
    `;

    // Trigger isolated iframe printing
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      document.body.removeChild(iframe);
      window.print();
      return;
    }

    doc.open();
    doc.write(receiptHtml);
    doc.close();

    iframe.contentWindow?.focus();
    setTimeout(() => {
      try {
        iframe.contentWindow?.print();
      } catch (e) {
        console.error('Receipt print failed:', e);
      } finally {
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 1000);
      }
    }, 350);
  };

  return (
    <>
      <Modal
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        title="Settlement & Payment"
        maxWidth="4xl"
        className="h-[92vh] max-h-[720px] flex flex-col"
        headerClassName="py-2.5 sm:py-3 px-5 sm:px-6"
        bodyClassName="p-0 overflow-hidden flex flex-col flex-1"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 p-4 sm:p-5 h-full flex-1 overflow-hidden">
          {/* ======================================================== */}
          {/* LEFT COLUMN: Order Overview with proper KOTs & Print Receipt */}
          {/* ======================================================== */}
          <div className="md:col-span-6 flex flex-col h-full overflow-hidden border-b md:border-b-0 md:border-r border-stone-200/80 dark:border-stone-800 pb-3 md:pb-0 md:pr-5">
            {/* Fixed Header */}
            <div className="flex items-center justify-between pb-2 shrink-0">
              <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wide">
                Order Summary
              </h4>
              {posMode === 'table' && selectedTableId && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                  Table #{selectedTableId}
                </span>
              )}
            </div>

            {/* Scrollable KOT Batches List (ONLY this part scrolls) */}
            <div className="flex-1 overflow-y-auto min-h-0 pr-1 space-y-2.5">
              {orderGroups.length === 0 ? (
                <div className="p-6 rounded-2xl border border-dashed border-stone-300 dark:border-stone-700 text-center text-xs text-stone-400">
                  No items in this order
                </div>
              ) : (
                orderGroups.map((group) => (
                  <div
                    key={group.id}
                    className="rounded-xl border border-stone-200/70 dark:border-stone-800 overflow-hidden bg-white dark:bg-stone-850/50 shadow-xs"
                  >
                    {/* Order Batch Header Strip */}
                    <div className="flex items-center justify-between px-3 py-1.5 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold text-xs border-b border-stone-200/60 dark:border-stone-800">
                      <span>{group.title}</span>
                      {group.time && (
                        <span className="text-[11px] font-mono font-normal text-stone-500 dark:text-stone-400">
                          {new Date(group.time).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      )}
                    </div>

                    {/* Items under this KOT batch */}
                    <div className="p-2 divide-y divide-stone-100 dark:divide-stone-800/60">
                      {group.items.map((it, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between text-xs py-1.5 px-1 hover:bg-stone-50/50 dark:hover:bg-stone-800/30 rounded-lg transition-colors"
                        >
                          <span className="text-stone-800 dark:text-stone-200 font-medium flex-1 truncate pr-2">
                            {it.name}
                          </span>
                          <span className="text-stone-400 dark:text-stone-500 font-mono text-xs w-10 text-center">
                            x{it.quantity}
                          </span>
                          <span className="text-stone-900 dark:text-stone-100 font-mono font-semibold w-18 text-right">
                            ₹{(it.price * it.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Left Column Bottom: Subtotal, Tax, and Print Receipt (FIXED at bottom) */}
            <div className="shrink-0 pt-3 border-t border-stone-200/80 dark:border-stone-800 space-y-2.5 mt-auto bg-white dark:bg-stone-900">
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-stone-500 dark:text-stone-400">
                  <span>Subtotal</span>
                  <span className="font-mono font-semibold text-stone-800 dark:text-stone-200">
                    ₹{subtotal.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between text-stone-500 dark:text-stone-400">
                  <span>Tax</span>
                  <span className="font-mono font-semibold text-stone-800 dark:text-stone-200">
                    ₹{tax.toFixed(2)}
                  </span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between font-semibold text-emerald-600 dark:text-emerald-400">
                    <span>Discount Applied</span>
                    <span className="font-mono">-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* Print Receipt Button */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handlePrintThermalReceipt}
                leftIcon={<Printer className="w-4 h-4 text-stone-600 dark:text-stone-300" />}
                className="w-full font-bold text-stone-700 dark:text-stone-200 border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 py-2 rounded-xl cursor-pointer"
              >
                Print Receipt
              </Button>
            </div>
          </div>

          {/* ======================================================== */}
          {/* RIGHT COLUMN: Payment & Settlement Controls */}
          {/* ======================================================== */}
          <div className="md:col-span-6 flex flex-col h-full overflow-hidden">
            {/* Fixed Top Controls */}
            <div className="shrink-0 space-y-2.5 pb-2">
              {/* Amount Summary */}
              <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-850/60 border border-stone-200/80 dark:border-stone-750/70 space-y-1">
                <div className="flex justify-between items-baseline text-xs">
                  <span className="text-stone-500 dark:text-stone-400 font-medium">Original Amount:</span>
                  <span className="font-mono text-stone-700 dark:text-stone-300 font-semibold">
                    ₹{baseTotal.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-start pt-0.5">
                  <span className="text-sm font-extrabold text-stone-900 dark:text-stone-100">
                    Total Amount:
                  </span>
                  <div className="flex flex-col items-end">
                    <span className="text-xl sm:text-2xl font-black font-mono text-blue-900 dark:text-blue-400">
                      ₹{roundedTotal}
                    </span>
                    {roundedTotal !== finalTotal && (
                      <span className="text-[11px] font-mono text-stone-500 dark:text-stone-400">
                        (₹{finalTotal.toFixed(2)})
                      </span>
                    )}
                  </div>
                </div>

                {/* If partial payments recorded, display live running balance */}
                {currentPaid > 0 && (
                  <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-stone-200/60 dark:border-stone-700/60 mt-1">
                    <div className="p-1.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800">
                      <span className="text-[10px] text-stone-400 block uppercase font-bold">Paid So Far</span>
                      <span className="text-xs sm:text-sm font-black font-mono text-emerald-600 dark:text-emerald-400">
                        ₹{currentPaid.toFixed(2)}
                      </span>
                    </div>
                    <div className="p-1.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800">
                      <span className="text-[10px] text-stone-400 block uppercase font-bold">Remaining Due</span>
                      <span
                        className={cn(
                          'text-xs sm:text-sm font-black font-mono',
                          currentRemaining <= 0.01 ? 'text-stone-400' : 'text-rose-600 dark:text-rose-400'
                        )}
                      >
                        ₹{currentRemaining.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Offer / Discount Section */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                  Offer / Discount
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as 'fixed' | 'percent')}
                    className="bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl px-2.5 py-1.5 text-xs font-bold text-stone-800 dark:text-stone-200 focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="fixed">Fixed (₹)</option>
                    <option value="percent">% Off</option>
                  </select>

                  <input
                    type="number"
                    min="0"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    placeholder="Amount"
                    className="flex-1 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl px-3 py-1.5 text-xs font-mono font-semibold focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Payment Mode Selector Tabs */}
              <div className="flex p-1 bg-stone-100 dark:bg-stone-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => setSettleTab('single')}
                  className={cn(
                    'flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5',
                    settleTab === 'single'
                      ? 'bg-white dark:bg-stone-900 shadow-sm text-stone-950 dark:text-stone-100 font-extrabold'
                      : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                  )}
                >
                  <Banknote className="w-3.5 h-3.5" />
                  <span>Single Full Payment</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSettleTab('split')}
                  className={cn(
                    'flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5',
                    settleTab === 'split'
                      ? 'bg-white dark:bg-stone-900 shadow-sm text-amber-600 dark:text-amber-400 font-extrabold'
                      : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                  )}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Partial Payment</span>
                  {currentPayments.length > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-stone-950 font-black">
                      {currentPayments.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* TAB 1: SINGLE FULL PAYMENT (Scrollable middle + Fixed bottom) */}
            {settleTab === 'single' && (
              <div className="flex-1 flex flex-col justify-between min-h-0 overflow-hidden">
                <div className="flex-1 overflow-y-auto min-h-0 pr-1 space-y-3">
                  <div>
                    <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1.5">
                      Payment Method
                    </label>

                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'Cash', label: 'Cash', icon: Banknote, color: 'text-emerald-600 dark:text-emerald-400' },
                        { id: 'Card', label: 'Card', icon: CreditCard, color: 'text-sky-600 dark:text-sky-400' },
                        { id: 'UPI', label: 'UPI', icon: QrCode, color: 'text-purple-600 dark:text-purple-400' },
                      ].map((m) => {
                        const isSelected = paymentType === m.id;
                        const Icon = m.icon;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setPaymentType(m.id)}
                            className={cn(
                              'p-2.5 rounded-xl border transition-all flex items-center gap-2 cursor-pointer text-left',
                              isSelected
                                ? 'border-blue-600 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 shadow-xs'
                                : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-750 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-850'
                            )}
                          >
                            {/* Radio circle */}
                            <div
                              className={cn(
                                'w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0',
                                isSelected
                                  ? 'border-blue-600 bg-blue-600 dark:border-blue-500 dark:bg-blue-500'
                                  : 'border-stone-400 dark:border-stone-600'
                              )}
                            >
                              {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>

                            <div className="flex flex-col items-center flex-1">
                              <Icon className={cn('w-4 h-4', m.color)} />
                              <span className="text-xs font-bold mt-0.5 text-stone-900 dark:text-stone-100">
                                {m.label}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Cash Tender Calculation (If Cash Selected) */}
                  {paymentType === 'Cash' && (
                    <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/80 dark:border-stone-700/80 space-y-2">
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
                        placeholder={roundedTotal.toString()}
                        value={tenderCash}
                        onChange={(e) => setTenderCash(e.target.value)}
                        className="w-full bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl px-3 py-1.5 text-sm font-mono font-bold focus:border-amber-500 focus:outline-none"
                      />

                      <div className="flex gap-1.5 pt-0.5">
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
                </div>

                {/* Settle Order Action Button (FIXED at bottom) */}
                <div className="shrink-0 pt-2.5 border-t border-stone-100 dark:border-stone-800 mt-auto bg-white dark:bg-stone-900">
                  <button
                    type="button"
                    onClick={() => confirmPaymentAndOrder()}
                    className="w-full font-bold text-sm py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all cursor-pointer active:scale-[0.99] flex items-center justify-center gap-2"
                  >
                    Confirm & Pay ₹{roundedTotal}
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: PARTIAL PAYMENT (Scrollable middle + Fixed bottom) */}
            {settleTab === 'split' && (
              <div className="flex-1 flex flex-col justify-between min-h-0 overflow-hidden">
                <div className="flex-1 overflow-y-auto min-h-0 pr-1 space-y-3">
                  {/* Custom Installment Input Form */}
                  {currentRemaining > 0.01 ? (
                    <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-750 space-y-2.5">
                      <div className="text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wide flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Plus className="w-3.5 h-3.5 text-amber-500" />
                          <span>Add Partial Payment</span>
                        </span>
                        <span className="text-[11px] font-mono text-stone-400 font-normal">
                          Max: ₹{currentRemaining.toFixed(2)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                        {/* Amount Input */}
                        <div className="sm:col-span-5">
                          <label className="text-[10px] font-bold text-stone-500 block mb-0.5">
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
                            className="w-full bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold focus:border-amber-500 focus:outline-none"
                          />
                        </div>

                        {/* Method Selector */}
                        <div className="sm:col-span-4">
                          <label className="text-[10px] font-bold text-stone-500 block mb-0.5">
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
                          <label className="text-[10px] font-bold text-stone-500 block mb-0.5">
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
                        className="w-full font-bold text-xs py-1.5"
                      >
                        + Add ₹{(parseFloat(installmentAmount) || 0).toFixed(2)} ({installmentMethod})
                      </Button>
                    </div>
                  ) : (
                    <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center gap-2.5 text-emerald-800 dark:text-emerald-300">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                      <div className="text-xs">
                        <strong>Bill is 100% Paid!</strong> You can now confirm and close the settlement below.
                      </div>
                    </div>
                  )}

                  {/* Recorded Partial Payments Ledger */}
                  <div className="space-y-1.5">
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
                      <div className="p-3 rounded-xl border border-dashed border-stone-300 dark:border-stone-800 text-center text-xs text-stone-400">
                        No payments recorded yet. Enter a custom installment amount above.
                      </div>
                    ) : (
                      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                        {currentPayments.map((p, idx) => (
                          <div
                            key={idx}
                            className="p-2 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/70 dark:border-stone-700/60 flex items-center justify-between gap-2 text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <div className="p-1 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700">
                                {getMethodIcon(p.paymentMethod)}
                              </div>
                              <div>
                                <span className="font-bold text-stone-900 dark:text-stone-100">
                                  {p.paymentMethod}
                                </span>
                                {p.reference && (
                                  <span className="text-[10px] text-stone-400 ml-1.5">
                                    • {p.reference}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
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
                </div>

                {/* Partial Payment Actions (FIXED at bottom) */}
                <div className="shrink-0 pt-2.5 border-t border-stone-100 dark:border-stone-800 mt-auto bg-white dark:bg-stone-900">
                  {currentRemaining <= 0.01 ? (
                    <button
                      type="button"
                      onClick={() => confirmPaymentAndOrder(currentPayments)}
                      className="w-full font-bold text-sm py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all cursor-pointer active:scale-[0.99] flex items-center justify-center gap-2"
                    >
                      Confirm & Settle Final Bill (₹{roundedTotal})
                    </button>
                  ) : posMode === 'table' && selectedTableId ? (
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setShowCheckoutModal(false);
                      }}
                      className="w-full font-extrabold text-sm py-2.5"
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                    >
                      Save Partial Deposit & Keep Table Open
                    </Button>
                  ) : (
                    <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-[11px] text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40 text-center font-medium">
                      Remaining due: <strong>₹{currentRemaining.toFixed(2)}</strong>. Please add the balance to settle the quick bill.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* 🖨️ Thermal Receipt Printable Container (Rendered off-screen, visible only on print) */}
      {/* 🖨️ Thermal Receipt Printable Container (Rendered off-screen, visible on direct print fallback) */}
      <div id="thermal-receipt" className="hidden print:block">
        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
          <div style={{ fontSize: '15px', fontWeight: 'bold', textTransform: 'uppercase' }}>
            {storeProfile?.businessName || appData?.settings?.storeName || 'VELORA QSR'}
          </div>
          {storeProfile?.cafeCode && (
            <div style={{ fontSize: '10px' }}>Code: {storeProfile.cafeCode}</div>
          )}
          {(storeProfile?.address || appData?.settings?.address) && (
            <div style={{ fontSize: '10px' }}>{storeProfile?.address || appData?.settings?.address}</div>
          )}
          {[storeProfile?.city, storeProfile?.state].filter(Boolean).length > 0 && (
            <div style={{ fontSize: '10px' }}>{[storeProfile?.city, storeProfile?.state].filter(Boolean).join(', ')}</div>
          )}
          {(storeProfile?.phone || appData?.settings?.phone) && (
            <div style={{ fontSize: '10px' }}>Phone: {storeProfile?.phone || appData?.settings?.phone}</div>
          )}
          {(storeProfile?.gstin || appData?.settings?.taxNo) && (
            <div style={{ fontSize: '10px' }}>GSTIN: {storeProfile?.gstin || appData?.settings?.taxNo}</div>
          )}
          <div style={{ borderBottom: '2px dashed #000', margin: '6px 0' }} />
        </div>

        <div style={{ fontSize: '10px', display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
          <span>Date: {new Date().toLocaleDateString('en-GB')}</span>
          <span>Time: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
        </div>
        <div style={{ fontSize: '10px', display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span>Type: {posMode === 'table' ? `Table #${selectedTableId}` : 'Quick Counter'}</span>
          <span>Staff: {currentUser?.fullName || currentUser?.username || 'Counter'}</span>
        </div>

        <div style={{ borderBottom: '1px dashed #000', margin: '4px 0' }} />

        {/* Itemized Table */}
        <table style={{ width: '100%', fontSize: '10.5px', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px dashed #000', textAlign: 'left' }}>
              <th style={{ paddingBottom: '3px', width: '55%' }}>Item</th>
              <th style={{ textAlign: 'center', paddingBottom: '3px', width: '18%' }}>Qty</th>
              <th style={{ textAlign: 'right', paddingBottom: '3px', width: '27%' }}>Amt</th>
            </tr>
          </thead>
          <tbody>
            {orderGroups.length > 0
              ? orderGroups.map((group) => (
                  <React.Fragment key={group.id}>
                    {orderGroups.length > 1 && (
                      <tr>
                        <td colSpan={3} style={{ fontWeight: 'bold', fontSize: '10px', paddingTop: '4px', borderBottom: '1px dotted #ccc' }}>
                          {group.title}
                        </td>
                      </tr>
                    )}
                    {group.items.map((it, i) => (
                      <tr key={i}>
                        <td style={{ padding: '2px 0' }}>{it.name}</td>
                        <td style={{ textAlign: 'center' }}>x{it.quantity}</td>
                        <td style={{ textAlign: 'right', fontWeight: 'bold' }}>₹{(it.price * it.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))
              : combinedItems.map((it: any, i: number) => {
                  const p = parseFloat(String(it.price).replace(/[^0-9.]/g, '')) || 0;
                  const q = it.quantity || 1;
                  return (
                    <tr key={i}>
                      <td style={{ padding: '2px 0' }}>{it.name}</td>
                      <td style={{ textAlign: 'center' }}>x{q}</td>
                      <td style={{ textAlign: 'right', fontWeight: 'bold' }}>₹{(p * q).toFixed(2)}</td>
                    </tr>
                  );
                })}
          </tbody>
        </table>

        <div style={{ borderBottom: '1px dashed #000', margin: '6px 0' }} />

        {/* Totals */}
        <div style={{ fontSize: '10.5px', lineHeight: '1.4' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Subtotal:</span>
            <span style={{ fontWeight: 'bold' }}>₹{subtotal.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Taxes & GST:</span>
            <span style={{ fontWeight: 'bold' }}>₹{tax.toFixed(2)}</span>
          </div>
          {discountAmount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
              <span>Discount Applied:</span>
              <span>-₹{discountAmount.toFixed(2)}</span>
            </div>
          )}
          {roundedTotal !== finalTotal && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Round Off:</span>
              <span>{roundedTotal > finalTotal ? '+' : ''}₹{(roundedTotal - finalTotal).toFixed(2)}</span>
            </div>
          )}
          <div style={{ borderBottom: '2px dashed #000', margin: '5px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: '900' }}>
            <span>NET PAYABLE:</span>
            <span>₹{roundedTotal}</span>
          </div>
          <div style={{ borderBottom: '2px dashed #000', margin: '5px 0' }} />
        </div>

        {/* Payment Breakdown */}
        <div style={{ fontSize: '10.5px', marginTop: '4px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>PAYMENT DETAILS:</div>
          {currentPayments.length > 0 ? (
            currentPayments.map((cp, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '1px 0' }}>
                <span>• {cp.paymentMethod}{cp.reference ? ` (${cp.reference})` : ''}:</span>
                <span style={{ fontWeight: 'bold' }}>₹{parseFloat(String(cp.amount)).toFixed(2)}</span>
              </div>
            ))
          ) : (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>• Mode: {paymentType}:</span>
              <span style={{ fontWeight: 'bold' }}>₹{roundedTotal}</span>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3px', fontWeight: 'bold', borderTop: '1px dotted #000', paddingTop: '2px' }}>
            <span>Paid Amount:</span>
            <span>₹{currentPaid.toFixed(2)}</span>
          </div>
          {currentRemaining > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
              <span>Balance Due:</span>
              <span>₹{currentRemaining.toFixed(2)}</span>
            </div>
          )}
        </div>

        <div style={{ borderBottom: '1px dashed #000', margin: '6px 0' }} />

        <div style={{ textAlign: 'center', fontSize: '9px', marginTop: '6px' }}>
          <div style={{ fontWeight: 'bold' }}>{storeProfile?.receiptFooter || 'THANK YOU FOR DINING WITH US!'}</div>
          <div style={{ fontStyle: 'italic', marginTop: '2px' }}>*** Velora QSR POS Terminal ***</div>
        </div>
      </div>
    </>
  );
};

function escapeXml(unsafe: string): string {
  return (unsafe || '').replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

