const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const dotenv = require('dotenv');

// 1. Locate .env
const envCandidates = [
  path.resolve(__dirname, '../.env'),
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), 'backend/.env'),
];
const envPath = envCandidates.find((p) => fs.existsSync(p));
if (envPath) {
  dotenv.config({ path: envPath });
}

function findMysqldumpBinary() {
  // Check if mysqldump is directly accessible in system PATH
  try {
    const test = spawnSync('mysqldump', ['--version'], { stdio: 'ignore' });
    if (test.status === 0) return 'mysqldump';
  } catch {
    // Continue searching standard Windows installation directories
  }

  const commonWindowsPaths = [
    'C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysqldump.exe',
    'C:\\Program Files\\MySQL\\MySQL Server 8.4\\bin\\mysqldump.exe',
    'C:\\Program Files\\MySQL\\MySQL Server 8.1\\bin\\mysqldump.exe',
    'C:\\Program Files\\MySQL\\MySQL Server 8.2\\bin\\mysqldump.exe',
    'C:\\Program Files\\MySQL\\MySQL Server 8.3\\bin\\mysqldump.exe',
    'C:\\Program Files (x86)\\MySQL\\MySQL Server 8.0\\bin\\mysqldump.exe',
    'C:\\xampp\\mysql\\bin\\mysqldump.exe',
    'C:\\laragon\\bin\\mysql\\current\\bin\\mysqldump.exe',
  ];

  for (const binPath of commonWindowsPaths) {
    if (fs.existsSync(binPath)) {
      return binPath;
    }
  }

  return null;
}

function pad(num) {
  return num.toString().padStart(2, '0');
}

function getTimestamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = pad(now.getMonth() + 1);
  const day = pad(now.getDate());
  const hours = pad(now.getHours());
  const minutes = pad(now.getMinutes());
  const seconds = pad(now.getSeconds());
  return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
}

async function runBackup() {
  const host = process.env.DATABASE_HOST || 'localhost';
  const port = Number(process.env.DATABASE_PORT) || 3306;
  const user = process.env.DATABASE_USER || 'root';
  const password = process.env.DATABASE_PASSWORD || '';
  const dbName = process.env.DATABASE_NAME || 'qsr_db';

  console.log('====================================================');
  console.log('  QSR POS Automated Database Backup Engine');
  console.log(`  Database Target: [${dbName}]`);
  console.log('====================================================');

  // Locate mysqldump binary
  const mysqldumpBin = findMysqldumpBinary();
  if (!mysqldumpBin) {
    console.error('[ERROR] mysqldump binary not found in PATH or standard MySQL directories.');
    console.error('Please ensure MySQL Server is installed and mysqldump is accessible.');
    process.exit(1);
  }
  console.log(`Using mysqldump binary: ${mysqldumpBin}`);

  // Resolve backups directory (checks project root or cwd)
  const candidateBackupDirs = [
    path.resolve(__dirname, '../../backups'),
    path.resolve(__dirname, '../backups'),
    path.resolve(process.cwd(), 'backups'),
  ];
  let rootBackupDir = candidateBackupDirs.find((d) => fs.existsSync(d));
  if (!rootBackupDir) {
    rootBackupDir = path.resolve(__dirname, '../../backups');
    fs.mkdirSync(rootBackupDir, { recursive: true });
  }

  const timestamp = getTimestamp();
  const backupFileName = `backup_${dbName}_${timestamp}.sql`;
  const backupFilePath = path.join(rootBackupDir, backupFileName);
  const latestFilePath = path.join(rootBackupDir, `backup_latest.sql`);

  console.log(`Dumping database to: ${backupFilePath} ...`);

  // Build command arguments (crash-safe flags: --single-transaction --quick --routines --triggers --hex-blob)
  const args = [
    `--host=${host}`,
    `--port=${port}`,
    `--user=${user}`,
  ];

  if (password) {
    args.push(`--password=${password}`);
  }

  args.push(
    '--single-transaction',
    '--quick',
    '--routines',
    '--triggers',
    '--hex-blob',
    dbName
  );

  try {
    const fileStream = fs.openSync(backupFilePath, 'w');
    const result = spawnSync(mysqldumpBin, args, {
      stdio: ['ignore', fileStream, 'pipe'],
      encoding: 'utf8',
      windowsHide: true,
    });
    fs.closeSync(fileStream);

    if (result.status !== 0) {
      const stderr = result.stderr ? result.stderr.trim() : 'Unknown error';
      console.error(`mysqldump failed with exit code ${result.status}: ${stderr}`);
      if (fs.existsSync(backupFilePath)) {
        fs.unlinkSync(backupFilePath);
      }
      process.exit(1);
    }

    const stats = fs.statSync(backupFilePath);
    const sizeKb = (stats.size / 1024).toFixed(2);
    console.log(`Database backup created successfully! (${sizeKb} KB)`);

    // Copy to backup_latest.sql for quick access
    fs.copyFileSync(backupFilePath, latestFilePath);
    console.log(`Updated latest backup snapshot: ${latestFilePath}`);

    // Google Drive / Cloud sync if configured
    const gdriveDir = process.env.GOOGLE_DRIVE_BACKUP_PATH;
    if (gdriveDir) {
      if (fs.existsSync(gdriveDir)) {
        const destPath = path.join(gdriveDir, backupFileName);
        fs.copyFileSync(backupFilePath, destPath);
        console.log(`Synced backup to Google Drive: ${destPath}`);
      } else {
        console.warn(`[Warning] Google Drive folder not found: ${gdriveDir}`);
      }
    } else {
      console.log('\n[Tip] To auto-sync backups to Google Drive:');
      console.log('  1. Install Google Drive for Desktop (creates virtual drive G:\\ or sync folder).');
      console.log('  2. Add to .env: GOOGLE_DRIVE_BACKUP_PATH="G:\\My Drive\\QSR_Backups"');
    }

    // Retention cleanup: purge backups older than retention period (default 30 days)
    const retentionDays = Number(process.env.BACKUP_RETENTION_DAYS) || 30;
    const now = Date.now();
    const maxAgeMs = retentionDays * 24 * 60 * 60 * 1000;

    const files = fs.readdirSync(rootBackupDir);
    let purgedCount = 0;

    for (const file of files) {
      if (file.startsWith(`backup_${dbName}_`) && file.endsWith('.sql')) {
        const fullPath = path.join(rootBackupDir, file);
        const fStat = fs.statSync(fullPath);
        if (now - fStat.mtimeMs > maxAgeMs) {
          fs.unlinkSync(fullPath);
          purgedCount++;
        }
      }
    }

    if (purgedCount > 0) {
      console.log(`Cleaned up ${purgedCount} backup(s) older than ${retentionDays} days.`);
    }

    console.log('Backup process completed successfully.\n');
    process.exit(0);
  } catch (err) {
    console.error('Backup failed:', err.message);
    process.exit(1);
  }
}

runBackup();
