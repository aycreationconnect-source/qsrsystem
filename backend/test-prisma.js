const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

try {
  const prisma = new PrismaClient({ datasourceUrl: process.env.DATABASE_URL });
  console.log("Success with datasourceUrl");
} catch(e) {
  console.log(e);
}
