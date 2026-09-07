import React from 'react';
import type { Order } from '../../types/app.types';
import { useApp } from '../../context/AppContext';
import { Modal } from '../ui/Modal';
import { Printer, CheckCircle2, Clock, CreditCard, Utensils, Hash, Calendar } from 'lucide-react';

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: (Order & { dailySeq?: number }) | null;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  isOpen,
  onClose,
  order,
}) => {
  const { storeProfile } = useApp();

  if (!order) return null;

  const cafeName = storeProfile?.businessName || 'Velora Cafe & POS';
  const cafeCode = storeProfile?.cafeCode || 'CF-001';
  const address = storeProfile?.address || '';
  const cityState = [storeProfile?.city, storeProfile?.state].filter(Boolean).join(', ');
  const phone = storeProfile?.phone;
  const gstin = storeProfile?.gstin;

  const orderDate = order.date ? new Date(order.date) : new Date();
  const dateFormatted = orderDate.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const timeFormatted = orderDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const dailyNum = order.dailySeq || order.dailyOrderNumber || order.id;
  const isPartiallyPaid = order.status === 'Partially Paid' || (order.balanceAmount || 0) > 0;

  const handlePrintReceipt = () => {
    // Printable thermal receipt trigger
    const printWindow = window.open('', '_blank', 'width=350,height=600');
    if (!printWindow) {
      alert('Please allow popups to print receipt');
      return;
    }

    const itemsRows = (order.items || []).map((item: any) => {
      const name = item.menuItem?.name || `Item #${item.menuItemId || item.id}`;
      const qty = item.quantity || 1;
      const price = (item.price || 0) * qty;
      return `
        <tr>
          <td style="padding: 3px 0;">${escapeXml(name)} x${qty}</td>
          <td style="text-align: right; padding: 3px 0;">₹${price.toFixed(2)}</td>
        </tr>
      `;
    }).join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - Order #${dailyNum}</title>
        <style>
          body { font-family: monospace; font-size: 12px; margin: 0; padding: 10px; width: 280px; }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .divider { border-top: 1px dashed #000; margin: 6px 0; }
          table { width: 100%; border-collapse: collapse; }
        </style>
      </head>
      <body>
        <div class="center">
          <h2 style="margin: 0;">${escapeXml(cafeName)}</h2>
          <div>${escapeXml(cafeCode)}${address ? ' - ' + escapeXml(address) : ''}</div>
          ${phone ? `<div>Tel: ${escapeXml(phone)}</div>` : ''}
          ${gstin ? `<div>GSTIN: ${escapeXml(gstin)}</div>` : ''}
          <div class="divider"></div>
          <div class="bold" style="font-size: 14px;">ORDER #${dailyNum}</div>
          <div>Ref ID: #${order.id}</div>
          <div>${dateFormatted} ${timeFormatted}</div>
          <div>Mode: ${escapeXml(order.paymentMethod || 'Cash')}</div>
        </div>
        <div class="divider"></div>
        <table>
          <thead>
            <tr>
              <th style="text-align: left; padding: 3px 0;">ITEM</th>
              <th style="text-align: right; padding: 3px 0;">AMT</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>
        <div class="divider"></div>
        <table>
          <tr><td>Subtotal</td><td style="text-align: right;">₹${(order.subtotal || 0).toFixed(2)}</td></tr>
          <tr><td>Tax</td><td style="text-align: right;">₹${(order.tax || 0).toFixed(2)}</td></tr>
          <tr class="bold" style="font-size: 13px;">
            <td>TOTAL</td>
            <td style="text-align: right;">₹${(order.total || 0).toFixed(2)}</td>
          </tr>
          ${order.paidAmount !== undefined ? `
            <tr><td>Paid</td><td style="text-align: right;">₹${(order.paidAmount || 0).toFixed(2)}</td></tr>
            <tr><td>Balance</td><td style="text-align: right;">₹${(order.balanceAmount || 0).toFixed(2)}</td></tr>
          ` : ''}
        </table>
        <div class="divider"></div>
        <div class="center" style="margin-top: 10px; font-size: 11px;">
          ${escapeXml(storeProfile?.receiptFooter || 'Thank you for dining with us!')}
        </div>
        <script>
          window.onload = function() { window.print(); window.close(); }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="2xl"
      bodyClassName="p-0 overflow-y-auto"
    >
      {/* 1. Cafe Details At Top Center Header */}
      <div className="bg-stone-50 dark:bg-stone-850/80 border-b border-stone-200/80 dark:border-stone-800 p-5 text-center">
        <h2 className="text-xl font-black text-stone-900 dark:text-stone-100 tracking-tight">
          {cafeName}
        </h2>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
          <span className="font-semibold text-stone-700 dark:text-stone-300">{cafeCode}</span>
          {address && <span> &bull; {address}</span>}
          {cityState && <span> &bull; {cityState}</span>}
        </p>
        <div className="flex items-center justify-center gap-4 text-[11px] text-stone-400 mt-1">
          {phone && <span>Tel: {phone}</span>}
          {gstin && <span>GSTIN: {gstin}</span>}
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-6">
        {/* 2. Order Meta Status Banner */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-extrabold text-base shadow-sm shadow-amber-500/20">
              #{dailyNum}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-stone-900 dark:text-stone-100">
                  Daily Order #{dailyNum}
                </span>
                <span className="text-xs text-stone-400 font-mono">
                  (System ID #{order.id})
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {dateFormatted}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {timeFormatted}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                isPartiallyPaid
                  ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                  : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {order.status || 'Completed'}
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
              <CreditCard className="w-3.5 h-3.5 text-stone-400" />
              {order.paymentMethod || 'Cash'}
            </span>
          </div>
        </div>

        {/* 3. Items Breakdown Table */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
              <Utensils className="w-3.5 h-3.5 text-amber-500" />
              <span>Ordered Dishes ({order.items?.length || 0})</span>
            </h3>
          </div>

          <div className="border border-stone-200/80 dark:border-stone-800 rounded-2xl overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-stone-50 dark:bg-stone-850/60 border-b border-stone-200/80 dark:border-stone-800 text-stone-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3.5">#</th>
                  <th className="py-2.5 px-3.5">Item Name</th>
                  <th className="py-2.5 px-3.5 text-center">Qty</th>
                  <th className="py-2.5 px-3.5 text-right">Price</th>
                  <th className="py-2.5 px-3.5 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {(order.items && order.items.length > 0) ? (
                  order.items.map((it: any, idx: number) => {
                    const itemName = it.menuItem?.name || `Dish #${it.menuItemId || it.id}`;
                    const qty = it.quantity || 1;
                    const unitPrice = parseFloat(it.price) || 0;
                    const lineTotal = unitPrice * qty;

                    return (
                      <tr key={idx} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/40">
                        <td className="py-2.5 px-3.5 text-stone-400 font-mono">{idx + 1}</td>
                        <td className="py-2.5 px-3.5 font-bold text-stone-800 dark:text-stone-200">
                          {itemName}
                          {it.menuItem?.type && (
                            <span className="ml-1.5 text-[10px] text-stone-400 font-normal">
                              ({it.menuItem.type})
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3.5 text-center font-bold font-mono">
                          {qty}
                        </td>
                        <td className="py-2.5 px-3.5 text-right font-mono text-stone-500 dark:text-stone-400">
                          ₹{unitPrice.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3.5 text-right font-mono font-bold text-stone-900 dark:text-stone-100">
                          ₹{lineTotal.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-stone-400 text-xs">
                      No individual items recorded for this order.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. Payment History (if multiple tenders recorded) */}
        {order.payments && order.payments.length > 0 && (
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-stone-400 flex items-center gap-1.5 mb-2">
              <Hash className="w-3.5 h-3.5 text-amber-500" />
              <span>Payment Tender Logs</span>
            </h3>
            <div className="border border-stone-200/80 dark:border-stone-800 rounded-2xl overflow-hidden divide-y divide-stone-100 dark:divide-stone-800 text-xs">
              {order.payments.map((p, i) => (
                <div key={i} className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="font-bold text-stone-800 dark:text-stone-200">
                      {p.paymentMethod}
                    </span>
                    {p.reference && (
                      <span className="text-[11px] text-stone-400 font-mono">
                        (Ref: {p.reference})
                      </span>
                    )}
                  </div>
                  <span className="font-mono font-bold text-stone-900 dark:text-stone-100">
                    ₹{p.amount?.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. Financial Calculation Box */}
        <div className="bg-stone-50 dark:bg-stone-850/80 rounded-2xl p-4 sm:p-5 border border-stone-200/80 dark:border-stone-800 space-y-2 text-xs sm:text-sm">
          <div className="flex justify-between text-stone-600 dark:text-stone-400">
            <span>Subtotal</span>
            <span className="font-mono font-bold">₹{(order.subtotal || 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-stone-600 dark:text-stone-400">
            <span>Taxes & GST</span>
            <span className="font-mono font-bold">₹{(order.tax || 0).toFixed(2)}</span>
          </div>
          <div className="pt-2 border-t border-stone-200 dark:border-stone-750 flex justify-between items-center text-sm sm:text-base font-black text-stone-900 dark:text-stone-100">
            <span>Total Bill Amount</span>
            <span className="font-mono text-amber-600 dark:text-amber-400">
              ₹{(order.total || 0).toFixed(2)}
            </span>
          </div>

          {order.paidAmount !== undefined && (
            <div className="pt-2 border-t border-dashed border-stone-200 dark:border-stone-750 flex justify-between text-xs text-stone-500">
              <span>Paid Amount: <strong className="text-emerald-600 font-mono">₹{(order.paidAmount || 0).toFixed(2)}</strong></span>
              <span>Balance Due: <strong className={`${(order.balanceAmount || 0) > 0 ? 'text-rose-600' : 'text-stone-600'} font-mono`}>₹{(order.balanceAmount || 0).toFixed(2)}</strong></span>
            </div>
          )}
        </div>
      </div>

      {/* 6. Footer Actions */}
      <div className="px-6 py-4 bg-stone-50 dark:bg-stone-900 border-t border-stone-200/80 dark:border-stone-800 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={handlePrintReceipt}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs hover:bg-amber-400 active:scale-95 transition-all shadow-sm shadow-amber-500/20 cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Print Receipt</span>
        </button>

        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-750 text-stone-600 dark:text-stone-300 font-bold text-xs hover:bg-stone-100 dark:hover:bg-stone-800 active:scale-95 transition-all cursor-pointer"
        >
          Close
        </button>
      </div>
    </Modal>
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
