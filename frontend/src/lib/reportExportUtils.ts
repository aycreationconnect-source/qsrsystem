export interface ReportColumn {
  header: string;
  key: string;
  align?: 'left' | 'center' | 'right';
  format?: (value: any, row: any) => string;
}

export interface StoreProfileReportInfo {
  businessName?: string;
  cafeCode?: string;
  address?: string;
  city?: string;
  state?: string;
  phone?: string;
  gstin?: string;
}

export interface ExportReportOptions {
  fileName: string;
  reportTitle: string;
  dateRangeText: string;
  storeProfile?: StoreProfileReportInfo | null;
  columns: ReportColumn[];
  rows: any[];
  summaryRow?: Record<string, any>;
}

/**
 * Generates an Excel-compatible spreadsheet (.xls) file with top-centered Cafe metadata
 * and initiates automatic browser download.
 */
export function exportReportToXls(options: ExportReportOptions) {
  const { fileName, reportTitle, dateRangeText, storeProfile, columns, rows, summaryRow } = options;

  const cafeName = storeProfile?.businessName || 'Velora Cafe & POS';
  const cafeCode = storeProfile?.cafeCode || 'CF-001';
  const addressParts = [
    storeProfile?.address,
    storeProfile?.city,
    storeProfile?.state,
  ].filter(Boolean).join(', ');
  const contactParts = [
    storeProfile?.phone ? `Phone: ${storeProfile.phone}` : '',
    storeProfile?.gstin ? `GSTIN: ${storeProfile.gstin}` : '',
  ].filter(Boolean).join(' | ');

  const colCount = columns.length;

  const html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <!--[if gte mso 9]>
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>${escapeXml(reportTitle.substring(0, 30))}</x:Name>
              <x:WorksheetOptions>
                <x:DisplayGridlines/>
              </x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
      <![endif]-->
      <meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8"/>
      <style>
        .cafe-title { font-family: Arial, sans-serif; font-size: 16pt; font-weight: bold; text-align: center; color: #0f172a; padding: 10px; }
        .cafe-info { font-family: Arial, sans-serif; font-size: 10pt; text-align: center; color: #475569; padding: 3px; }
        .report-header { font-family: Arial, sans-serif; font-size: 13pt; font-weight: bold; text-align: center; color: #d97706; padding: 8px; }
        .report-meta { font-family: Arial, sans-serif; font-size: 9pt; text-align: center; color: #64748b; padding: 3px; }
        th.col-header { font-family: Arial, sans-serif; background-color: #1e293b; color: #ffffff; font-weight: bold; font-size: 10pt; border: 1px solid #cbd5e1; padding: 8px 6px; }
        td.cell { font-family: Arial, sans-serif; font-size: 9.5pt; border: 1px solid #e2e8f0; padding: 6px; color: #1e293b; }
        td.summary-cell { font-family: Arial, sans-serif; font-size: 10pt; font-weight: bold; background-color: #fef3c7; border: 1px solid #f59e0b; padding: 8px 6px; color: #78350f; }
        .align-left { text-align: left; }
        .align-center { text-align: center; }
        .align-right { text-align: right; }
      </style>
    </head>
    <body>
      <table>
        <!-- 1. Cafe Details At Top Center -->
        <tr><td colspan="${colCount}" class="cafe-title">${escapeXml(cafeName)}</td></tr>
        <tr><td colspan="${colCount}" class="cafe-info">${escapeXml(cafeCode)}${addressParts ? ' &bull; ' + escapeXml(addressParts) : ''}</td></tr>
        ${contactParts ? `<tr><td colspan="${colCount}" class="cafe-info">${escapeXml(contactParts)}</td></tr>` : ''}
        <tr><td colspan="${colCount}" class="report-header">${escapeXml(reportTitle)} &mdash; ${escapeXml(dateRangeText)}</td></tr>
        <tr><td colspan="${colCount}" class="report-meta">Generated On: ${escapeXml(new Date().toLocaleString())}</td></tr>
        <tr><td colspan="${colCount}" style="height: 14px;"></td></tr>

        <!-- 2. Table Header Row -->
        <tr>
          ${columns.map((col) => {
            const alignClass = col.align === 'right' ? 'align-right' : col.align === 'center' ? 'align-center' : 'align-left';
            return `<th class="col-header ${alignClass}">${escapeXml(col.header)}</th>`;
          }).join('')}
        </tr>

        <!-- 3. Table Data Rows -->
        ${rows.map((row, idx) => {
          const bg = idx % 2 === 1 ? 'style="background-color: #f8fafc;"' : '';
          return `
            <tr ${bg}>
              ${columns.map((col) => {
                const alignClass = col.align === 'right' ? 'align-right' : col.align === 'center' ? 'align-center' : 'align-left';
                const val = col.format ? col.format(row[col.key], row) : (row[col.key] ?? '');
                return `<td class="cell ${alignClass}">${escapeXml(String(val))}</td>`;
              }).join('')}
            </tr>
          `;
        }).join('')}

        <!-- 4. Grand Total Summary Row -->
        ${summaryRow ? `
          <tr>
            ${columns.map((col) => {
              const alignClass = col.align === 'right' ? 'align-right' : col.align === 'center' ? 'align-center' : 'align-left';
              const val = summaryRow[col.key] !== undefined ? summaryRow[col.key] : '';
              return `<td class="summary-cell ${alignClass}">${escapeXml(String(val))}</td>`;
            }).join('')}
          </tr>
        ` : ''}
      </table>
    </body>
    </html>
  `;

  const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName.endsWith('.xls') ? fileName : `${fileName}.xls`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Renders a clean printable report inside an isolated iframe with top-centered Cafe details
 * and triggers window.print(). Users can save as PDF or print physically.
 */
export function printReportToPdf(options: ExportReportOptions) {
  const { reportTitle, dateRangeText, storeProfile, columns, rows, summaryRow } = options;

  const cafeName = storeProfile?.businessName || 'Velora Cafe & POS';
  const cafeCode = storeProfile?.cafeCode || 'CF-001';
  const addressParts = [
    storeProfile?.address,
    storeProfile?.city,
    storeProfile?.state,
  ].filter(Boolean).join(', ');
  const contactParts = [
    storeProfile?.phone ? `Phone: ${storeProfile.phone}` : '',
    storeProfile?.gstin ? `GSTIN: ${storeProfile.gstin}` : '',
  ].filter(Boolean).join(' &bull; ');

  const printableHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title>${escapeXml(reportTitle)} - ${escapeXml(cafeName)}</title>
      <style>
        @page {
          size: auto;
          margin: 14mm 12mm;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          margin: 0;
          padding: 0;
          color: #0f172a;
          background: #ffffff;
          font-size: 11px;
          line-height: 1.4;
        }
        .header-container {
          text-align: center;
          margin-bottom: 20px;
          padding-bottom: 14px;
          border-bottom: 2px solid #e2e8f0;
        }
        .cafe-name {
          font-size: 20px;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 4px 0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .cafe-meta {
          font-size: 11px;
          color: #475569;
          margin: 2px 0;
        }
        .report-badge {
          display: inline-block;
          margin-top: 8px;
          padding: 4px 16px;
          background-color: #fef3c7;
          color: #92400e;
          border-radius: 9999px;
          font-size: 12px;
          font-weight: 700;
          border: 1px solid #fde68a;
        }
        .timestamp {
          font-size: 9px;
          color: #94a3b8;
          margin-top: 5px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }
        th {
          background-color: #f1f5f9;
          color: #0f172a;
          font-weight: 700;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border: 1px solid #cbd5e1;
          padding: 7px 8px;
        }
        td {
          border: 1px solid #e2e8f0;
          padding: 6px 8px;
          font-size: 10.5px;
        }
        tr:nth-child(even) td {
          background-color: #f8fafc;
        }
        .summary-row td {
          background-color: #fef3c7 !important;
          color: #78350f;
          font-weight: 800;
          border-top: 2px solid #f59e0b;
          border-bottom: 2px solid #f59e0b;
          font-size: 11px;
        }
        .align-left { text-align: left; }
        .align-center { text-align: center; }
        .align-right { text-align: right; }
        .font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
        
        .print-footer {
          margin-top: 25px;
          padding-top: 10px;
          border-top: 1px dashed #cbd5e1;
          display: flex;
          justify-content: space-between;
          font-size: 9px;
          color: #94a3b8;
        }
      </style>
    </head>
    <body>
      <div class="header-container">
        <h1 class="cafe-name">${escapeXml(cafeName)}</h1>
        <div class="cafe-meta"><strong>Code: ${escapeXml(cafeCode)}</strong>${addressParts ? ' &bull; ' + escapeXml(addressParts) : ''}</div>
        ${contactParts ? `<div class="cafe-meta">${contactParts}</div>` : ''}
        <div>
          <span class="report-badge">${escapeXml(reportTitle)} &bull; ${escapeXml(dateRangeText)}</span>
        </div>
        <div class="timestamp">Generated on: ${escapeXml(new Date().toLocaleString())}</div>
      </div>

      <table>
        <thead>
          <tr>
            ${columns.map((col) => {
              const alignClass = col.align === 'right' ? 'align-right' : col.align === 'center' ? 'align-center' : 'align-left';
              return `<th class="${alignClass}">${escapeXml(col.header)}</th>`;
            }).join('')}
          </tr>
        </thead>
        <tbody>
          ${rows.map((row) => `
            <tr>
              ${columns.map((col) => {
                const alignClass = col.align === 'right' ? 'align-right font-mono' : col.align === 'center' ? 'align-center' : 'align-left';
                const val = col.format ? col.format(row[col.key], row) : (row[col.key] ?? '');
                return `<td class="${alignClass}">${escapeXml(String(val))}</td>`;
              }).join('')}
            </tr>
          `).join('')}

          ${summaryRow ? `
            <tr class="summary-row">
              ${columns.map((col) => {
                const alignClass = col.align === 'right' ? 'align-right font-mono' : col.align === 'center' ? 'align-center' : 'align-left';
                const val = summaryRow[col.key] !== undefined ? summaryRow[col.key] : '';
                return `<td class="${alignClass}">${escapeXml(String(val))}</td>`;
              }).join('')}
            </tr>
          ` : ''}
        </tbody>
      </table>

      <div class="print-footer">
        <span>Confidential &bull; Generated by ${escapeXml(cafeName)} POS System</span>
        <span>Printed on ${escapeXml(new Date().toLocaleString())}</span>
      </div>
    </body>
    </html>
  `;

  // Create an iframe to cleanly render and print
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
  doc.write(printableHtml);
  doc.close();

  iframe.contentWindow?.focus();
  setTimeout(() => {
    try {
      iframe.contentWindow?.print();
    } catch (e) {
      console.error('Print failed:', e);
    } finally {
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 1000);
    }
  }, 400);
}

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
