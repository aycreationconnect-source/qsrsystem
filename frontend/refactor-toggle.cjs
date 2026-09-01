const fs = require('fs');

// 1. Refactor App.tsx Modal
let appCode = fs.readFileSync('src/App.tsx', 'utf8');

const oldModalRegex = /\{\/\* Add Category Modal \*\/\}\s*\{showAddCategoryModal && \([\s\S]*?\}\) \? 'Edit Category' : 'Add New Category'\}[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*\)\}/;

const newModalCode = `{/* Add Category Modal */}
          {showAddCategoryModal && (
            <div className="modal-overlay">
              <div className="modal-content" style={{ width: 450 }}>
                <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2>{editingCategoryName ? 'Edit Category' : 'Add New Category'}</h2>
                  <button className="close-btn" onClick={() => { setShowAddCategoryModal(false); setEditingCategoryName(null); setNewCategory({ name: '', description: '', displayOrder: '', status: 'Active' }); }}>&times;</button>
                </div>
                <div className="modal-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #e2e8f0' }}>
                    <div>
                      <span style={{ fontWeight: 600, fontSize: '1.05rem', color: '#1e293b' }}>Category Status</span>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Toggle to make this category {newCategory?.status === 'Active' ? 'inactive' : 'active'}</p>
                    </div>
                    <label className="switch">
                      <input 
                        type="checkbox" 
                        checked={newCategory?.status === 'Active'} 
                        onChange={(e) => setNewCategory({ ...newCategory, status: e.target.checked ? 'Active' : 'Inactive' })} 
                      />
                      <span className="slider round"></span>
                    </label>
                  </div>

                  <div className="form-group">
                    <label>Category Name <span style={{ color: 'red' }}>*</span></label>
                    <input type="text" placeholder="e.g. Desserts" value={newCategory?.name || ''} onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Category Description</label>
                    <textarea rows={3} placeholder="Brief description..." value={newCategory?.description || ''} onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })} style={{ width: '100%', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', marginTop: '8px', resize: 'vertical' }}></textarea>
                  </div>
                  <div className="form-group">
                    <label>Display Order</label>
                    <input type="number" placeholder="e.g. 1" value={newCategory?.displayOrder || ''} onChange={(e) => setNewCategory({ ...newCategory, displayOrder: e.target.value })} />
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
                           newAppData.menu.forEach((m:any) => {
                             if (m.category === editingCategoryName) m.category = catObj.name;
                           });
                           if(selectedCategory === editingCategoryName) setSelectedCategory(catObj.name);
                        }
                      } else {
                        newAppData.categories.push(catObj);
                      }
                      
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
fs.writeFileSync('src/App.tsx', appCode);

// 2. Add CSS for toggle
let cssCode = fs.readFileSync('src/index.css', 'utf8');
const toggleCSS = `
/* Toggle Switch */
.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 28px;
}

.switch input { 
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #cbd5e1;
  -webkit-transition: .4s;
  transition: .4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  -webkit-transition: .4s;
  transition: .4s;
}

input:checked + .slider {
  background-color: #34d399;
}

input:focus + .slider {
  box-shadow: 0 0 1px #34d399;
}

input:checked + .slider:before {
  -webkit-transform: translateX(22px);
  -ms-transform: translateX(22px);
  transform: translateX(22px);
}

.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}
`;

if (!cssCode.includes('.switch {')) {
  cssCode += '\\n' + toggleCSS;
  fs.writeFileSync('src/index.css', cssCode);
}
console.log('Toggle added');
