# 📋 Features & Modifications Changelog (QA & Testing Reference)

This document provides a concise, chronological log of all features, enhancements, and modifications implemented in the **QSR POS System**. Testers and QA engineers can use this ledger to understand what was implemented, how it behaves, and refer directly to the attached documentation for detailed testing steps.

---

## 📅 Chronological Ledger

### 1. 2026-09-12 — Enhancement: Fast Area Dropdown & Zero-Scroll Categories Popover with High-Speed Diet Toggles ([`POSTableSidebar.tsx`](file:///c:/Learning/projects/qsrsystem/frontend/src/components/pos/POSTableSidebar.tsx), [`POSCategoryTabs.tsx`](file:///c:/Learning/projects/qsrsystem/frontend/src/components/pos/POSCategoryTabs.tsx))
- **Type**: Floor Section Filter & Category/Diet Navigation Speed Overhaul
- **Summary**:
  - **Fast Area Selector Dropdown (`POSTableSidebar.tsx`)**:
    - **Problem Addressed**: Horizontal scrolling in the narrow (~280px) table sidebar for Area/section filters would become tedious and time-wasting as more dining sections (Rooftop, AC Hall, Garden, Banquet, etc.) are added in the future.
    - **Zero-Scroll Dropdown Selector**:
      - Replaced the horizontal pill scroll strip with a dedicated, space-efficient Area Select button.
      - Trigger displays: `<MapPin />` icon, active area label (or `All Areas`), active area color dot badge, and table count.
      - Clicking opens an instant vertical dropdown with all areas, their color dots, table counts, and active checkmarks.
      - Includes a 1-click `✕` clear button when a specific area is active to reset back to "All Areas" instantly.
    - **Header Cleanup**: Removed redundant `3 Free • 1 Busy` text under the "Floor & Tables" title, as status counts are already clearly displayed in the occupancy filter bar below.
  - **Zero-Scroll Category Navigation (`POSCategoryTabs.tsx`)**:
    - **Problem Addressed**: Horizontal scrolling through 10-20 categories and 5 bulky diet filter buttons wasted significant time during fast cashier order entry.
    - **"All Categories" Popover Picker Grid**:
      - Added a prominent `[ 📑 Categories ({count}) ▾ ]` button at the start of the category bar.
      - Clicking opens a 2-column visual popover grid showing **all categories with dish counts and icons**.
      - Clicking any category jumps directly to it in 1 single tap without any horizontal scrolling.
      - If categories exceed 6, an integrated quick search input allows instant typing to jump to any category.
    - **Smooth Arrow Step Controls**: Added left (`‹`) and right (`›`) step buttons to visible category tabs that automatically appear when tabs overflow, providing 1-click stepping without trackpad drag-scrolling.
  - **High-Speed Compact Dietary Filtering (`POSCategoryTabs.tsx`)**:
    - Replaced the 5 bulky text buttons (which previously consumed ~350px of width) with a high-speed compact toggle group:
      - **1-Click Veg Toggle (`[ 🟢 Veg ]`)**: Directly toggles Pure Veg dishes. Clicking again resets to All.
      - **1-Click Non-Veg Toggle (`[ 🔴 Non-Veg ]`)**: Directly toggles Non-Veg dishes. Clicking again resets to All.
      - **Diet Dropdown (`[ 🥗 Diets ▾ ]`)**: Compact menu allowing selection of Egg, Vegan, or All Diets with clear badges and labels.
      - **Width Saved**: Reduced diet filter width from ~350px down to ~150px, immediately granting over 200px of width back to visible category tabs.

---

### 2. 2026-09-12 — Enhancement: Decongested Item Cards & Streamlined Table Selection ([`POSProductGrid.tsx`](file:///c:/Learning/projects/qsrsystem/frontend/src/components/pos/POSProductGrid.tsx), [`POSTableSidebar.tsx`](file:///c:/Learning/projects/qsrsystem/frontend/src/components/pos/POSTableSidebar.tsx))
- **Type**: Table POS Mode Layout Balance & Usability Decongestion
- **Summary**:
  - **Item Cards Grid Decongestion (`POSProductGrid.tsx`)**:
    - **Root Cause Identified**: In Table Mode, with both the left Table Sidebar (~336px) and right Cart Sidebar (~420px) open, the available center viewport is ~600px–750px. Standard screen breakpoint classes previously forced 4 or 5 columns (`lg:grid-cols-4 xl:grid-cols-5`), reducing card widths to an unusable ~110px–130px.
    - **Mode-Aware Responsive Columns**: Implemented conditional mode-aware grid column classes:
      - In **Table Mode**: Renders 2 columns on small screens, 3 spacious columns on standard laptops (`lg` & `xl`), 4 columns on large desktops (`2xl`), and 5 on ultra-wide screens (`1920px+`). Card widths increased from ~110px to ~210px (nearly double the breathing room).
      - In **Quick Order Mode**: Retains dense high-throughput columns (up to 7 columns) since no left table sidebar is present.
    - **Bottom Price Row Redesign**: When an item has `quantity > 1` in the cart, the calculated subtotal is now rendered in an amber pill badge (`bg-amber-500/15 text-amber-800 dark:text-amber-200 rounded-md border border-amber-500/30 px-1.5 py-0.5 font-mono font-black text-[11px]`). This eliminates confusion between unit price and running total without re-adding the text label "Total:".
    - **Card Padding & Heights**: Refined card padding to `p-3 min-h-[110px]` with generous typography leading.
  - **Table Selection Sidebar Decongestion (`POSTableSidebar.tsx`)**:
    - **Sidebar Width Rebalance**: Slimmed sidebar width from bloated `w-72 sm:w-80 lg:w-84` (up to 336px) to a balanced `w-72 lg:w-76 xl:w-80` (~288px–304px), immediately returning 32px–48px of width back to the center item grid.
    - **Streamlined Filter Rows**: Eliminated the confusing stacked double filter bars that previously rendered identical `[All (4)]` buttons directly above one another.
      - **Area Row**: Labeled `All Areas ({count})` alongside color-dotted area pills.
      - **Occupancy Filter**: Converted to a clean, distinct segmented bar: `[ All | Free (3) | Busy (1) | Partial | Billed ]` with colorful status dots and counts.
    - **Table Card Alignment**: Refined card padding to `p-2.5 rounded-xl` with 36x36 monogram badges (`w-9 h-9 rounded-lg`), cleaner text truncation, and structured running bill metadata.
    - **"Extra Table" Card**: Compacted to match the refined table card dimensions with a clean dashed border and 1-click `+ Add` button.

