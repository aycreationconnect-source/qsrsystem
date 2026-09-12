import { roundPOSAmount, getStoreGlobalTaxRate, formatTaxLabel } from './orderUtils';

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

  // Custom Taxes Breakdown for Receipt
  let customTaxRowsHtml = '';
  if (settings?.customTaxes && tax > 0) {
    try {
      const parsedTaxes = JSON.parse(settings.customTaxes);
      if (Array.isArray(parsedTaxes) && parsedTaxes.length > 1) {
        const totalTaxRate = parsedTaxes.reduce(
          (sum: number, t: any) => sum + (parseFloat(String(t.rate ?? '0')) || 0),
          0
        );
        if (totalTaxRate > 0) {
          customTaxRowsHtml = parsedTaxes
            .filter((t: any) => (parseFloat(String(t.rate ?? '0')) || 0) > 0 && t.name)
            .map((t: any) => {
              const r = parseFloat(String(t.rate));
              const part = (r / totalTaxRate) * tax;
              return `
                <div class="calc-row" style="font-size: ${is58mm ? '8.5px' : '9.5px'}; color: #444; padding-left: 8px;">
                  <span>• ${escapeXml(t.name)} (${r}%):</span>
                  <span>₹${part.toFixed(2)}</span>
                </div>
              `;
            })
            .join('');
        }
      }
    } catch {}
  }

  const is58mm = (settings?.printer_bill_paper_width === '58mm') || (settings?.paperWidth === '58mm');
  const paperWidthMm = is58mm ? 58 : 80;
  const bodyWidthMm = is58mm ? 50 : 74;
  const baseFontSize = is58mm ? '10px' : '11px';

  const receiptHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title>Receipt - Order #${orderNum}</title>
      <style>
        @page {
          size: ${paperWidthMm}mm auto;
          margin: 0mm ${is58mm ? '1mm' : '2mm'};
        }
        * {
          box-sizing: border-box;
        }
        body {
          font-family: 'JetBrains Mono', 'Courier New', Courier, monospace;
          width: ${bodyWidthMm}mm;
          max-width: ${bodyWidthMm}mm;
          margin: 0 auto;
          padding: 8px 2px 24px 2px;
          font-size: ${baseFontSize};
          line-height: 1.35;
          color: #000;
          background: #fff;
        }
        .center { text-align: center; }
        .right { text-align: right; }
        .bold { font-weight: bold; }
        .store-name {
          font-size: ${is58mm ? '14px' : '16px'};
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 2px;
        }
        .store-info {
          font-size: ${is58mm ? '9px' : '10px'};
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
          font-size: ${is58mm ? '9.5px' : '10.5px'};
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
          font-size: ${baseFontSize};
          margin: 4px 0;
        }
        th {
          font-size: ${is58mm ? '9px' : '10px'};
          font-weight: bold;
          text-align: left;
          padding-bottom: 3px;
          border-bottom: 1px dashed #000;
        }
        .calc-row {
          display: flex;
          justify-content: space-between;
          padding: 1.5px 0;
          font-size: ${baseFontSize};
        }
        .total-banner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: ${is58mm ? '13px' : '15px'};
          font-weight: 900;
          padding: 4px 0;
        }
        .footer {
          margin-top: 10px;
          text-align: center;
          font-size: ${is58mm ? '9px' : '10px'};
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
        ${order.description ? `
        <div style="margin-top: 2px; font-style: italic;">
          <span>Note:</span>
          <span>${escapeXml(order.description)}</span>
        </div>` : ''}
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
        <span>${settings?.taxCalculationType === 'reverse' ? 'Net Base Subtotal:' : 'Subtotal:'}</span>
        <span class="bold">₹${subtotal.toFixed(2)}</span>
      </div>

      <div class="calc-row">
        <span>${escapeXml(formatTaxLabel(settings, getStoreGlobalTaxRate(settings), tax))}${settings?.taxCalculationType === 'reverse' ? ' (Incl.)' : ''}:</span>
        <span class="bold">₹${tax.toFixed(2)}</span>
      </div>
      ${customTaxRowsHtml}

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

  printHtmlInIframe(receiptHtml);
}

/**
 * Utility to isolate HTML printing in an invisible sandbox iframe.
 */
export function printHtmlInIframe(html: string): void {
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
  doc.write(html);
  doc.close();

  iframe.contentWindow?.focus();
  setTimeout(() => {
    try {
      iframe.contentWindow?.print();
    } catch (e) {
      console.error('Thermal print failed:', e);
    } finally {
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 1000);
    }
  }, 350);
}

/**
 * Triggers a live test print for the Bill / Customer Tax Invoice layout.
 */
