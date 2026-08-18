const fs = require('fs');

let appCode = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Replace the state
appCode = appCode.replace(
  "const [newCategoryName, setNewCategoryName] = useState('');",
  "const [newCategory, setNewCategory] = useState<any>({ name: '', description: '', displayOrder: '', status: 'Active' });"
);

// We still keep editingCategoryName as string (name) or change it to keep track by ID if needed, but since it's hardcoded data, by name is fine.
// Wait, we can keep editingCategoryName as string for now.

// 2. Replace Modal UI
const oldModalRegex = /\{\/\* Add Category Modal \*\/\}\s*\{showAddCategoryModal && \([\s\S]*?\}\) \? 'Edit Category' : 'Add New Category'\}[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*\)}/;

const newModalCode = `{/* Add Category Modal */}
          {showAddCategoryModal && (
            <div className="modal-overlay">
              <div className="modal-content" style={{ width: 450 }}>
                <div className="modal-header">
                  <h2>{editingCategoryName ? 'Edit Category' : 'Add New Category'}</h2>
                  <button className="close-btn" onClick={() => { setShowAddCategoryModal(false); setEditingCategoryName(null); setNewCategory({ name: '', description: '', displayOrder: '', status: 'Active' }); }}>&times;</button>
                </div>
                <div className="modal-body">
                  <div className="form-group">
                    <label>Category Name <span style={{ color: 'red' }}>*</span></label>
                    <input type="text" placeholder="e.g. Desserts" value={newCategory.name} onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Category Description</label>
                    <textarea rows={3} placeholder="Brief description..." value={newCategory.description} onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })} style={{ width: '100%', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', marginTop: '8px', resize: 'vertical' }}></textarea>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div className="form-group">
                      <label>Display Order</label>
                      <input type="number" placeholder="e.g. 1" value={newCategory.displayOrder} onChange={(e) => setNewCategory({ ...newCategory, displayOrder: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Status <span style={{ color: 'red' }}>*</span></label>
                      <select value={newCategory.status} onChange={(e) => setNewCategory({ ...newCategory, status: e.target.value })}>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 16, marginTop: 32 }}>
                    <button className="btn btn-prev" style={{ flex: 1 }} onClick={() => { setShowAddCategoryModal(false); setEditingCategoryName(null); setNewCategory({ name: '', description: '', displayOrder: '', status: 'Active' }); }}>Cancel</button>
                    <button className="btn btn-next" style={{ flex: 1 }} onClick={() => {
                      if (!newCategory.name) return;
                      const newAppData = { ...appData };
                      
                      const parsedOrder = newCategory.displayOrder ? parseInt(newCategory.displayOrder) : 999;
                      const catObj = { ...newCategory, displayOrder: parsedOrder };

                      if (editingCategoryName) {
                        const idx = newAppData.categories.findIndex((c:any) => c.name === editingCategoryName || c === editingCategoryName);
                        if (idx !== -1) {
                           newAppData.categories[idx] = catObj;
                           // Update all menu items that belonged to this category
                           newAppData.menu.forEach((m:any) => {
                             if (m.category === editingCategoryName) m.category = catObj.name;
                           });
                           if(selectedCategory === editingCategoryName) setSelectedCategory(catObj.name);
                        }
                      } else {
                        newAppData.categories.push(catObj);
                      }
                      
                      // Sort by display order
                      newAppData.categories.sort((a:any, b:any) => {
                         const orderA = typeof a === 'object' ? a.displayOrder : 999;
                         const orderB = typeof b === 'object' ? b.displayOrder : 999;
                         return orderA - orderB;
                      });
                      
                      setAppData(newAppData);
                      setShowAddCategoryModal(false);
                      setEditingCategoryName(null);
                      setNewCategory({ name: '', description: '', displayOrder: '', status: 'Active' });
                    }}>{editingCategoryName ? 'Update Category' : 'Save Category'}</button>
                  </div>
                </div>
              </div>
            </div>
          )}`;

appCode = appCode.replace(oldModalRegex, newModalCode);

// 3. Update Category rendering loop
const listLoopRegex = /currentBranchData\.categories\.map\(\(cat, i\) => \{[\s\S]*?const items = currentBranchData\.menu\.filter\(\(m\) => m\.category === cat\);/;
const newListLoopCode = `currentBranchData.categories.map((catObj: any, i: number) => {
                      const catName = typeof catObj === 'string' ? catObj : catObj.name;
                      const isActiveCategory = typeof catObj === 'object' && catObj.status === 'Inactive' ? false : true;
                      const items = currentBranchData.menu.filter((m: any) => m.category === catName);`;

appCode = appCode.replace(listLoopRegex, newListLoopCode);

// Fix references inside the loop
appCode = appCode.replace(/const isActiveCat = selectedCategory === cat;/g, "const isActiveCat = selectedCategory === catName;");
appCode = appCode.replace(/onClick=\{\(\) => setSelectedCategory\(cat\)\}/g, "onClick={() => setSelectedCategory(catName)}");
appCode = appCode.replace(/<h4>\{i \+ 1\}\. \{cat\}<\/h4>/g, `<h4>{i + 1}. {catName} {!isActiveCategory && <span style={{fontSize:'0.6rem', color:'#ef4444', border:'1px solid #ef4444', padding:'2px 6px', borderRadius:10, marginLeft:8, verticalAlign:'middle'}}>Inactive</span>}</h4>`);

const editCatBtnRegex = /setEditingCategoryName\(cat\);\s*setNewCategoryName\(cat\);\s*setShowAddCategoryModal\(true\);/g;
appCode = appCode.replace(editCatBtnRegex, `setEditingCategoryName(catName);
                                setNewCategory(typeof catObj === 'object' ? catObj : { name: catName, description: '', displayOrder: i + 1, status: 'Active' });
                                setShowAddCategoryModal(true);`);

// 4. POS Categories Bar
const posBarRegex = /\{\['All Items', \.\.\.currentBranchData\.categories\]\.map\(\(cat: string, i: number\) => \(/;
appCode = appCode.replace(posBarRegex, `{['All Items', ...currentBranchData.categories.map((c:any) => typeof c === 'string' ? c : c.name)].map((cat: string, i: number) => (`);


fs.writeFileSync('src/App.tsx', appCode);
console.log('App.tsx refactored for Category objects');
