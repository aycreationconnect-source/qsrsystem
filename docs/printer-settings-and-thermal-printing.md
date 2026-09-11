# 🖨️ POS Printer Settings & Live Thermal Preview System

## 📌 Overview
The **POS Printer Settings & Live Thermal Preview System** allows restaurant owners, cafe managers, and cashiers to configure thermal printing preferences with real-time visual fidelity and instant physical test prints. 

The feature supports three core restaurant printing workflows:
1. **🧾 Bill Print**: Customer receipts, tax invoices, and payment tokens.
2. **🍳 KOT Print**: Kitchen Order Tickets, station routing, and chef preparation slips.
3. **🏷️ Item Print**: Packaging stickers, cup labels, and retail barcodes.

---

## 📐 Default Printer Page & Roll Formats

### 1. Default Page Format: 80mm Standard POS Thermal Roll
- **Industry Standard**: 80mm (3 1/8 inches) width thermal rolls are the standard across all commercial countertop POS printers (e.g. Epson TM-T82/T88, TVS RP3200, Posiflex, Citizen, Star Micronics, NGX).
- **Printable Area**: 72mm – 74mm printable line width.
- **Font Sizing**: Monospace 11px font with 42–48 characters per line.
- **Auto-Cutter**: Fully compatible with partial and full guillotine cut commands.

### 2. 58mm Compact Mini / Mobile Bluetooth Roll
- **Portability**: Used for handheld wireless POS terminals (Sunmi, Pine Labs, Mswipe, Verifone), mobile belt printers, and food trucks.
- **Printable Area**: 48mm – 50mm printable line width.
- **Font Sizing**: Monospace 10px / 9.5px font with 32 characters per line.

---

## 📑 Detailed Category Capabilities

### 1. 🧾 Bill Print (Customer Receipt / Tax Invoice)
| Feature | Description | Default |
| :--- | :--- | :--- |
| **Paper Width** | Toggle between **80mm** (Standard POS) and **58mm** (Compact Mini) | `80mm` |
| **Invoice Header Title** | Top banner title text (e.g. `TAX INVOICE`, `CASH RECEIPT`, `RETAIL BILL`) | `TAX INVOICE` |
| **Show Brand / Logo** | Prints cafe brand name and outlet code badge | `Enabled` |
| **Show Address & Contact** | Outlet street address, city, state, and phone number | `Enabled` |
| **Show GSTIN / Tax No** | Statutory GST identification number | `Enabled` |
| **Show Table & Section** | Dining table identifier (e.g. `T-04 (Main Dining)`) or `Takeaway` | `Enabled` |
| **Show Cashier / Staff** | Biller / cashier username and reference token | `Enabled` |
| **Itemized Breakdown** | Dish name, item rate, quantity, and line total | `Enabled` |
| **Show Taxes & CGST/SGST** | Itemized tax rates and total tax breakdown | `Enabled` |
| **Payment Breakdown** | Payment mode (Cash, UPI QR, Card), transaction reference, and change | `Enabled` |
| **Payment / Feedback QR** | Thermal QR box for UPI QR payment or Google Reviews / feedback | `Enabled` |
| **Receipt Footer Note** | Custom greeting, WiFi password, feedback URL, or return policy | *"Thank you for dining with us! Please visit again."* |
| **Copies to Print** | `1 Copy` (Customer) or `2 Copies` (Customer + Merchant Copy) | `1 Copy` |
| **Auto-Print on Checkout** | Automatically triggers print dialog upon order payment | `Disabled` |

---

