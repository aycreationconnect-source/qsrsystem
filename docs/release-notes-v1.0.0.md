# 🚀 Velora QSR POS System — Release Notes v1.0.0

**Release Tag:** `v1.0.0`  
**Milestone:** Build 1 — General Availability (GA)  
**Release Date:** September 2026  
**Target Platform:** Windows 10 / Windows 11 (Offline-First Standalone Terminal)  
**Distribution Bundle:** `Build Release/qsr-pos-v1.0.0-windows/`  

---

## 🌟 Executive Overview: What We Are Serving

The **Velora QSR POS System v1.0.0** is an enterprise-grade, offline-first restaurant management and point-of-sale platform specifically architected for cafes, quick-service restaurants (QSR), cloud kitchens, and dine-in bistros. 

In hospitality, every second at the billing counter matters. A dropped internet connection or cloud latency can stall counter lines and frustrate guests. **Velora v1.0.0 eliminates cloud dependency for daily operations** by running an ultra-responsive local engine directly on the store terminal. It delivers instant 0ms billing, table management, live kitchen order ticket (KOT) routing, recipe-level inventory tracking, split payments, thermal receipt printing, automated daily disaster recovery, and dynamic multi-cafe database provisioning.

---

## 📦 What We Provide: Core System Modules

```
┌────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   QSR POS SYSTEM v1.0.0                                        │
├───────────────────────────────┬────────────────────────────────┬───────────────────────────────┤
│  ⚡ POS Billing Terminal      │  🍽️ Visual Table Management    │  🍳 KOT Kitchen Routing       │
│  - Full-card tap-to-add       │  - Section floor plan grids    │  - Multi-batch KOT dispatch   │
│  - Tactile touch feedback     │  - Live status (Free/Busy/Bill)│  - Item-level kitchen notes   │
│  - In-cart quantity badges    │  - Real-time running timers    │  - Automatic stock deduction  │
│  - Instant catalog search     │  - Ad-hoc temporary tables     │  - Cancel/edit stock reversal │
├───────────────────────────────┼────────────────────────────────┼───────────────────────────────┤
│  📦 Recipe Inventory Engine   │  💳 Payments, Taxes & Discount │  🖨️ Thermal Printing Engine  │
│  - Raw ingredient tracking    │  - Fixed & % bill discounts    │  - 58mm & 80mm ESC/POS        │
│  - Recipe dish auto-deduct    │  - Custom charges & packaging  │  - Printable guest receipts   │
│  - Real-time stock warnings   │  - Multi-tender split payments │  - Chef-tailored kitchen slips│
│  - Total asset valuation      │  - Customer credit settlement  │  - Customizable brand headers │
├───────────────────────────────┼────────────────────────────────┼───────────────────────────────┤
│  📊 Business Analytics Suite  │  👥 Customer & Loyalty Ledger  │  🛡️ Disaster Recovery & Sync  │
│  - Total revenue KPIs         │  - Full customer directory     │  - Auto-dump mysqldump engine │
│  - Dish sales ranking         │  - Total spend & visit ledger  │  - 30-day automated retention │
│  - Custom calendar picker     │  - Outstanding credit balances │  - Google Drive cloud mirror  │
│  - Paginated audit exports    │  - Role-based staff PIN access │  - Dynamic cafe DB onboarding │
└───────────────────────────────┴────────────────────────────────┴───────────────────────────────┘
```

---

### 1. ⚡ High-Velocity Counter Billing Terminal
- **Streamlined Tap-to-Add Cards:** Eliminated cluttered inline stepper buttons. Tapping anywhere on a food card instantly punches the item into the active cart with subtle tactile scale feedback (`active:scale-[0.98]`).
- **High-Visibility Cart Badges:** Items in the active cart display a vibrant amber counter badge `(x{qty})` and highlighted border ring directly on the catalog grid.
- **Categorization & Smooth Transitions:** Dynamic category sidebar with smooth view transitions (`document.startViewTransition` and `.animate-fade-in-up`), auto-scroll-to-top, and FSSAI dietary badges (Veg, Non-Veg, Egg, Vegan).
- **Cart Management Drawer:** Line-item quantity increments/decrements, direct dish cooking notes (e.g. *"less spicy"*, *"extra cheese"*), item removal, and live order summary.

