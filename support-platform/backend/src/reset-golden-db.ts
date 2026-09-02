import { PrismaClient } from '@prisma/client';
import { PlanType, LicenseStatus } from './common/enums';
import { generateNumericId } from './common/id-generator';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

// HMAC-SHA256 Secret for signing license
const SECRET_SALT = 'QSR_MASTER_GOLDEN_SECRET_2026_AY_CONNECT';

function signLicense(payload: any): string {
  const payloadStr = JSON.stringify(payload);
  const hmac = crypto.createHmac('sha256', SECRET_SALT);
  hmac.update(payloadStr);
  const signature = hmac.digest('hex').substring(0, 16).toUpperCase();
  const b64Payload = Buffer.from(payloadStr).toString('base64url');
  const cleanCode = payload.cafeCode.replace(/[^A-Z0-9]/g, '');
  return `LIC-${cleanCode}-${payload.durationDays}D-${signature}-${b64Payload}`;
}

async function main() {
  console.log('🧹 [1/4] Clearing all tables in golden_qsr_db except admin_users...');
  
  // 1. Delete in reverse dependency order
  const deletedHistories = await prisma.licenseHistory.deleteMany({});
  console.log(`   - Deleted ${deletedHistories.count} license_histories`);

  const deletedCafes = await prisma.cafeMaster.deleteMany({});
  console.log(`   - Deleted ${deletedCafes.count} cafe_masters`);

  const deletedPlans = await prisma.planTemplate.deleteMany({});
  console.log(`   - Deleted ${deletedPlans.count} plan_templates`);

  console.log('👤 [2/4] Verifying/Ensuring Admin User (aycreationconnect)...');
  const salt = 'qsr_master_admin_salt_2026';
  const passwordHash = crypto.pbkdf2Sync('ay@creationconnect123$', salt, 1000, 64, 'sha512').toString('hex');

  const admin = await prisma.adminUser.upsert({
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
  console.log(`   - Super-Admin User ready: ${admin.username} (ID: ${admin.id})`);

  console.log('📦 [3/4] Creating Clean Plan Templates with Numeric IDs...');
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
      description: '30-day pilot trial for small cafes and kiosks.',
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
      description: '15-day grace extension for cafes renewing subscription.',
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
      description: 'Full monthly POS license with Cloud GDrive sync.',
      allowedModules: ['COUNTER_POS', 'TABLE_POS', 'KDS', 'INVENTORY', 'GDRIVE_BACKUP'],
    },
    {
      planCode: 'PAID_3M',
      name: 'Quarterly Growth Plan',
      planType: PlanType.PAID,
      durationDays: 90,
      price: 2499.00,
      isDefault: false,
      maxTerminals: 15,
      description: '3-month discounted license with priority support.',
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
      description: 'Complete 1-year license with unlimited terminals & all modules.',
      allowedModules: ['COUNTER_POS', 'TABLE_POS', 'KDS', 'INVENTORY', 'GDRIVE_BACKUP'],
    },
  ];

  const createdPlans = [];
  for (const plan of defaultPlans) {
    const p = await prisma.planTemplate.create({
      data: {
        id: generateNumericId(),
        ...plan,
      },
    });
    createdPlans.push(p);
    console.log(`   - Created Plan: ${p.name} (${p.planCode}) [ID: ${p.id}]`);
  }

  console.log('🏪 [4/4] Creating 1 Single Dummy Cafe in cafe_masters...');
  const defaultTrialPlan = createdPlans.find((p) => p.isDefault) || createdPlans[0];
  const now = new Date();
  const expiresAt = new Date();
  expiresAt.setDate(now.getDate() + defaultTrialPlan.durationDays);

  const cafeId = generateNumericId();
  const cafeCode = 'CF-MUM-001';

  const licensePayload = {
    cafeCode,
    businessName: 'The Urban Bistro',
    planCode: defaultTrialPlan.planCode,
    durationDays: defaultTrialPlan.durationDays,
    issuedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    maxTerminals: defaultTrialPlan.maxTerminals,
    modules: defaultTrialPlan.allowedModules,
  };

  const licenseKey = signLicense(licensePayload);

  const cafe = await prisma.cafeMaster.create({
    data: {
      id: cafeId,
      cafeCode,
      businessName: 'The Urban Bistro',
      ownerName: 'Rajesh Sharma',
      ownerPhone: '9876543210',
      ownerEmail: 'rajesh@urbanbistro.com',
      city: 'Mumbai',
      state: 'Maharashtra',
      address: 'Shop 4, Bandra West, Mumbai',
      planId: defaultTrialPlan.id,
      licenseStatus: LicenseStatus.TRIAL,
      currentLicenseKey: licenseKey,
      trialStartedAt: now,
      licenseExpiresAt: expiresAt,
      gdriveLinked: false,
      appVersion: '1.0.0',
      notes: 'Initial dummy onboarded cafe with 3-Month Free Trial',
    },
  });

  // Create initial history record
  const historyId = generateNumericId();
  await prisma.licenseHistory.create({
    data: {
      id: historyId,
      cafeId: cafe.id,
      planId: defaultTrialPlan.id,
      action: 'INITIAL_REGISTRATION',
      issuedLicenseKey: licenseKey,
      newExpiry: expiresAt,
      issuedByAdmin: admin.username,
      notes: 'Initial 90-day Free Trial license issued.',
    },
  });

  console.log(`   - Created Dummy Cafe: "${cafe.businessName}" (${cafe.cafeCode})`);
  console.log(`   - Cafe Master ID: ${cafe.id}`);
  console.log(`   - License Status: ${cafe.licenseStatus}`);
  console.log(`   - License Key: ${cafe.currentLicenseKey}`);
  console.log(`   - Expiry Date: ${expiresAt.toDateString()}`);

  console.log('\n✨ GOLDEN DB RESET & SEED COMPLETE! ✨');
}

main()
  .catch((e) => {
    console.error('❌ Error during Golden DB reset:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
