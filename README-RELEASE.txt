================================================================================
                    QSR POS SYSTEM - RELEASE 1.0.0
================================================================================

Welcome to QSR POS System Build Release 1.0.0.
This package is configured for fast, 1-click deployment on Windows POS terminals.

--------------------------------------------------------------------------------
1. PREREQUISITES
--------------------------------------------------------------------------------
Before running the system, make sure the machine has:
  a) Node.js (v18 or v20+): https://nodejs.org
  b) MySQL Server (v8.0 or v8.4) or MariaDB running on port 3306.

--------------------------------------------------------------------------------
2. INITIAL SETUP (RUN ONCE PER CAFE)
--------------------------------------------------------------------------------
1. Double-click `setup.bat`.
2. When prompted:
   - Type your cafe's unique database name (e.g., mocha_bliss) and press ENTER, OR
   - Just press ENTER to use the default database configured in backend/.env.
3. The script will automatically:
   - Create the MySQL database if it doesn't already exist.
   - Configure backend/.env with the exact connection string.
   - Run Prisma to push all required database tables, models, and schemas.
4. When finished, you will see "SETUP COMPLETE!".

--------------------------------------------------------------------------------
3. DAILY USE / HOW TO START
--------------------------------------------------------------------------------
1. Double-click `start.bat`.
2. The system will start the backend engine and launch the POS terminal in a
   distraction-free, full desktop application window.
3. Keep the server window open or minimized while using the POS.

--------------------------------------------------------------------------------
4. DATABASE BACKUPS & DISASTER RECOVERY
--------------------------------------------------------------------------------
Manual Backup:
- Double-click `backup-now.bat` anytime to take an immediate database snapshot.
- Backups are stored in the `backups/` folder as:
  `backup_<cafe_name>_YYYY-MM-DD_HH-mm-ss.sql`

Google Drive Sync (Recommended):
- Install "Google Drive for Desktop" on the machine.
- In backend/.env, set:
  GOOGLE_DRIVE_BACKUP_PATH="G:\My Drive\QSR_Backups"
- Every time a backup runs, it will also upload a copy to your Google Drive!

Scheduled Daily Backups:
- You can schedule `backup-now.bat` in Windows Task Scheduler to run every night
  at closing time (e.g. 11:30 PM).

--------------------------------------------------------------------------------
5. SUPPORT & TROUBLESHOOTING
--------------------------------------------------------------------------------
- Cannot connect to MySQL: Ensure MySQL service is started in Windows Services (services.msc).
- Port 3000 in use: Verify no other service is occupying port 3000.
================================================================================
