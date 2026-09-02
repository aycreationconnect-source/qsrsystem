import { PrismaClient } from '@prisma/client';
import { PlanType } from '../common/enums';
import { generateNumericId } from '../common/id-generator';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Golden DB Default Plans...');

  const defaultPlans = [
    {
      planCode: 'TRIAL_3M',
      name: '3 Months Free Trial',
      planType: PlanType.FREE_TRIAL,
      durationDays: 90,
      price: 0,
      isDefault: true,
      maxTerminals: 10,
      description: 'Standard 90-day introductory trial for newly onboarded cafes.',
      allowedModules: ['COUNTER_POS', 'TABLE_POS', 'KDS', 'INVENTORY', 'GDRIVE_BACKUP'],
    },
    {
      planCode: 'TRIAL_1M',
      name: '1 Month Free Trial',
      planType: PlanType.FREE_TRIAL,
      durationDays: 30,
      price: 0,
      isDefault: false,
      maxTerminals: 5,
      description: '30-day fast-track pilot trial for small cafes.',
      allowedModules: ['COUNTER_POS', 'TABLE_POS', 'KDS', 'INVENTORY', 'GDRIVE_BACKUP'],
    },
    {
      planCode: 'TRIAL_2M',
      name: '2 Months Free Trial',
      planType: PlanType.FREE_TRIAL,
      durationDays: 60,
      price: 0,
      isDefault: false,
      maxTerminals: 8,
      description: '60-day promotional trial for franchise partners.',
      allowedModules: ['COUNTER_POS', 'TABLE_POS', 'KDS', 'INVENTORY', 'GDRIVE_BACKUP'],
    },
    {
      planCode: 'EXTEND_15D',
      name: '15 Days Grace Extension',
      planType: PlanType.EXTENSION,
      durationDays: 15,
      price: 0,
      isDefault: false,
      maxTerminals: 10,
      description: '15-day grace extension for cafes finalizing their paid plan renewals.',
      allowedModules: ['COUNTER_POS', 'TABLE_POS', 'KDS', 'INVENTORY', 'GDRIVE_BACKUP'],
    },
    {
      planCode: 'PAID_1M',
      name: 'Standard Monthly Subscription',
      planType: PlanType.PAID,
      durationDays: 30,
      price: 999.00,
      isDefault: false,
      maxTerminals: 10,
      description: 'Monthly paid license with full modules & updates.',
      allowedModules: ['COUNTER_POS', 'TABLE_POS', 'KDS', 'INVENTORY', 'GDRIVE_BACKUP'],
    },
    {
      planCode: 'PAID_3M',
      name: 'Quarterly Pro Plan',
      planType: PlanType.PAID,
      durationDays: 90,
      price: 2699.00,
      isDefault: false,
      maxTerminals: 15,
      description: 'Quarterly subscription plan with priority support.',
      allowedModules: ['COUNTER_POS', 'TABLE_POS', 'KDS', 'INVENTORY', 'GDRIVE_BACKUP'],
    },
    {
      planCode: 'PAID_1Y',
      name: 'Annual Enterprise Plan',
      planType: PlanType.PAID,
      durationDays: 365,
      price: 8999.00,
      isDefault: false,
      maxTerminals: 25,
      description: 'Complete 1-year license with unlimited terminals & all features.',
      allowedModules: ['COUNTER_POS', 'TABLE_POS', 'KDS', 'INVENTORY', 'GDRIVE_BACKUP'],
    },
  ];

  for (const plan of defaultPlans) {
    await prisma.planTemplate.upsert({
      where: { planCode: plan.planCode },
      update: {
        name: plan.name,
        durationDays: plan.durationDays,
        price: plan.price,
        description: plan.description,
        isDefault: plan.isDefault,
      },
      create: {
        id: generateNumericId(),
        ...plan,
      },
    });
  }

  console.log('✅ Golden DB Plans seeded successfully!');

  // Seed Default Super-Admin User
  console.log('👤 Seeding Super-Admin User (aycreationconnect)...');
  const crypto = require('crypto');
  const salt = 'qsr_master_admin_salt_2026';
  const passwordHash = crypto.pbkdf2Sync('ay@creationconnect123$', salt, 1000, 64, 'sha512').toString('hex');

  await prisma.adminUser.upsert({
    where: { username: 'aycreationconnect' },
    update: {
      passwordHash,
      fullName: 'AyCreationConnect Super-Admin',
      role: 'SUPER_ADMIN',
    },
    create: {
      id: generateNumericId(),
      username: 'aycreationconnect',
      passwordHash,
      fullName: 'AyCreationConnect Super-Admin',
      role: 'SUPER_ADMIN',
    },
  });
  console.log('✅ Default Super-Admin User seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
