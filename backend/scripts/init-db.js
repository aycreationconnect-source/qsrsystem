const fs = require('fs');
const path = require('path');

// 1. Locate .env (check backend/.env or current directory .env)
const envCandidates = [
  path.resolve(__dirname, '../.env'),
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), 'backend/.env'),
];

let envPath = envCandidates.find((p) => fs.existsSync(p));
if (!envPath) {
  const exampleCandidates = [
    path.resolve(__dirname, '../.env.example'),
    path.resolve(process.cwd(), '.env.example'),
    path.resolve(process.cwd(), 'backend/.env.example'),
  ];
  const examplePath = exampleCandidates.find((p) => fs.existsSync(p));
  envPath = path.resolve(__dirname, '../.env');
  if (examplePath) {
    fs.copyFileSync(examplePath, envPath);
    console.log(`Copied environment template from ${examplePath} to ${envPath}`);
  }
}

// Fallback .env parser if dotenv is not yet installed
function loadEnvFallback(filepath) {
  if (!fs.existsSync(filepath)) return;
  const content = fs.readFileSync(filepath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const match = trimmed.match(/^([\w.-]+)\s*=\s*(.*)?$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      if (!process.env[key]) process.env[key] = value.trim();
    }
  }
}

if (envPath && fs.existsSync(envPath)) {
  try {
    const dotenv = require('dotenv');
    dotenv.config({ path: envPath });
  } catch {
    loadEnvFallback(envPath);
  }
}

async function initializeDatabase() {
  let mysql;
  try {
    mysql = require('mysql2/promise');
  } catch (err) {
    console.error('\n[ERROR] mysql2 package is missing in node_modules!');
    console.error('Please run "npm install" inside the backend folder first.');
    process.exit(1);
  }

  const host = process.env.DATABASE_HOST || 'localhost';
  const port = Number(process.env.DATABASE_PORT) || 3306;
  const user = process.env.DATABASE_USER || 'root';
  const password = process.env.DATABASE_PASSWORD || '';

  // Priority: 1. CLI argument, 2. Existing DATABASE_NAME in .env, 3. Default 'qsr_db'
  const rawDbName = process.argv[2] || process.env.DATABASE_NAME || 'qsr_db';
  const dbName = rawDbName.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');

  console.log('====================================================');
  console.log(`  QSR POS Database Initializer`);
  console.log(`  Target Database: [${dbName}]`);
  console.log('====================================================');

  try {
    // 2. Connect to MySQL server instance (without specifying database)
    console.log(`Connecting to MySQL at ${host}:${port} as user '${user}'...`);
    const connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
    });

    // 3. Create database if it does not already exist
    console.log(`Creating database \`${dbName}\` if not exists...`);
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
    await connection.end();
    console.log(`Database \`${dbName}\` is verified and ready!`);

    // 4. Update .env with the chosen database name & connection URL
    const encodedPassword = encodeURIComponent(password);
    const databaseUrl = `mysql://${user}:${encodedPassword}@${host}:${port}/${dbName}`;

    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
      if (envContent.includes('DATABASE_NAME=')) {
        envContent = envContent.replace(/DATABASE_NAME=.*/g, `DATABASE_NAME=${dbName}`);
      } else {
        envContent += `\nDATABASE_NAME=${dbName}`;
      }

      if (envContent.includes('DATABASE_URL=')) {
        envContent = envContent.replace(/DATABASE_URL=.*/g, `DATABASE_URL="${databaseUrl}"`);
      } else {
        envContent += `\nDATABASE_URL="${databaseUrl}"`;
      }
    } else {
      envContent = `# Server Port\nPORT=3000\n\n# Database Configuration\nDATABASE_HOST=${host}\nDATABASE_PORT=${port}\nDATABASE_USER=${user}\nDATABASE_PASSWORD=${password}\nDATABASE_NAME=${dbName}\nDATABASE_CONNECTION_LIMIT=10\n\n# Prisma Database Connection URL\nDATABASE_URL="${databaseUrl}"\n`;
    }

    fs.writeFileSync(envPath, envContent, 'utf8');
    console.log(`Updated ${envPath} with DATABASE_NAME=${dbName}`);
    console.log('Database initialization successful.');
    process.exit(0);
  } catch (error) {
    console.error('Database initialization failed:', error.message);
    process.exit(1);
  }
}

initializeDatabase();