### 2. 🍽️ Dine-In Floor Plan & Table Terminal
- **Interactive Floor Plan:** Tables arranged by custom dining sections (e.g., *Main Hall*, *AC Dining*, *Rooftop Garden*, *Patio Lounge*).
- **Live Status Color Spectrum:**
  - 🟢 **Available (Emerald):** Ready for walk-in or phone reservations.
  - 🟠 **Occupied (Amber):** Active dining session with live elapsed timer, item count, and running bill.
  - 🔵 **Billed (Blue):** Final invoice printed, awaiting payment settlement.
  - 🟣 **Reserved (Purple):** Reserved table held for incoming guests.
- **Instant Table Switching & Ticket Linkage:** Tap any table to inspect or append items to its active ticket, switch tables, or merge tickets seamlessly.
- **Ad-Hoc Temporary Tables:** Create on-the-fly temporary tables (e.g. *Extra T-101*) for peak rush hours without modifying the master dining layout.

### 3. 🍳 Kitchen Order Ticket (KOT) Lifecycle
- **Batch Dispatching:** Tap **"Send KOT"** to dispatch only un-fired items directly to the kitchen, stamping them with unique KOT batch numbers and timestamps.
- **Kitchen Preparation Notes:** Custom preparation instructions printed on kitchen tickets to eliminate order miscommunication.
- **Automated Recipe Stock Deduction:** The moment a KOT is dispatched, all corresponding raw ingredients in the recipe are deducted from inventory in real time.
- **Stock Reversal on Cancellation:** If a customer cancels a dish or a table session is cleared, deducted inventory stocks are automatically reverted and restored back to the warehouse.

### 4. 📦 Recipe-Level Inventory & Warehouse Control
- **Raw Material Catalog:** Track flour, milk, cheese, coffee beans, syrups, and packaging boxes with units (`kg`, `g`, `L`, `ml`, `pcs`), purchase costs, and reorder safety thresholds.
- **Menu Recipe Linkage:** Map finished dishes to exact ingredient portions (e.g., 1 Cappuccino = 18g espresso beans + 180ml whole milk + 1 takeaway cup).
- **Low Stock Tooltip Badges:** Visual alert badges on the POS food card warning cashiers if ingredients are insufficient before punching an order.
- **Inventory Health Metrics:** Real-time dashboard showing Total Raw Items, Low Stock Warnings, Out of Stock Alerts, and Total Inventory Asset Valuation (`stock * costPerUnit`).

### 5. 💳 Dynamic Checkout, Split Payments & Tax Engine
- **Flexible Discounts:** Apply discounts either as a **Percentage (%)** or **Fixed Amount (₹)** with portal-anchored dropdowns that prevent UI clipping.
- **Custom Charges:** Configure packaging charges, delivery fees, or service charges at checkout.
- **Compliant Tax Engine:** Configurable GST/VAT calculations with itemized CGST and SGST receipt breakdowns.
- **Multi-Tender Split Payments:** Accept mixed payment tenders on a single bill (e.g., ₹500 Cash + ₹750 UPI / QR Code + ₹300 Card).
- **Customer Credit Ledger:** Allow regular patrons or corporate accounts to purchase on credit ("Pay Later"), tracking running balances in their customer profile.

