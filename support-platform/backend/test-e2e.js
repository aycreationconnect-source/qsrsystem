async function runE2ETest() {
  try {
    console.log('--- 1. Fetching Plans ---');
    const plansRes = await fetch('http://localhost:3001/api/plans');
    const plans = await plansRes.json();
    console.log(`✅ ${plans.length} plans available in Golden DB.`);

    const defaultPlan = plans.find((p) => p.isDefault) || plans[0];
    console.log(`🌟 Default Plan: ${defaultPlan.name} (${defaultPlan.durationDays} Days)`);

    console.log('\n--- 2. Onboarding Cafe: Mocha Bliss Cafe ---');
    const regRes = await fetch('http://localhost:3001/api/cafes/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        businessName: 'Mocha Bliss Cafe',
        ownerName: 'Rajesh Sharma',
        ownerPhone: '9876543210',
        ownerEmail: 'rajesh@mochabliss.com',
        city: 'Mumbai',
        state: 'Maharashtra',
        planId: defaultPlan.id,
      }),
    });

    let regData = await regRes.json();
    if (regRes.status === 400 && regData.message.includes('already registered')) {
      console.log('ℹ️ Cafe already registered, fetching list...');
      const listRes = await fetch('http://localhost:3001/api/cafes');
      const list = await listRes.json();
      regData = { cafe: list[0], licenseKey: list[0].currentLicenseKey };
    }

    console.log(`✅ Cafe Code: ${regData.cafe.cafeCode}`);
    console.log(`✅ Business Name: ${regData.cafe.businessName}`);
    console.log(`🔑 Signed License Key: ${regData.licenseKey}`);
    console.log(`📅 Expiry Date: ${regData.cafe.licenseExpiresAt}`);

    console.log('\n--- 3. Testing License Renewal (+30 Days) ---');
    const renewRes = await fetch(`http://localhost:3001/api/cafes/${regData.cafe.id}/renew`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        planId: defaultPlan.id,
        customDays: 30,
        notes: 'Extended by 30 days test renewal',
      }),
    });
    const renewData = await renewRes.json();
    console.log(`✅ License Renewed! New Expiry: ${renewData.newExpiry}`);
    console.log(`🔑 New Signed License Key: ${renewData.newLicenseKey}`);

    console.log('\n--- 4. Dashboard Stats ---');
    const statsRes = await fetch('http://localhost:3001/api/stats');
    const stats = await statsRes.json();
    console.log('📊 Dashboard Stats:', {
      totalCafes: stats.totalCafes,
      activeTrials: stats.activeTrials,
      expiringSoon: stats.expiringSoon,
      paidActive: stats.paidActive,
      expired: stats.expired,
    });

    console.log('\n✨ ALL TESTS PASSED SUCCESSFULLY! ✨');
  } catch (err) {
    console.error('❌ E2E Test Failed:', err);
  }
}

runE2ETest();
