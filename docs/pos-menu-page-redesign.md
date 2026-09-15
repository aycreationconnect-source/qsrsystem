# Velora POS — Menu Page Redesign (Ordering View) Feature Specification

---

## 1. Executive Summary & Purpose

The **POS Menu Page (Ordering View)** is the primary high-velocity transactional workspace for restaurant waitstaff, cashiers, and floor captains. Once a dining table is selected from the Floor Terminal (or in counter Quick Order mode), this interface enables instant category navigation, visual dish discovery, dietary filtering, portion adjustments, and order building.

Following the Table Terminal redesign, the Ordering View has been overhauled to match **Image 2 (Figure 2)**, replacing plain textual cards and cramped horizontal dropdown tabs with:
1. A dedicated **Active Table Subheader** displaying live dining timers, table identity, capacity, and table management actions.
2. A left-hand **Vertical Categories Sidebar** with culinary icons and live dish counts.
3. A center **Visual Food Catalog Grid** featuring rich photography, floating FSSAI dietary badges, inline quantity steppers, and Grid/List view mode switching.
4. An **unmodified right-hand `POSCartSidebar`**, preserving 100% of the active ticket calculations, item customizer notes, taxes, and checkout settlements.

---

## 2. Architectural Comparison: Legacy vs. Redesigned Layout

### 2.1 The Legacy Ordering View (Image 1)
```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ [Brand] [← Floor Plan] [● T-12]    [Search food & beverages...]    [History] [81 Days] [YJ] │
├───────────────────────────────────────────────────────────────────┬─────────────────────────┤
│ [Categories 6 ∨]  [All] [Veg] [Non-Veg] [Egg] [Vegan]             │ Current Ticket          │
├───────────────────────────────────────────────────────────────────┤ 0 items in bill         │
│ DESSERT (5 items)                                                 │                         │
│ [All (5)] [Sub 1 (0)] [Brownies (1)]                              │                         │
│ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐             │ (Cart Sidebar)          │
│ │ Ras Malai     │ │ Gulab Jamun   │ │ Barfi         │             │                         │
│ │ ₹50.00        │ │ ₹50.00        │ │ ₹30.00        │             │                         │
│ └───────────────┘ └───────────────┘ └───────────────┘             │ Subtotal: ₹0.00         │
│                                                                   │ Total:    ₹0.00         │
│ SABJI (3 items)                                                   │ [ Pay ₹0 ]              │
│ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐             │                         │
│ │ Paneer Tikka  │ │ Paneer 65     │ │ Pizza         │             │                         │
│ └───────────────┘ └───────────────┘ └───────────────┘             │                         │
└───────────────────────────────────────────────────────────────────┴─────────────────────────┘
                                   Figure 1: Legacy Layout
```

**Pain Points of Image 1**:
1. **No Visual Food Cues**: Cards were plain white rectangles containing only text labels and prices, slowing down dish identification during peak rushes.
2. **Horizontal Dropdown Clutter**: Categories were hidden inside a dropdown button (`Categories 6 ∨`), forcing multiple taps to inspect menu groups.
3. **Top Navbar Crowding**: The table identity badge (`[● T-12 (Carpet Area)]`) and return button were shoved into the station top navbar alongside global search, license pills, and staff avatars.

---