---

### 2. 2026-09-12 — Enhancement: Floor & Tables Header Cleanup & "Extra Table" Card in Table List ([`POSTableSidebar.tsx`](file:///c:/Learning/projects/qsrsystem/frontend/src/components/pos/POSTableSidebar.tsx))
- **Type**: Table POS Terminal Layout & Quick Table Creation UX
- **Summary**:
  - **Header Cleanup**:
    - Removed the table total quantity badge (`{tables.length}`) in front of the **"Floor & Tables"** title.
    - Removed the existing `+ Add` button from the top header to declutter the navigation bar and keep only the Sort tool.
  - **"Extra Table" Card in Last Row**:
    - Added an **"Extra Table"** option directly in the last row of the tables list.
    - Styled consistently with existing table cards (`p-3 rounded-2xl` with dashed border and subtle hover feedback).
    - Features a 40x40 `+` icon badge, bold title **"Extra Table"**, descriptive subtitle *"Add temporary or dining table"*, and an amber `+ Add` action pill.
    - Clicking the card opens `AddTablePOSModal`, allowing instant creation of temporary or extra tables without leaving the floor view.

---

### 2. 2026-09-12 — Bug Fix: Tooltip Right-Side Clipping & Horizontal Scrollbar ([`POSOrderHistoryModal.tsx`](file:///c:/Learning/projects/qsrsystem/frontend/src/components/pos/POSOrderHistoryModal.tsx))
- **Type**: POS Order History UX & Overflow Prevention
- **Summary**:
  - **Issue Identified**:
    - When hovering over the **View** button in the orders table, the default centered tooltip (`align="center"`) extended past the right edge of the table, causing `overflow-x-auto` to trigger an unwanted horizontal scrollbar while clipping the right half of the tooltip.
    - Similarly, hovering over the **Refresh / Reload** button in the header caused its tooltip to be partially hidden under the right side of the modal.
  - **Solution**:
    - Added `align="end"` to the `Tooltip` components for **View Order Details**, **Reprint Receipt**, and **Refresh Orders List**.
    - Anchored tooltip right edges flush to the right edge of their trigger buttons (`right-0`), expanding tooltips safely towards the left.
    - Completely eliminated horizontal table scrollbar triggers and right-edge modal clipping.

---

### 2. 2026-09-12 — UX Overhaul: Intuitive Cash Received & Change Calculator ([`CheckoutModal.tsx`](file:///c:/Learning/projects/qsrsystem/frontend/src/components/pos/CheckoutModal.tsx))
- **Type**: Checkout Settlement UX & Cashier Financial Usability
- **Summary**:
  - **Replaced Accounting Jargon ("Cash Tendered")**:
    - Replaced the confusing financial label `"Cash Tendered (₹)"` with the human, self-explanatory label **"Cash Received from Customer (₹)"** and helpful subtitle *"Calculate physical change to return"*.
  - **Smart Dynamic Currency Suggestions (Replaced Static `[50, 100, 200, 500]`)**:
    - Eliminated static buttons that made no sense for bills higher than ₹500 (e.g., offering a ₹50 button on a ₹1,430 bill).
    - Introduced intelligent `smartCashOptions` that dynamically compute sensible payments based on the actual bill total:
      1. **Exact Cash**: 1-click button for exact bill amount (`Exact (₹1430)`).
      2. **Higher Realistic Currency Notes**: Suggests the next round currency notes a customer would realistically hand over (e.g. `₹1500` with subtitle `Return ₹70`, `₹2000` with subtitle `Return ₹570`).
  - **Live Return Change & Shortfall Feedback**:
    - Prominently displays an emerald badge **"Return Change: ₹XX.XX"** when cash given exceeds the total.
    - Displays a rose alert badge **"Short by: ₹XX.XX"** if cash given is less than the bill amount.
    - Displays **"Change: ₹0.00"** when exact cash is given.
  - **Input Sanitization & Cleaner Controls**:
    - Added `min="0"` and removed browser up/down number spin buttons (`[appearance:textfield]`) that previously allowed clicking into negative values like `-1`.
    - Added an instant clear (`✕`) button inside the input to clear custom cash entry in 1 click.

---

