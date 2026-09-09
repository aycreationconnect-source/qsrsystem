# 🧾 Order History Report Documentation

## 1. Overview & Purpose
The **Order History Report** provides a line-item audit trail of every customer order recorded in the POS system. It supports quick searching, tender filtering, and status categorization. Clicking any order row opens a complete modal view showing dishes, quantities, unit prices, taxes, and split tender records.

---

## 2. Daily Sequential Numbering Architecture

Unlike global database auto-increment IDs (which grow indefinitely into `#105`, `#106`, etc.), kitchen tokens and customer receipts require simple daily numbers that reset every day at midnight:
- Orders restart each calendar day at `#1`, `#2`, `#3...`
- The system resolves the daily sequential number via `buildDailyOrderNumberMap()` from `lib/orderUtils.ts` or the backend `dailyOrderNumber` attribute.
- The UI presents both the Daily Order # (primary badge) and the System Reference ID (secondary mono label).

---

## 3. Interactive Order History Table

The table renders with `overflow-x: auto` on its container so horizontal scroll is strictly contained within the table:

| Column | Content | Description |
| :--- | :--- | :--- |
| **Order #** | `#{dailySeq}` (Badge) + `(ID #{id})` | Daily token sequence number and database ID |
| **Date & Time** | `DD Mon YYYY` & `HH:MM AM/PM` | Exact local timestamp of transaction |
| **Items Summary** | Dish names & quantities preview | Highlights top ordered items and remaining item count |
| **Tender** | Badge (`Cash`, `UPI`, `Card`, `Split`) | Payment method used |
| **Subtotal** | `₹{subtotal}` | Sum of items before tax |
| **Tax** | `₹{tax}` | Tax amount |
| **Total** | `₹{total}` | Final charged bill |
| **Status** | Badge (`Completed`, `Partially Paid`) | Payment and order completion status |
| **Action** | **View** Button | Opens the complete Order Details Modal |

---

## 4. Order Details Modal Breakdown

When an owner or cashier clicks an order row or the **View** button:

1. **Top Center Cafe Branding**:
   - Cafe Business Name
   - Cafe Code & Branch Address
   - Contact Phone & GSTIN
2. **Order Metadata Banner**:
   - Daily Order # (`#5`) & System ID (`#105`)
   - Order Date and exact timestamp
   - Status badge (`Completed` / `Partially Paid`)
   - Payment method badge (`Cash`, `UPI`, `Card`, `Split`)
3. **Itemized Dishes Table**:
   - Item sequence #
   - Dish Name and dietary type badge (Veg / Non-Veg)
   - Ordered Quantity
   - Unit Price
   - Line Item Total
4. **Financial Summary**:
   - Subtotal
   - Taxes & GST
   - Total Bill Amount
   - Paid Amount & Balance Due (if partially settled)
5. **Tender Logs**:
   - Details of each payment tender transaction (method, reference code, amount)
6. **Actions**:
   - **Print Receipt**: Launches a printable 58mm/80mm thermal receipt formatted for counter printers.
   - **Close**: Dismisses modal.

---

## 5. Exporting Order History (PDF & XLS)

- **Print PDF**: Generates a clean printable table of all filtered orders with the Cafe's details centered at the top.
- **Print XLS**: Exports all columns to an Excel-compatible spreadsheet (`.xls`), including the centered header metadata rows and totals row.
