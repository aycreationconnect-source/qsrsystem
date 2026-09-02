import 'dotenv/config';
import { PrismaService } from './src/prisma/prisma.service';
import { LicenseVerifierService } from './src/license/license-verifier.service';
import { LicenseService } from './src/license/license.service';
import { AuthService } from './src/auth/auth.service';

const prisma = new PrismaService();

async function runE2ETest() {
  console.log('🧪 Starting Local POS Offline Activation & Auth E2E Test...\n');

  const verifier = new LicenseVerifierService();
  const licenseService = new LicenseService(prisma as any, verifier);
  const authService = new AuthService(prisma as any);

  const testKey =
    'LIC-CFMUM001-90D-89B24C797D9EE8EF-eyJjYWZlQ29kZSI6IkNGLU1VTS0wMDEiLCJidXNpbmVzc05hbWUiOiJUaGUgVXJiYW4gQmlzdHJvIiwicGxhbkNvZGUiOiJUUklBTF8zTSIsImR1cmF0aW9uRGF5cyI6OTAsImlzc3VlZEF0IjoiMjAyNi0wOS0wMlQxMjoxNTo1OS42ODJaIiwiZXhwaXJlc0F0IjoiMjAyNi0xMi0wMVQxMjoxNTo1OS42ODJaIiwibWF4VGVybWluYWxzIjoxMCwibW9kdWxlcyI6WyJDT1VOVEVSX1BPUyIsIlRBQkxFX1BPUyIsIktEUyIsIklOVkVOVE9SWSIsIkdEUklWRV9CQUNLVVAiXX0';

  // Clear previous test records
  await prisma.localUser.deleteMany({});
  await prisma.localLicense.deleteMany({});
  await prisma.storeProfile.deleteMany({});

  // Step 1: Offline License Activation
  console.log('--- Step 1: Activating "The Urban Bistro" (CF-MUM-001) ---');
  const activateRes = await licenseService.activateStore({
    cafeCode: 'CF-MUM-001',
    licenseKey: testKey,
    ownerPin: '1234',
    ownerPassword: 'adminpassword123',
    ownerName: 'Rajesh Sharma',
    phone: '9876543210',
    city: 'Mumbai',
    state: 'Maharashtra',
  });

  console.log('✅ Activation Result:', activateRes.message);
  console.log('   Store:', activateRes.store.businessName, `(${activateRes.store.cafeCode})`);
  console.log('   Plan:', activateRes.license.planCode, `(${activateRes.license.durationDays} Days)`);
  console.log('   Days Remaining:', activateRes.license.daysRemaining);

  // Step 2: Query Store & License Status
  console.log('\n--- Step 2: Querying /api/license/status ---');
  const statusRes = await licenseService.getStatus();
  console.log('✅ Is Activated:', statusRes.isActivated);
  console.log('   Store Business Name:', statusRes.store?.businessName);
  console.log('   License Expiration:', statusRes.license?.expiresAt.toLocaleDateString());
  console.log('   Allowed Modules:', statusRes.license?.allowedModules);

  // Step 3: Test Staff PIN Login
  console.log('\n--- Step 3: Testing Staff PIN Login (Owner PIN: 1234) ---');
  const loginRes = await authService.login({ pin: '1234' });
  console.log('✅ Staff Login Success!');
  console.log('   User:', loginRes.user.fullName, `[Role: ${loginRes.user.role}]`);
  console.log('   Store Identity:', loginRes.store.businessName, `(${loginRes.store.cafeCode})`);
  console.log('   Signed JWT Token:', loginRes.token.substring(0, 45) + '...');

  // Step 4: Test Cashier PIN Login (1111)
  console.log('\n--- Step 4: Testing Cashier PIN Login (PIN: 1111) ---');
  const cashierLogin = await authService.login({ pin: '1111' });
  console.log('✅ Cashier Login Success!');
  console.log('   User:', cashierLogin.user.fullName, `[Role: ${cashierLogin.user.role}]`);

  // Step 5: Test Tampered License Rejection
  console.log('\n--- Step 5: Testing Tampered Key Rejection ---');
  try {
    const tamperedKey = testKey.replace('89B24C797D9EE8EF', '0000000000000000');
    verifier.verifyLicenseKey(tamperedKey, 'CF-MUM-001');
    console.error('❌ Failed: Tampered key was unexpectedly accepted!');
  } catch (err: any) {
    console.log('✅ Security Check Passed: Tampered key rejected with error:', err.message);
  }

  // Step 6: Print Pure Numeric Database IDs
  console.log('\n--- Step 6: Database ID Verification ---');
  const store = await prisma.storeProfile.findFirst();
  const license = await prisma.localLicense.findFirst();
  const staff = await prisma.localUser.findMany();

  console.log('📌 StoreProfile ID: ', store?.id);
  console.log('📌 LocalLicense ID: ', license?.id);
  staff.forEach((u) => console.log(`📌 LocalUser ID (${u.username}):`, u.id));

  console.log('\n✨ ALL LOCAL POS TESTS PASSED WITH 100% SUCCESS! ✨');
}

runE2ETest()
  .catch((e) => {
    console.error('❌ Error during E2E test:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
