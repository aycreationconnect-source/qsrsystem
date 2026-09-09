# 📋 Features & Modifications Changelog (QA & Testing Reference)

This document provides a concise, chronological log of all features, enhancements, and modifications implemented in the **QSR POS System**. Testers and QA engineers can use this ledger to understand what was implemented, how it behaves, and refer directly to the attached documentation for detailed testing steps.

---

## 📅 Chronological Ledger

### 1. 2026-09-08 — Feature: Inventory Category Management & Stock Tracking (Requirement 9)
- **Type**: New Feature & Inventory Architecture
- **Summary**:
  - **Database Schema Expansion**: Added `InventoryCategory` entity to `schema.prisma` with unique category names, descriptions, and linked relation to `InventoryItem`. Added `categoryName` (default: `"General"`) and `categoryId` to `InventoryItem` table.
  - **Backend API Layer (`InventoryController` & `InventoryService`)**:
    - Added `GET /inventory/categories` returning all categories with live counts for total items and low-stock items.
    - Added `POST /inventory/categories` to create custom inventory categories on-the-fly.
    - Added `DELETE /inventory/categories/:id` to remove categories with automatic safe re-association of orphaned items to `"General"`.
    - Seeded standard default categories on empty database: `"General"`, `"Dairy"`, `"Bakery"`, `"Beverages"`, `"Produce"`, `"Packaging"`, `"Spices & Dry Goods"`.
    - Updated `create` and `update` methods to accept and persist category names and IDs.
  - **Category Navigation Bar (`InventoryView`)**: Added top category filter pills (`All Categories`, `Dairy`, `Bakery`, etc.) displaying item count badges and red alert dots for categories containing depleted/low-stock items.
  - **Category Summary Header**: Shows live breakdown for the active category filter: total items, optimal count, low-stock count, and depleted count.
  - **Dedicated Category Creator Modal (`AddCategoryModal`)**: Quick modal triggered by `+ Add Category` to create new categories.
  - **Direct Raw Item Creator (`AddInventoryItemModal`)**: Added `+ Add Raw Item` button enabling creation of new ingredients with Name, Category dropdown, Unit of measure (`pcs`, `kg`, `g`, `L`, `ml`, `slice`, `portion`, `box`), initial stock, and minimum alert threshold.
  - **Inventory Table (`InventoryTable`)**: Added a styled **Category** badge column and filtered table view reflecting the selected category pill.
  - **Stock Adjustment Modal (`UpdateStockModal`)**: Added an **Inventory Category** selector allowing managers to reassign an ingredient's category while updating stock levels and alert thresholds.