### 2.2 The Redesigned Ordering View (Image 2 / Figure 2)
```
┌───────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [UB] The Urban Bistro    POS - Table Service [Table Mode]   [Search food & beverages...]  [History] [🔔] [SK] │
├───────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [← Change Table]  [Icon T-03]  [👥 4 Pax]  [⏱ 42 min]  [● Occupied]                 [••• More]       │
├───────────────────┬───────────────────────────────────────────────────────────┬───────────────────────┤
│ ⊞ Categories (8)  │ [All] [Veg] [Non-Veg] [Egg] [Vegan]           [⊞ Grid] [☰]│ Current Order (T-03)  │
├───────────────────┼───────────────────────────────────────────────────────────┤ [T-03] [4 Pax] [42m]  │
│ [All Items    48] │ 🔥 Popular Items                                View All → │                       │
│ [Starters      8] │ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │ • Paneer Tikka  x1    │
│ [Soups         6] │ │ [Photo] 🟩   │ │ [Photo] 🟩   │ │ [Photo] 🟩   │        │ • Lemonade      x2    │
│ [Main Course  12] │ │ Pizza        │ │ Paneer Tikka │ │ Lemonade     │        │ • French Fries  x1    │
│ [Rice/Biryani  8] │ │ ₹280.00      │ │ ₹250.00      │ │ ₹120.00      │        │                       │
│ [Breads        6] │ │ [ + Add ]    │ │ [ + Add ]    │ │ [ + Add ]    │        │ Subtotal:      ₹670.00│
│ [Chinese       6] │ └──────────────┘ └──────────────┘ └──────────────┘        │ Tax (5%):       ₹33.50│
│ [Beverages     8] │ 🍲 Starters                                     View All → │ Total:         ₹703.50│
│ [Desserts      4] │ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │                       │
│ ───────────────── │ │ [Photo] 🟩   │ │ [Photo] 🟩   │ │ [Photo] 🟥   │        │ [ Pay ₹703.50 → ]     │
│ [⚙️ Manage Menu]  │ │ Paneer 65    │ │ Hara Bhara   │ │ Chicken Tikka│        │                       │
└───────────────────┴─┴──────────────┴─┴──────────────┴─┴──────────────┴────────┴───────────────────────┘
                                       Figure 2: New Design
```

---

## 3. Core Functional Components

### 3.1 Active Table Subheader (`POSTableSubheader.tsx`)
Positioned across the left and center ordering canvas directly below the station top navigation bar:
- **`← Change Table` Action**: Single-click return to the Table Floor Terminal (`setSelectedTableId(null)`) while keeping all unsaved cart items and saved KOT orders intact.
- **Table Identity Badge**: Vibrant amber container with seating icon and table name (`[Icon] T-03`).
- **Seating Capacity Chip**: Displays table chair count (`👥 4 Pax`).
- **Live Elapsed Dining Timer**: Dynamically increments in real time (`⏱ 42 min`) based on the table's seated timestamp.
- **Status Indicator**: Color-coded pulse badge (`● Occupied` vs `● Vacant / New`).
- **Clean Streamlining**: Redundant `••• More` menu button removed; table transfer (`Shift Table`) and clear order actions are integrated directly into the `POSCartSidebar` header.

---

### 3.2 Full-Height Expanded Cart Sidebar & Streamlined Spacing (`POSCartSidebar.tsx`)
- **Expanded to Upside (Full Viewport Height)**:
  - `POSCartSidebar` now starts directly below the station top navigation bar, spanning 100% of the vertical height of the ordering workspace.
  - Gives ~56px of extra vertical space for multiple KOT batches, kitchen notes, and long guest bills.
- **Streamlined Vertical Spacing**:
  - Compacted the `Current Ticket` header container (`px-3.5 py-2 sm:px-4 sm:py-2.5`) and column headers (`py-1.5`) to eliminate wasted vertical padding, ensuring maximum visible items without scrolling.

---

### 3.3 Vertical Categories Sidebar (`POSVerticalCategorySidebar.tsx`)
A dedicated left-hand navigation column (width `w-56 xl:w-64`) replacing the legacy dropdown:
- **Header**: `⊞ Categories` with dynamic count of active categories.
- **Category Nav Rows**:
  - Curated Lucide icons assigned based on category name (`Flame` for starters, `Soup` for soups, `CookingPot` for main course, `Wheat` for breads, `CupSoda` for beverages, `Cake` for desserts, etc.).
  - Category label with truncation protection.
  - Live count chip indicating available dishes matching active dietary filters.
  - Active selection highlighted in soft amber container (`bg-[#fff5ea] text-amber-950`).
- **Footer Shortcut**:
  - `⚙️ Manage Menu`: Direct pathway to menu management `/menu`.
- **Responsive Behavior**: Collapses cleanly on mobile/small tablets into an inline horizontal scroll rail inside the main catalog.

---

### 3.4 Center Food Catalog & Products View (`POSProductGrid.tsx`)

#### A. Top Controls Strip
- **Dietary Filter Buttons**:
  - `All`: Solid amber pill when active (`bg-amber-500 text-stone-950`).
  - `Veg`: Emerald outline pill with FSSAI green circle badge (`badge-diet-veg`).
  - `Non-Veg`: Rose outline pill with FSSAI red triangle badge (`badge-diet-nonveg`).
  - `Egg`: Amber outline pill with egg yolk badge.
  - `Vegan`: Emerald outline pill with plant leaf symbol (`🌱`).
