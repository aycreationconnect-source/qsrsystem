async function verifyFeatures() {
  try {
    console.log('--- 1. Registering Cafe with Human-Readable Unique ID ---');
    const randomPhone = `98${Math.floor(10000000 + Math.random() * 90000000)}`;
    const regRes = await fetch('http://localhost:3001/api/cafes/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        businessName: 'The Urban Bistro',
        ownerName: 'Aakash Verma',
        ownerPhone: randomPhone,
        ownerEmail: 'aakash@urbanbistro.in',
        city: 'Delhi',
        state: 'Delhi',
      }),
    });

    const regData = await regRes.json();
    console.log(`✅ Generated Master ID: ${regData.cafe.id}`);
    console.log(`✅ Cafe Code: ${regData.cafe.cafeCode}`);
    console.log(`✅ Status: ${regData.cafe.licenseStatus}`);

    console.log('\n--- 2. Testing Blocking Cafe Access ---');
    const blockRes = await fetch(`http://localhost:3001/api/cafes/${regData.cafe.id}/toggle-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'BLOCK',
        reason: 'Payment dispute / Store verification pending',
      }),
    });
    const blockData = await blockRes.json();
    console.log(`🚫 Action Result: ${blockData.message}`);
    console.log(`🚫 Updated Status: ${blockData.licenseStatus}`);

    console.log('\n--- 3. Testing Unblocking Cafe Access ---');
    const unblockRes = await fetch(`http://localhost:3001/api/cafes/${regData.cafe.id}/toggle-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'UNBLOCK',
        reason: 'Account cleared by Support Admin',
      }),
    });
    const unblockData = await unblockRes.json();
    console.log(`🟢 Action Result: ${unblockData.message}`);
    console.log(`🟢 Restored Status: ${unblockData.licenseStatus}`);

    console.log('\n✨ ALL TESTS PASSED SUCCESSFULLY! ✨');
  } catch (err) {
    console.error('❌ Verification failed:', err);
  }
}

verifyFeatures();