### 2. 🍳 KOT Print (Kitchen Order Ticket / Chef Prep Slip)
| Feature | Description | Default |
| :--- | :--- | :--- |
| **Paper Width** | Toggle between **80mm** (Kitchen printer) and **58mm** (Bar printer) | `80mm` |
| **Station Routing** | Destination routing: `All Stations`, `Hot Kitchen`, `Beverage Bar`, `Bakery & Grill` | `All Stations` |
| **KOT Token Banner** | High-visibility, high-contrast `#KOT-042` banner for chef line | `Enabled` |
| **Show Table & Area** | Prominent table identifier for food runners and expeditors | `Enabled` |
| **Show Steward / Waiter** | Identifies the waitstaff who took the order | `Enabled` |
| **Bold Large Quantities** | High-visibility quantity font (e.g. **`x2`**, **`x5`**) readable from 2 meters away | `Enabled` |
| **Preparation Notes** | Highlighted callouts for special instructions (e.g. *"Less spicy"*, *"No mayo"*) | `Enabled` |
| **Dietary Indicators** | Veg (`🟢`) and Non-Veg (`🔴`) classification badges | `Enabled` |
| **KOT Copies** | `1 Copy` (Kitchen) or `2 Copies` (Kitchen + Bar split) | `1 Copy` |
| **Auto-Print on Punch** | Sends ticket to kitchen immediately when cashier punches order | `Enabled` |

---

### 3. 🏷️ Item Print (Stickers, Cup Labels & Barcodes)
| Feature | Description | Default |
| :--- | :--- | :--- |
| **Label Dimensions** | `50mm x 25mm` (Drink cup / box sticker), `40mm x 30mm` (Price tag), or `Continuous Strip` | `50mm x 25mm` |
| **Show Price (₹ MRP)** | Item retail selling price | `Enabled` |
| **Show Barcode / SKU** | High-density 1D barcode lines and SKU code for retail scanning | `Enabled` |
| **Dietary Symbol** | Food safety FSSAI green/red indicator dot | `Enabled` |
| **Token & Customer Name** | Token number and customer name for takeout drink cups (Starbucks/Boba style) | `Enabled` |
| **Label Subtext / Note** | Freshness note (e.g. *"Consume within 2 hrs"*, *"Store in cool place"*) | *"Freshly Brewed & Prepared"* |

---

## 🖥️ Real-Time Live Thermal Preview Canvas

### Visual Layout & Behavior
- **Textured Paper Canvas**: Realistic `#fdfdfd` thermal paper with subtle drop shadows and serrated top/bottom tear edges.
- **Dynamic Width Adjustment**:
  - Selecting **80mm** expands the canvas to 280px (simulating full receipt roll width).
  - Selecting **58mm** contracts the canvas to 220px (simulating compact mobile rolls).
- **Reactive Data Binding**:
  - Typing into the **Header Title** or **Footer Note** fields updates the text on the preview paper in real time.
  - Toggling any checkbox (e.g. Logo, GSTIN, Staff, Table, Taxes, QR) immediately shows or hides that section on the preview.
  - Switching between **Bill Print**, **KOT Print**, and **Item Print** tabs instantly shifts the canvas to the corresponding slip template.

---

## 🖨️ Physical Test Print Engine (`thermalPrintUtils.ts`)

### Isolated Iframe Sandbox Architecture
To ensure physical printing works seamlessly without modal trapping, popup blockers, or browser URL header/footer contamination:
1. A hidden DOM `iframe` sandbox is dynamically generated.
2. Complete standalone HTML is injected with precise CSS `@page` media rules:
   ```css
   @page {
     size: 80mm auto; /* Or 58mm auto */
     margin: 0mm 2mm;
   }
   body {
     font-family: 'JetBrains Mono', 'Courier New', Courier, monospace;
     width: 74mm;     /* 50mm for 58mm rolls */
     margin: 0 auto;
     color: #000;
     background: #fff;
   }
   ```
3. `iframe.contentWindow.print()` triggers the system print spooler directly.
4. The iframe is cleanly removed from the DOM after print execution completes.

### Available Test Print Handlers
- `printTestThermalBill({ config, storeProfile })`: Sends a complete sample customer tax invoice to the physical printer.
- `printTestKOT({ config, storeProfile })`: Prints a kitchen prep slip with large tokens and notes.
- `printTestItemLabel({ config, storeProfile })`: Prints a calibrated adhesive sticker or barcode label.

---

## 🗄️ Database Storage & Configuration Keys
All printer settings are stored in the database's key-value `Setting` table via `settingsApi.saveSettings(payload)`. No database migrations or schema restarts are needed.

