# Velora POS System — Release, Onboarding & Architecture Guide

> **Version:** 1.0.0 (Release 1)  
> **Author:** DeepMind / Velora Engineering Team  
> **Scope:** Architecture rationale, Dynamic Database Provisioning, Build Distribution, Disaster Recovery, and Operator Guide.

---

## 1. Executive Overview & Design Philosophy

The Velora QSR POS system is built as an **offline-first, single-store autonomous POS engine**. In high-speed Quick Service Restaurants and cafes, network outages or remote cloud latency cannot be allowed to halt billing, kitchen order tickets (KOT), or table turnarounds.

For this reason, every cafe terminal runs a local engine:
- **Backend:** NestJS on Node.js with MySQL 8.x / MariaDB.
- **Frontend:** React 19 + Tailwind CSS + Lucide Icons + React Router.
- **ORM / Data Layer:** Prisma ORM with `@prisma/adapter-mariadb`.

This document explains **why** every piece of the release, database provisioning, API proxying, and backup architecture is designed the way it is.

---

## 2. Dynamic Database Architecture: Why Dynamic DB Names per Cafe?

### 2.1 The Problem with Hardcoded `qsr_db`
In traditional boilerplate setups, systems often default to a hardcoded database name like `qsr_db`. However, in real-world commercial rollouts:
1. **Multi-Store Management:** A franchisee or franchise group may host multiple store instances or test instances on one local server or QA machine. If everyone uses `qsr_db`, data collisions and overwrite disasters happen immediately.
2. **License Key Binding & Identity:** When an activation license key is issued from `qsrsystem_hq` or GoldenDB, it encodes the store's identity (e.g. `businessName: "Mocha Bliss"`, `cafeCode: "MB-01"`). Giving each store its own isolated database name (e.g., `mocha_bliss`) creates a 1-to-1 match between the cryptographic license and the physical database.
3. **Audit & Regulatory Compliance:** Accounting databases must be easily identifiable by tax authorities, accountants, and auditors. A dump named `backup_mocha_bliss_2026-09-21.sql` is unmistakable, whereas `backup_qsr_db.sql` is ambiguous and prone to fatal restore errors.

### 2.2 The "Chicken-and-Egg" Prisma Boot Constraint
When NestJS boots, its `PrismaService` initializes connection pooling using the connection string defined in `DATABASE_URL`.
- **The Catch:** If the database specified in `DATABASE_URL` does not exist yet, MySQL immediately rejects the connection with:
  ```
  PrismaClientInitializationError: Unknown database 'mocha_bliss'
  ```
- This prevents the application from booting or running migrations from within NestJS controllers.

### 2.3 The Solution: `init-db.js` Pre-Flight Initializer
To solve this cleanly without manual MySQL workbench interaction:
1. `init-db.js` executes **before** NestJS or Prisma starts.
2. It connects directly to the MySQL instance (without attaching to a database) using `mysql2/promise`.
3. It executes:
   ```sql
   CREATE DATABASE IF NOT EXISTS `mocha_bliss` 
   CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
4. It dynamically rewrites `backend/.env` with:
   ```env
   DATABASE_NAME=mocha_bliss
   DATABASE_URL="mysql://root:password@localhost:3306/mocha_bliss"
   ```
5. `setup.bat` then immediately runs:
   ```cmd
   npx prisma db push --skip-generate
   ```
   Because the database now exists, Prisma connects instantly, pushes all Prisma schema tables (Users, Categories, MenuItems, Orders, OrderItems, KOTs, InventoryItems, Recipes, Tables, Areas, Licenses, Settings) into the fresh database with zero human intervention.

---

## 3. Single-Port Production Serving & API Routing

### 3.1 Dev Mode vs Production Mode
- **In Development:**
  - Frontend runs on Vite dev server (`http://localhost:5173`).
  - Backend runs on NestJS (`http://localhost:3000`).
  - Vite uses an internal proxy that rewrites `/api/*` to `http://127.0.0.1:3000/*`.
- **In Production (POS Terminal):**
  - Requiring a store cashier or manager to launch two terminal windows (one for Vite and one for NestJS) is fragile and error-prone.
  - In release builds, the entire system must run on **Port 3000 as a single unified service**.

### 3.2 Why Express `/api` Rewrite Middleware?
All frontend API calls are authored with the `/api` prefix (e.g. `/api/order`, `/api/menu`, `/api/inventory/recipes`).
In `backend/src/main.ts`, we registered:
```ts
app.use((req: any, res: any, next: any) => {
  if (req.url.startsWith('/api/')) {
    req.url = req.url.substring(4); // transforms '/api/order' -> '/order'
  } else if (req.url === '/api') {
    req.url = '/';
  }
  next();
});
```
**Why do this?**
- Zero code changes required in either frontend API services or backend NestJS controllers.
- Backend controllers remain cleanly structured (`@Controller('order')`, `@Controller('menu')`).
- In dev mode, Vite handles the rewrite; in production mode, NestJS handles the rewrite. Both environments run identical frontend code.

