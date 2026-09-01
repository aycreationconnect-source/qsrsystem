const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

const newState = `const [appData, setAppData] = useState<any>({
  menu: [
    { name: 'Classic Cheeseburger', price: '₹149.00', category: 'Burgers', status: 'Available', type: 'Non-Veg', ingredients: [] },
    { name: 'Double Patty Smash', price: '₹249.00', category: 'Burgers', status: 'Available', type: 'Non-Veg', ingredients: [] },
    { name: 'Spicy Chicken Burger', price: '₹199.00', category: 'Burgers', status: 'Available', type: 'Non-Veg', ingredients: [] },
    { name: 'Margherita Pizza', price: '₹299.00', category: 'Pizzas', status: 'Available', type: 'Veg', ingredients: [] },
    { name: 'Pepperoni Pizza', price: '₹399.00', category: 'Pizzas', status: 'Available', type: 'Non-Veg', ingredients: [] },
    { name: 'French Fries', price: '₹99.00', category: 'Sides', status: 'Available', type: 'Veg', ingredients: [] },
    { name: 'Cold Coffee', price: '₹129.00', category: 'Beverages', status: 'Available', type: 'Veg', ingredients: [] },
    { name: 'Chocolate Brownie', price: '₹159.00', category: 'Desserts', status: 'Available', type: 'Egg', ingredients: [] }
  ],
  inventory: [
    { item: 'Burger Buns', unit: 'pcs', stock: 120, used: 0, threshold: 20, status: 'Good', history: [] },
    { item: 'Chicken Patty', unit: 'pcs', stock: 85, used: 0, threshold: 15, status: 'Good', history: [] },
    { item: 'Pizza Base', unit: 'pcs', stock: 40, used: 0, threshold: 10, status: 'Good', history: [] },
    { item: 'Cheese', unit: 'kg', stock: 12.5, used: 0, threshold: 2.0, status: 'Good', history: [] },
    { item: 'French Fries (Frozen)', unit: 'kg', stock: 25, used: 0, threshold: 5.0, status: 'Good', history: [] }
  ],
  categories: ['Burgers', 'Pizzas', 'Beverages', 'Desserts', 'Sides']
});`;

code = code.replace(/const \[branchData, setBranchData\] = useState<any>\(\{[\s\S]*?\}\);\n/, newState + '\n');
code = code.replace(/const \[selectedBranch, setSelectedBranch\] = useState\('main'\);\n/g, '');

code = code.replace(/branchData\[selectedBranch\]/g, 'appData');
code = code.replace(/newBranchData\[selectedBranch\]/g, 'newAppData');
code = code.replace(/branchData/g, 'appData');
code = code.replace(/setBranchData/g, 'setAppData');
code = code.replace(/newBranchData/g, 'newAppData');
code = code.replace(/const currentBranchData = appData;/g, 'const currentBranchData = appData;');

code = code.replace(/<div style={{ display: 'flex', gap: 16 }}>\s*<select value={selectedBranch}[\s\S]*?<\/select>\s*<\/div>/, '');

code = code.replace(/<div style={{ color: 'var\(--text-muted\)', fontSize: '0.8rem', marginTop: 4 }}>Branch: \{selectedBranch\}<\/div>/g, '');

const newLoginLogic = `  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'password') {
      setView('dashboard');
    } else {
      alert('Invalid credentials. Use admin/password');
    }
  };`;
code = code.replace(/const handleLogin = \(e: React\.FormEvent\) => \{[\s\S]*?\};/, newLoginLogic);

fs.writeFileSync('src/App.tsx', code);
console.log('Refactoring complete.');