| Configuration Key | Data Type | Default Value | Description |
| :--- | :--- | :--- | :--- |
| `printer_default_paper_width` | `'80mm' \| '58mm'` | `'80mm'` | System-wide default thermal roll format |
| `printer_bill_paper_width` | `'80mm' \| '58mm'` | `'80mm'` | Bill receipt roll width |
| `printer_bill_header_title` | `string` | `'TAX INVOICE'` | Bill top title text |
| `printer_bill_show_logo` | `'true' \| 'false'` | `'true'` | Show brand badge in bill header |
| `printer_bill_show_address` | `'true' \| 'false'` | `'true'` | Show outlet address and phone |
| `printer_bill_show_gstin` | `'true' \| 'false'` | `'true'` | Show statutory GSTIN number |
| `printer_bill_show_cashier` | `'true' \| 'false'` | `'true'` | Show biller name and bill reference |
| `printer_bill_show_table` | `'true' \| 'false'` | `'true'` | Show dining table name |
| `printer_bill_show_taxes` | `'true' \| 'false'` | `'true'` | Show CGST / SGST tax calculation rows |
| `printer_bill_show_payments` | `'true' \| 'false'` | `'true'` | Show payment breakdown (Cash, UPI, Card) |
| `printer_bill_footer_msg` | `string` | `'Thank you...'` | Custom footer note text |
| `printer_bill_show_qr` | `'true' \| 'false'` | `'true'` | Show UPI scan & pay / feedback QR box |
| `printer_bill_copies` | `'1' \| '2'` | `'1'` | Copies printed per transaction |
| `printer_bill_auto_print` | `'true' \| 'false'` | `'false'` | Auto-trigger print upon checkout |
| `printer_kot_paper_width` | `'80mm' \| '58mm'` | `'80mm'` | Kitchen ticket roll width |
| `printer_kot_station` | `string` | `'All Stations'` | Destination kitchen station routing |
| `printer_kot_show_table` | `'true' \| 'false'` | `'true'` | Show table name on KOT |
| `printer_kot_show_server` | `'true' \| 'false'` | `'true'` | Show steward / waiter name on KOT |
| `printer_kot_show_notes` | `'true' \| 'false'` | `'true'` | Highlight preparation instructions |
| `printer_kot_show_dietary` | `'true' \| 'false'` | `'true'` | Show Veg / Non-Veg dots |
| `printer_kot_auto_print` | `'true' \| 'false'` | `'true'` | Auto-print KOT on order punch |
| `printer_kot_copies` | `'1' \| '2'` | `'1'` | KOT copies (1 or 2) |
| `printer_item_label_size` | `'50x25' \| '40x30' \| 'continuous'` | `'50x25'` | Adhesive label dimensions |
| `printer_item_show_price` | `'true' \| 'false'` | `'true'` | Show item retail price (₹ MRP) |
| `printer_item_show_barcode` | `'true' \| 'false'` | `'true'` | Show 1D barcode and SKU lines |
| `printer_item_show_dietary` | `'true' \| 'false'` | `'true'` | Show dietary classification dot |
| `printer_item_show_token` | `'true' \| 'false'` | `'true'` | Show order token and customer name |
| `printer_item_note` | `string` | `'Freshly Brewed...'` | Custom subtext note on label |

---

## 🛠️ Hardware Setup & Troubleshooting Guide

### 1. Windows USB Thermal Printer Setup
1. Connect the USB printer to the POS terminal.
2. Install the manufacturer's thermal print driver (e.g. *Epson Advanced Printer Driver*, *TVS POS Driver*, or *Generic / Text Only*).
3. In **Windows Printers & Scanners**, right-click the printer $\rightarrow$ **Printer Properties** $\rightarrow$ **Device Settings**:
   - Set **Paper Size** to `80 x 297 mm` (or `58 x 297 mm`).
   - Set **Page Cut Type** to `Partial Cut` or `Docum Cut`.
4. In Chrome/Edge print dialog, ensure **Margins** is set to **None** or **Minimum**, and **Headers and Footers** is **Unchecked**.

### 2. Bluetooth Mini Printer Setup
1. Pair the Bluetooth thermal printer via Windows Bluetooth Settings.
2. The virtual COM/SPP port or driver will appear in Windows Devices.
3. In **Printer Settings**, select **58mm Compact Mini** paper format.
4. Click **Test Print** to verify formatting alignment.
