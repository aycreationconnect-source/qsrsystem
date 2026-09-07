# 📊 Store Reports & Analytics System

The **Reports & Analytics System** in the QSR POS provides cafe owners and restaurant managers with real-time financial auditing, daily performance summaries, itemized order tracking, and export capabilities.

## 📑 Reports Suite

The reporting module is organized under the **Report** (`/reports`) section of the management console:

1. [**Total Summary Report**](total-summary-report.md) (`total-summary-report.md`)
   - Consolidated revenue, taxes, order counts, and ticket metrics.
   - Tender breakdown across Cash, Card, UPI, and Split payments.
   - Date-wise operational table with grand totals.

2. [**Order History Report**](order-history-report.md) (`order-history-report.md`)
   - Detailed ledger of every individual customer ticket.
   - Daily sequence order numbering (`#1, #2, #3...` resetting every day).
   - Interactive row-click **Order Details Modal** with itemized dishes, price breakdowns, and reprint capabilities.

3. [**Stock Summary & Inventory Linkage**](stock-summary-report.md) (`stock-summary-report.md`)
   - Stock movement ledger and recipe-based ingredient consumption tracking.
   - Threshold limits, replenishment alerts, and inventory history audit logs.

---

## 🎨 UI & UX Architecture

- **Contained Horizontal Scrolling**: On mobile devices, tablets, or compact screens, tables employ `overflow-x: auto` strictly within the table wrapper. The browser viewport/screen remains steady without any horizontal viewport drift.
- **Top-Centered Cafe Branding**: Both **Print PDF** and **Print XLS** exports embed the store's profile metadata centered at the top:
  - Business / Cafe Name
  - Store Code & Branch Address
  - Contact Telephone & GSTIN Identification
  - Report Title & Date Range Generated
- **Instant Thermal Bill Reprinting**: Any historical order can be reviewed in full and reprinted as a 58mm/80mm thermal receipt directly from the details modal.
