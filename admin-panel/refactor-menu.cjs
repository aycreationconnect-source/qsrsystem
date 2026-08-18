const fs = require('fs');

// 1. Refactor App.tsx Menu Management Block
let appCode = fs.readFileSync('src/App.tsx', 'utf8');

const newMenuBlock = `      case 'Menu Management':
        return (
          <div className="admin-content" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            <div className="admin-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 24, backgroundColor: '#f8fafc' }}>
              <div className="menu-layout">
                {/* Left Side: Categories */}
                <div className="category-sidebar">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h3 style={{ fontSize: '1.25rem', color: '#1e293b', fontWeight: 600 }}>Categories</h3>
                    <button className="btn btn-next" style={{ padding: '6px 16px', fontSize: '0.85rem', borderRadius: 20, backgroundColor: '#3b82f6', color: '#fff', border: 'none', fontWeight: 500 }} onClick={() => setShowAddCategoryModal(true)}>+ Add</button>
                  </div>
                  
                  <div className="category-list-container">
                    {currentBranchData.categories.map((cat, i) => {
                      const items = currentBranchData.menu.filter((m) => m.category === cat);
                      const activeCount = items.filter((m) => m.status === 'Available').length;
                      const inactiveCount = items.length - activeCount;
                      const isActiveCat = selectedCategory === cat;
                      
                      return (
                        <div key={i} className={\`category-card \${isActiveCat ? 'active-cat' : ''}\`} onClick={() => setSelectedCategory(cat)}>
                          <div className="category-card-header">
                            <h4>{i + 1}. {cat}</h4>
                            <button 
                              className="edit-cat-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingCategoryName(cat);
                                setNewCategoryName(cat);
                                setShowAddCategoryModal(true);
                              }}
                            >Edit</button>
                          </div>
                          <div className="category-stats">
                            <div className="cat-stat active-stat">
                              <span className="cat-stat-value">{activeCount}</span>
                              <span className="cat-stat-label">ACTIVE</span>
                            </div>
                            <div className="cat-stat deactive-stat">
                              <span className="cat-stat-value">{inactiveCount}</span>
                              <span className="cat-stat-label">DEACTIVE</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right Side: Items List */}
                <div className="items-content">
                  {!selectedCategory ? (
                    <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '1.1rem', textAlign: 'center', padding: '0 40px' }}>
                      Select a category from the left to view<br/>and manage its items.
                    </div>
                  ) : (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <h3 style={{ fontSize: '1.25rem', color: '#1e293b', fontWeight: 600 }}>{selectedCategory} Items</h3>
                        <button className="btn btn-next" style={{ padding: '8px 16px', borderRadius: 20, backgroundColor: '#3b82f6', color: '#fff', border: 'none', fontWeight: 500 }} onClick={() => { setShowIngredientsList(true); setShowAddItemModal(true); }}>+ Add Item</button>
                      </div>
                      <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
`;

// Extract existing table body code to preserve it
const oldBlockRegex = /case 'Menu Management':[\s\S]*?<table style=\{\{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' \}\}>/;
appCode = appCode.replace(oldBlockRegex, newMenuBlock);
fs.writeFileSync('src/App.tsx', appCode);

// 2. Refactor index.css
let cssCode = fs.readFileSync('src/index.css', 'utf8');

const newCssRules = `
/* Light Theme Menu Layout */
.menu-layout {
  display: flex;
  gap: 24px;
  height: 100%;
}

.category-sidebar {
  width: 380px;
  display: flex;
  flex-direction: column;
}

.category-list-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
  padding-right: 8px;
  padding-bottom: 20px;
}

.category-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0,0,0,0.02);
}

.category-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}

.category-card.active-cat {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59,130,246,0.1);
}

.category-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.category-card-header h4 {
  font-size: 1.15rem;
  color: #0f172a;
  margin: 0;
  font-weight: 600;
}

.edit-cat-btn {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: #475569;
  border-radius: 12px;
  padding: 4px 12px;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.edit-cat-btn:hover {
  background: #e2e8f0;
  color: #1e293b;
}

.category-stats {
  display: flex;
  gap: 12px;
}

.cat-stat {
  flex: 1;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.cat-stat-value {
  font-size: 1.1rem;
  font-weight: 700;
}

.cat-stat-label {
  font-size: 0.65rem;
  font-weight: 600;
  color: #64748b;
  letter-spacing: 0.5px;
}

.active-stat .cat-stat-value {
  color: #10b981;
}

.deactive-stat .cat-stat-value {
  color: #475569;
}

.items-content {
  flex: 1;
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  padding: 24px;
  overflow-y: auto;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

/* Tablet Responsive */
@media (max-width: 1024px) {
  .menu-layout {
    flex-direction: column;
  }
  
  .category-sidebar {
    width: 100%;
    height: auto;
    flex-shrink: 0;
  }
  
  .category-list-container {
    flex-direction: row;
    overflow-x: auto;
    padding-bottom: 8px;
  }
  
  .category-card {
    min-width: 280px;
  }
  
  .items-content {
    min-height: 50vh;
  }
}
`;

// Replace the old CSS block for menu-layout
const cssRegex = /\.menu-layout\s*\{[\s\S]*?\.items-content\s*\{[\s\S]*?box-shadow: 0 4px 6px -1px rgba\(0, 0, 0, 0\.05\);\s*\n\s*\}/;
if(cssRegex.test(cssCode)) {
  cssCode = cssCode.replace(cssRegex, newCssRules.trim());
} else {
  // If we couldn't find the exact block to replace, just append it
  cssCode += '\\n' + newCssRules;
}
fs.writeFileSync('src/index.css', cssCode);

console.log('Refactoring complete.');
