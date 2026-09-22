# QSR POS System v1.0.0 — Production Build, Release, Database Initialization & Onboarding Architecture Guide

## Executive Summary
This document defines the production release architecture, GitHub distribution workflow, dynamic database initialization, disaster recovery backup engine, and onboarding lifecycle for the **Velora / QSR POS System (Build 1, v1.0.0)**. 

---

## 1. Semantic Versioning Specification (`v1.0.0`)

The versioning follows the strict **SemVer 2.0.0** (`MAJOR.MINOR.PATCH`) standard:

```
      v 1  .  0  .  0
        │     │     │
        │     │     └── PATCH (Backwards-compatible bug fixes)
        │     └──────── MINOR (Backwards-compatible new features)
        └────────────── MAJOR (Breaking changes or production milestone)
```

### 1.1 What Each Number Indicates

1. **MAJOR (`1`): First Production-Ready Milestone**
   - Represents the first stable, production-grade release of the QSR POS System.
   - Signals that the core architectural contracts (database schema, Prisma models, order lifecycles, and KOT state machines) are finalized and validated for real-world cafe and restaurant deployments.
   - In the future, increment this number (e.g. `v2.0.0`) **only** when introducing breaking changes (e.g., major database engine migration, incompatible API rewrites, or structural architectural overhauls).

2. **MINOR (`0`): Feature Additions**
   - Incremented when adding new functionality in a backwards-compatible manner.
   - Examples for future releases:
     - Adding customer loyalty points & reward programs $\rightarrow$ `v1.1.0`.
     - Adding multi-printer kitchen routing (e.g., Bar vs. Kitchen KOT) $\rightarrow$ `v1.2.0`.
     - Adding custom receipt template designers $\rightarrow$ `v1.3.0`.
   - No existing database data or cafe configurations are broken when moving between minor versions.

3. **PATCH (`0`): Bug Fixes & Stability Polish**
   - Incremented for backwards-compatible bug fixes, UI adjustments, and performance optimizations.
   - Examples:
     - Fixing dropdown clipping in checkout modals $\rightarrow$ `v1.0.1`.
     - Correcting currency rounding edge-cases in partial payments $\rightarrow$ `v1.0.2`.
     - Adjusting responsive sidebar layout for 10-inch tablets $\rightarrow$ `v1.0.3`.

---

## 2. Release Distribution Folder Structure

The production distribution package is generated under:
`Build Release/qsr-pos-v1.0.0-windows/`

This is the exact standalone directory provided to client cafes, franchise stores, and deployment technicians:

```
Build Release/qsr-pos-v1.0.0-windows/
├── backend/
│   ├── dist/                   # Pre-compiled NestJS JavaScript application
│   │   ├── main.js             # Server entry point with static UI hosting
│   │   ├── app.module.js
│   │   └── ...                 # Compiled domain controllers and services
│   ├── prisma/
│   │   └── schema.prisma       # Database schema models and relations
│   ├── scripts/
│   │   ├── init-db.js          # Dynamic database creator and .env updater
│   │   └── backup-db.js        # Automated crash-safe database backup engine
│   ├── package.json            # Production dependencies specification
│   ├── .env                    # Active cafe configuration file
│   └── .env.example            # Configuration template with parameter guides
├── frontend/
│   └── dist/                   # Pre-compiled Vite static frontend bundle
│       ├── index.html          # SPA entry point
│       ├── assets/             # Bundled JS, CSS, fonts, and icons
│       └── ...                 # Logos, emblems, and static assets
├── backups/                    # Dedicated snapshot folder (auto-created)
│   └── .gitkeep
├── setup.bat                   # 1-Click First-Time Setup Launcher
├── start.bat                   # 1-Click Daily POS System Launcher
├── backup-now.bat              # 1-Click Manual Backup Snapshot Launcher
└── README-INSTALL.txt          # Store Manager & Technician Quick Start Guide
```