### 3.3 SPA Fallback Routing
Because the frontend uses `react-router-dom` with HTML5 History API (`/pos`, `/dashboard`, `/tables`, `/menu`), when a user refreshes their browser on `http://localhost:3000/tables`, the browser sends a direct `GET` request for `/tables`.
- Without SPA fallback, the server would return 404 Not Found.
- In `backend/src/main.ts`, our static handler detects direct browser navigations (`Accept: text/html`) that are not `/api` routes and serves `frontend/dist/index.html`.
- React Router then takes over on the client and renders the requested view seamlessly.

### 3.4 Microsoft Edge Standalone App Mode (`--app`)
In `start.bat`, the system launches:
```cmd
msedge.exe --app=http://localhost:3000
```
**Why `--app`?**
- It removes browser address bars, navigation buttons, extension icons, and tab strips.
- It locks the cashier's focus onto the POS interface.
- It gives the user experience of a native Windows desktop application with the speed, responsiveness, and beauty of modern React.

---

## 4. Disaster Recovery & Automated Backup Architecture

### 4.1 Why Local Backups are Critical
In restaurant environments, hardware accidents happen (coffee spills, sudden power outages, SSD wear). Losing a single day's sales data or recipe stocks can destroy business records and inventory balances.

### 4.2 How `backup-db.js` Works
1. **Binary Auto-Discovery:** On Windows, `mysqldump.exe` is often installed in `C:\Program Files\MySQL\MySQL Server 8.x\bin` but not added to system `PATH`. The script automatically scans standard MySQL directories, guaranteeing it works out-of-the-box on any Windows machine.
2. **Crash-Safe Flags:** Executes `mysqldump` with `--single-transaction --quick --routines --triggers --hex-blob`. This guarantees that if transactions or KOTs are running while a backup occurs, the snapshot remains 100% consistent without locking tables.
3. **Snapshot Versioning & Pointer:**
   - Saves dated snapshot: `backups/backup_mocha_bliss_2026-09-21_13-19-06.sql`.
   - Copies to `backups/backup_latest.sql` for instant 1-click restore testing.
4. **30-Day Automated Retention:** POS terminals have finite SSD space. The script purges `.sql` files older than 30 days automatically.
5. **Google Drive Cloud Sync:**
   - If `GOOGLE_DRIVE_BACKUP_PATH` is defined in `.env` (pointing to Google Drive for Desktop virtual folder `G:\My Drive\QSR_Backups`), every backup is mirrored off-site in real time. If the POS terminal is stolen or destroyed, the entire database is safe in the cloud.

---

## 5. Git, GitHub Releases & Semantic Versioning

### 5.1 What Does Version `1.0.0` Mean?
Semantic Versioning follows `MAJOR.MINOR.PATCH`:
- **MAJOR (`1`):** Represents the first stable, production-grade release of Velora POS. Breaking database or architectural changes increment this number (e.g. `2.0.0`).
- **MINOR (`0`):** Backwards-compatible features added (e.g. adding a new loyalty program or custom receipt template $\rightarrow$ `1.1.0`).
- **PATCH (`0`):** Backwards-compatible bug fixes or minor tweaks (e.g. fixing a dropdown clipping issue or tax rounding $\rightarrow$ `1.0.1`).

### 5.2 Why Build Artifacts Are NEVER Committed to Git
- **Never commit:** `node_modules/`, `dist/`, `.env`, or `.sql` files to GitHub.
- **Why?**
  1. `node_modules` contains thousands of OS-specific binary packages (e.g. Windows vs Linux C++ bindings).
  2. Committing large build artifacts bloats repository history permanently.
  3. Git is for **source code**; GitHub Releases is for **distribution binaries**.

### 5.3 Production Release Folder Structure
When preparing a release package for a client terminal or store installer:

```
qsrsystem-release-v1.0.0/
├── backend/
│   ├── dist/                   <-- Pre-compiled NestJS JavaScript
│   ├── node_modules/           <-- Production dependencies only (npm prune --production)
│   ├── prisma/
│   │   └── schema.prisma       <-- Data models
│   ├── scripts/
│   │   ├── init-db.js          <-- DB creation & .env updater
│   │   └── backup-db.js        <-- Automated mysqldump engine
│   ├── .env                    <-- Configured for customer
│   └── package.json
├── frontend/
│   └── dist/                   <-- Pre-compiled Vite static bundle (HTML, JS, CSS)
├── backups/                    <-- Auto-created backup folder
├── setup.bat                   <-- 1-Click First Time Setup
├── start.bat                   <-- 1-Click Daily Launcher
├── backup-now.bat              <-- 1-Click Manual Backup Snapshot
└── README-RELEASE.txt          <-- Instructions for store manager
```

---

## 6. Store Operator & Technician Guide

### Initial Store Deployment
1. Run `setup.bat`.
2. When prompted:
   - Enter cafe database name (e.g., `mocha_bliss`) or press `ENTER` to accept default.
   - The script creates the MySQL database and pushes all tables automatically.
3. Once completed, the terminal is ready.

### Daily Store Launch
1. Double-click `start.bat`.
2. The background engine starts, and Microsoft Edge opens the POS terminal in dedicated application mode.

### Nightly Closing & Backups
1. Double-click `backup-now.bat` (or let Windows Task Scheduler trigger it automatically at midnight).
2. The snapshot is saved locally to `backups/` and synced to Google Drive if configured.
