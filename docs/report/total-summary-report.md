# 📊 Total Summary Report Documentation

## 1. Overview & Purpose
The **Total Summary Report** aggregates store transactions across specified date ranges (e.g. *Today*, *Yesterday*, *Last 7 Days*, *Last 30 Days*, *This Month*, *All Time*, or *Custom*). It provides the owner with an immediate high-level picture of financial health, tax liability, and payment method popularity.

---

## 2. Key Metrics & Calculations

| Metric | Calculation / Source | Purpose |
| :--- | :--- | :--- |
| **Total Revenue** | `∑ Order.total` across filtered orders | Gross money taken across all tender methods including tax. |
| **Total Orders** | Count of distinct completed orders | Overall customer transaction volume. |
| **Total Tax / GST** | `∑ Order.tax` across filtered orders | Tax liability accrued during the period for filing. |
| **Average Order Value (AOV)** | `Total Revenue / Total Orders` | Average spend per customer ticket. |
| **Cash Tender** | `∑ Cash payments` | Physical currency received in drawer. |
| **Card Tender** | `∑ Card payments` | POS terminal card swiped collections. |
| **UPI / Online** | `∑ UPI payments` | Dynamic QR code / digital collections. |
| **Split / Other** | `∑ Split payment lines` | Multi-tender transaction amounts. |

---

## 3. Date-Wise Aggregated Table Format

The table organizes transactions into local calendar days (ordered descending by date):

| Column | Description | Alignment |
| :--- | :--- | :--- |
| **Date** | Formatted local date (e.g., `07 Sep 2026`) | Left |
| **Orders** | Number of orders settled on that calendar date | Center |
| **Subtotal** | Net item sales before tax | Right |
| **Tax** | Total taxes collected | Right |
| **Cash** | Cash received | Right |
| **Card** | Card swipe transactions | Right |
| **UPI** | UPI digital transactions | Right |
| **Split/Other** | Multi-tender / auxiliary collections | Right |
| **Net Sales** | Final settlement total | Right |
| **AOV** | Average Order Value for that date | Right |

### Grand Total Footer
The table ends with a highlighted **Grand Total** row summarizing the entire selected date interval.

---

## 4. Export & Print Architecture

### A. Print PDF
- Triggered by the **Print PDF** button on the action bar.
- Uses clean, responsive `@media print` styling inside an isolated sandbox iframe.
- **Top Center Header**:
  - Store Name (e.g. `THE URBAN BISTRO`)
  - Cafe Code & Address (`CF-NAG-001 • Nagpur, Maharashtra`)
  - Phone & GSTIN (`Phone: 9876543210 • GSTIN: 27AAAAA0000A1Z5`)
  - Report Badge & Date Range (`Total Summary & Sales Report • 01 Sep 2026 - 07 Sep 2026`)
  - Generation Timestamp

### B. Print XLS (Excel Download)
- Triggered by the **Print XLS** button.
- Generates an XML/HTML spreadsheet (`.xls`) with `application/vnd.ms-excel` MIME.
- Merges columns `1` to `10` across rows 1 to 4 with `text-align: center` to place Cafe metadata prominently at the top.
- Directly opens in Microsoft Excel, Google Sheets, or LibreOffice Calc with formatted numeric cells.