### 6. 🖨️ ESC/POS Thermal Printing Suite
- **Hardware Agnostic:** Native support for both standard **58mm (2-inch)** and **80mm (3-inch)** thermal receipt printers.
- **Customer Receipts:** Branded printouts featuring cafe logo, custom header, order details, tax breakdown, payment method, and custom footer note.
- **Chef-Focused KOT Slips:** High-contrast, clean kitchen slips highlighting table number, server name, timestamp, and dish prep instructions.
- **Print Preview & Testing:** Built-in receipt testing tools in Store Settings.

### 7. 📊 Reports & Business Intelligence Suite
- **Total Summary:** Sales velocity, net revenue, total orders, average ticket size, and payment tender breakdown (Cash vs UPI vs Card).
- **Order History Ledger:** Full searchable audit trail of every past transaction with line-item inspection, reprint invoice, and payment status filters.
- **Stock & Inventory Report:** Stock health status (`GOOD`, `LOW`, `OUT`), threshold tracking, and inventory valuation.
- **Menu Item-Wise Report:** Dish sales ranking, quantity sold, total dish revenue, average selling price, and revenue share %.
- **Custom Calendar Date Picker:** Intuitive calendar popover with presets (`Today`, `Past 7 Days`, `Past 30 Days`) and customizable date ranges.
- **Unified Pagination:** Clean table pagination with configurable rows per page (`10`, `15`, `25`, `50`).

### 8. 🛡️ Dynamic Cafe Onboarding & Automated Disaster Recovery
- **Dynamic Cafe Database Provisioning (`setup.bat`):** Store technicians specify the cafe name (e.g., `mocha_bliss`), automatically creating the MySQL database and syncing all Prisma models before the app starts.
- **Single-Port Production Serving (`backend/src/main.ts`):** The NestJS backend serves the compiled React/Vite frontend bundle directly on port 3000, eliminating CORS issues and dual-server complexity.
- **1-Click POS Launcher (`start.bat`):** Checks MySQL service status, boots the POS engine, and opens Microsoft Edge in dedicated fullscreen application mode (`--app=http://localhost:3000`).
- **Crash-Safe Automated Backup Engine (`backup-db.js`):** Executes point-in-time database dumps with `--single-transaction --quick --routines --triggers --hex-blob`, auto-purges files older than 30 days, and mirrors snapshots to Google Drive.

---

## 🗂️ What Is Provided in the Release Package

The official release artifact is bundled in:  
📁 **`Build Release/qsr-pos-v1.0.0-windows/`**

```
qsr-pos-v1.0.0-windows/
├── backend/
│   ├── dist/                   # Pre-compiled NestJS server binaries
│   ├── prisma/schema.prisma    # Complete database schema definitions
│   ├── scripts/
│   │   ├── init-db.js          # Dynamic database creator & .env updater
│   │   └── backup-db.js        # Crash-safe mysqldump backup engine
│   ├── package.json            # Node.js dependencies manifest
│   ├── .env                    # Production configuration
│   └── .env.example            # Environment template guide
├── frontend/
│   └── dist/                   # Pre-compiled Vite production static UI bundle
│       ├── index.html          # SPA entry point
│       └── assets/             # Bundled JS, CSS, and optimized media
├── backups/                    # Auto-created snapshot repository
│   └── .gitkeep
├── setup.bat                   # 1-Click Initial Setup & Database Provisioner
├── start.bat                   # 1-Click Daily Store Launcher (Edge App Mode)
├── backup-now.bat              # 1-Click Instant Manual Backup Snapshot
├── README-INSTALL.txt          # Store Manager Field Operations Manual
└── RELEASE_NOTES.md            # Official Product Specification & Changelog
```

---

## 💻 System Requirements & Hardware Guidelines

