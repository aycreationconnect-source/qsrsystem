const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const releaseDir = path.join(rootDir, 'Build Release', 'qsr-pos-v1.0.0-windows');

console.log('====================================================');
console.log('  QSR POS Release Packager (v1.0.0)');
console.log(`  Target Output: ${releaseDir}`);
console.log('====================================================');

// Helper to recursively copy directories
function copyDirSync(src, dest) {
  if (!fs.existsSync(src)) {
    throw new Error(`Source folder does not exist: ${src}`);
  }
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// 1. Reset release directory
if (fs.existsSync(releaseDir)) {
  console.log(`Clearing existing release folder...`);
  fs.rmSync(releaseDir, { recursive: true, force: true });
}
fs.mkdirSync(releaseDir, { recursive: true });

// 2. Create subdirectories
const backendDest = path.join(releaseDir, 'backend');
const frontendDest = path.join(releaseDir, 'frontend');
const backupsDest = path.join(releaseDir, 'backups');

fs.mkdirSync(backendDest, { recursive: true });
fs.mkdirSync(frontendDest, { recursive: true });
fs.mkdirSync(backupsDest, { recursive: true });
fs.writeFileSync(path.join(backupsDest, '.gitkeep'), '', 'utf8');

// 3. Copy backend build artifacts
console.log('Copying backend dist...');
copyDirSync(path.join(rootDir, 'backend', 'dist'), path.join(backendDest, 'dist'));

console.log('Copying backend prisma schema...');
fs.mkdirSync(path.join(backendDest, 'prisma'), { recursive: true });
fs.copyFileSync(
  path.join(rootDir, 'backend', 'prisma', 'schema.prisma'),
  path.join(backendDest, 'prisma', 'schema.prisma')
);

console.log('Copying backend scripts...');
fs.mkdirSync(path.join(backendDest, 'scripts'), { recursive: true });
fs.copyFileSync(
  path.join(rootDir, 'backend', 'scripts', 'init-db.js'),
  path.join(backendDest, 'scripts', 'init-db.js')
);
fs.copyFileSync(
  path.join(rootDir, 'backend', 'scripts', 'backup-db.js'),
  path.join(backendDest, 'scripts', 'backup-db.js')
);
fs.copyFileSync(
  path.join(rootDir, 'backend', 'scripts', 'prompt-db.vbs'),
  path.join(backendDest, 'scripts', 'prompt-db.vbs')
);
fs.copyFileSync(
  path.join(rootDir, 'backend', 'scripts', 'setup-complete.vbs'),
  path.join(backendDest, 'scripts', 'setup-complete.vbs')
);

console.log('Copying backend package.json...');
fs.copyFileSync(
  path.join(rootDir, 'backend', 'package.json'),
  path.join(backendDest, 'package.json')
);

// Create .env.example in backendDest
const envExampleContent = `# ========================================================
# QSR POS System - Production Environment Configuration
# ========================================================

# Server Port (Default: 3000)
PORT=3000

# MySQL Server Credentials
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=your_mysql_password
DATABASE_NAME=qsr_db
DATABASE_CONNECTION_LIMIT=10

# Prisma Connection URL (Automatically updated by setup.bat)
DATABASE_URL="mysql://root:your_mysql_password@localhost:3306/qsr_db"

# Automated Database Backup Configuration
BACKUP_RETENTION_DAYS=30

# Optional: Google Drive sync folder (Path to local virtual drive folder)
# e.g.: GOOGLE_DRIVE_BACKUP_PATH="G:\\My Drive\\QSR_Backups"
# GOOGLE_DRIVE_BACKUP_PATH=
`;

fs.writeFileSync(path.join(backendDest, '.env.example'), envExampleContent, 'utf8');

// Copy .env if available as default starting point
const localEnvPath = path.join(rootDir, 'backend', '.env');
if (fs.existsSync(localEnvPath)) {
  fs.copyFileSync(localEnvPath, path.join(backendDest, '.env'));
  console.log('Copied backend/.env into release package.');
} else {
  fs.writeFileSync(path.join(backendDest, '.env'), envExampleContent, 'utf8');
}

// 4. Note: node_modules is intentionally omitted from the release distribution
// to keep package size tiny (~3 MB). setup.bat automatically installs dependencies on first run.
console.log('Skipping node_modules (handled automatically by setup.bat on first run)...');

// 5. Copy frontend distribution bundle
console.log('Copying frontend dist...');
copyDirSync(path.join(rootDir, 'frontend', 'dist'), path.join(frontendDest, 'dist'));

// 6. Copy launcher batch scripts to release root
console.log('Copying launcher scripts...');
fs.copyFileSync(path.join(rootDir, 'setup.bat'), path.join(releaseDir, 'setup.bat'));
fs.copyFileSync(path.join(rootDir, 'start.bat'), path.join(releaseDir, 'start.bat'));
fs.copyFileSync(path.join(rootDir, 'backup-now.bat'), path.join(releaseDir, 'backup-now.bat'));

// 7. Generate README-INSTALL.txt
const readmeContent = `================================================================================
                    QSR POS SYSTEM - RELEASE v1.0.0 (WINDOWS)
================================================================================

Welcome to the QSR POS System production distribution.
This standalone package contains the complete offline-first restaurant management
engine, point-of-sale desktop interface, automated database management, and
disaster recovery tools.

--------------------------------------------------------------------------------
SYSTEM REQUIREMENTS
--------------------------------------------------------------------------------
1. Windows 10 or Windows 11 (64-bit recommended).
2. Node.js LTS v18, v20, or v22 installed (https://nodejs.org).
3. MySQL Server 8.0+ running locally (or XAMPP / MariaDB on port 3306).
4. Modern Chromium browser (Microsoft Edge is pre-installed on Windows).

--------------------------------------------------------------------------------
FIRST TIME STORE SETUP (ONE TIME ONLY)
--------------------------------------------------------------------------------
Step 1: Check Database Credentials
  - Open "backend\\.env" with Notepad.
  - Set your MySQL root password:
      DATABASE_PASSWORD=your_mysql_password
  - Save and close the file.

Step 2: Run Database Setup
  - Double-click "setup.bat".
  - A popup dialog will appear on screen asking:
      "Enter the unique Database Name for this cafe:"
  - Type your cafe name (e.g. mocha_bliss) and click OK.
  - The script will automatically:
      1. Create the dedicated database in MySQL.
      2. Configure backend\\.env with the database name.
      3. Push all database tables and schema relationships.
  - Once finished, you will see a confirmation popup: "Setup Complete!".

--------------------------------------------------------------------------------
DAILY STORE USAGE
--------------------------------------------------------------------------------
To start the POS terminal at store opening:
  1. Double-click "start.bat".
  2. The POS server boots in a background console.
  3. Microsoft Edge launches automatically in dedicated fullscreen app mode:
     http://localhost:3000
  4. Keep the server console minimized while using the POS.

--------------------------------------------------------------------------------
BACKUP & DISASTER RECOVERY
--------------------------------------------------------------------------------
Manual Snapshot:
  - Double-click "backup-now.bat" anytime to take an immediate database snapshot.
  - Backups are stored in the "backups\\" folder with date and time stamps:
      backups\\backup_<cafename>_YYYY-MM-DD_HH-mm-ss.sql
  - The most recent backup is always mirrored to:
      backups\\backup_latest.sql

Automatic Retention:
  - Snapshots older than 30 days are automatically pruned to preserve disk space.

Automatic Cloud Sync to Google Drive:
  1. Install "Google Drive for Desktop" on the POS machine.
  2. In "backend\\.env", add the path to your Google Drive backup folder:
       GOOGLE_DRIVE_BACKUP_PATH="G:\\My Drive\\QSR_Backups"
  3. Every backup will automatically sync off-site to the cloud.

Windows Daily Scheduled Backup:
  To run backups automatically every night at 11:59 PM:
  1. Open Windows "Task Scheduler" -> Create Basic Task.
  2. Trigger: Daily at 23:59.
  3. Action: Start a program -> Select "backup-now.bat".

--------------------------------------------------------------------------------
SUPPORT & ASSISTANCE
--------------------------------------------------------------------------------
For license activation keys, troubleshooting, or updates:
Visit: https://qsrsystem.com/support
Documentation: docs/build-release-and-onboarding-guide.md
================================================================================
`;

fs.writeFileSync(path.join(releaseDir, 'README-INSTALL.txt'), readmeContent, 'utf8');

// 8. Copy RELEASE_NOTES.md
const releaseNotesPath = path.join(rootDir, 'RELEASE_NOTES.md');
if (fs.existsSync(releaseNotesPath)) {
  fs.copyFileSync(releaseNotesPath, path.join(releaseDir, 'RELEASE_NOTES.md'));
  console.log('Copied RELEASE_NOTES.md into release package.');
}

console.log('====================================================');
console.log('  PACKAGE RELEASE ASSEMBLED SUCCESSFULLY!');
console.log(`  Location: ${releaseDir}`);
console.log('====================================================');
