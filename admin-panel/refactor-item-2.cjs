const fs = require('fs');

let appCode = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add states for configuration modal
if (!appCode.includes('showConfigModal')) {
  appCode = appCode.replace('const [showAddItemModal, setShowAddItemModal] = useState(false);', 
    'const [showAddItemModal, setShowAddItemModal] = useState(false);\n  const [showConfigModal, setShowConfigModal] = useState(false);\n  const [configItemIndex, setConfigItemIndex] = useState<number | null>(null);');
}

// 2. Add config handler
if (!appCode.includes('handleConfigItem')) {
  appCode = appCode.replace('const handleEditItem = (item: any) => {', 
    `const handleConfigItem = (item: any) => {
    setConfigItemIndex(currentBranchData.menu.findIndex((m: any) => m.name === item.name));
    setNewItem({
      ...item,
      tax: item.tax || '',
    });
    setIngredients(item.ingredients && item.ingredients.length > 0 ? [...item.ingredients] : [{ name: '', quantity: '', unit: 'pcs' }]);
    setShowConfigModal(true);
  };\n\n  const handleEditItem = (item: any) => {`);
}

// 3. Find the Menu Table and update action buttons
const tableActionRegex = /<td style=\{\{ padding: '16px 24px' \}\}>\s*<button\s*className="btn-outline"[\s\S]*?>\s*Edit\s*<\/button>\s*<\/td>/g;
appCode = appCode.replace(tableActionRegex, `<td style={{ padding: '16px 24px', display: 'flex', gap: '8px' }}>
                                  <button
                                    className="btn-outline"
                                    style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                                    onClick={() => handleEditItem(item)}
                                  >
                                    ✏️ Edit
                                  </button>
                                  <button
                                    className="btn-outline"
                                    style={{ padding: '6px 12px', fontSize: '0.85rem', borderColor: '#8b5cf6', color: '#8b5cf6' }}
                                    onClick={() => handleConfigItem(item)}
                                  >
                                    ⚙️ Config
                                  </button>
                                </td>`);

// Write back
fs.writeFileSync('src/App.tsx', appCode);
console.log('App.tsx step 1 complete');