| Component            | Minimum Specification                  | Recommended Specification                   |
| :------------------- | :------------------------------------- | :------------------------------------------ |
| **Operating System** | Windows 10 (64-bit) Home/Pro           | Windows 11 (64-bit) Pro                     |
| **Processor**        | Intel Core i3 / AMD Ryzen 3 (2.0 GHz+) | Intel Core i5 / AMD Ryzen 5 or higher       |
| **Memory (RAM)**     | 4 GB                                   | 8 GB or 16 GB                               |
| **Storage**          | 20 GB free SSD space                   | 128 GB+ NVMe SSD                            |
| **Display**          | 1024 × 768 Touchscreen                 | 1920 × 1080 (1080p) Touchscreen Terminal    |
| **Runtime**          | Node.js LTS v18, v20, or v22           | Node.js LTS v20.x                           |
| **Database**         | MySQL Server 8.0+ or MariaDB 10.5+     | MySQL Server 8.0.x (Local service)          |
| **Receipt Printer**  | 58mm Thermal USB Printer               | 80mm Thermal USB / Ethernet ESC/POS Printer |
| **Cash Drawer**      | RJ11 interface connected to printer    | RJ11 interface connected to 80mm printer    |

---

## 📝 Detailed Changelog — Milestone v1.0.0

### Added
- **Dynamic Cafe Database Initializer (`init-db.js`):** Accepts custom cafe database names, sanitizes MySQL identifiers, creates the database if missing, and updates `.env` connection strings.
- **Single-Port Production Mode:** NestJS directly serves `frontend/dist`, handles SPA route fallback (`index.html`), and rewrites `/api/*` routes.
- **Automated Database Backup Engine (`backup-db.js`):** Auto-locates `mysqldump.exe`, dumps database snapshots with crash-safe flags, maintains `backup_latest.sql`, enforces 30-day retention, and syncs to Google Drive.
- **1-Click Launchers:** Created `setup.bat`, `start.bat`, and `backup-now.bat` for turnkey Windows deployment.
- **Release Packager (`scripts/package-release.js`):** Automated compilation and bundling script generating `Build Release/qsr-pos-v1.0.0-windows/`.
- **Inventory KOT Stock Automation:** Deducts recipe raw ingredients when KOTs are dispatched; restores inventory when KOT items or tables are cancelled.
- **Reports Module Suite:** Built 4 dedicated analytics modules (`Total Summary`, `Order History`, `Inventory Health`, `Menu Item Wise`) with interactive date range picker and unified pagination.
- **Ad-Hoc Temporary Tables:** 1-tap temporary dining tables for overflow seating during peak hours.

### Enhanced
- **High-Visibility Cart Badges:** Replaced inline `[- qty +]` card buttons with full-card click-to-cart, active touch cues, and vibrant amber `(x{qty})` badges.
- **Category Transitions:** Integrated `document.startViewTransition` with `@keyframes fadeInSlideUp` for fluid menu switching.
- **Client-Side Image Compression:** Added HTML Canvas image compression in Store Profile modal (downscales logos to 512×512 ~50KB), expanding upload limit to 10MB without 413 payload errors.
- **Staff Profile & Navigation:** Streamlined top navigation bar, added direct staff logout in category rail, and positioned store profile launch directly in the brand monogram badge.
- **Low Stock Inspection Tooltips:** Interactive hover tooltips displaying exact raw ingredient shortages for recipe dishes.

### Fixed
- **Checkout Modal Dropdown Clipping:** Fixed discount type and charges dropdown menus by rendering through React Portals with high z-index (`z-[150]`).
- **Prisma Startup Sequence:** Resolved boot crash when database does not exist prior to server startup.
- **Thermal Receipt Text Alignment:** Standardized line widths and character limits across 58mm and 80mm paper widths.

---

## 🔮 Future Roadmap (Upcoming v1.1.0 & v1.2.0)

- **v1.1.0 (Customer Loyalty & Multi-Station Routing):**
  - Customer reward points earning and instant bill redemption.
  - Multi-station KOT routing (split tickets between Kitchen and Bar/Beverage stations).
- **v1.2.0 (HQ Cloud Sync & Analytics):**
  - Centralized multi-store Superadmin dashboard for multi-branch cafe owners.
  - Remote menu pushing and master recipe synchronization.

---