- **Documentation**:
  - [**Stock Summary & Inventory Linkage**](report/stock-summary-report.md)
  - [**System README**](../README.md#3-📦-recipe-linked-inventory--automated-stock-tracking)

---

### 2. 2026-09-08 — Enhancement: Item Configuration UI Simplification, Inline Add-on Creation & Global Tax Toggle (Issue 8)
- **Type**: UI Simplification, Usability & Financial Calculation
- **Summary**:
  - **Modal Tabs Renaming (`ConfigItemModal`)**: Renamed confusing tab titles to clear, user-friendly labels:
    - `Recipe & Stock Consumption` $\rightarrow$ **`Inventory`**
    - `Modifiers & Add-ons` $\rightarrow$ **`Add-ons`**
    - `Taxes & GST` $\rightarrow$ **`Taxes`**
  - **Inventory Tab (Stock Deduction)**: Renamed section header to **"Raw Ingredients (Stock Deduction)"** with intuitive subtitle explaining automatic depletion on POS billing. Column headers simplified to `Ingredient Name`, `Qty per Dish`, `Unit`, and delete action.
  - **Add-ons Tab with Inline Creation**:
    - Added an **`+ Add New Add-on`** button directly in the tab.
    - Clicking opens an inline creation form with Add-on Name, Price (₹), and optional description.
    - Saves directly via `menuApi.createAddon`, refreshes the add-on catalog, and immediately selects the newly created add-on for the dish.
  - **Taxes Tab with Global Tax vs. Manual Tax Toggle**:
    - Added an **`Apply Global Tax`** toggle button with active (emerald) / inactive (stone) state badges.
    - **Active State (Default)**: Automatically applies the store's global tax rate configured in Settings (e.g. 5% GST), hiding manual inputs to prevent cashier/manager confusion and accidental duplicate taxation.
    - **Inactive State**: Disables global tax for this specific item and unlocks the **Manual Tax Rates** editor with `+ Add Tax Rate` (Tax Label, Rate %), or allows 0% tax-exempt dishes if left empty.
  - **POS Tax Calculation Engine (`POSContext.tsx`)**: Updated `getCartTotals` to calculate taxes per item based on `useGlobalTax`: items with manual taxes use their custom rate and are exempt from global tax, while global tax items inherit the store-wide rate.
- **Documentation**:
  - [**System README**](../README.md#2-🍽️-menu--dynamic-categories-management)
  - [**Total Summary Report Specification**](report/total-summary-report.md)

---

### 3. 2026-09-08 — UI Polish: Dish Edit Modal Status & Subcategory Row Alignment
- **Type**: UI Polish & Layout Fix
- **Summary**:
  - **Dish Status Box Compacted (`ItemModal`)**: Removed the multi-line descriptive text (`Active (Visible and available for ordering on POS)` / `Inactive...`) that occupied excessive vertical space and triggered unnecessary `overflow-y` scrollbars. Replaced with a compact inline status pill (`ACTIVE` / `INACTIVE`) and switch toggle.
  - **Row Alignment Fix (`Dish / Beverage Name`, `Category`, `Subcategory`)**:
    - Resolved misalignment caused by the `Subcategory (Optional)` label wrapping into two lines and pushing its select dropdown down.
    - Standardized all labels to single-line `h-4 flex items-center` with `uppercase tracking-wider` and `whitespace-nowrap`.
    - Unified `<select>` dropdown styles to match the `<Input>` field: height `h-[42px]`, rounded corners `rounded-xl`, background `bg-white dark:bg-stone-900`, and borders `border-stone-300 dark:border-stone-700`.
    - Balanced column widths to `sm:col-span-5` (Name), `sm:col-span-3` (Category), and `sm:col-span-4` (Subcategory).
  - **Vertical Spacing Reduction**: Reduced form spacing to `space-y-3.5` ensuring modal content fits comfortably in standard laptop screens without vertical clipping.
- **Documentation**:
  - [**Frontend Architecture & Design System**](frontend-architecture-and-design-system.md)

---

### 4. 2026-09-07 — Feature: Order History in All Terminals (Quick & Table POS)
- **Type**: New Feature & Terminal Usability Enhancement
- **Summary**:
  - **Terminal Access**: Integrated direct access to **Order History** from all POS terminals (both Quick POS and Table POS) without forcing cashiers/waiters to leave the active terminal or switch to the admin dashboard.
  - **Top Navigation Trigger (`POSTopNav`)**: Added a prominent `Order History` button in the top navigation bar with a dedicated history icon and responsive label (`History` on mobile/small screens).
  - **Floor Sidebar Shortcut (`POSTableSidebar`)**: In Dine-in / Table mode, added an `Order History` quick action button directly on the floor sidebar header for fast waiter access.
  - **Dedicated Terminal Modal (`POSOrderHistoryModal`)**:
    - **Date Filters**: Fast preset switching for `Today` (default for quick counter operation), `Yesterday`, `Last 7 Days`, and `All Orders`.
    - **Real-Time Search**: Search orders on-the-fly by daily token # (`#1`, `#2`), database ID, dish name, customer info, or payment method.
    - **Filter Pills**: Filter by Payment Mode (`All`, `Cash`, `UPI`, `Card`, `Split`) and Settlement Status (`All`, `Completed`, `Partial`).
    - **Live Counters**: Displays live order counts and total sales revenue for the current view.
    - **Order Table**: Shows daily sequence token, timestamp, preview of items, payment badge, rounded net amount, and completion status.
    - **One-Click Thermal Reprint**: Instant `Reprint` button on each order row that prints an 80mm/58mm thermal receipt directly via isolated iframe sandbox without opening popups.
    - **Itemized Details Inspection**: Clicking any row or "View" opens the full `OrderDetailsModal` showing centered cafe details, taxes, payment installments, and itemized quantities.
- **Documentation**:
  - [**Order History Report Specification**](report/order-history-report.md)
  - [**System README**](../README.md)

---

### 5. 2026-09-07 — Feature: POS Amount Round Up & Decimal Transparency
- **Type**: Financial Calculation & UI Enhancement
- **Summary**:
  - **POS Amount Rounding Rule**: Added standard half-up rounding logic (`roundPOSAmount`) where amounts with decimal $\ge 0.50$ round UP to the nearest integer (e.g. ₹1192.50 $\rightarrow$ ₹1193) and amounts $< 0.50$ round DOWN to the previous integer (e.g. ₹1192.49 $\rightarrow$ ₹1192).
  - **Settlement & Payment Modal (`CheckoutModal`)**: Displays the rounded total prominently in bold font (e.g. `₹1193`), with the exact decimal figure displayed directly below in a smaller font (e.g. `(₹1192.50)`). Cash tendered change, remaining balance, and single payment actions calculate against the rounded amount.
  - **POS Cart Sidebar (`POSCartSidebar`)**: Shows the rounded amount prominently and the exact unrounded decimal in smaller font below, with the "Pay" button displaying the rounded figure.
  - **Thermal Receipt Printing**: Both isolated iframe and direct printable receipt formats show `NET PAYABLE: ₹1193` along with an explicit `Round Off: +₹0.50` line item.
  - **Reports & Export Reflection**: Stored order records, Total Summary Report, Order History Report, Order Details inspection modal, and PDF/XLS exports consistently reflect the rounded integer total to ensure sales revenue and drawer tenders balance without discrepancy.
- **Documentation**:
  - [**Order History Report Specification**](report/order-history-report.md)
  - [**Total Summary Report Specification**](report/total-summary-report.md)

---

### 6. 2026-09-07 — Bugfix: Thermal Receipt Printing on Settlement & Payment Screen
- **Type**: Bugfix & Printing Improvement
- **Summary**:
  - **Issue Resolved**: When clicking "Print Receipt" on the Settlement & Payment modal (`CheckoutModal`), the browser preview was completely blank due to `display: none` (`hidden`) overriding print styles, fixed backdrop modal trapping, and full-page `window.print()` quirks.
  - **Isolated Thermal Printing**: Built a dedicated `handlePrintThermalReceipt` generator utilizing an isolated iframe sandbox that renders only the 80mm/58mm thermal receipt directly to the printer without browser headers/footers (`localhost:5173...`).
  - **Complete Order & Cafe Details**: The thermal receipt prints centered Cafe Branding (`storeProfile.businessName`, `cafeCode`, address, phone, GSTIN), Order/Table meta, itemized dishes grouped by KOT batches (`Order 1`, `Order 2`, etc.), subtotals, taxes, discount deductions, net payable total in bold, payment settlement breakdown, and custom receipt footer.
  - **Direct CSS Fallback**: Added `display: block !important` and updated the in-DOM `#thermal-receipt` container in `index.css` for print media query fallbacks.
- **Documentation**:
  - [**System README**](../README.md)
  - [**Features & Modifications Changelog**](features%20&%20modifications.md)

---

### 7. 2026-09-07 — Reports Suite (Total Summary & Order History) + Dashboard Cleanup
- **Type**: New Feature & UI Modification
- **Summary**:
  - **Dashboard Cleanup**: Removed the "Recent Completed Orders" card from the Admin Dashboard (`DashboardView`) and rebalanced the grid layout (`RevenueChart` + `QuickActions`). Added a direct **Reports** workflow shortcut.
  - **Sidebar Navigation**: Added a dedicated **Report** navigation tab in the sidebar under `MANAGEMENT` routing to `/reports`.
  - **Total Summary Report**: Added KPI metric cards (Total Revenue, Orders, Tax, AOV), payment tender distribution cards (Cash, Card, UPI, Split), and a date-wise aggregated table with a highlighted **Grand Total** summary row.
  - **Order History Report**: Added a line-item ledger with search (by daily order #, system ID, dish, or tender) and quick filters for payment methods and completion statuses.
  - **Complete Order Details Modal**: Clicking any order row opens a modal showing top-centered cafe details, daily order #, timestamps, itemized dish quantities, unit prices, tax calculations, payment logs, and a **Print Receipt** thermal printer action.
  - **Print PDF & Print XLS Exports**: Added export buttons with the **Cafe details centered at the top** (Business Name, Code, Address, Phone, GSTIN).
  - **Table Horizontal Scroll Containment**: Configured table wrappers with `overflow-x: auto` so horizontal scrolling is strictly confined to tables and never causes screen-level viewport scrolling.
- **Documentation**:
  - [**Reports Suite Overview**](report/README.md)
  - [**Total Summary Report Specification**](report/total-summary-report.md)
  - [**Order History Report Specification**](report/order-history-report.md)
  - [**Stock Summary & Inventory Linkage**](report/stock-summary-report.md)

---

### 8. 2026-09-07 — Architecture Decoupling: Dedicated Support Platform (`qsrsystem-hq`)
- **Type**: Architectural Modification
- **Summary**:
  - Decoupled the central Developer/Superadmin Support Platform, Golden DB (Supabase PostgreSQL), and Master Licensing Authority into a separate, independent repository: `qsrsystem-hq`.
  - Moved `support-platform.md` and `API Documentation.html` into `qsrsystem-hq/docs/`.
  - Updated local `README.md` to define the architectural boundary between the on-premise, offline-first local POS (`qsrsystem`) and cloud headquarters (`qsrsystem-hq`).
- **Documentation**:
  - [**System README**](../README.md#🏢-ecosystem--headquarters-qsrsystem-hq)
  - [**Support Platform & Golden DB Spec**](../../qsrsystem-hq/docs/support-platform.md)

---

### 9. 2026-09-06 — Daily Sequential Order Numbering & Live Audio Notifications
- **Type**: New Feature & Workflow Improvement
- **Summary**:
  - **Daily Order Sequence**: Added logic resetting sequential order numbers everyday at midnight (`#1, #2, #3...`) instead of exposing raw auto-incrementing database IDs on customer bills and kitchen tokens.
  - **Real-Time Sound Chime**: Integrated Web Audio API synthetic chime synthesis (with fallback audio) that plays an audible alert whenever an order is successfully completed.
  - **Order Toast Notification**: Added a floating top-right notification toast showing the daily order sequence number, total amount, and item preview.
- **Documentation**:
  - [**Order Notification & Sound Feature Specification**](order-notification-and-sound-feature.md)

---

### 10. 2026-09-04 — Multi-Tender & Partial Payment Settlement
- **Type**: New Feature & Financial Enhancement
- **Summary**:
  - Enabled split and partial payment billing at checkout. Customers can split a single order across multiple tenders (e.g. part Cash, part UPI, part Card).
  - Extended Prisma database schema and transactional order engine with `paidAmount`, `balanceAmount`, and an `OrderPayment` ledger table.
  - Added visual badges for `Partially Paid` vs `Completed` statuses and remaining balance calculations.
- **Documentation**:
  - [**Partial Payment Feature Specification**](partial-payment-feature.md)

---

### 11. 2026-09-04 — Secure Cookie-Based Authentication & Navigation Route Guards
- **Type**: Security & Routing Modification
- **Summary**:
  - Replaced legacy client-side localStorage token reliance with secure, HttpOnly cookie-based session verification via `cookie-parser`.
  - Added React Router `AuthGuard` protecting `/dashboard`, `/menu`, `/inventory`, `/tables`, `/reports`, and `/pos`.
  - Added `PublicOnlyGuard` redirecting logged-in users away from `/login`.
- **Documentation**:
  - [**Local POS Onboarding & Auth Guide**](local-pos-onboarding.md)

---

### 12. 2026-09-03 — Dynamic Cafe Branding & Store Profile Management
- **Type**: New Feature & UI Customization
- **Summary**:
  - Added a Store Profile Modal in Settings allowing managers to customize Business Name, Cafe Code, Address, Phone, GSTIN, Logo URL, and Receipt Footer note.
  - Built `CafeBrandBadge` dynamically rendering the active store's name, code, and logo across top navigation bars, sidebars, login screens, and receipts.
- **Documentation**:
  - [**Brand Name & Identity Guidelines**](Brand%20Name%20Selection.md)
  - [**Local POS Onboarding Guide**](local-pos-onboarding.md)

---

### 13. 2026-09-02 — Offline Cryptographic Licensing & Local Staff PIN Login
- **Type**: Security & Onboarding Feature
- **Summary**:
  - Built an offline mathematical license validation system using HMAC-SHA256 tokens and hardware binding (Machine ID + Cafe Code + Expiry Timestamp).
  - Created `/activate` screen allowing offline store activation without requiring an internet connection on store hardware.
  - Implemented 4-digit quick staff PIN login and Owner username/password credentials.
- **Documentation**:
  - [**Local POS Onboarding Guide**](local-pos-onboarding.md)

---

### 14. 2026-09-01 — Frontend Modularization & Decoupled REST API Client Layer
- **Type**: Architecture & Code Quality Refactoring
- **Summary**:
  - Refactored monolithic frontend into modular domain folders: `auth/`, `dashboard/`, `menu/`, `inventory/`, `tables/`, `pos/`, `reports/`, `settings/`, and `ui/`.
  - Decoupled application state into `AppContext` (user, store, live sync) and `POSContext` (cart, table staging, payment calculations).
  - Created centralized REST API modules (`client.ts`, `menuApi.ts`, `orderApi.ts`, `inventoryApi.ts`, `tableApi.ts`, `settingsApi.ts`).
- **Documentation**:
  - [**Frontend Architecture & Design System**](frontend-architecture-and-design-system.md)

---

### 15. 2026-08-21 — Add-ons & Modifiers Module with Recipe-Based Stock Deductions
- **Type**: New Feature & Inventory Automation
- **Summary**:
  - Added `Addon` entities allowing customizable extras (extra cheese, sauces, toppings) linked to menu items.
  - Integrated automatic recipe-linked stock deduction: placing an order atomically deducts raw ingredients from inventory items and logs an immutable `InventoryHistory` record.
- **Documentation**:
  - [**Stock Summary & Recipe Deduction Specification**](report/stock-summary-report.md)
  - [**System README**](../README.md#3-📦-recipe-linked-inventory--automated-stock-tracking)

---

### 16. 2026-08-19 to 2026-08-31 — Core POS Engine, Dine-In Tables & Setup
- **Type**: Core Foundation & Initial Release
- **Summary**:
  - Initialized NestJS 11 backend with Prisma ORM (v7) and MariaDB/MySQL database integration.
  - Built Quick Service POS terminal with keyboard shortcuts, fast cashier checkout, and thermal bill layout.
  - Built Dine-In Table Management with multi-area floor plans (Main Dining, Rooftop, AC Hall), seat capacities, live occupancy elapsed timers, and table shifting.
- **Documentation**:
  - [**System README**](../README.md)

---

## 🔍 Quick Testing Checklist for QA

| Feature Area | Key Testing Verification Steps | Reference Document |
| :--- | :--- | :--- |
| **Inventory Categories (Req 9)** | Go to Inventory. Click category pills (`All`, `Dairy`, `Bakery`) to filter rows. Click `+ Add Category` to create a category. Click `+ Add Raw Item` to create ingredient under that category. Verify `Category` column in table and live counters. | [System README](../README.md#3-📦-recipe-linked-inventory--automated-stock-tracking) |
| **Item Config: Add-ons (Issue 8)** | Menu Management $\rightarrow$ Configure dish $\rightarrow$ `Add-ons` tab. Click `+ Add New Add-on`, enter Name & Price, save. Verify new add-on appears in selection grid and auto-attaches. | [System README](../README.md#2-🍽️-menu--dynamic-categories-management) |
| **Item Config: Taxes (Issue 8)** | Menu Management $\rightarrow$ Configure dish $\rightarrow$ `Taxes` tab. Verify `Apply Global Tax` toggle. Switch toggle Inactive and add manual tax. Add item to POS cart and verify tax calculates accurately without double-taxing. | [Total Summary Report](report/total-summary-report.md) |
| **Edit Dish Modal Layout** | Menu Management $\rightarrow$ Edit dish. Verify Dish Status box is compact with no vertical scrolling (`overflow-y`). Verify Dish Name, Category, and Subcategory labels and inputs align on the exact same horizontal baseline. | [Frontend Architecture](frontend-architecture-and-design-system.md) |
| **Total Summary Report** | Verify date presets (Today, Yesterday, Last 7 Days, Month, Custom). Check that cash, card, UPI, split totals match the grand total. | [Total Summary Report](report/total-summary-report.md) |
| **Order History Report** | Test search bar with daily order # and dish name. Test payment & status filters. Confirm horizontal scroll is inside table container only. | [Order History Report](report/order-history-report.md) |
| **Order Details Modal** | Click any order row. Verify items list, quantities, subtotal, tax, and total. Click "Print Receipt" and verify printable output. | [Order History Report](report/order-history-report.md) |
| **Print PDF & XLS** | Click "Print PDF" -> verify Cafe details centered at top. Click "Print XLS" -> verify downloaded Excel file has centered header rows. | [Reports Overview](report/README.md) |
| **Daily Order Number** | Place a new order on POS -> verify sequence restarts at `#1` each calendar day. | [Order Notification Spec](order-notification-and-sound-feature.md) |
| **Sound Notification** | Complete an order on POS -> listen for chime and check floating toast alert. | [Order Notification Spec](order-notification-and-sound-feature.md) |
| **Partial Payments** | Split payment into Cash + UPI -> verify order is marked `Partially Paid` until fully settled. | [Partial Payment Spec](partial-payment-feature.md) |
| **Offline Licensing** | Access `/activate` -> verify offline token activation and expiry checks. | [Local POS Onboarding](local-pos-onboarding.md) |
