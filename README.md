# 🍽️ QSR & Restaurant Management POS System

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11.x-red.svg)](https://nestjs.com/)
[![React](https://img.shields.io/badge/React-19.x-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.x-purple.svg)](https://vitejs.dev/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-7.x-2D3748.svg)](https://www.prisma.io/)
[![Database](https://img.shields.io/badge/Database-MySQL%20%7C%20MariaDB-orange.svg)](https://mariadb.org/)

A full-stack, enterprise-grade **Quick Service Restaurant (QSR) & Dine-In Management System** built with **NestJS**, **React 19**, **TypeScript**, **Prisma ORM (v7)**, and **MySQL / MariaDB**.

The platform provides a modular, production-ready solution for modern food businesses, featuring real-time POS terminals (Counter & Dine-In Table flow), automated recipe-based inventory deduction, floor and table management, menu catalog engineering, authentication, and an executive analytical dashboard.

---

## 📑 Table of Contents

- [✨ Key Features](#-key-features)
- [🏗️ System Architecture](#️-system-architecture)
  - [Frontend Architecture & State Management](#frontend-architecture--state-management)
  - [Backend Architecture & Data Flow](#backend-architecture--data-flow)
- [💻 Tech Stack](#-tech-stack)
- [🗄️ Database Schema & Models](#️-database-schema--models)
- [🛠️ Required Tools & Prerequisites](#️-required-tools--prerequisites)
- [🚀 Installation & Setup Guide](#-installation--setup-guide)
  - [1. Database Setup](#1-database-setup)
  - [2. Backend Setup](#2-backend-setup)
  - [3. Frontend Setup](#3-frontend-setup)
- [🖥️ How to Run & Access the System](#️-how-to-run--access-the-system)
- [📡 API Documentation & Service Layer](#-api-documentation--service-layer)
- [🏢 Ecosystem & Headquarters (qsrsystem-hq)](#-ecosystem--headquarters-qsrsystem-hq)
- [📁 Project Directory Structure](#-project-directory-structure)
- [🔧 Helper Scripts & Maintenance](#-helper-scripts--maintenance)
- [❓ Troubleshooting & FAQs](#-troubleshooting--faqs)

---

## ✨ Key Features

### 1. 📊 Executive Admin Dashboard
- **Live Sales & Performance Metrics**: Real-time tracking of daily orders, revenue, active tables, and comparison trends vs. previous days.
- **7-Day Revenue Analytics**: Interactive visual bar charts displaying weekly revenue distributions.
- **Recent Activity Stream**: Live feed of incoming orders and transaction values.
- **Quick Actions**: One-click shortcuts for rapid item addition, stock replenishment, and table configurations.

### 2. 🍔 Menu & Catalog Engineering
- **Category Hierarchy**: Organize items into categorized groups with custom display ordering and status toggling (`Active`/`Inactive`).
- **Comprehensive Item Configuration**: Support for Veg/Non-Veg badges, SKU codes, preparation times, tax rates, base pricing, and image URLs.
- **Add-on / Modifier System**: Create custom extras and attach them dynamically to menu items with pricing rules.
- **Live Availability Switch**: Instantly toggle out-of-stock items off POS screens.

### 3. 📦 Recipe-Linked Inventory & Automated Stock Tracking
- **Raw Material Stock Control**: Track raw ingredients with unit metrics (`kg`, `L`, `pcs`, etc.) and safety threshold limits.
- **Automated Recipe Deduction**: When orders are placed at POS, the backend atomically deducts exact raw material quantities based on recipe ingredient ratios.
- **Inventory Audit History**: Automatic immutable logging of stock changes per order and manual stock reconciliations.
- **Low Stock Alerts**: Real-time status indicators flagging items nearing replenishment thresholds.

### 4. 🪑 Floor & Dine-In Table Management
- **Multi-Area Seating Layouts**: Group tables by areas/floors (e.g., Main Dining, Rooftop, Patio, AC Hall).
- **Table Capacity & Statuses**: Manage seat capacity per table with dynamic status tracking (`Available`, `In Use`, `Bill Printed`).
- **Live Occupancy Timers**: Real-time elapsed time counters showing how long guests have occupied each table.
- **Table Shifting & Merging**: Reassign or shift orders between active tables effortlessly.

### 5. ⚡ Fast-Casual & Counter POS Terminal
- **High-Velocity Checkout**: Built for fast cashier workflows with keyboard shortcuts, category quick-filters, and search.
- **Add-on Selection Modal**: Customise items with modifiers, custom notes, and variant extras.
- **Discount & Tax Engine**: Apply percentage-based or flat cash discounts with automatic itemized tax computations.
- **Multi-Payment Support**: Cash, Credit/Debit Card, and UPI payments.
- **Instant Thermal Receipt Formatting**: Printable digital bill layouts.

### 6. 🔐 Authentication & Role Views
- **Clean Auth State**: Built-in login and registration views with decoupled context management.
- **Seamless View Switching**: Instant switching between Admin Dashboard, POS Counter, and POS Dine-In modes.

---

## 🏗️ System Architecture

```mermaid
graph TD
    subgraph "Frontend Layer (React 19 + TypeScript + Vite)"
        App[App Root]
        AuthView[Auth: Login / Register]
        AdminLayout[Admin Layout]
        POSLayout[POS Layout]
        
        AppCtx[AppContext: Global State & Tabs]
        POSCtx[POSContext: Cart & Order Engine]
        
        APILayer[Modular API Client Layer]
    end

    subgraph "Backend Layer (NestJS 11 + Express)"
        API[NestJS REST API Server :3000]
        CatMod[Category Module]
        MenuMod[Menu & Addon Module]
        InvMod[Inventory & History Service]
        OrdMod[Transactional Order Engine]
        TableMod[Floor & Table Module]
        SetMod[Settings Module]
    end

    subgraph "Database & Storage"
        Prisma[Prisma ORM 7 + MariaDB Adapter]
        DB[(MySQL / MariaDB: 3306 `qsr_db`)]
    end

    App --> AuthView & AdminLayout & POSLayout
    AdminLayout & POSLayout --> AppCtx & POSCtx
    AppCtx & POSCtx --> APILayer
    APILayer -->|HTTP / JSON via fetch| API
    
    API --> CatMod & MenuMod & InvMod & OrdMod & TableMod & SetMod
    CatMod & MenuMod & InvMod & OrdMod & TableMod & SetMod --> Prisma
    Prisma --> DB
```

### Frontend Architecture & State Management
The frontend is completely refactored and modularized into decoupled layers:
- **`src/views/`**: Top-level layouts (`AdminLayout`, `POSLayout`).
- **`src/context/`**:
  - `AppContext`: Global app state, active tab (`dashboard`, `menu`, `inventory`, `tables`, `settings`), active view (`login`, `register`, `dashboard`, `pos`), theme, notifications.
  - `POSContext`: POS state machine handling active carts, table assignment, search/filter queries, discounts, add-ons, and payment processing.
- **`src/api/`**: Centralized HTTP client (`client.ts`) with service modules (`menuApi.ts`, `orderApi.ts`, `inventoryApi.ts`, `tableApi.ts`, `settingsApi.ts`).
- **`src/components/`**: Domain-grouped component modules (`auth/`, `common/`, `dashboard/`, `menu/`, `inventory/`, `tables/`, `pos/`, `settings/`).
- **`src/types/`**: Shared TypeScript contracts (`app.types.ts`).

---

## 💻 Tech Stack

### Frontend (`frontend`)
| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **React** | `^19.2.8` | Modern UI library with declarative components and hooks |
| **TypeScript** | `~6.0.2` | Strong static typing across state, props, and API payloads |
| **Vite** | `^8.2.0` | Ultra-fast next-gen build tool and HMR dev server |
| **CSS3 / Variables** | Native | Responsive design system with custom CSS tokens |
| **Oxlint** | `^1.75.0` | High-performance JavaScript/TypeScript linter |

### Backend (`backend`)
| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **NestJS** | `^11.0.1` | Scalable, modular enterprise Node.js server framework |
| **TypeScript** | `^5.7.3` | Server-side typed codebase with decorators |
| **Express** | `^5.0.0` | Underlying HTTP request pipeline & middleware |
| **Prisma ORM** | `^7.9.1` | Type-safe query builder, migrations, and schema generator |
| **@prisma/adapter-mariadb** | `^7.9.1` | High-throughput MariaDB/MySQL direct driver adapter |
| **mariadb / mysql2** | `^3.5.3` | Native database connection drivers with pooling |
| **RxJS** | `^7.8.1` | Reactive event and stream handling |

### Database
- **Engine**: MySQL 8.0+ or MariaDB 10.5+
- **Default Database Name**: `qsr_db`
- **Default Port**: `3306`

---

## 🗄️ Database Schema & Models

The database schema is defined in [`backend/prisma/schema.prisma`](backend/prisma/schema.prisma):

```mermaid
erDiagram
    Category ||--o{ MenuItem : contains
    MenuItem ||--o{ RecipeIngredient : requires
    MenuItem ||--o{ OrderItem : ordered_in
    MenuItem ||--o{ ItemTax : taxed_by
    InventoryItem ||--o{ RecipeIngredient : used_in
    InventoryItem ||--o{ InventoryHistory : logs
    Order ||--o{ OrderItem : includes
    Area ||--o{ Table : contains
```

### Models Summary:
1. **`Category`**: `id`, `name`, `description`, `displayOrder`, `status`.
2. **`MenuItem`**: `id`, `name`, `description`, `imageUrl`, `price`, `tax`, `sku`, `prepTime`, `isAvailable`, `type` (Veg/Non-Veg), `status`, `isAddon`, `addonIds`, `categoryId`.
3. **`ItemTax`**: `id`, `name`, `rate`, `menuItemId`.
4. **`Addon`**: `id`, `name`, `description`, `price`.
5. **`InventoryItem`**: `id`, `name`, `unit` (kg/L/pcs), `stock`, `threshold`, `status` (Good/Low Stock).
6. **`RecipeIngredient`**: `id`, `quantity`, `menuItemId`, `inventoryId`.
7. **`InventoryHistory`**: `id`, `date`, `change` (+/- qty), `type` (Order #ID / Restock), `inventoryId`.
8. **`Order`**: `id`, `date`, `paymentMethod` (Cash/Card/UPI), `subtotal`, `tax`, `total`, `status`.
9. **`OrderItem`**: `id`, `quantity`, `price`, `orderId`, `menuItemId`.
10. **`Area`**: `id`, `name`, `description`.
11. **`Table`**: `id`, `name`, `seats`, `status`, `areaId`.
12. **`Setting`**: `key`, `value` (key-value store for app-wide settings).

---

## 🛠️ Required Tools & Prerequisites

Before setting up and running the project, ensure you have the following installed on your machine:

1. **Node.js**: `v20.x` LTS or `v22.x` (Recommended: `v22.18.0` via nvm)
   - Verify: `node -v`
2. **npm**: `v10.x` or higher
   - Verify: `npm -v`
3. **MySQL Server** or **MariaDB Server**:
   - Ensure the service is running on port `3306`.
   - Accessible with a user that has database creation/read/write privileges.
4. **Git**: For source version control.
5. **Browser**: Modern web browser (Chrome, Edge, Firefox, Safari).

---

## 🚀 Installation & Setup Guide

### 1. Database Setup

1. Start your local MySQL or MariaDB service.
2. Open your MySQL client (CLI, MySQL Workbench, phpMyAdmin, or DBeaver) and create the database:
   ```sql
   CREATE DATABASE IF NOT EXISTS qsr_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
3. Configure the environment variables in `backend/.env`:
   ```env
   DATABASE_HOST="localhost"
   DATABASE_PORT=3306
   DATABASE_USER="root"
   DATABASE_PASSWORD="your_password_here"
   DATABASE_NAME="qsr_db"
   DATABASE_CONNECTION_LIMIT=10
   PORT=3000
   ```

---

### 2. Backend Setup

1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Generate the Prisma Client and push schema to your database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. *(Optional)* Fix auto-increment sequences if seeding manual IDs:
   ```bash
   node fix-auto-increment.js
   ```

5. Start the backend development server:
   ```bash
   npm run start:dev
   ```
   *The backend will start on `http://localhost:3000` (listening on all interfaces `0.0.0.0:3000`).*

---

### 3. Frontend Setup

1. Open a second terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. *(Optional)* Create a `.env` file in `frontend/` if you want to override the backend API endpoint:
   ```env
   VITE_API_URL="http://localhost:3000"
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend will start on `http://localhost:5173`.*

> [!NOTE]
> If testing across devices on your local network (e.g. tablet POS / mobile order taking), set `VITE_API_URL` to your machine's LAN IP address (e.g., `http://192.168.1.100:3000`).

---

## 🖥️ How to Run & Access the System

Once both the backend and frontend servers are running, access the various views via your web browser:

| Interface | URL | Purpose |
| :--- | :--- | :--- |
| **Authentication & Portal** | `http://localhost:5173/` | Login, user registration, and view routing |
| **Admin Dashboard & Management** | Select "Dashboard" in Portal | Analytics, Menu catalog, Inventory stock, Floor tables, Settings |
| **Quick Service POS (Counter)** | Select "POS" in Portal | Fast order processing, cashier billing, discounts & receipts |
| **Dine-In Table POS** | Select "POS" -> Dine-In Mode | Floor-plan view, live table timers, table order staging & billing |
| **Backend REST API** | `http://localhost:3000/` | NestJS REST API root & endpoints |

---

## 📡 API Documentation & Service Layer

The frontend consumes the NestJS REST API via the modular service layer in `frontend/src/api/`:

### Categories (`/category`) — `menuApi.ts`
- `GET /category` — Retrieve all categories ordered by `displayOrder`.
- `POST /category` — Create a new menu category.
- `PATCH /category/:id` — Update category details (name, displayOrder, status).
- `DELETE /category/:id` — Delete category.

### Menu Items (`/menu`) — `menuApi.ts`
- `GET /menu` — Retrieve all menu items with category relation.
- `POST /menu` — Create menu item (auto-resolves category name or ID).
- `PATCH /menu/:id` — Update menu item (price, availability, prep time, taxes, image).
- `DELETE /menu/:id` — Remove menu item.

### Add-ons (`/addon`) — `menuApi.ts`
- `GET /addon` — List all modifiers/add-ons.
- `POST /addon` — Create an add-on item.
- `PATCH /addon/:id` — Update add-on.
- `DELETE /addon/:id` — Remove add-on.

### Inventory (`/inventory`) — `inventoryApi.ts`
- `GET /inventory` — Fetch inventory items with stock audit history logs.
- `POST /inventory` — Add raw ingredient / stock item.
- `PATCH /inventory/:id` — Adjust stock/threshold (auto-logs manual stock changes).
- `DELETE /inventory/:id` — Delete inventory item.

### Orders (`/order`) — `orderApi.ts`
- `GET /order` — List order history with item breakdown.
- `GET /order/:id` — Get single order details.
- `POST /order` — **Place order with automatic transactional inventory deduction**.
  ```json
  {
    "paymentMethod": "Cash",
    "subtotal": 250,
    "tax": 12.5,
    "total": 262.5,
    "items": [
      {
        "menuItemId": 1,
        "quantity": 2,
        "price": 125
      }
    ]
  }
  ```
- `PATCH /order/:id` — Update order status.
- `DELETE /order/:id` — Delete order.

### Areas & Tables (`/area`, `/table`) — `tableApi.ts`
- `GET /area` / `POST /area` / `PATCH /area/:id` / `DELETE /area/:id` — Manage seating sections.
- `GET /table` / `POST /table` / `PATCH /table/:id` / `DELETE /table/:id` — Manage tables and seat counts.

### Settings (`/setting`) — `settingsApi.ts`
- `GET /setting` — Retrieve key-value configuration pairs (tax rules, store details).
- `POST /setting` — Upsert application settings.

---

## 🏢 Ecosystem & Headquarters (`qsrsystem-hq`)

The central cloud operations, superadmin developer portal, master cafe registry, and cryptographic license generation authority have been decoupled into a dedicated companion repository:

👉 **[`qsrsystem-hq`](../qsrsystem-hq)**

### Architecture Separation:
- **`qsrsystem` (This Repository)**: The on-premise, offline-first restaurant & QSR POS engine running at local cafe hardware (NestJS + React 19 + MariaDB/MySQL). It verifies store licenses cryptographically offline without requiring continuous internet.
- **[`qsrsystem-hq`](../qsrsystem-hq)**: The Centralized Headquarters hosted on **Vercel + Supabase PostgreSQL** ("Golden DB"). It serves as the master cafe registry, dynamic plan manager, superadmin dashboard, and cryptographic license key generator.

> [!NOTE]
> Detailed documentation for the cloud support platform architecture, Supabase schema, licensing mechanics, and the standalone API reference HTML file have been migrated to the HQ repository:
> - **Architecture & Licensing Spec**: [`qsrsystem-hq/docs/support-platform.md`](../qsrsystem-hq/docs/support-platform.md)
> - **Standalone API Reference**: [`qsrsystem-hq/docs/API Documentation.html`](../qsrsystem-hq/docs/API%20Documentation.html)

---

## 📁 Project Directory Structure

```text
qsrsystem/
├── README.md                          # Complete system documentation (This file)
├── package.json                       # Root project definition
│
├── docs/                              # Local POS Architecture & Feature Documentation
│   ├── Brand Name Selection.md        # Branding and naming strategy
│   ├── frontend-architecture-and-design-system.md  # UI design tokens and component structure
│   ├── local-pos-onboarding.md        # Local store setup & offline activation guide
│   ├── order-notification-and-sound-feature.md     # Real-time audio alerts & Web Audio API
│   └── partial-payment-feature.md     # Split/partial billing workflow
│   *(Note: Support platform & API HTML docs have moved to qsrsystem-hq/docs/)*
│
├── frontend/                          # Refactored Frontend (React 19 + TypeScript + Vite)
│   ├── index.html                     # Single-page application HTML root
│   ├── package.json                   # Frontend dependencies & scripts
│   ├── vite.config.ts                 # Vite bundler configuration
│   ├── tsconfig.json                  # TypeScript project references
│   ├── tsconfig.app.json              # TypeScript application config
│   └── src/
│       ├── main.tsx                   # React root mount
│       ├── App.tsx                    # Top-level routing & provider root
│       ├── App.css                    # Component-level styles
│       ├── index.css                  # Design tokens, typography & global layouts
│       ├── api/                       # Decoupled REST API Client layer
│       │   ├── client.ts              # Base fetch wrapper with VITE_API_URL
│       │   ├── menuApi.ts             # Categories, Menu Items & Addons API
│       │   ├── orderApi.ts            # Orders API
│       │   ├── inventoryApi.ts        # Inventory items & stock history API
│       │   ├── tableApi.ts            # Floor areas & tables API
│       │   └── settingsApi.ts         # Application settings API
│       ├── context/                   # Global state management providers
│       │   ├── AppContext.tsx         # User auth, tabs, views & notifications
│       │   └── POSContext.tsx         # Cart, POS tables, discounts & calculations
│       ├── types/                     # Shared TypeScript data models & contracts
│       │   └── app.types.ts           # Types for categories, items, orders, tables, etc.
│       ├── views/                     # Layout orchestrators
│       │   ├── AdminLayout.tsx        # Dashboard layout with sidebar navigation
│       │   └── POSLayout.tsx          # POS terminal layout (Counter & Dine-In)
│       └── components/                # Modular domain components
│           ├── auth/                  # LoginView, RegisterView
│           ├── common/                # Header, Sidebar
│           ├── dashboard/             # DashboardView, StatCards, RevenueChart, RecentActivity, QuickActions
│           ├── menu/                  # MenuView, MenuItemsGrid, CategorySidebar, Modals, AddonsManagement
│           ├── inventory/             # InventoryView, InventoryTable, UpdateStockModal, HistoryModal
│           ├── tables/                # FloorManagement, AreaModal, TableModal
│           ├── pos/                   # POSTopNav, CategoryTabs, ProductGrid, CartSidebar, CheckoutModal, Modals
│           └── settings/              # SettingsView
│
├── backend/                           # Backend Application (NestJS 11 + Prisma ORM 7)
│   ├── .env                           # Environment variables (DB credentials & Port)
│   ├── package.json                   # Backend dependencies & scripts
│   ├── tsconfig.json                  # TypeScript server config
│   ├── nest-cli.json                  # NestJS CLI configuration
│   ├── prisma.config.ts               # Prisma datasource configuration
│   ├── fix-auto-increment.js          # Utility script for database sequence adjustments
│   ├── prisma/
│   │   └── schema.prisma              # Database schema definition (MySQL / MariaDB)
│   └── src/
│       ├── main.ts                    # Server bootstrap with CORS, port & void promise handler
│       ├── app.module.ts              # Root NestJS module wiring all feature modules
│       ├── prisma/                    # Prisma service with MariaDB adapter
│       ├── category/                  # Category management module
│       ├── menu/                      # Menu items and recipe management module
│       ├── addon/                     # Addons and modifiers module
│       ├── inventory/                 # Inventory and stock audit history module
│       ├── order/                     # Order engine with transactional recipe deduction
│       ├── area/                      # Dining floor / area management module
│       ├── table/                     # Table configuration module
│       └── setting/                   # Store settings & configuration module
│
└── local-backend/                     # Auxiliary / lightweight fallback backend workspace
```

---

## 🔧 Helper Scripts & Maintenance

- **Test Database Connectivity**:
  ```bash
  cd backend
  node test-mariadb.js
  ```
- **Sync & Push Database Schema Changes**:
  ```bash
  cd backend
  npx prisma db push
  ```
- **Open Prisma Studio (Visual DB GUI)**:
  ```bash
  cd backend
  npx prisma studio
  ```
- **Lint Codebase**:
  ```bash
  # Frontend
  cd frontend && npm run lint

  # Backend
  cd backend && npm run lint
  ```

---

## ❓ Troubleshooting & FAQs

### Q1: `PrismaClientInitializationError: Can't reach database server`
- **Cause**: MySQL/MariaDB is not running or credentials in `backend/.env` do not match.
- **Fix**: Verify MySQL service status (e.g. `services.msc` on Windows or `systemctl status mysql`), test connectivity with `node test-mariadb.js` in `backend`, and check credentials in `backend/.env`.

### Q2: `✘ [CLI.UNKNOWN_COMMAND] No command registered for generate`
- **Cause**: An unstable release candidate or incompatible CLI version of Prisma (e.g., Prisma 8 RC) is installed in `devDependencies`.
- **Fix**: Ensure `prisma` and `@prisma/client` versions match `^7.9.1` in `backend/package.json`, then run `npm install` and `npx prisma generate`.

### Q3: Frontend fails to connect to backend (`API Error / Failed to fetch`)
- **Cause**: Backend server is not running or frontend is attempting to fetch from an incorrect URL.
- **Fix**: Ensure `npm run start:dev` is running in `backend` on port `3000`. By default, the API client points to `http://localhost:3000`. If you need a custom host or LAN IP, define `VITE_API_URL="http://<YOUR_IP>:3000"` in `frontend/.env`.

### Q4: Auto-increment primary key collision on fresh import
- **Fix**: Run `node fix-auto-increment.js` in the `backend` directory to reset table sequence pointers to `MAX(id) + 1`.

---

## 📄 License

This project is licensed under the [ISC License](LICENSE) or proprietary terms of the owner.
