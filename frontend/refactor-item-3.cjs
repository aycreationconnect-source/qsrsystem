const fs = require('fs');
let appCode = fs.readFileSync('src/App.tsx', 'utf8');

// The new simplified Add Item Modal
const newAddItemModal = `{/* Add Item Modal */}
          {showAddItemModal && (
            <div className="modal-overlay">
              <div className="modal-content" style={{ width: 650, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
                <div className="modal-header">
                  <h2>{editingItemIndex !== null ? 'Edit Menu Item' : 'Add New Menu Item'}</h2>
                  <button className="close-btn" onClick={() => { setShowAddItemModal(false); setEditingItemIndex(null); setNewItem({ name: '', category: '', description: '', image: '', price: '', type: 'Veg', available: true, status: 'Active', sku: '', prepTime: '' }); }}>&times;</button>
                </div>
                <div className="modal-body" style={{ overflowY: 'auto', paddingRight: 8 }}>
                  
                  {/* Status & Availability Toggles */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontWeight: 600, fontSize: '1rem' }}>Availability</span>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Is this item currently available?</p>
                      </div>
                      <label style={{ position: 'relative', display: 'inline-block', width: 44, height: 24 }}>
                        <input type="checkbox" checked={newItem.available} onChange={(e) => setNewItem({...newItem, available: e.target.checked})} style={{ opacity: 0, width: 0, height: 0 }} />
                        <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: newItem.available ? '#3b82f6' : '#cbd5e1', transition: '0.4s', borderRadius: 24 }}>
                          <span style={{ position: 'absolute', height: 18, width: 18, left: 3, bottom: 3, backgroundColor: 'white', transition: '0.4s', borderRadius: '50%', transform: newItem.available ? 'translateX(20px)' : 'translateX(0px)' }}></span>
                        </span>
                      </label>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontWeight: 600, fontSize: '1rem' }}>Status</span>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Active or Inactive</p>
                      </div>
                      <label style={{ position: 'relative', display: 'inline-block', width: 44, height: 24 }}>
                        <input type="checkbox" checked={newItem.status === 'Active'} onChange={(e) => setNewItem({...newItem, status: e.target.checked ? 'Active' : 'Inactive'})} style={{ opacity: 0, width: 0, height: 0 }} />
                        <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: newItem.status === 'Active' ? '#10b981' : '#cbd5e1', transition: '0.4s', borderRadius: 24 }}>
                          <span style={{ position: 'absolute', height: 18, width: 18, left: 3, bottom: 3, backgroundColor: 'white', transition: '0.4s', borderRadius: '50%', transform: newItem.status === 'Active' ? 'translateX(20px)' : 'translateX(0px)' }}></span>
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Basic Info */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div className="form-group">
                      <label>Item Name <span style={{ color: 'red' }}>*</span></label>
                      <input type="text" placeholder="e.g. Paneer Tikka" value={newItem.name} onChange={(e) => setNewItem({...newItem, name: e.target.value})} required />
                    </div>
                    <div className="form-group">
                      <label>Category <span style={{ color: 'red' }}>*</span></label>
                      <select style={{ width: '100%', padding: '12px', background: '#fff', border: '1px solid var(--border-color)', borderRadius: 8 }} value={newItem.category || selectedCategory || ''} onChange={(e) => setNewItem({...newItem, category: e.target.value})} required>
                        <option value="" disabled>Select Category</option>
                        {appData.categories.map((c, i) => {
                           const cName = typeof c === 'string' ? c : c.name;
                           return <option key={i} value={cName}>{cName}</option>;
                        })}
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Item Description</label>
                    <textarea rows={2} placeholder="Ingredients, taste, etc..." value={newItem.description} onChange={(e) => setNewItem({...newItem, description: e.target.value})} style={{ width: '100%', padding: '12px', border: '1px solid var(--border-color)', borderRadius: 8 }}></textarea>
                  </div>

                  {/* Pricing & Prep */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div className="form-group">
                      <label>Price (₹) <span style={{ color: 'red' }}>*</span></label>
                      <input type="number" placeholder="0.00" value={newItem.price} onChange={(e) => setNewItem({...newItem, price: e.target.value})} required />
                    </div>
                    <div className="form-group">
                      <label>Prep Time (min)</label>
                      <input type="number" placeholder="15" value={newItem.prepTime} onChange={(e) => setNewItem({...newItem, prepTime: e.target.value})} />
                    </div>
                  </div>

                  {/* Classification & File */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                    <div className="form-group">
                      <label>Dietary Type</label>
                      <select style={{ width: '100%', padding: '12px', background: '#fff', border: '1px solid var(--border-color)', borderRadius: 8 }} value={newItem.type} onChange={(e) => setNewItem({...newItem, type: e.target.value})}>
                        <option value="Veg">🟢 Veg</option>
                        <option value="Non-Veg">🔴 Non-Veg</option>
                        <option value="Egg">🟡 Egg</option>
                        <option value="Vegan">🌱 Vegan</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Item Code / SKU</label>
                      <input type="text" placeholder="e.g. PT-01" value={newItem.sku} onChange={(e) => setNewItem({...newItem, sku: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label>Item Image</label>
                      <input type="file" accept="image/*" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                           setNewItem({...newItem, image: URL.createObjectURL(file)});
                        }
                      }} style={{ padding: '8px 0' }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 16, marginTop: 24 }}>
                    <button className="btn btn-prev" style={{ flex: 1 }} onClick={() => { setShowAddItemModal(false); setEditingItemIndex(null); setNewItem({ name: '', category: '', description: '', image: '', price: '', type: 'Veg', available: true, status: 'Active', sku: '', prepTime: '' }); }}>Cancel</button>
                    <button className="btn btn-next" style={{ flex: 1 }} onClick={() => {
                      if (!newItem.name || !newItem.price) return;
                      const newAppData = {...appData};
                      const catToUse = newItem.category || selectedCategory || (newAppData.categories.length > 0 ? (typeof newAppData.categories[0] === 'string' ? newAppData.categories[0] : newAppData.categories[0].name) : 'Uncategorized');
                      
                      const finalItem = {
                         ...newItem,
                         price: \`₹\${parseFloat(newItem.price).toFixed(2)}\`,
                         category: catToUse,
                      };
                      
                      if (editingItemIndex !== null) {
                        newAppData.menu[editingItemIndex] = { ...newAppData.menu[editingItemIndex], ...finalItem };
                      } else {
                        newAppData.menu.push(finalItem);
                      }
                      
                      setAppData(newAppData);
                      setShowAddItemModal(false);
                      setEditingItemIndex(null);
                      setNewItem({ name: '', category: '', description: '', image: '', price: '', type: 'Veg', available: true, status: 'Active', sku: '', prepTime: '' });
                    }}>{editingItemIndex !== null ? 'Update Item' : 'Save Item'}</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Configuration Modal */}
          {showConfigModal && configItemIndex !== null && (
            <div className="modal-overlay">
              <div className="modal-content" style={{ width: 500, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
                <div className="modal-header">
                  <h2>Configure: {appData.menu[configItemIndex].name}</h2>
                  <button className="close-btn" onClick={() => { setShowConfigModal(false); setConfigItemIndex(null); }}>&times;</button>
                </div>
                <div className="modal-body" style={{ overflowY: 'auto' }}>
                  
                  <div className="form-group" style={{ marginBottom: 24 }}>
                    <label>Tax (%)</label>
                    <input type="number" placeholder="5" value={newItem.tax || ''} onChange={(e) => setNewItem({...newItem, tax: e.target.value})} />
                  </div>

                  <div className="form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                       <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Recipe / Ingredients</h4>
                       <button className="btn-outline" style={{ padding: '4px 8px', fontSize: '0.7rem' }} onClick={() => setIngredients([...ingredients, { name: '', quantity: '', unit: 'pcs' }])}>+ Add Ingredient</button>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Link raw materials. If a material doesn't exist, it will be auto-created in Inventory.</p>
                    
                    <div className="ingredients-list" style={{ marginTop: 12, padding: 16, background: '#f8fafc', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                      {ingredients.map((ing, i) => (
                        <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                          <input type="text" list="inventory-items" placeholder="Item Name" value={ing.name} onChange={(e) => {
                            const newIng = [...ingredients];
                            newIng[i].name = e.target.value;
                            setIngredients(newIng);
                          }} style={{ flex: 2 }} />
                          <input type="number" placeholder="Qty" value={ing.quantity} onChange={(e) => {
                            const newIng = [...ingredients];
                            newIng[i].quantity = e.target.value;
                            setIngredients(newIng);
                          }} style={{ flex: 1 }} />
                          <select value={ing.unit} onChange={(e) => {
                            const newIng = [...ingredients];
                            newIng[i].unit = e.target.value;
                            setIngredients(newIng);
                          }} style={{ flex: 1 }}>
                            <option value="pcs">pcs</option>
                            <option value="kg">kg</option>
                            <option value="g">g</option>
                            <option value="L">L</option>
                            <option value="ml">ml</option>
                          </select>
                          <button onClick={() => setIngredients(ingredients.filter((_, idx) => idx !== i))} style={{ background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: 4, padding: '0 8px', cursor: 'pointer' }}>&times;</button>
                        </div>
                      ))}
                      {ingredients.length === 0 && <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>No ingredients added.</p>}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 16, marginTop: 32 }}>
                    <button className="btn btn-prev" style={{ flex: 1 }} onClick={() => { setShowConfigModal(false); setConfigItemIndex(null); }}>Cancel</button>
                    <button className="btn btn-next" style={{ flex: 1 }} onClick={() => {
                      const newAppData = {...appData};
                      const validIngredients = ingredients.filter(i => i.name && i.quantity);
                      
                      newAppData.menu[configItemIndex].tax = newItem.tax;
                      newAppData.menu[configItemIndex].ingredients = validIngredients;
                      
                      setAppData(newAppData);
                      setShowConfigModal(false);
                      setConfigItemIndex(null);
                    }}>Save Configuration</button>
                  </div>
                </div>
              </div>
            </div>
          )}`

// Replace the old add item modal
const startIndex = appCode.indexOf('{/* Add Item Modal */}');
const endIndex = appCode.indexOf('{/* Add Category Modal */}');
appCode = appCode.substring(0, startIndex) + newAddItemModal + '\n\n          ' + appCode.substring(endIndex);

fs.writeFileSync('src/App.tsx', appCode);
console.log('App.tsx step 3 complete');