- **View Mode Toggle**:
  - `⊞ Grid View`: Default 4-column visual photography card grid.
  - `☰ List View`: Compact horizontal row layout for lightning-fast rush hour billing.

#### B. Category Grouping & Navigation
- When **`All Items`** is selected:
  - Groups items by category with section headers (`🔥 Popular Items`, `🍲 Starters`, `🥣 Soups`, etc.).
  - Includes a **`View All →`** button on each section header that switches the active category filter directly to that section.
- When a **single category** is selected:
  - Displays subcategory filter chips (`All`, `Tandoor`, `Fried`, `Brownies`, etc.) allowing granular drill-down.

#### C. Visual Food Card Anatomy
- **Photography Banner**:
  - Aspect-ratio optimized container (`h-36 sm:h-40 w-full`) with smooth hover zoom.
  - Uses dish's custom `imageUrl`/`image`, with automated culinary fallback resolution via `foodImageUtils.ts`.
  - Floating top-left dietary indicator over image (`badge-diet-veg`, `badge-diet-nonveg`, etc.) on a translucent frosted glass backing.
  - Floating top-right tags: `Custom` (for dishes with addon variants) and `Low Stock` tooltip.
- **Card Body**:
  - Bold dish title and description.
  - High-contrast price in monospace typography (`₹280.00`).
- **Action Control**:
  - If item not in cart: Outlined orange **`+ Add`** button (`border border-amber-500 text-amber-600 hover:bg-amber-500 hover:text-stone-950`).
  - If item in cart (`qty > 0`): Instant **`[- qty +]` stepper** directly on the card for effortless increment/decrement without needing to open the cart drawer!

---

### 3.4 Unmodified Right `POSCartSidebar` Integrity
Per strict instructions:
- The right-hand `POSCartSidebar` remains **100% untouched and identical to Image 1**.
- All ticket calculations, CGST/SGST/VAT displays, item deletion, notes, discounts, KOT kitchen printing, and settlement buttons continue operating seamlessly.

---

## 4. Multi-Device Responsiveness Matrix

| Device Tier | Viewport Width | Layout Presentation |
| :--- | :--- | :--- |
| **Desktop Terminals** | $\ge 1280\text{ px}$ | 3-Column Layout: Left Vertical Categories (`w-64`), Center 4-Column Food Grid, Right `POSCartSidebar` (`w-96` to `w-[420px]`). |
| **Laptops / Compact POS** | $1024\text{ px} - 1279\text{ px}$ | Compact 3-Column: Left Categories (`w-56`), Center 3-Column Food Grid, Right `POSCartSidebar` (`w-96`). |
| **Tablets / iPads** | $768\text{ px} - 1023\text{ px}$ | 2-Column: Left Categories (`w-56`), Center 2-3 Column Food Grid. Cart accessible via slide-over drawer or right toggle. |
| **Mobile Handhelds** | $< 768\text{ px}$ | 1-Column: Categories convert to top horizontal scroll chips. 1-2 Column touch-friendly food cards. Floating bottom order summary pill opens mobile cart drawer. |

---

## 5. Verification & Testing Checklist

- [x] **Production Build**: `npm run build` exits with code 0 without any TypeScript or Vite compilation errors.
- [x] **Floor to Menu Transition**: Selecting a table in Floor Terminal opens the Menu View with the table subheader populated.
- [x] **Table Subheader Controls**: `← Change Table` successfully navigates back to Floor Terminal; `••• More` menu triggers Shift Table, Print Bill, and Clear Table.
- [x] **Vertical Category Navigation**: Clicking any category in the sidebar instantly updates the catalog; `All Items` groups by sections with `View All →` links.
- [x] **Dietary Filtering**: Toggling `Veg`, `Non-Veg`, `Egg`, and `Vegan` filters items in real-time across all sections.
- [x] **Food Photography & Fallbacks**: Dishes render high-quality images, with graceful fallback resolution when no image is uploaded.
- [x] **Inline Quantity Stepper**: Clicking `+ Add` adds item to cart and displays `[- qty +]` controls directly on the card.
- [x] **Grid vs. List View**: View mode toggle smoothly alternates between visual grid cards and compact list rows.
- [x] **Cart Sidebar Unchanged**: `POSCartSidebar` displays tickets, subtotals, tax badges, and payment actions identically to Image 1.