### 2.1 Single-Port Production Architecture
In development, the backend runs on `localhost:3000` while Vite runs on `localhost:5173`. In production:
- **Backend Port 3000 hosts everything.**
- NestJS detects the pre-compiled `frontend/dist` directory.
- Static assets (`.js`, `.css`, images) are served through `express.static`.
- SPA navigation (e.g. `/menu`, `/tables`, `/pos`, `/dashboard`) serves `index.html` on GET requests.
- API endpoints (`/api/*`) are transparently rewritten to route directly into NestJS controllers.
- Eliminates CORS issues, simplifies Windows Firewall rules, and reduces memory overhead on low-spec POS hardware.

---

## 3. Dynamic Database Initialization (`cafename` Architecture)

### 3.1 The "Chicken-and-Egg" Dilemma & Resolution
In NestJS, `PrismaService` connects to MySQL when the application boots:
```typescript
async onModuleInit() {
  await this.$connect();
}
```
If the database named in `DATABASE_URL` does not exist in MySQL prior to boot, NestJS crashes before listening on port 3000. An in-app browser activation screen cannot create the database if the server itself cannot boot.

### 3.2 Solution: Pre-Boot Initialization Engine (`init-db.js`)
1. `setup.bat` queries the store technician for the Cafe Database Name:
   ```cmd
   Specify the database name for this cafe (e.g. mocha_bliss, central_cafe).
   Or press [ENTER] without typing to use the name defined in configuration:
   ```
2. Calls `node scripts/init-db.js [cafename]`:
   - Normalizes the name into a safe MySQL identifier (lowercased, alphanumeric and underscores only):
     `"Mocha Bliss & Lounge"` $\rightarrow$ `mocha_bliss`
   - Connects to the local MySQL server instance (without specifying a database).
   - Executes:
     ```sql
     CREATE DATABASE IF NOT EXISTS `mocha_bliss` 
     CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
     ```
   - Automatically writes the new database name into `backend/.env`:
     ```properties
     DATABASE_NAME=mocha_bliss
     DATABASE_URL="mysql://root:password@localhost:3306/mocha_bliss"
     ```
3. `setup.bat` immediately runs Prisma push:
   ```cmd
   npx prisma db push --accept-data-loss
   ```
   This synchronizes all models (categories, products, orders, order items, inventory items, tables, and settings) into empty tables within the new database.
4. When `start.bat` is executed, NestJS connects cleanly to the newly created database with zero boot errors.

---

## 4. Disaster Recovery & Automated Backup Architecture

### 4.1 Why Daily Automated Backups are Mandatory
POS systems run in harsh, demanding retail environments subject to sudden power outages, accidental liquid spills, hard drive wear, and terminal theft. Losing sales data or inventory stock reconciliations can severely disrupt a food & beverage business.

### 4.2 Backup Engine (`backup-db.js`) Specifications
1. **Windows Binary Auto-Discovery:**
   - Detects `mysqldump.exe` in the system `PATH`.
   - If not in `PATH`, automatically scans standard MySQL installation directories:
     - `C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqldump.exe`
     - `C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqldump.exe`
     - `C:\xampp\mysql\bin\mysqldump.exe`
     - `C:\laragon\bin\mysql\current\bin\mysqldump.exe`
2. **Crash-Safe Flags:**
   - Runs `mysqldump` with:
     ```cmd
     --single-transaction --quick --routines --triggers --hex-blob
     ```
   - Guarantees an atomic, consistent point-in-time snapshot without locking database tables, allowing backups to occur during active restaurant service.
3. **Snapshot Naming & Version Pointer:**
   - Timestamped file: `backups/backup_mocha_bliss_2026-09-21_14-43-44.sql`.
   - Pointer clone: `backups/backup_latest.sql` (for instant 1-click restore testing).
4. **Automated 30-Day Retention Policy:**
   - Scans `backups/` and automatically deletes backup files older than 30 days (`BACKUP_RETENTION_DAYS=30`), preventing local disk space exhaustion.