### 2. 2026-09-12 — Enhancement: Item Card Subtotal Display (Removed "Total:" Label)
- **Type**: POS Terminal UX & Visual Cleanliness
- **Summary**:
  - In [`POSProductGrid.tsx`](file:///c:/Learning/projects/qsrsystem/frontend/src/components/pos/POSProductGrid.tsx), removed the redundant `"Total:"` text label displayed when an item has quantity > 1 in cart.
  - Retained the calculated total amount (`₹X.XX`) formatted with bold monospaced typography (`text-[11px] sm:text-xs font-black text-amber-700 dark:text-amber-400 font-mono`) and tooltip preview.
  - Added `gap-1` between unit price and total price in the card footer to ensure numbers never touch or overlap on narrow screens.

---

### 2. 2026-09-12 — Feature: Order Description / Note in Settlement & Payment Screen (Full-Stack)
- **Type**: Order Settlement & Multi-Channel Note Support (Full-Stack Backend + Frontend)
- **Summary**:
  - **Database & Backend Persistence (`schema.prisma` & `order.service.ts`)**:
    - Added `description String? @db.Text` to the `Order` model in Prisma schema and synced to MySQL (`npx prisma db push`).
    - Regenerated Prisma Client (`npx prisma generate`).
    - Updated `OrderService.create()` to accept `description` in payload and persist it as trimmed text/null in database transactions.
  - **Settlement & Payment UI Input (`CheckoutModal.tsx`)**:
    - Added clean **Order Description / Note (Optional)** input with `<FileText />` icon in the right settlement panel.
    - Integrated across both **Single Full Payment** and **Partial Payment** modes.
    - Form state is automatically cleared on new checkout openings.
  - **Thermal Receipt Integration (`CheckoutModal.tsx` & `thermalPrintUtils.ts`)**:
    - Displays order note/description in printed physical thermal receipts (80mm & 58mm) under order metadata.
  - **POS Order History & Details Modal Integration (`POSOrderHistoryModal.tsx` & `OrderDetailsModal.tsx`)**:
    - **Order History**: Search filter matches description text; order rows render description notes under item summaries with an icon tag.
    - **Order Details Modal**: Displays a styled Order Note / Description card with `<FileText />` icon and clear formatting.
  - **Frontend State & Context Flow (`POSContext.tsx`, `orderApi.ts`, `app.types.ts`)**:
    - Extended `Order` interface with `description?: string | null`.
    - Extended `PlaceOrderPayload` with `description?: string`.
    - Extended `confirmPaymentAndOrder(splitPayments, description)` in POSContext to seamlessly pass description to the backend.

---

### 2. 2026-09-12 — Feature: Expanded Bill Panel & Single-Line Aligned Ticket Items (QSR POS Terminal)
- **Type**: POS Cart UX & High-Density Ticket Alignment
- **Summary**:
  - **Expanded Bill Panel Width (`POSLayout.tsx`)**:
    - Increased desktop Bill Panel width from `w-72 xl:w-80 2xl:w-88` (288px–352px) to `w-96 xl:w-[420px] 2xl:w-[460px]` (384px–460px), providing generous breathing room for item names, steppers, and pricing.
    - Optimized mobile and tablet drawer cart container to `max-w-md sm:max-w-lg w-full` with borderless full-height scroll and mobile close (`X`) action.
  - **Single-Line Aligned Ticket Items (`POSCartSidebar.tsx`)**:
    - Replaced the chunky 2-row item card design with an ultra-clean, single-line horizontal layout.
    - Explicitly aligns all 4 required information elements in each row:
      1. **Item Name**: Left-aligned, bold title with unit price caption (`flex-1 min-w-0 pr-1`).
      2. **Quantity**: Centered compact numeric stepper (`w-24 sm:w-26`) with 1-click `-` / `+` buttons and direct quantity input (`CartItemQtyInput`).
      3. **Price**: Right-aligned, bold monospaced Indian Rupee total (`w-20 sm:w-24`).
      4. **Actions**: Right-aligned trash can icon button (`w-8`) for fast 1-click line deletion.
  - **Aligned Bill Column Header**:
    - Added an uppercase column sub-header (`ITEM NAME | QUANTITY | PRICE | ACTION`) with identical column widths, providing clear table alignment down the entire ticket.
  - **Consistent KOT Table Batches**:
    - Standardized kitchen-routed orders in Table POS Mode to follow the same single-line column alignment.

---

### 2. 2026-09-11 — Feature: Settings Hub UI/UX Redesign & Click-Driven Responsive Sidebar Collapse
- **Type**: Admin Settings Redesign & Global Sidebar Navigation
- **Summary**:
  - **Click-Driven Sidebar Collapse/Expand (`Sidebar.tsx` & `AdminLayout.tsx`)**:
    - **Eliminated Auto-Collapse**: Completely removed desktop mouse hover expansion (`onMouseEnter`/`onMouseLeave`) and click-outside listeners that caused unexpected auto-collapsing.
    - **Universal Arrow Toggle Across All Resolutions**: Removed `lg:hidden` constraint; the circular toggle button on the right sidebar border is now accessible on desktop (1080p/1440p/4K), laptops, and tablets.
    - **Smooth Button & Icon Transition**: Added a 180° rotation animation to the chevron icon (`transition-transform duration-300 ease-in-out`, rotating from left ← when open to right → when collapsed), paired with smooth button hover scaling (`hover:scale-110 active:scale-95`).
    - **Buttery-Smooth Layout Rail Sync**: Animated the parent layout container in `AdminLayout.tsx` between `w-[72px]` and `w-[260px]` with `transition-all duration-300 ease-in-out` and persistent `localStorage` memory (`pos_sidebar_collapsed`).
  - **Settings Hub UI/UX Redesign (`SettingsView.tsx`)**:
    - **Eliminated Dead / Empty Space**: Expanded the container from narrow `max-w-6xl` to a spacious `max-w-[1540px]` workspace, structuring information into high-utility, purposeful operational cards.
    - **System & Station Health Widget**: Added a dedicated bottom card in the left rail displaying database node status (`Local SQLite`), active license plan (`Pro Plan • 85 Days Left`), logged-in cashier name, default thermal format, and 1-click Quick POS / Table POS launchers.
    - **Hero Cafe Identity Banner**: Integrated a premium high-contrast cafe banner with store monogram, verified `🟢 Operational & POS Ready` badge, currency pill, and live operational stats (Tables, Dishes, Categories, Inventory Items).
    - **6-Card Structured Store Operations Grid**: Organized cafe metadata into 6 distinct modules: Store Ownership, Store Location, Tax Compliance, Receipt Customization, Terminal Modes, and Offline Sync Connectivity.
    - **Store Operational Readiness Checklist**: Added a 4-point verification card displaying 100% operational readiness across profile, tax, printer, and menu.
    - **Live Bill Tax Simulator**: Added an interactive calculation preview card in the Tax & Billing tab that reacts live to input changes (calculating Subtotal, Tax Amount, and Grand Total in real time).
    - **Live Onscreen Toast Simulator**: Added a 1-click simulation trigger in the Popup Alerts tab allowing users to test corner notification popups and durations instantly.

---
- **Type**: POS Cart UX & Visual Polish
- **Summary**:
  - **Indian Rupee (INR ₹) Icon (`POSCartSidebar.tsx`)**:
    - Replaced the previous `Receipt` icon (which had an embedded dollar `$` sign) with the official `<IndianRupee className="w-4 h-4" />` icon in the Current Ticket header badge.
  - **Viewport-Safe Clear All Tooltip (`Tooltip.tsx` & `POSCartSidebar.tsx`)**:
    - Added `align="end"` to the `Clear All Items` and `Shift Table` tooltips (`position="bottom" align="end"`), aligning the popup flush with the right screen edge so tooltip text is never clipped or hidden beyond the screen boundary.
  - **Hidden Number Input Spinners (`index.css` & `CartItemQtyInput`)**:
    - Added `.no-spinner` CSS class and Tailwind utility classes (`[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`) to remove the browser-default up/down arrow spinners from the custom quantity box.
  - **Ultra-Compact Cart Item Cards**:
    - Redesigned cart item cards into a high-density, 2-row layout with `p-2 rounded-xl` padding and `space-y-1.5` list spacing.
    - Card height reduced from ~90px to ~50px, allowing **6 to 7 cart items to display comfortably on desktop screens without scrolling**.

---

### 2. 2026-09-11 — Feature: Ultra-Compact Item Tiles (Icon-Only Badges) & Current Ticket Custom Quantity Entry
- **Type**: High-Density POS UX, Touchscreen Tap-to-Add & Direct Quantity Input
- **Summary**:
  - **Dietary Icons Only (`POSProductGrid.tsx`)**:
    - Removed all "Veg", "Non-Veg", "Egg", "Vegan" text labels from Item Cards.
    - Replaced with standard, compact FSSAI dietary symbols (green square/circle for Veg, red square/triangle for Non-Veg, amber egg dot, vegan green leaf).
  - **High-Density Compact Grid Layout**:
    - Increased grid column density to 5–7 columns on desktop (`grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 min-[1920px]:grid-cols-7`).
    - Removed fixed minimum heights (`min-h-[160px]`); reduced padding to `p-2.5`; truncated descriptions to single line.
    - More than doubles the number of menu items visible simultaneously on screen without requiring scrolling.
  - **Fast Multi-Click Tap-to-Add**:
    - Removed `+ Add` button and stepper controls from Item Cards in the product grid.
    - The entire item card is now an instant tap target. Tapping once adds 1 item; tapping repeatedly adds and increments the quantity directly.
    - Items currently in cart display a prominent `x{qty}` pill badge and an active amber border ring.
  - **Custom Number Entry in Current Ticket (`POSCartSidebar.tsx`)**:
    - Centralized quantity adjustments in the Current Ticket sidebar / drawer.
    - Introduced `CartItemQtyInput`: an interactive, clearly bordered numeric input (`w-12 h-7`) between the `-` and `+` buttons.
    - Tapping the quantity box automatically selects all text, allowing cashiers to type any custom quantity directly (e.g. 5, 10, 50) and press `Enter` to commit, while retaining `-` and `+` buttons for 1-click stepping.

---

### 2. 2026-09-11 — Feature: Header-Integrated Search Bar & Reclaimed Food Item Display Space (QSR POS Terminal)
- **Type**: UI Space Optimization & Real-Time POS Search
- **Summary**:
  - **Search Moved to Header (`POSTopNav.tsx`)**:
    - Relocated the menu search input directly into the top navigation bar of the QSR Terminal, taking advantage of open horizontal space between the cafe identity badge and action buttons.
    - Features instant real-time filtering, dedicated clear (`X`) button, and keyboard shortcuts (`/` or `Ctrl+K` to focus, `Escape` to clear).
  - **Reclaimed Vertical Height for Food Display (`POSProductGrid.tsx`)**:
    - Eliminated the redundant secondary search bar and dietary filter container from `POSProductGrid`, saving over 60px of vertical space on desktop and over 100px on mobile/tablets.
    - Food cards and category sections now start immediately beneath the category bar, maximizing visible screen real estate for dish cards, photos, prices, and fast order punch-in.
  - **Unified Category & Dietary Filter Bar (`POSCategoryTabs.tsx`)**:
    - Integrated dietary filter chips (`All Diets`, `🟢 Veg`, `🔴 Non-Veg`, `🟡 Egg`, `🌱 Vegan`) directly into the category bar alongside category tabs with an elegant vertical separator.
    - Added `dietFilter` and `setDietFilter` to global `POSContext` for seamless synchronization across components.
  - **Contextual Search Feedback**:
    - When an active search query is entered, displays an unobtrusive results counter badge (`X items found`) with a quick 1-click `Clear Search` action.
    - Enhanced empty search state with a dedicated `Clear Search Filter` button.

---

### 2. 2026-09-11 — Modification: Removed Admin Panel Button from QSR POS Terminal Top Navigation
- **Type**: POS Terminal Navigation & UI Streamlining
- **Summary**:
  - Removed the **Admin Panel** button and its tooltip from `POSTopNav.tsx` in the POS Terminal header.
  - Cleaned up unused imports (`Link` from `react-router-dom` and `LayoutDashboard` from `lucide-react`).
  - Terminal cashier interface is now dedicated solely to order taking and management (Quick POS / Table POS), cart operations, and Order History / Bill Reprints without navigation distraction or unintended exit to management dashboard.

---

### 2. 2026-09-10 — Feature: Printer Settings with Bill Print, KOT Print, Item Print & Real-Time Live Thermal Preview
- **Type**: New Category, Printing Hardware & Thermal Layout Configuration
- **Summary**:
  - **Printer Settings Category (`SettingsView.tsx` & `PrinterSettingsPanel.tsx`)**:
    - Added a dedicated **Printer Settings** category in the left-hand settings navigation with `<Printer />` icon and live badge (e.g. `80mm Roll • Default`).
    - Added a default thermal page format selector: **80mm Standard POS Thermal Roll** (industry default) vs **58mm Compact Mini / Mobile Bluetooth Roll**.
  - **Multi-Mode Sub-Tabs / Pills**:
    - 🧾 **Bill Print**: Customer Receipt & Tax Invoice layout customization (Header Title, Brand Logo, Address, Phone, GSTIN, Table & Section, Cashier Name, Itemized Breakdown, CGST/SGST Taxes, Payment Modes, UPI/Feedback QR box, custom footer note, copies count, and checkout auto-print trigger).
    - 🍳 **KOT Print**: Kitchen Order Ticket configuration (Station routing: *All Stations*, *Hot Kitchen*, *Beverage Bar*, *Bakery & Grill*; high-visibility `#KOT-042` banner, Table name, Steward name, bold large quantities `x2`, preparation instructions callouts, Veg/Non-Veg dots, and auto-print on order punch).
    - 🏷️ **Item Print**: Packaging and cup label stickers (`50mm x 25mm` cup sticker, `40mm x 30mm` price tag, continuous strip; item name & variant, price ₹ MRP, scannable 1D barcode lines, dietary indicator, order token & customer name, and freshness notes).
  - **Interactive Live Thermal Preview Canvas**:
    - High-fidelity thermal paper preview with realistic paper texture, tear edges, monospace typography, and live width constraint adjusting between 80mm and 58mm.
    - Reactively updates in real time as user edits text or flips toggles.
    - Context-aware preview changes dynamically across Bill, KOT, and Item print tabs.
  - **Physical Test Print Sandbox (`thermalPrintUtils.ts`)**:
    - Isolated invisible iframe sandbox triggers direct printer spooling for Bill, KOT, and Item labels with zero browser header/footer pollution.
  - **Compact Header & Roll Toggle Switch**:
    - Streamlined the default roll format card to a compact single-row design with description strictly truncated in one line.
    - Replaced dual buttons with a sleek interactive toggle switch between **58mm Mini** and **80mm Standard**, dynamically updating the live `DEFAULT: 80MM / 58MM` badge.
  - **Spacious Full-Width Setting Rows for Copies & Auto-Print**:
    - Replaced narrow side-by-side columns with dedicated full-width cards for **Print Copies** (`1 Copy` vs `2 Copies` segmented switch) and **Auto-Print on Checkout** (smooth toggle switch).
    - Completely eliminated text wrapping and overlapping between button badges and control labels.
  - **Clean, Unobtrusive Live-Sync Notice**:
    - Restored the footer notice to a clean, subtle inline format with amber sparkle icon: *"Settings apply immediately across POS checkout and kitchen printers"*.
  - **Persistence**: Persists all 28 configuration keys to MySQL via key-value `Setting` table.
- **Documentation**:
  - [**Printer Settings & Thermal Printing System Guide**](./printer-settings-and-thermal-printing.md)

---

### 2. 2026-09-10 — Feature: Redesigned Settings View with Left-Side Category Navigation & Clean Header-Free Layout
- **Type**: UI/UX Redesign, Navigation & Layout Enhancement
- **Summary**:
  - **Removed Redundant Top Header Banner (`SettingsView.tsx`)**:
    - Eliminated the oversized top card banner ("Store Settings & Configuration" description and horizontal tab bar) to reclaim screen space and avoid duplication with the navbar.
  - **Left-Side Category Navigation (Desktop/Tablet) & Mobile Pills**:
    - Replaced the horizontal tabs with an intuitive, sticky left-hand navigation sidebar (`lg:col-span-4`) that categorizes settings logically.
    - Each category item displays a distinct icon, title, subtitle, and **live status badge** reflecting real-time system state (e.g. `CF-MUM-001`, `5% Tax`, `80% Vol`, `4s Duration`).
    - Added a responsive horizontal pill selector for mobile screens (`lg:hidden`).
  - **Structured Category Breakdown**:
    1. **Store Profile (`'profile'`)**: Store brand identity, Cafe logo badge (`CafeBrandBadge`), manager contact, location, GSTIN, receipt footer note, and quick launch to `StoreProfileModal`.
    2. **Tax & Billing (`'tax'`)**: Invoice tax naming, global tax percentage input with live tax preview example, and offline license/subscription verification card with dedicated save button.
    3. **Audio Chimes (`'audio'`)**: Order completion chime toggle, tone selection with 4 cafe presets (`Cafe Bell`, `Counter Ring`, `Digital Chime`, `Soft Ping`), live audio preview testing buttons, and volume slider.
    4. **Popup Alerts (`'popup'`)**: Floating order completion toast notification switch, display duration selector (`3s`, `4s`, `5s`, `8s`), and dedicated save action.
  - **Independent Form Submissions**:
    - Split configuration into independent save handlers (`handleSaveTaxSettings`, `handleSaveOwnerConfig`) to prevent cross-category payload collisions and provide instant, clear success banners.

---

### 2. 2026-09-10 — Feature: Multi-Color Floor Section / Area Visual Distinction (Table Setup & POS)
- **Type**: New Requirement, Visual Distinction & Theme Architecture
- **Summary**:
  - **Database & Backend Architecture**:
    - Expanded Prisma `Area` model with optional `color String?` field.
    - Synchronized MySQL database table `Area` via `npx prisma db push` and regenerated Prisma Client.
    - Backend `AreaController` and `AreaService` automatically persist and return `color` on creation and modification.
  - **Comprehensive 8-Color Palette (`areaColors.ts`)**:
    - Configured 8 rich color themes: **Warm Amber**, **Royal Indigo**, **Fresh Emerald**, **Velvet Purple**, **Coral Rose**, **Electric Cyan**, **Ocean Blue**, and **Deep Teal**.
    - Each theme provides complete styling tokens: card top accent line, theme border, header background tint, icon badge, table count pill, quick table tile border, table card hover ring, and filter tab active states.
    - **Smart Fallback & Auto-Suggestion**: Automatic cyclic fallback ensures every section always has a distinct color even if existing in the database without one. New sections automatically suggest the next unused color in the palette (`getNextAvailableColor`).
  - **Color Picker in Section Modal (`AreaModal.tsx`)**:
    - Added an interactive **Section Color Theme** palette picker with 8 circular color swatches, active checkmark indicator, and real-time color name display.
    - Persists the selected color theme when creating or editing sections.
  - **Floor Setup Screen (`FloorManagement.tsx`)**:
    - **Clean Neutral Card with Softly Tinted Header**: Removed solid contrast top accent lines to keep the outer card sleek and neutral (`border-stone-200/80 dark:border-stone-800`), while maintaining the distinct soft header tint (`theme.headerBg`), color-coded `MapPin` icon badge, and table count badge.
    - **Colored Filter Tabs**: Section filter pills display a live color dot for each area when unselected, and illuminate in that section's full color theme when selected.
    - **Cohesive Quick Action**: The dashed `+ New Table` tile inside each section reflects that area's theme color on borders and hover states.
  - **Table Modal & POS Sidebar Integration**:
    - In `TableModal.tsx`, the Floor Section / Area dropdown presents the section's color dot next to its name.
    - In `POSTableSidebar.tsx`, POS area filter buttons display the area's color dot and highlight in its theme when selected.
- **Documentation**:
  - [**System README**](../README.md#4-🍽️-dine-in-tables--live-floor-management)

---

### 2. 2026-09-10 — UI Enhancement: Modernized Custom Dropdowns for Table Management (Floor Section & Availability Status)
- **Type**: UI Enhancement, Form Usability & Design System
- **Summary**:
  - **Replaced Raw Native `<select>` Elements (`TableModal.tsx`)**: Replaced browser-default HTML select dropdowns with the application's modern, custom-designed `Select` UI component.
  - **Floor Section / Area Dropdown**:
    - Includes search filter for rapid selection when many dining sections exist (`searchable={areaOptions.length > 5}`).
    - Left-aligned `<Layers className="w-4 h-4" />` icon in the input trigger.
    - Rich option rows showcasing dining section name, optional section description/notes, total registered tables badge (`X Tables`), and amber section icons.
  - **Table Availability Status Dropdown**:
    - Clean, modern option list with status-colored indicators and helper descriptions:
      - **Available**: Pulsing emerald dot (`🟢`), badge: `Ready`, description: `Clean & ready for new guests`.
      - **Reserved**: Warm amber dot (`🟡`), badge: `Booked`, description: `Pre-booked or held for reservation`.
      - **Occupied**: Vibrant rose dot (`🔴`), badge: `In Use`, description: `Guests currently seated & dining`.
    - **Smart Upward Direction (`dropdownDirection="up"`)**: Ensured the status dropdown opens upwards over seating presets to avoid vertical scrollbars or clipping at the bottom of the modal.
  - **Component Library Upgrade (`Select.tsx`)**:
    - Extended `SelectProps` to support `label?: React.ReactNode`, `leftIcon`, `dropdownDirection` (`'up' | 'down' | 'auto'`), `triggerClassName`, and `menuClassName`.
    - Integrated Escape key listener for keyboard dismissal.
    - Synchronous directional calculation preventing upward-opening render flicker.
    - Matched styling to `Input.tsx` (rounded-xl, amber focus rings, consistent typography and dark mode support).
- **Documentation**:
  - [**System README**](../README.md#4-🍽️-dine-in-tables--live-floor-management)

---

### 2. 2026-09-10 — Feature: Menu Search & Dietary Filter Chips (Veg / Non-Veg / Egg / Vegan)
- **Type**: UI Enhancement, Filtering & Catalog Discovery
- **Summary**:
  - **Search by Menu Name (`MenuItemsGrid`)**: Added a real-time search input bar with search icon and an instant clear (`X`) button. Filters menu items in the active category by dish/beverage name in a case-insensitive manner.
  - **Dietary Filter Chips (`All`, `Veg`, `Non-Veg`, `Egg`, `Vegan`)**:
    - Added styled dietary filter pills with live item count badges scoped to the selected category and subcategory.
    - Standardized badges and icons for each dietary classification:
      - `All` (neutral pill with total dish count)
      - `Veg` (emerald styling with FSSAI green circle badge)
      - `Non-Veg` (rose styling with FSSAI red triangle badge)
      - `Egg` (amber styling with 🟡 indicator)
      - `Vegan` (green styling with 🌱 indicator)
    - Clicking any active dietary chip toggles back to `All`, or users can click the explicit `All` chip.
  - **Default Selected Veg**:
    - The menu grid defaults to `selectedDiet = 'Veg'` whenever the page loads or a new category is selected from the sidebar.
    - Category switching automatically resets the filter to `Veg` and clears the search box.
  - **Smart Cross-Diet Search Suggestions & Empty States**:
    - When searching for a dish that is in a different dietary category (e.g. searching "Chicken" while `Veg` is selected), the empty state proactively detects the match and offers a one-click button: `View All Results (X)` to immediately switch to `All` without losing the search term.
    - Clear contextual empty states with actionable buttons for empty search results, empty dietary categories (`Add [Diet] Dish`), and empty subcategories.
  - **Dietary Classification Propagation**:
    - Clicking `+ Add Dish / Beverage` passes the currently active dietary filter (`Veg`, `Non-Veg`, `Egg`, `Vegan`) into `ItemModal` as the default dietary preference for fast item creation.
    - Added `vegan` variant to `Badge.tsx` and updated `POSProductGrid.tsx` to support `Vegan` badges and filters.
- **Documentation**:
  - [**System README**](../README.md#2-🍽️-menu--dynamic-categories-management)

---

### 2. 2026-09-10 — UI Enhancement: Floor Management Redesign & Table Workflow Polish
- **Type**: UI Enhancement, Layout Streamlining & Hook Fix
- **Summary**:
  - **Header Simplification (`FloorManagement.tsx`)**: Removed redundant top Header Card (`Floor & Table Architecture`) as the page title is already clearly indicated in the Navbar. This eliminates unnecessary vertical whitespace and brings the KPI overview and tables immediately into view.
  - **Repositioned 'Add Section / Area' Button**: Moved the primary `+ Add Section / Area` button down into the section filter & table search controls bar, providing a consolidated, cohesive toolbar.
  - **Area/Section Card Header Cleanup**: Removed the redundant `Add Table` button from each section's header card (as table creation is handled intuitively via the prominent dashed `+ New Table` card in the grid and the empty state button), leaving only the clean `Edit Section` trigger.
  - **Table Cards Minimalist Redesign (Screen Shot 1)**: Removed the top `AVAILABLE`, `OCCUPIED`, `RESERVED` status badge pills from table cards. Status is now decided based on the central Chair Icon color (🟢 Green = Available, 🔴 Red = Occupied, 🟡 Yellow = Reserved), keeping the cards clean and balanced.
  - **Table Status KPI Labels (Screen Shot 2)**: Added explicit text labels to the counts in the top KPI strip (`🟢 {count} Available • 🔴 {count} Occupied • 🟡 {count} Reserved`) for clear, instant understanding.
  - **Floor Architecture Overview (KPI Strip)**: Added high-level metric cards: Total Dining Sections, Total Tables, Max Seating Capacity (guests), and live availability breakdown.
  - **Section Filter Tabs & Real-Time Search**: Added quick section filter pills (`All Sections`, `Main Dining`, etc.) and a table search bar allowing instant table lookup by name or seating capacity.
  - **React Rules of Hooks Fix (`TableModal.tsx`)**: Fixed runtime error (`Rendered more hooks than during the previous render`) by moving all `useState` hook declarations (`isSaving`, `isDeleting`, `showConfirmDelete`, `error`) to the top of the component unconditionally prior to any early returns.
  - **Table & Section Deletion Support**: Integrated deletion with confirmation modals in `TableModal.tsx` and `AreaModal.tsx` (with safety validation preventing section deletion if tables are registered).
- **Documentation**:
  - [**System README**](../README.md#4-🍽️-dine-in-tables--live-floor-management)

---

### 3. 2026-09-08 — Feature: Inventory Category Management & Stock Tracking (Requirement 9)
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

### 4. 2026-09-08 — Enhancement: Item Configuration UI Simplification, Inline Add-on Creation & Global Tax Toggle (Issue 8)
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

### 5. 2026-09-08 — UI Polish: Dish Edit Modal Status & Subcategory Row Alignment
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

### 6. 2026-09-07 — Feature: Order History in All Terminals (Quick & Table POS)
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

### 7. 2026-09-07 — Feature: POS Amount Round Up & Decimal Transparency
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

### 8. 2026-09-07 — Bugfix: Thermal Receipt Printing on Settlement & Payment Screen
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

### 9. 2026-09-07 — Reports Suite (Total Summary & Order History) + Dashboard Cleanup
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

### 10. 2026-09-07 — Architecture Decoupling: Dedicated Support Platform (`qsrsystem-hq`)
- **Type**: Architectural Modification
- **Summary**:
  - Decoupled the central Developer/Superadmin Support Platform, Golden DB (Supabase PostgreSQL), and Master Licensing Authority into a separate, independent repository: `qsrsystem-hq`.
  - Moved `support-platform.md` and `API Documentation.html` into `qsrsystem-hq/docs/`.
  - Updated local `README.md` to define the architectural boundary between the on-premise, offline-first local POS (`qsrsystem`) and cloud headquarters (`qsrsystem-hq`).
- **Documentation**:
  - [**System README**](../README.md#🏢-ecosystem--headquarters-qsrsystem-hq)
  - [**Support Platform & Golden DB Spec**](../../qsrsystem-hq/docs/support-platform.md)

---

### 11. 2026-09-06 — Daily Sequential Order Numbering & Live Audio Notifications
- **Type**: New Feature & Workflow Improvement
- **Summary**:
  - **Daily Order Sequence**: Added logic resetting sequential order numbers everyday at midnight (`#1, #2, #3...`) instead of exposing raw auto-incrementing database IDs on customer bills and kitchen tokens.
  - **Real-Time Sound Chime**: Integrated Web Audio API synthetic chime synthesis (with fallback audio) that plays an audible alert whenever an order is successfully completed.
  - **Order Toast Notification**: Added a floating top-right notification toast showing the daily order sequence number, total amount, and item preview.
- **Documentation**:
  - [**Order Notification & Sound Feature Specification**](order-notification-and-sound-feature.md)

---

### 12. 2026-09-04 — Multi-Tender & Partial Payment Settlement
- **Type**: New Feature & Financial Enhancement
- **Summary**:
  - Enabled split and partial payment billing at checkout. Customers can split a single order across multiple tenders (e.g. part Cash, part UPI, part Card).
  - Extended Prisma database schema and transactional order engine with `paidAmount`, `balanceAmount`, and an `OrderPayment` ledger table.
  - Added visual badges for `Partially Paid` vs `Completed` statuses and remaining balance calculations.
- **Documentation**:
  - [**Partial Payment Feature Specification**](partial-payment-feature.md)

---

### 13. 2026-09-04 — Secure Cookie-Based Authentication & Navigation Route Guards
- **Type**: Security & Routing Modification
- **Summary**:
  - Replaced legacy client-side localStorage token reliance with secure, HttpOnly cookie-based session verification via `cookie-parser`.
  - Added React Router `AuthGuard` protecting `/dashboard`, `/menu`, `/inventory`, `/tables`, `/reports`, and `/pos`.
  - Added `PublicOnlyGuard` redirecting logged-in users away from `/login`.
- **Documentation**:
  - [**Local POS Onboarding & Auth Guide**](local-pos-onboarding.md)

---

### 14. 2026-09-03 — Dynamic Cafe Branding & Store Profile Management
- **Type**: New Feature & UI Customization
- **Summary**:
  - Added a Store Profile Modal in Settings allowing managers to customize Business Name, Cafe Code, Address, Phone, GSTIN, Logo URL, and Receipt Footer note.
  - Built `CafeBrandBadge` dynamically rendering the active store's name, code, and logo across top navigation bars, sidebars, login screens, and receipts.
- **Documentation**:
  - [**Brand Name & Identity Guidelines**](Brand%20Name%20Selection.md)
  - [**Local POS Onboarding Guide**](local-pos-onboarding.md)

---

### 15. 2026-09-02 — Offline Cryptographic Licensing & Local Staff PIN Login
- **Type**: Security & Onboarding Feature
- **Summary**:
  - Built an offline mathematical license validation system using HMAC-SHA256 tokens and hardware binding (Machine ID + Cafe Code + Expiry Timestamp).
  - Created `/activate` screen allowing offline store activation without requiring an internet connection on store hardware.
  - Implemented 4-digit quick staff PIN login and Owner username/password credentials.
- **Documentation**:
  - [**Local POS Onboarding Guide**](local-pos-onboarding.md)

---

### 16. 2026-09-01 — Frontend Modularization & Decoupled REST API Client Layer
- **Type**: Architecture & Code Quality Refactoring
- **Summary**:
  - Refactored monolithic frontend into modular domain folders: `auth/`, `dashboard/`, `menu/`, `inventory/`, `tables/`, `pos/`, `reports/`, `settings/`, and `ui/`.
  - Decoupled application state into `AppContext` (user, store, live sync) and `POSContext` (cart, table staging, payment calculations).
  - Created centralized REST API modules (`client.ts`, `menuApi.ts`, `orderApi.ts`, `inventoryApi.ts`, `tableApi.ts`, `settingsApi.ts`).
- **Documentation**:
  - [**Frontend Architecture & Design System**](frontend-architecture-and-design-system.md)

---

### 17. 2026-08-21 — Add-ons & Modifiers Module with Recipe-Based Stock Deductions
- **Type**: New Feature & Inventory Automation
- **Summary**:
  - Added `Addon` entities allowing customizable extras (extra cheese, sauces, toppings) linked to menu items.
  - Integrated automatic recipe-linked stock deduction: placing an order atomically deducts raw ingredients from inventory items and logs an immutable `InventoryHistory` record.
- **Documentation**:
  - [**Stock Summary & Recipe Deduction Specification**](report/stock-summary-report.md)
  - [**System README**](../README.md#3-📦-recipe-linked-inventory--automated-stock-tracking)

---

### 18. 2026-08-19 to 2026-08-31 — Core POS Engine, Dine-In Tables & Setup
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
| **Menu Filters & Search** | Menu Management $\rightarrow$ Dishes. Test search input by dish name (matches case-insensitively) and instant clear 'X'. Verify dietary chips (`All`, `Veg`, `Non-Veg`, `Egg`, `Vegan`) with default selected `Veg`. Verify live count badges and cross-diet result hints on empty search. | [System README](../README.md#2-🍽️-menu--dynamic-categories-management) |
| **Floor & Table Architecture** | Table Management (`/tables`). Verify top header only contains `+ Add Section / Area`. Check KPI strip (Sections, Tables, Seating Capacity, Availability). Test section filter pills and real-time table search. Click `+ Add Table` on section header to verify pre-selected areaId. Click table card to edit/delete table. | [System README](../README.md#4-🍽️-dine-in-tables--live-floor-management) |
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
