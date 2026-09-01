const fs = require('fs');

let appCode = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Fetch data on load
const dataFetchCode = `  const fetchBackendData = async () => {
    try {
      const catRes = await fetch('http://localhost:3000/category');
      const cats = await catRes.json();
      
      const menuRes = await fetch('http://localhost:3000/menu');
      const menus = await menuRes.json();
      
      setAppData(prev => ({
        ...prev,
        categories: cats,
        menu: menus.map((m: any) => ({ ...m, category: m.category?.name || 'Uncategorized', price: \`₹\${m.price.toFixed(2)}\` }))
      }));
    } catch(e) { console.error('Backend connection failed:', e); }
  };

  useEffect(() => {
    fetchBackendData();
  }, []);`;

// Replace the localStorage logic entirely
const oldStateBlockRegex = /const \[appData, setAppData\] = useState<any>\(\(\) => \{[\s\S]*?\}, \[appData\]\);/;
const newStateBlock = `const [appData, setAppData] = useState<any>({
    stats: { orders: 42, revenue: '₹12,450', tables: '8 / 15' },
    categories: [],
    tables: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],
    menu: [],
    inventory: [
      { item: 'Burger Buns', unit: 'pcs', stock: 120, used: 0, threshold: 20, status: 'Good', history: [] },
      { item: 'Chicken Patty', unit: 'pcs', stock: 85, used: 0, threshold: 15, status: 'Good', history: [] }
    ]
  });

${dataFetchCode}`;

if(oldStateBlockRegex.test(appCode)) {
  appCode = appCode.replace(oldStateBlockRegex, newStateBlock);
}

// 2. Modify "Save Category" logic
const saveCategoryRegex = /if \(editingCategoryName\) \{[\s\S]*?setEditingCategoryName\(null\);\s*setNewCategory\(\{ name: '', description: '', displayOrder: '', status: 'Active' \}\);\s*\}\}/;

const newSaveCategoryCode = `if (editingCategoryName) {
                        const existingCat = newAppData.categories.find((c:any) => c.name === editingCategoryName);
                        if (existingCat && existingCat.id) {
                           fetch(\`http://localhost:3000/category/\${existingCat.id}\`, {
                             method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(catObj)
                           }).then(() => fetchBackendData());
                        }
                      } else {
                        fetch('http://localhost:3000/category', {
                           method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(catObj)
                        }).then(() => fetchBackendData());
                      }
                      
                      setShowAddCategoryModal(false);
                      setEditingCategoryName(null);
                      setNewCategory({ name: '', description: '', displayOrder: '', status: 'Active' });
                    }}`;

appCode = appCode.replace(saveCategoryRegex, newSaveCategoryCode);


// 3. Modify "Save Item" logic
const saveItemRegex = /if \(editingItemIndex !== null\) \{[\s\S]*?setNewItem\(\{ name: '', category: '', description: '', image: '', price: '', type: 'Veg', available: true, status: 'Active', sku: '', prepTime: '' \}\);\s*\}\}/;

const newSaveItemCode = `if (editingItemIndex !== null) {
                        const existingItem = newAppData.menu[editingItemIndex];
                        if (existingItem && existingItem.id) {
                          fetch(\`http://localhost:3000/menu/\${existingItem.id}\`, {
                            method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(finalItem)
                          }).then(() => fetchBackendData());
                        }
                      } else {
                        fetch('http://localhost:3000/menu', {
                           method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(finalItem)
                        }).then(() => fetchBackendData());
                      }
                      
                      setShowAddItemModal(false);
                      setEditingItemIndex(null);
                      setNewItem({ name: '', category: '', description: '', image: '', price: '', type: 'Veg', available: true, status: 'Active', sku: '', prepTime: '' });
                    }}`;

appCode = appCode.replace(saveItemRegex, newSaveItemCode);

fs.writeFileSync('src/App.tsx', appCode);
console.log('Frontend connected to backend APIs');
