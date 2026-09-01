const fs = require('fs');

let appCode = fs.readFileSync('src/App.tsx', 'utf8');

const initialState = `const [appData, setAppData] = useState<any>(() => {
    const saved = localStorage.getItem('qsr_appData');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      stats: { orders: 42, revenue: '₹12,450', tables: '8 / 15' },
      categories: [],
      tables: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],
      menu: [],
      inventory: [
        { item: 'Burger Buns', unit: 'pcs', stock: 120, used: 0, threshold: 20, status: 'Good', history: [] },
        { item: 'Chicken Patty', unit: 'pcs', stock: 85, used: 0, threshold: 15, status: 'Good', history: [] },
        { item: 'Pizza Base', unit: 'pcs', stock: 40, used: 0, threshold: 10, status: 'Good', history: [] }
      ]
    };
  });

  useEffect(() => {
    localStorage.setItem('qsr_appData', JSON.stringify(appData));
  }, [appData]);`;

const oldStateBlockRegex = /const \[appData, setAppData\] = useState<any>\(\{[\s\S]*?\}\]\s*\}\);/;

if (oldStateBlockRegex.test(appCode)) {
  appCode = appCode.replace(oldStateBlockRegex, initialState);
  
  // ensure useEffect is imported
  if (!appCode.includes('useEffect')) {
    appCode = appCode.replace('import React, { useState } from', 'import React, { useState, useEffect } from');
  }

  fs.writeFileSync('src/App.tsx', appCode);
  console.log('localStorage added to App.tsx');
} else {
  console.log('Regex failed');
}