5. **Google Drive Cloud Sync:**
   - When `GOOGLE_DRIVE_BACKUP_PATH` is defined in `.env`:
     ```properties
     GOOGLE_DRIVE_BACKUP_PATH="G:\My Drive\QSR_Backups"
     ```
   - Backups are automatically mirrored to the cloud drive instantly. If the physical machine is damaged or stolen, store data is completely safe off-site.

### 4.3 Scheduling Nightly Backups with Windows Task Scheduler
To automate the backup at 11:59 PM every night:
1. Open Windows Start menu $\rightarrow$ type **Task Scheduler** $\rightarrow$ press Enter.
2. Click **Create Basic Task...** in the right panel.
3. Name: `QSR_POS_Nightly_Backup`.
4. Trigger: Select **Daily** $\rightarrow$ Set start time to `23:59:00`.
5. Action: Select **Start a program**.
6. Program/script:
   ```
   C:\path\to\Build Release\qsr-pos-v1.0.0-windows\backup-now.bat
   ```
7. Start in (optional):
   ```
   C:\path\to\Build Release\qsr-pos-v1.0.0-windows
   ```
8. Click **Finish**.

---

## 5. Git & GitHub Releases Strategy

### 5.1 Why Build Artifacts Are NEVER Committed to Git
- **Never commit:** `node_modules/`, `dist/`, `.env`, `backups/`, or `*.sql` files to GitHub.
- **Reasons:**
  1. `node_modules` contains OS-specific C++ binary bindings (e.g. Windows vs Linux).
  2. Large compiled bundles permanently bloat `.git` repository size and slow down clones.
  3. Git is strictly for **source code history**; GitHub Releases is for **distribution binaries**.

### 5.2 GitHub Tagging & Release Workflow
When ready to publish release `v1.0.0`:

```bash
# 1. Ensure working directory is clean
git status

# 2. Create an annotated Git tag
git tag -a v1.0.0 -m "Release v1.0.0 - First Production Milestone"

# 3. Push the tag to GitHub
git push origin v1.0.0
```

### 5.3 Publishing on GitHub Releases
1. Navigate to your repository on GitHub: `https://github.com/<owner>/qsrsystem`.
2. Click on **Releases** $\rightarrow$ **Draft a new release**.
3. Choose the tag: `v1.0.0`.
4. Release Title: `QSR POS System v1.0.0 — Production Release 1`.
5. Compress the distribution folder:
   - Zip `Build Release/qsr-pos-v1.0.0-windows/` into `qsr-pos-v1.0.0-windows.zip`.
6. Drag and drop `qsr-pos-v1.0.0-windows.zip` into the GitHub release asset uploader.
7. Click **Publish release**.

---

## 6. Store Operator & Field Technician Runbook

### 6.1 First Time Store Setup
1. Extract `qsr-pos-v1.0.0-windows.zip` onto the POS terminal (e.g., `C:\QSR_POS\`).
2. Open `backend/.env` with Notepad and verify MySQL credentials:
   ```properties
   DATABASE_USER=root
   DATABASE_PASSWORD=your_local_mysql_password
   ```
3. Double-click `setup.bat`:
   - Type the cafe database name (e.g. `mocha_bliss`).
   - Press Enter.
   - The script creates the database and populates all tables.
4. Setup completes with a confirmation message.

### 6.2 Daily Operations
1. Turn on the POS terminal.
2. Double-click `start.bat`.
3. The server starts in the background and Microsoft Edge launches in dedicated application mode directly to `http://localhost:3000`.

### 6.3 Emergency Restore Procedure
If a database restore is required:
1. Open Command Prompt in the release folder.
2. Locate the desired `.sql` snapshot in `backups/` (e.g., `backup_mocha_bliss_2026-09-21_14-43-44.sql` or `backup_latest.sql`).
3. Run:
   ```cmd
   mysql -u root -p mocha_bliss < backups\backup_latest.sql
   ```
4. Restart the POS with `start.bat`. All orders, inventory, and menu settings are restored.
