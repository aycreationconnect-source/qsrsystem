require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST || 'localhost',
  port: Number(process.env.DATABASE_PORT) || 3306,
  user: process.env.DATABASE_USER || 'root',
  password: process.env.DATABASE_PASSWORD || 'ay@creationconnect123',
  database: process.env.DATABASE_NAME || 'qsr_db',
  connectionLimit: 1,
  allowPublicKeyRetrieval: true,
});
const prisma = new PrismaClient({ adapter });

async function fix() {
  const models = ['MenuItem', 'Category', 'Addon', 'InventoryItem', 'RecipeIngredient', 'ItemTax', 'InventoryHistory', 'Order', 'OrderItem', 'Area', 'Table'];
  for (const model of models) {
    try {
      const lowerModel = model.charAt(0).toLowerCase() + model.slice(1);
      const max = await prisma[lowerModel].aggregate({ _max: { id: true } });
      const maxId = max._max.id || 0;
      const nextId = maxId + 1;
      await prisma.$queryRawUnsafe(`ALTER TABLE ${model} AUTO_INCREMENT = ${nextId}`);
      console.log(`Fixed ${model} auto_increment to ${nextId}`);
    } catch (e) {
      console.error(`Failed for ${model}`);
    }
  }
}
fix().finally(() => prisma.$disconnect());