export function printTestThermalBill({
  config,
  storeProfile,
}: {
  config: {
    paperWidth: '80mm' | '58mm';
    headerTitle?: string;
    showLogo?: boolean;
    showAddress?: boolean;
    showGstin?: boolean;
    showCashier?: boolean;
    showTable?: boolean;
    showTaxes?: boolean;
    showPayments?: boolean;
    footerMsg?: string;
    showQr?: boolean;
  };
  storeProfile?: any;
}): void {
  const is58 = config.paperWidth === '58mm';
  const paperWidthMm = is58 ? 58 : 80;
  const bodyWidthMm = is58 ? 50 : 74;
  const baseFontSize = is58 ? '10px' : '11px';

  const storeName = storeProfile?.businessName || 'Velora Artisan Cafe';
  const headerTitle = config.headerTitle || 'TAX INVOICE';
  const address = storeProfile?.address || '102 High Street, Bandra West';
  const phone = storeProfile?.phone || '+91 98765 43210';
  const gstin = storeProfile?.gstin || '27AADCB2230M1Z2';
  const footerMsg = config.footerMsg || 'Thank you for dining with us! Please visit again.';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title>Test Bill Receipt (${config.paperWidth})</title>
      <style>
        @page { size: ${paperWidthMm}mm auto; margin: 0mm ${is58 ? '1mm' : '2mm'}; }
        * { box-sizing: border-box; }
        body {
          font-family: 'JetBrains Mono', 'Courier New', Courier, monospace;
          width: ${bodyWidthMm}mm;
          max-width: ${bodyWidthMm}mm;
          margin: 0 auto;
          padding: 8px 2px 20px 2px;
          font-size: ${baseFontSize};
          line-height: 1.35;
          color: #000;
          background: #fff;
        }
        .center { text-align: center; }
        .right { text-align: right; }
        .bold { font-weight: bold; }
        .header-title { font-size: 11px; font-weight: 800; letter-spacing: 1px; margin-bottom: 2px; }
        .store-name { font-size: ${is58 ? '13px' : '15px'}; font-weight: 900; text-transform: uppercase; }
        .store-info { font-size: ${is58 ? '8.5px' : '9.5px'}; color: #222; margin: 1px 0; }
        .divider { border-top: 1px dashed #000; margin: 5px 0; }
        .divider-double { border-top: 2px dashed #000; margin: 5px 0; }
        .meta-row { display: flex; justify-content: space-between; font-size: ${is58 ? '9px' : '10px'}; padding: 1px 0; }
        table { width: 100%; border-collapse: collapse; font-size: ${baseFontSize}; margin: 4px 0; }
        th { font-size: ${is58 ? '8.5px' : '9.5px'}; text-align: left; padding-bottom: 2px; border-bottom: 1px dashed #000; }
        .calc-row { display: flex; justify-content: space-between; padding: 1.5px 0; font-size: ${baseFontSize}; }
        .total-banner { display: flex; justify-content: space-between; align-items: center; font-size: ${is58 ? '12px' : '14px'}; font-weight: 900; padding: 3px 0; }
        .footer { margin-top: 8px; text-align: center; font-size: ${is58 ? '8.5px' : '9.5px'}; }
        .qr-placeholder { border: 1px dashed #000; padding: 6px; margin: 6px auto; width: 70px; text-align: center; font-size: 8px; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="center">
        <div class="header-title">${escapeXml(headerTitle)}</div>
        <div class="store-name">${escapeXml(storeName)}</div>
        ${config.showAddress ? `<div class="store-info">${escapeXml(address)}</div><div class="store-info">Tel: ${escapeXml(phone)}</div>` : ''}
        ${config.showGstin ? `<div class="store-info">GSTIN: ${escapeXml(gstin)}</div>` : ''}
      </div>

      <div class="divider-double"></div>

      <div class="meta-row">
        <span>TOKEN: <strong style="font-size: 12px;">#042</strong></span>
        <span>${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
      <div class="meta-row">
        <span>DATE: ${new Date().toLocaleDateString('en-GB')}</span>
        ${config.showTable ? `<span>TABLE: <strong>T-04 (Main)</strong></span>` : `<span>TYPE: <strong>Dine-In</strong></span>`}
      </div>
      ${config.showCashier ? `<div class="meta-row"><span>STAFF: Alex Morgan</span><span>BILL: #B-9981</span></div>` : ''}

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
          <tr>
            <td style="padding: 2px 0;">Hazelnut Cappuccino</td>
            <td style="text-align: center; padding: 2px 0;">x2</td>
            <td style="text-align: right; font-weight: bold; padding: 2px 0;">₹440.00</td>
          </tr>
          <tr>
            <td style="padding: 2px 0;">Truffle Parmesan Fries</td>
            <td style="text-align: center; padding: 2px 0;">x1</td>
            <td style="text-align: right; font-weight: bold; padding: 2px 0;">₹280.00</td>
          </tr>
          <tr>
            <td style="padding: 2px 0;">Blueberry Cheesecake</td>
            <td style="text-align: center; padding: 2px 0;">x1</td>
            <td style="text-align: right; font-weight: bold; padding: 2px 0;">₹260.00</td>
          </tr>
        </tbody>
      </table>

      <div class="divider"></div>

      <div class="calc-row">
        <span>Subtotal:</span>
        <span class="bold">₹980.00</span>
      </div>

      ${
        config.showTaxes !== false
          ? `
        <div class="calc-row">
          <span>CGST (2.5%):</span>
          <span>₹24.50</span>
        </div>
        <div class="calc-row">
          <span>SGST (2.5%):</span>
          <span>₹24.50</span>
        </div>
      `
          : ''
      }

      <div class="divider-double"></div>

      <div class="total-banner">
        <span>GRAND TOTAL:</span>
        <span>₹1029.00</span>
      </div>

      <div class="divider-double"></div>

      ${
        config.showPayments !== false
          ? `
        <div class="meta-row">
          <span>• Mode: <strong>UPI / QR (Paid)</strong></span>
          <span class="bold">₹1029.00</span>
        </div>
        <div class="meta-row" style="font-size: 8.5px; opacity: 0.8;">
          <span>Ref: UPI/260910042</span>
          <span>APPROVED</span>
        </div>
      `
          : ''
      }

      ${
        config.showQr !== false
          ? `
        <div class="qr-placeholder">
          [ SCAN TO PAY / FEEDBACK ]
        </div>
      `
          : ''
      }

      <div class="divider"></div>

      <div class="footer">
        <div class="bold">${escapeXml(footerMsg)}</div>
        <div style="margin-top: 3px; font-size: 8.5px; opacity: 0.7;">*** TEST PRINT PASS (${config.paperWidth}) ***</div>
      </div>
    </body>
    </html>
  `;

  printHtmlInIframe(html);
}

/**
 * Triggers a live test print for the KOT (Kitchen Order Ticket).
 */
export function printTestKOT({
  config,
  storeProfile,
}: {
  config: {
    paperWidth: '80mm' | '58mm';
    station?: string;
    showTable?: boolean;
    showServer?: boolean;
    showNotes?: boolean;
    showDietary?: boolean;
  };
  storeProfile?: any;
}): void {
  const is58 = config.paperWidth === '58mm';
  const paperWidthMm = is58 ? 58 : 80;
  const bodyWidthMm = is58 ? 50 : 74;
  const storeName = storeProfile?.businessName || 'Velora Cafe';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title>Kitchen Order Ticket (${config.paperWidth})</title>
      <style>
        @page { size: ${paperWidthMm}mm auto; margin: 0mm ${is58 ? '1mm' : '2mm'}; }
        * { box-sizing: border-box; }
        body {
          font-family: 'JetBrains Mono', 'Courier New', Courier, monospace;
          width: ${bodyWidthMm}mm;
          max-width: ${bodyWidthMm}mm;
          margin: 0 auto;
          padding: 8px 2px 20px 2px;
          font-size: 11px;
          line-height: 1.35;
          color: #000;
          background: #fff;
        }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .kot-banner {
          font-size: ${is58 ? '16px' : '18px'};
          font-weight: 900;
          text-align: center;
          padding: 4px;
          border: 2px solid #000;
          margin-bottom: 5px;
        }
        .divider-double { border-top: 2px dashed #000; margin: 5px 0; }
        .divider { border-top: 1px dashed #000; margin: 5px 0; }
        .meta-row { display: flex; justify-content: space-between; font-size: 10.5px; padding: 1.5px 0; }
        .item-row { display: flex; justify-content: space-between; align-items: flex-start; padding: 4px 0; border-bottom: 1px dotted #888; }
        .item-qty { font-size: ${is58 ? '14px' : '16px'}; font-weight: 900; min-width: 32px; }
        .item-name { font-size: ${is58 ? '12px' : '13px'}; font-weight: 800; flex: 1; }
        .instruction { font-size: 9.5px; font-style: italic; background: #eee; padding: 2px 4px; margin-top: 2px; display: inline-block; }
      </style>
    </head>
    <body>
      <div class="kot-banner">KOT #042</div>
      
      <div class="center" style="font-size: 11px; font-weight: bold; margin-bottom: 4px;">
        STATION: ${escapeXml(config.station || 'MAIN HOT KITCHEN')}
      </div>

      <div class="divider-double"></div>

      <div class="meta-row">
        <span>TIME: <strong>${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong></span>
        <span>DATE: ${new Date().toLocaleDateString('en-GB')}</span>
      </div>
      <div class="meta-row">
        ${config.showTable !== false ? `<span>TABLE: <strong style="font-size: 13px;">T-04 (Balcony)</strong></span>` : `<span>TYPE: <strong>Takeaway</strong></span>`}
        ${config.showServer !== false ? `<span>STEWARD: <strong>Alex</strong></span>` : `<span>ORDER: <strong>#9981</strong></span>`}
      </div>

      <div class="divider-double"></div>

      <div class="item-row">
        <span class="item-qty">x 2</span>
        <div class="item-name">
          ${config.showDietary !== false ? '🟢 ' : ''}Crispy Paneer Burger
          ${config.showNotes !== false ? '<div class="instruction">★ Note: Extra crisp patty, no mayo</div>' : ''}
        </div>
      </div>

      <div class="item-row">
        <span class="item-qty">x 1</span>
        <div class="item-name">
          ${config.showDietary !== false ? '🟢 ' : ''}Peri Peri Truffle Fries
          ${config.showNotes !== false ? '<div class="instruction">★ Note: Spicy dip on the side</div>' : ''}
        </div>
      </div>

      <div class="item-row" style="border-bottom: none;">
        <span class="item-qty">x 2</span>
        <div class="item-name">
          ${config.showDietary !== false ? '🟢 ' : ''}Classic Cold Brew
          ${config.showNotes !== false ? '<div class="instruction">★ Note: Oat milk, low sugar</div>' : ''}
        </div>
      </div>

      <div class="divider-double"></div>

      <div class="center" style="font-size: 9px; font-weight: bold; padding-top: 4px;">
        *** ${escapeXml(storeName)} • KITCHEN PREP SLIP (${config.paperWidth}) ***
      </div>
    </body>
    </html>
  `;

  printHtmlInIframe(html);
}

/**
 * Triggers a live test print for Item / Cup / Packaging Label.
 */
export function printTestItemLabel({
  config,
  storeProfile,
}: {
  config: {
    labelSize: '50x25' | '40x30' | 'continuous';
    showPrice?: boolean;
    showBarcode?: boolean;
    showDietary?: boolean;
    showToken?: boolean;
    note?: string;
  };
  storeProfile?: any;
}): void {
  const storeName = storeProfile?.businessName || 'Velora Cafe';
  const widthMm = config.labelSize === '40x30' ? 40 : 50;
  const heightMm = config.labelSize === '40x30' ? 30 : 25;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title>Item Sticker Label (${config.labelSize})</title>
      <style>
        @page { size: ${widthMm}mm ${heightMm}mm; margin: 1mm; }
        * { box-sizing: border-box; }
        body {
          font-family: 'JetBrains Mono', 'Courier New', Courier, monospace;
          width: ${widthMm - 2}mm;
          height: ${heightMm - 2}mm;
          margin: 0 auto;
          padding: 2px;
          font-size: 9px;
          line-height: 1.25;
          color: #000;
          background: #fff;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .title { font-size: 10px; font-weight: 900; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .store { font-size: 8px; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.8; }
        .barcode { font-family: 'Courier New', monospace; letter-spacing: 1px; font-size: 8px; font-weight: 900; margin: 1px 0; }
        .badge { border: 1px solid #000; font-size: 7.5px; padding: 0 2px; font-weight: bold; }
      </style>
    </head>
    <body>
      <div>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span class="store">${escapeXml(storeName)}</span>
          ${config.showToken !== false ? `<span class="badge">#TOKEN 42</span>` : ''}
        </div>
        <div class="title" style="margin-top: 1px;">
          ${config.showDietary !== false ? '🟢 ' : ''}Caramel Macchiato (L)
        </div>
        <div style="font-size: 8px; color: #333;">Customer: Priya S.</div>
      </div>

      <div>
        ${
          config.showBarcode !== false
            ? `
          <div class="center">
            <div class="barcode">||| | |||| | ||| |||| |</div>
            <div style="font-size: 7px;">SKU: VEL-CM-042</div>
          </div>
        `
            : ''
        }

        <div style="display: flex; justify-content: space-between; align-items: flex-end; font-size: 8.5px; font-weight: bold;">
          <span>${config.note ? escapeXml(config.note) : 'Fresh Brew'}</span>
          ${config.showPrice !== false ? `<span>₹240.00</span>` : ''}
        </div>
      </div>
    </body>
    </html>
  `;

  printHtmlInIframe(html);
}

