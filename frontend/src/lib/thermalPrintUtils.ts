import { roundPOSAmount } from './orderUtils';

function escapeXml(str: any): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export interface PrintReceiptOptions {
  order: any;
  storeProfile?: any;
  dailySeq?: number | string;
  settings?: any;
  currentUser?: any;
}

/**
 * Triggers clean 80mm/58mm thermal receipt printing via an isolated invisible iframe sandbox.
 * Prevents modal trapping, pop-up blockers, and browser URL header/footer contamination.
 */
export function printThermalReceipt({
  order,
  storeProfile,
  dailySeq,
  settings,
  currentUser,
}: PrintReceiptOptions): void {
  if (!order) return;

  const storeName = storeProfile?.businessName || settings?.storeName || 'Velora Cafe';
  const cafeCode = storeProfile?.cafeCode || '';
  const address = storeProfile?.address || settings?.address || '';
  const cityState = [storeProfile?.city, storeProfile?.state].filter(Boolean).join(', ');
  const phone = storeProfile?.phone || settings?.phone || '';
  const gstin = storeProfile?.gstin || settings?.taxNo || '';
  const receiptFooter = storeProfile?.receiptFooter || 'Thank you for dining with us! Please visit again.';

  const orderNum = dailySeq || order.dailyOrderNumber || order.id;
  const orderDate = order.date ? new Date(order.date) : new Date();
  const dateFormatted = orderDate.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const timeFormatted = orderDate.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const subtotal = order.subtotal || 0;
  const tax = order.tax || 0;
  const rawTotal = order.total || 0;
  const roundedTotal = roundPOSAmount(rawTotal);

  // Items table rows
  const itemsList = order.items || [];
  const itemsHtml =
    itemsList.length > 0
      ? itemsList
          .map((it: any) => {
            const name = it.menuItem?.name || it.name || 'Dish';
            const quantity = it.quantity || 1;
            const price = parseFloat(String(it.price || 0).replace(/[^0-9.]/g, '')) || 0;
            return `
              <tr>
                <td style="padding: 2.5px 0; vertical-align: top;">${escapeXml(name)}</td>
                <td style="padding: 2.5px 0; text-align: center; vertical-align: top; white-space: nowrap;">x${quantity}</td>
                <td style="padding: 2.5px 0; text-align: right; vertical-align: top; font-weight: bold; white-space: nowrap;">₹${(price * quantity).toFixed(2)}</td>
              </tr>
            `;
          })
          .join('')
      : `<tr><td colspan="3" style="text-align: center; padding: 4px 0; color: #555;">No items listed</td></tr>`;

  // Payment Breakdown
  let paymentLinesHtml = '';
  if (order.payments && order.payments.length > 0) {
    paymentLinesHtml = order.payments
      .map(
        (p: any) => `
        <div style="display: flex; justify-content: space-between; padding: 1px 0;">
          <span>• ${escapeXml(p.paymentMethod)}${p.reference ? ` (${escapeXml(p.reference)})` : ''}:</span>
          <span style="font-weight: bold;">₹${parseFloat(String(p.amount || 0)).toFixed(2)}</span>
        </div>
      `
      )
      .join('');
  } else {
    paymentLinesHtml = `
      <div style="display: flex; justify-content: space-between; padding: 1px 0;">
        <span>• Mode: ${escapeXml(order.paymentMethod || 'Cash')}</span>
        <span style="font-weight: bold;">₹${roundedTotal}</span>
      </div>
    `;
  }

  const receiptHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title>Receipt - Order #${orderNum}</title>
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
          <span>Token / Bill: <strong style="font-size: 13px;">#${orderNum}</strong></span>
          <span>${timeFormatted}</span>
        </div>
        <div>
          <span>Date: ${dateFormatted}</span>
          <span>Staff: ${escapeXml(currentUser?.fullName || currentUser?.username || 'Counter')}</span>
        </div>
        <div>
          <span>Ref ID: #${order.id}</span>
          <span>Status: <strong>${escapeXml(order.status || 'Completed')}</strong></span>
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

      ${
        roundedTotal !== rawTotal
          ? `
        <div class="calc-row" style="color: #222;">
          <span>Round Off:</span>
          <span>${roundedTotal > rawTotal ? '+' : ''}₹${(roundedTotal - rawTotal).toFixed(2)}</span>
        </div>
      `
          : ''
      }

      <div class="divider-double"></div>

      <div class="total-banner">
        <span>NET PAYABLE:</span>
        <span>₹${roundedTotal}</span>
      </div>

      <div class="divider-double"></div>

      <div style="font-size: 10.5px; margin: 4px 0;">
        <div class="bold" style="margin-bottom: 2px;">PAYMENT DETAILS:</div>
        ${paymentLinesHtml}
        ${
          order.paidAmount !== undefined
            ? `
          <div style="display: flex; justify-content: space-between; margin-top: 3px; font-weight: bold; border-top: 1px dotted #000; padding-top: 2px;">
            <span>Paid Amount:</span>
            <span>₹${parseFloat(String(order.paidAmount || 0)).toFixed(2)}</span>
          </div>
        `
            : ''
        }
        ${
          (order.balanceAmount || 0) > 0
            ? `
          <div style="display: flex; justify-content: space-between; font-weight: bold; color: #000;">
            <span>Balance Due:</span>
            <span>₹${parseFloat(String(order.balanceAmount || 0)).toFixed(2)}</span>
          </div>
        `
            : ''
        }
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
}
