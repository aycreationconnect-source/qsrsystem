import React, { useState, useEffect } from 'react';
import './index.css';

function App() {
  const [view, setView] = useState<'login' | 'register' | 'dashboard' | 'pos'>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('view') === 'pos' ? 'pos' : 'login';
  });
  const [posMode] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('mode');
  });
  const [cart, setCart] = useState<any[]>([]);
  const [posCategory, setPosCategory] = useState<string>('All Items');
  const [posSearchQuery, setPosSearchQuery] = useState('');
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [paymentType, setPaymentType] = useState('Cash');
  const [discountType, setDiscountType] = useState<'percent'|'fixed'>('fixed');
  const [discountValue, setDiscountValue] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('Dashboard');

  const [tableOrders, setTableOrders] = useState<Record<string, { savedOrders: any[][], activeCart: any[] }>>({});
  const [tableStartTimes, setTableStartTimes] = useState<Record<string, number>>({});
  const [tablePrinted, setTablePrinted] = useState<Record<string, boolean>>({});
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const [showAddTableModal, setShowAddTableModal] = useState(false);
  const [newTableName, setNewTableName] = useState('');
  const [showShiftTableModal, setShowShiftTableModal] = useState(false);

  const [appData, setAppData] = useState<any>({
    stats: { orders: 42, revenue: '₹12,450', tables: '8 / 15' },
    categories: [],
    areas: [],
    tables: [],
    menu: [],
    addons: [],
    inventory: [
      { item: 'Burger Buns', unit: 'pcs', stock: 120, used: 0, threshold: 20, status: 'Good', history: [] },
      { item: 'Chicken Patty', unit: 'pcs', stock: 85, used: 0, threshold: 15, status: 'Good', history: [] }
    ]
  });

  const fetchBackendData = async () => {
    try {
      const catRes = await fetch('http://localhost:3000/category');
      const cats = catRes.ok ? await catRes.json() : [];
      
      const menuRes = await fetch('http://localhost:3000/menu');
      const menus = menuRes.ok ? await menuRes.json() : [];
      
      const invRes = await fetch('http://localhost:3000/inventory');
      const inventory = invRes.ok ? await invRes.json() : [];

      const areaRes = await fetch('http://localhost:3000/area');
      const areas = areaRes.ok ? await areaRes.json() : [];
      const tableRes = await fetch('http://localhost:3000/table');
      const tables = tableRes.ok ? await tableRes.json() : [];

      const orderRes = await fetch('http://localhost:3000/order');
      const orders = orderRes.ok ? await orderRes.json() : [];

      const addonRes = await fetch('http://localhost:3000/addon');
      const addons = addonRes.ok ? await addonRes.json() : [];

      setAppData((prev: any) => ({
        ...prev,
        categories: cats,
        areas: areas,
        tables: tables,
        orders: orders,
        addons: addons,
        menu: Array.isArray(menus) ? menus.filter((m: any) => !m.isAddon).map((m: any) => ({ ...m, image: m.imageUrl, available: m.isAvailable, category: m.category?.name || 'Uncategorized', price: `₹${m.price.toFixed(2)}` })) : [],
        inventory: Array.isArray(inventory) && inventory.length > 0 ? inventory : prev.inventory
      }));
    } catch(e) { console.error('Backend connection failed:', e); }
  };

  useEffect(() => {
    fetchBackendData();
    const intervalId = setInterval(() => {
      fetchBackendData();
    }, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const currentBranchData = appData;

  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [configItemIndex, setConfigItemIndex] = useState<number | null>(null);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState<any>({ name: '', description: '', displayOrder: '', status: 'Active' });
  const [editingCategoryName, setEditingCategoryName] = useState<string | null>(null);
  const [menuManagementTab, setMenuManagementTab] = useState<'Menu Items' | 'Addons'>('Menu Items');
  const [newItem, setNewItem] = useState<any>({ name: '', category: '', description: '', image: '', price: '', tax: '', sku: '', prepTime: '', type: 'Veg', available: true, status: 'Active', isAddon: false });
  const [ingredients, setIngredients] = useState([{ name: '', quantity: '', unit: 'pcs' }]);
  const [taxes, setTaxes] = useState<any[]>([{ name: '', rate: '' }]);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);

  const [addonSelectionItem, setAddonSelectionItem] = useState<any>(null);
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);

  // Dedicated Addon CRUD state
  const [showAddonModal, setShowAddonModal] = useState(false);
  const [editingAddon, setEditingAddon] = useState<any>(null);
  const [addonForm, setAddonForm] = useState({ name: '', description: '', price: '' });

  const [showUpdateStockModal, setShowUpdateStockModal] = useState(false);
  const [editingInventoryIndex, setEditingInventoryIndex] = useState<number | null>(null);
  const [inventoryUpdateData, setInventoryUpdateData] = useState({ stock: '', threshold: '' });

  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyItemIndex, setHistoryItemIndex] = useState<number | null>(null);

  // Area & Table Modals
  const [showAddAreaModal, setShowAddAreaModal] = useState(false);
  const [editingAreaId, setEditingAreaId] = useState<number | null>(null);
  const [newArea, setNewArea] = useState<any>({ name: '', description: '' });

  const [showAddTableConfigModal, setShowAddTableConfigModal] = useState(false);
  const [editingTableId, setEditingTableId] = useState<number | null>(null);
  const [newTableConfig, setNewTableConfig] = useState<any>({ name: '', seats: 4, status: 'Available', areaId: '' });

  // Redirect to category list when branch changes
  useEffect(() => {
    setSelectedCategory(null);
  }, []);

  const handleConfigItem = (item: any) => {
    setConfigItemIndex(currentBranchData.menu.findIndex((m: any) => m.name === item.name));
    setNewItem({
      ...item,
      tax: item.tax || '',
    });
    setIngredients(item.ingredients && item.ingredients.length > 0 ? [...item.ingredients] : [{ name: '', quantity: '', unit: 'pcs' }]);
    setTaxes(item.taxes && item.taxes.length > 0 ? [...item.taxes] : [{ name: '', rate: '' }]);
    setShowConfigModal(true);
  };

  const handleEditItem = (item: any) => {
    setNewItem({
      name: item.name || '',
      category: item.category || '',
      description: item.description || '',
      image: item.image || '',
      price: item.price ? item.price.replace('₹', '') : '',
      tax: item.tax || '',
      taxName: item.taxName || '',
      sku: item.sku || '',
      prepTime: item.prepTime || '',
      type: item.type || 'Veg',
      available: item.available !== undefined ? item.available : true,
      status: item.status || 'Active',
      isAddon: item.isAddon || false,
      addonIds: item.addonIds || ''
    });
    setIngredients(item.ingredients && item.ingredients.length > 0 ? [...item.ingredients] : [{ name: '', quantity: '', unit: 'pcs' }]);
    setEditingItemIndex(currentBranchData.menu.findIndex((m: any) => m.name === item.name));

    setShowAddItemModal(true);
  };

  const handleDeleteItem = async (item: any) => {
    if (window.confirm(`Are you sure you want to delete ${item.name}?`)) {
      try {
        await fetch(`http://localhost:3000/menu/${item.id}`, { method: 'DELETE' });
        fetchBackendData();
      } catch (err) {
        console.error("Failed to delete item:", err);
        alert("Failed to delete item.");
      }
    }
  };

  const handleEditInventory = (index: number) => {
    const item = currentBranchData.inventory[index];
    setInventoryUpdateData({ stock: item.stock.toString(), threshold: item.threshold.toString() });
    setEditingInventoryIndex(index);
    setShowUpdateStockModal(true);
  };

  const handleViewHistory = (index: number) => {
    setHistoryItemIndex(index);
    setShowHistoryModal(true);
  };

  // Form States
  const [loginData, setLoginData] = useState({ adminId: '', password: '' });
  const [registerData, setRegisterData] = useState({
    dbHost: 'localhost',
    dbPort: '3306',
    dbUser: 'root',
    dbPassword: '',
    dbName: 'qsr_local',
    adminId: '',
    adminPassword: '',
    restaurantName: ''
  });

  // Persist Login
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isAdminLoggedIn');
    const savedAdminId = localStorage.getItem('adminId');
    if (isLoggedIn === 'true') {
      if (savedAdminId) setLoginData(prev => ({ ...prev, adminId: savedAdminId }));
      const params = new URLSearchParams(window.location.search);
      if (params.get('view') !== 'pos') {
        setView('dashboard');
      }
    }
  }, []);


  const handleSaveArea = async () => {
    try {
      if (editingAreaId) {
        await fetch(`http://localhost:3000/area/${editingAreaId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newArea)
        });
      } else {
        await fetch('http://localhost:3000/area', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newArea)
        });
      }
      setShowAddAreaModal(false);
      fetchBackendData();
    } catch(e) { console.error('Failed to save area:', e); }
  };

  const handleSaveTable = async () => {
    try {
      const payload = { ...newTableConfig, seats: parseInt(newTableConfig.seats), areaId: parseInt(newTableConfig.areaId) };
      if (editingTableId) {
        await fetch(`http://localhost:3000/table/${editingTableId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        await fetch('http://localhost:3000/table', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
      setShowAddTableConfigModal(false);
      fetchBackendData();
    } catch(e) { console.error('Failed to save table:', e); }
  };

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  };



      const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('isAdminLoggedIn', 'true');
    localStorage.setItem('adminId', loginData.adminId || 'admin');
    setView('dashboard');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Connecting to MySQL at ${registerData.dbHost}... Saving Admin ${registerData.adminId}...`);
    try {
      const res = await fetch('http://localhost:3000/init', { method: 'POST' });
      if (res.ok) {
        setAppData({
          categories: [],
          areas: [],
          tables: [],
          orders: [],
          menu: [],
          inventory: []
        });
        localStorage.setItem('isAdminLoggedIn', 'true');
        localStorage.setItem('adminId', registerData.adminId);
        setView('dashboard');
      } else {
        alert('Failed to initialize local database');
      }
    } catch (e) {
      console.error(e);
      alert('Error connecting to backend for initialization.');
    }
  };



  const renderDashboardContent = () => {
    switch(activeTab) {
      case 'Dashboard':
        return (
          <div className="admin-content">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-title">Total Orders Today</div>
                <div className="stat-value">{currentBranchData.stats.orders}</div>
              </div>
              <div className="stat-card">
                <div className="stat-title">Total Revenue</div>
                <div className="stat-value">{currentBranchData.stats.revenue}</div>
              </div>
              <div className="stat-card">
                <div className="stat-title">Active Tables</div>
                <div className="stat-value">{currentBranchData.stats.tables}</div>
              </div>
            </div>
            <div className="admin-card" style={{ marginTop: 24 }}>
              <h3>Recent Activity</h3>
              <ul style={{ marginTop: 12, listStyle: 'none', color: 'var(--text-muted)' }}>
                <li style={{ padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>Order completed</li>
                <li style={{ padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>Table status updated</li>
              </ul>
            </div>
          </div>
        );
            case 'Menu Management':
        return (
          <div className="admin-content" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            <div className="admin-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 24, backgroundColor: '#f8fafc' }}>
              <div style={{ display: 'flex', gap: 16, marginBottom: 20, borderBottom: '1px solid #e2e8f0', paddingBottom: 12 }}>
                <div onClick={() => setMenuManagementTab('Menu Items')} style={{ cursor: 'pointer', padding: '8px 16px', fontWeight: 600, color: menuManagementTab === 'Menu Items' ? '#2563eb' : '#64748b', borderBottom: menuManagementTab === 'Menu Items' ? '2px solid #2563eb' : 'none' }}>Menu Items</div>
                <div onClick={() => setMenuManagementTab('Addons')} style={{ cursor: 'pointer', padding: '8px 16px', fontWeight: 600, color: menuManagementTab === 'Addons' ? '#2563eb' : '#64748b', borderBottom: menuManagementTab === 'Addons' ? '2px solid #2563eb' : 'none' }}>Add-ons</div>
              </div>

              {menuManagementTab === 'Menu Items' && (
                <div className="menu-layout">
                  {/* Left Side: Categories */}
                <div className="category-sidebar">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h3 style={{ fontSize: '1.25rem', color: '#1e293b', fontWeight: 600 }}>Categories</h3>
                    <button className="btn btn-next" style={{ padding: '6px 16px', fontSize: '0.85rem', borderRadius: 20, backgroundColor: '#3b82f6', color: '#fff', border: 'none', fontWeight: 500 }} onClick={() => setShowAddCategoryModal(true)}>+ Add</button>
                  </div>
                  
                  <div className="category-list-container">
                    {currentBranchData.categories.map((catObj: any, i: number) => {
                      const catName = typeof catObj === 'string' ? catObj : catObj.name;
                      const isActiveCategory = typeof catObj === 'object' && catObj.status === 'Inactive' ? false : true;
                      const items = currentBranchData.menu.filter((m: any) => m.category === catName);
                      const activeCount = items.filter((m: any) => m.available !== false && m.status === 'Active').length;
                      const inactiveCount = items.length - activeCount;
                      const isActiveCat = selectedCategory === catName;
                      
                      return (
                        <div key={i} className={`category-card ${isActiveCat ? 'active-cat' : ''}`} onClick={() => setSelectedCategory(catName)}>
                          <div className="category-card-header">
                            <h4>{i + 1}. {catName} {!isActiveCategory && <span style={{fontSize:'0.6rem', color:'#ef4444', border:'1px solid #ef4444', padding:'2px 6px', borderRadius:10, marginLeft:8, verticalAlign:'middle'}}>Inactive</span>}</h4>
                            <button 
                              className="edit-cat-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingCategoryName(catName);
                                setNewCategory(typeof catObj === 'object' ? catObj : { name: catName, description: '', displayOrder: i + 1, status: 'Active' });
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
                        <button className="btn btn-next" style={{ padding: '8px 16px', borderRadius: 20, backgroundColor: '#3b82f6', color: '#fff', border: 'none', fontWeight: 500 }} onClick={() => { setShowAddItemModal(true); }}>+ Add Item</button>
                      </div>
                      <div style={{ overflowY: 'auto', flex: 1, paddingBottom: 24 }}>
                      {(() => {
                        const items = currentBranchData.menu.filter((m:any) => m.category === selectedCategory && !m.isAddon);

                        return (
                          <div style={{ marginBottom: 32 }}>
                            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                              <thead>
                                <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.1)', color: 'var(--text-muted)' }}>
                                  <th style={{ padding: 12, width: 40 }}>#</th>
                                  <th style={{ padding: 12 }}>Name</th>
                                  <th style={{ padding: 12 }}>Price</th>
                                  <th style={{ padding: 12 }}>Status</th>
                                  <th style={{ padding: 12, textAlign: 'right' }}>Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {items.length === 0 ? (
                                  <tr>
                                    <td colSpan={5} style={{ padding: 12, textAlign: 'center', color: '#94a3b8' }}>No items found.</td>
                                  </tr>
                                ) : items.map((item: any, i: number) => {
                                  let typeColor = '#22c55e'; // Veg (Green)
                                  if (item.type === 'Non-Veg') typeColor = '#ef4444'; // Red
                                  if (item.type === 'Egg') typeColor = '#eab308'; // Yellow

                                  return (
                                    <tr key={i} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                                      <td style={{ padding: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{i + 1}</td>
                                      <td style={{ padding: 12 }}>
                                        <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', backgroundColor: typeColor, marginRight: 8, border: `1px solid ${typeColor}` }}></span>
                                        {item.name}
                                      </td>
                                      <td style={{ padding: 12 }}>{item.price}</td>
                                      <td style={{ padding: 12 }}><span style={{ color: item.available ? 'var(--success)' : 'var(--primary-color)' }}>{item.available ? 'Available' : 'Unavailable'}</span></td>
                                      <td style={{ padding: 12, textAlign: 'right' }}>
                                        <button 
                                          className="btn btn-next" 
                                          style={{ padding: '4px 12px', fontSize: '0.8rem', background: '#f8fafc', border: '1px solid #94a3b8', color: '#475569', fontWeight: 600, marginRight: 8 }} 
                                          onClick={() => handleConfigItem(item)}
                                        >
                                          ⚙ Config
                                        </button>
                                        <button 
                                          className="btn btn-next" 
                                          style={{ padding: '4px 12px', fontSize: '0.8rem', background: '#eff6ff', border: '1px solid #3b82f6', color: '#1d4ed8', fontWeight: 600, marginRight: 8 }} 
                                          onClick={() => handleEditItem(item)}
                                        >
                                          Edit
                                        </button>
                                        <button 
                                          className="btn btn-next" 
                                          style={{ padding: '4px 12px', fontSize: '0.8rem', background: '#fef2f2', border: '1px solid #ef4444', color: '#b91c1c', fontWeight: 600 }} 
                                          onClick={() => handleDeleteItem(item)}
                                        >
                                          Delete
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        );
                      })()}
                      </div>
                    </>
                  )}
                </div>
              </div>
              )}

              {menuManagementTab === 'Addons' && (
                <div className="addons-layout" style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h3 style={{ fontSize: '1.25rem', color: '#1e293b', fontWeight: 600 }}>All Add-ons</h3>
                    <button className="btn btn-next" style={{ padding: '8px 16px', borderRadius: 20, backgroundColor: '#3b82f6', color: '#fff', border: 'none', fontWeight: 500 }} onClick={() => {
                      setEditingAddon(null);
                      setAddonForm({ name: '', description: '', price: '' });
                      setShowAddonModal(true);
                    }}>+ Create Add-on</button>
                  </div>
                  <div style={{ overflowY: 'auto', flex: 1, paddingBottom: 24 }}>
                    <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.1)', color: 'var(--text-muted)' }}>
                          <th style={{ padding: 12, width: 40 }}>#</th>
                          <th style={{ padding: 12 }}>Name</th>
                          <th style={{ padding: 12 }}>Description</th>
                          <th style={{ padding: 12 }}>Price</th>
                          <th style={{ padding: 12, textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentBranchData.addons.length === 0 ? (
                          <tr><td colSpan={5} style={{ padding: 24, textAlign: 'center', color: '#94a3b8' }}>No add-ons yet. Click "+ Create Add-on" to add one.</td></tr>
                        ) : currentBranchData.addons.map((addon: any, i: number) => (
                          <tr key={addon.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                            <td style={{ padding: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{i + 1}</td>
                            <td style={{ padding: 12, fontWeight: 600 }}>{addon.name}</td>
                            <td style={{ padding: 12, color: '#64748b', fontSize: '0.9rem' }}>{addon.description || '—'}</td>
                            <td style={{ padding: 12 }}>₹{parseFloat(addon.price).toFixed(2)}</td>
                            <td style={{ padding: 12, textAlign: 'right' }}>
                              <button className="btn btn-next" style={{ padding: '4px 12px', fontSize: '0.8rem', background: '#eff6ff', border: '1px solid #3b82f6', color: '#1d4ed8', fontWeight: 600, marginRight: 8 }} onClick={() => {
                                setEditingAddon(addon);
                                setAddonForm({ name: addon.name, description: addon.description || '', price: String(addon.price) });
                                setShowAddonModal(true);
                              }}>Edit</button>
                              <button className="btn btn-next" style={{ padding: '4px 12px', fontSize: '0.8rem', background: '#fef2f2', border: '1px solid #ef4444', color: '#b91c1c', fontWeight: 600 }} onClick={async () => {
                                if (window.confirm(`Delete "${addon.name}"?`)) {
                                  await fetch(`http://localhost:3000/addon/${addon.id}`, { method: 'DELETE' });
                                  fetchBackendData();
                                }
                              }}>Delete</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      case 'Inventory':
        return (
          <div className="admin-content">
            <div className="admin-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <h3>Stock & Inventory</h3>
                <button className="btn btn-next">+ Update Stock</button>
              </div>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: 12 }}>Raw Material</th>
                    <th style={{ padding: 12 }}>Current Stock</th>
                    <th style={{ padding: 12 }}>Threshold</th>
                    <th style={{ padding: 12 }}>Status</th>
                    <th style={{ padding: 12, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentBranchData.inventory.map((item: any, i: number) => {
                    let color = 'var(--success)';
                    if (item.status === 'Low Stock') color = '#fbbf24'; // warning yellow
                    if (item.status === 'Out of Stock') color = 'var(--primary-color)'; // red
                    
                    return (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: 12, fontWeight: 500 }}>{item.item}</td>
                        <td style={{ padding: 12 }}>
                          {item.stock <= 0 ? (
                            <span style={{ color: '#ef4444', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                              Out of stock
                            </span>
                          ) : (
                            `${item.stock} ${item.unit}`
                          )}
                        </td>
                        <td style={{ padding: 12, color: 'var(--text-muted)' }}>{item.threshold} {item.unit}</td>
                        <td style={{ padding: 12 }}><span style={{ color, fontWeight: 600 }}>{item.status}</span></td>
                        <td style={{ padding: 12, textAlign: 'right' }}>
                          <button 
                            className="btn btn-next" 
                            style={{ padding: '4px 12px', fontSize: '0.8rem', background: '#f8fafc', border: '1px solid #94a3b8', color: '#475569', marginRight: 8, fontWeight: 600 }} 
                            onClick={() => handleViewHistory(i)}
                          >
                            History
                          </button>
                          <button 
                            className="btn btn-next" 
                            style={{ padding: '4px 12px', fontSize: '0.8rem', background: '#eff6ff', border: '1px solid #3b82f6', color: '#1d4ed8', fontWeight: 600 }} 
                            onClick={() => handleEditInventory(i)}
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'Table Setup':
        return (
          <div className="admin-content">
            <div className="admin-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3>Table Configuration</h3>
                  <p style={{ color: 'var(--text-muted)', marginTop: 12 }}>Manage areas and tables.</p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn-primary" onClick={() => { setEditingAreaId(null); setNewArea({name:'', description:''}); setShowAddAreaModal(true); }}>+ Add Area</button>
                </div>
              </div>

              {currentBranchData.areas?.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                  No areas configured. Create an area first.
                </div>
              ) : (
                currentBranchData.areas?.map((area: any) => (
                  <div key={area.id} style={{ marginTop: 24, padding: 16, border: '1px solid var(--border-color)', borderRadius: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <h4 style={{ margin: 0 }}>{area.name}</h4>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button style={{ backgroundColor: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '6px 12px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: 500, transition: 'background-color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dbeafe'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#eff6ff'} onClick={() => {
                          setEditingAreaId(area.id);
                          setNewArea({ name: area.name, description: area.description || '' });
                          setShowAddAreaModal(true);
                        }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                          </svg>
                          Edit Area
                        </button>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'stretch' }}>
                      {currentBranchData.tables?.filter((t: any) => t.areaId === area.id).map((t: any) => (
                        <div key={t.id} style={{ width: 120, padding: 12, border: '2px solid var(--border-color)', borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'border-color 0.2s', position: 'relative' }} onClick={() => {
                              setEditingTableId(t.id);
                              setNewTableConfig({ name: t.name, seats: t.seats, status: t.status, areaId: t.areaId });
                              setShowAddTableConfigModal(true);
                        }} onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-color)'} onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}>
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)', marginBottom: 8 }}>
                            <rect x="4" y="7" width="16" height="10" rx="2" />
                            <path d="M8 7V5c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v2" />
                            <path d="M8 17v2c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2v-2" />
                            <path d="M4 10H2c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h2" />
                            <path d="M20 10h2c1.1 0 2 .9 2 2v2c0 1.1.9 2 2 2h-2" />
                          </svg>
                          <div style={{ fontWeight: 'bold' }}>{t.name}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.seats} Seats</div>
                        </div>
                      ))}
                      
                      <div style={{ width: 120, padding: 12, border: '2px dashed var(--border-color)', borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)', transition: 'border-color 0.2s, color 0.2s' }} onClick={() => {
                        setEditingTableId(null);
                        setNewTableConfig({name:'', seats:4, status:'Available', areaId: area.id});
                        setShowAddTableConfigModal(true);
                      }} onMouseEnter={(e) => {e.currentTarget.style.borderColor = 'var(--accent-color)'; e.currentTarget.style.color = 'var(--accent-color)';}} onMouseLeave={(e) => {e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-muted)';}}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 8 }}>
                          <line x1="12" y1="5" x2="12" y2="19"></line>
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>Add Table</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      default:
        return (
          <div className="admin-content">
            <div className="admin-card">
              <h3>{activeTab}</h3>
              <p style={{ color: 'var(--text-muted)', marginTop: 12 }}>This section is under construction.</p>
            </div>
          </div>
        );
    }
  };

  // POS Logic
  const updateTableActiveCart = (tableId: string, newCart: any[]) => {
    setTableOrders(prev => {
      const existing = prev[tableId] || { savedOrders: [], activeCart: [] };
      return { ...prev, [tableId]: { ...existing, activeCart: newCart } };
    });
    
    if (newCart.length > 0) {
      setTableStartTimes(prev => {
        if (!prev[tableId]) {
          return { ...prev, [tableId]: Date.now() };
        }
        return prev;
      });
    }
  };

  const saveTableOrder = () => {
    if (posMode !== 'table' || !selectedTableId || cart.length === 0) return;
    setTableOrders(prev => {
      const existing = prev[selectedTableId] || { savedOrders: [], activeCart: [] };
      return {
        ...prev,
        [selectedTableId]: {
          savedOrders: [...existing.savedOrders, existing.activeCart],
          activeCart: []
        }
      };
    });
    setCart([]);
  };

  const handleAddToCart = (item: any, skipAddonCheck = false) => {
    if (posMode === 'table' && !selectedTableId) {
      alert("Please select a table from the left sidebar to add items.");
      return;
    }
    
    if (!skipAddonCheck && item.addonIds && item.addonIds.trim() !== '') {
       setAddonSelectionItem(item);
       setSelectedAddonIds([]);
       return;
    }

    setCart(prev => {
      let newCart;
      const existing = prev.find(i => i.name === item.name);
      if (existing) {
        newCart = prev.map(i => i.name === item.name ? { ...i, quantity: i.quantity + 1 } : i);
      } else {
        newCart = [...prev, { ...item, quantity: 1 }];
      }
      if (posMode === 'table' && selectedTableId) updateTableActiveCart(selectedTableId, newCart);
      return newCart;
    });
  };

  const updateCartQty = (itemOrName: any, delta: number) => {
    setCart(prev => {
      let newCart;
      const itemName = typeof itemOrName === 'string' ? itemOrName : itemOrName.name;
      const existing = prev.find(i => i.name === itemName);
      if (existing) {
        newCart = prev.map(i => i.name === itemName ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i).filter(i => i.quantity > 0);
      } else if (delta > 0 && typeof itemOrName !== 'string') {
        newCart = [...prev, { ...itemOrName, quantity: delta }];
      } else {
        newCart = prev;
      }
      if (posMode === 'table' && selectedTableId) updateTableActiveCart(selectedTableId, newCart);
      return newCart;
    });
  };
  
  const updateCartQtyExact = (itemOrName: any, qty: number) => {
    setCart(prev => {
      let newCart;
      const itemName = typeof itemOrName === 'string' ? itemOrName : itemOrName.name;
      const existing = prev.find(i => i.name === itemName);
      if (existing) {
        newCart = prev.map(i => i.name === itemName ? { ...i, quantity: Math.max(0, qty) } : i).filter(i => i.quantity > 0);
      } else if (qty > 0 && typeof itemOrName !== 'string') {
        newCart = [...prev, { ...itemOrName, quantity: qty }];
      } else {
        newCart = prev;
      }
      if (posMode === 'table' && selectedTableId) updateTableActiveCart(selectedTableId, newCart);
      return newCart;
    });
  };

  const cancelCartItem = (itemName: string) => {
    setCart(prev => {
      const newCart = prev.filter(i => i.name !== itemName);
      if (posMode === 'table' && selectedTableId) updateTableActiveCart(selectedTableId, newCart);
      return newCart;
    });
  };
  
  const getCartTotals = () => {
    let combinedItems = [...cart];
    if (posMode === 'table' && selectedTableId && tableOrders[selectedTableId]) {
      tableOrders[selectedTableId].savedOrders.forEach(order => {
        combinedItems = [...combinedItems, ...order];
      });
    }
    let subtotal = 0;
    let tax = 0;
    combinedItems.forEach(item => {
      const price = parseFloat(item.price.replace('₹', ''));
      const itemSubtotal = price * item.quantity;
      subtotal += itemSubtotal;
      
      let itemTaxRate = 0;
      if (item.taxes && item.taxes.length > 0) {
         itemTaxRate = item.taxes.reduce((sum: number, t: any) => sum + (parseFloat(t.rate) || 0), 0);
      } else if (item.tax) {
         itemTaxRate = parseFloat(item.tax);
      }
      tax += itemSubtotal * (itemTaxRate / 100);
    });
    return { subtotal, tax, total: subtotal + tax };
  };
  
  const confirmPaymentAndOrder = async () => {
    let combinedItems = [...cart];
    if (posMode === 'table' && selectedTableId && tableOrders[selectedTableId]) {
      tableOrders[selectedTableId].savedOrders.forEach(order => {
        combinedItems = [...combinedItems, ...order];
      });
    }

    if (combinedItems.length === 0) return;
    
    const { subtotal, tax, total: baseTotal } = getCartTotals();
    const dVal = parseFloat(discountValue) || 0;
    let finalTotal = baseTotal;
    if (discountType === 'percent') {
      finalTotal = baseTotal - (baseTotal * dVal / 100);
    } else {
      finalTotal = baseTotal - dVal;
    }
    if (finalTotal < 0) finalTotal = 0;

    const orderDetails = {
      items: combinedItems.map(c => ({
        menuItemId: c.id,
        quantity: c.quantity,
        price: parseFloat(c.price.toString().replace('₹', '')) || 0
      })),
      subtotal,
      tax,
      total: finalTotal,
      paymentMethod: paymentType
    };
    
    try {
      const res = await fetch('http://localhost:3000/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderDetails)
      });
      
      if (res.ok) {
        await fetchBackendData();
        setCart([]);
        if (posMode === 'table' && selectedTableId) {
          setTableOrders(t => {
            const newT = { ...t };
            delete newT[selectedTableId];
            return newT;
          });
          setTableStartTimes(t => {
            const newT = { ...t };
            delete newT[selectedTableId];
            return newT;
          });
          setSelectedTableId(null);
        }
        setDiscountValue('');
        setShowCheckoutModal(false);
        setOrderSuccess(true);
        setTimeout(() => {
          setOrderSuccess(false);
        }, 3000);
      } else {
        alert("Failed to place order.");
      }
    } catch (e) {
      console.error(e);
      alert("Error placing order.");
    }
  };

  if (view === 'dashboard') {
    return (
      <div className="admin-dashboard-layout">
        <aside className="admin-sidebar">
          <div className="admin-brand">{registerData.restaurantName || 'QSR Admin'}</div>
          <div className="admin-nav">
            {['Dashboard', 'Menu Management', 'Inventory', 'Table Setup', 'Settings'].map(tab => (
              <div 
                key={tab}
                className={`admin-nav-item ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </div>
            ))}
            <div className={`admin-nav-item`} onClick={() => window.open('/?view=pos', '_blank')}>
              <span style={{ fontSize: '1.2rem' }}>🖥️</span> QSR Terminal
            </div>
            <div className={`admin-nav-item`} onClick={() => window.open('/?view=pos&mode=table', '_blank')}>
              <span style={{ fontSize: '1.2rem' }}>🍽️</span> Table POS Terminal
            </div>
            <div style={{ marginTop: 'auto', paddingTop: 24, borderTop: '1px solid rgba(0,0,0,0.05)' }}>
              <div className="admin-nav-item" style={{ color: '#e11d48' }} onClick={() => setView('login')}>
                <span style={{ fontSize: '1.2rem' }}>🚪</span> Logout
              </div>
            </div>
          </div>
        </aside>
        <main className="admin-main">
          <header className="admin-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <h2>{activeTab}</h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', boxShadow: '0 4px 10px rgba(59,130,246,0.3)' }}>
                {(loginData.adminId || registerData.adminId || 'A').charAt(0).toUpperCase()}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>{loginData.adminId || registerData.adminId || 'Admin'}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Super Admin</span>
              </div>
            </div>
          </header>
          {renderDashboardContent()}

          {/* Area Modal */}
          {showAddAreaModal && (
            <div className="modal-overlay">
              <div className="modal-content" style={{ width: 500, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
                <div className="modal-header">
                  <h2>{editingAreaId ? 'Edit Area' : 'Add New Area'}</h2>
                  <button className="close-btn" onClick={() => setShowAddAreaModal(false)}>&times;</button>
                </div>
                <div className="modal-body" style={{ overflowY: 'auto', paddingRight: 8 }}>
                  <div className="form-group">
                    <label>Area Name</label>
                    <input type="text" placeholder="e.g. Main Dining" value={newArea.name} onChange={e => setNewArea({...newArea, name: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea rows={3} placeholder="Brief description..." value={newArea.description} onChange={e => setNewArea({...newArea, description: e.target.value})} style={{ width: '100%', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', marginTop: '8px', resize: 'vertical' }}></textarea>
                  </div>
                  <div style={{ display: 'flex', gap: 16, marginTop: 32 }}>
                    <button className="btn btn-prev" style={{ flex: 1 }} onClick={() => setShowAddAreaModal(false)}>Cancel</button>
                    <button className="btn btn-next" style={{ flex: 1 }} onClick={handleSaveArea}>Save Area</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Table Modal */}
          {showAddTableConfigModal && (
            <div className="modal-overlay">
              <div className="modal-content" style={{ width: 500, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
                <div className="modal-header">
                  <h2>{editingTableId ? 'Edit Table' : 'Add New Table'}</h2>
                  <button className="close-btn" onClick={() => setShowAddTableConfigModal(false)}>&times;</button>
                </div>
                <div className="modal-body" style={{ overflowY: 'auto', paddingRight: 8 }}>
                  <div className="form-group">
                    <label>Table Name</label>
                    <input type="text" placeholder="e.g. T-12" value={newTableConfig.name} onChange={e => setNewTableConfig({...newTableConfig, name: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Seats</label>
                    <input type="number" placeholder="e.g. 4" value={newTableConfig.seats} onChange={e => setNewTableConfig({...newTableConfig, seats: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Area</label>
                    <select value={newTableConfig.areaId} onChange={e => setNewTableConfig({...newTableConfig, areaId: e.target.value})} style={{ width: '100%', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', marginTop: '8px' }}>
                      <option value="">Select Area</option>
                      {currentBranchData.areas?.map((a: any) => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: 16, marginTop: 32 }}>
                    <button className="btn btn-prev" style={{ flex: 1 }} onClick={() => setShowAddTableConfigModal(false)}>Cancel</button>
                    <button className="btn btn-next" style={{ flex: 1 }} onClick={handleSaveTable} disabled={!newTableConfig.areaId}>Save Table</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Add Item Modal */}
          {showAddItemModal && (
            <div className="modal-overlay">
              <div className="modal-content" style={{ width: 650, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
                <div className="modal-header">
                  <h2>{editingItemIndex !== null ? (newItem.isAddon ? 'Edit Add-on' : 'Edit Menu Item') : (newItem.isAddon ? 'Create Add-on' : 'Add New Menu Item')}</h2>
                  <button className="close-btn" onClick={() => { setShowAddItemModal(false); setEditingItemIndex(null); setNewItem({ name: '', category: '', description: '', image: '', price: '', type: 'Veg', available: true, status: 'Active', sku: '', prepTime: '' }); }}>&times;</button>
                </div>
                <div className="modal-body" style={{ overflowY: 'auto', paddingRight: 8 }}>
                  
                  {/* Status & Availability & Addon Toggles */}
                  {!newItem.isAddon && (
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
                  )}

                  {/* Basic Info */}
                  <div className="form-group" style={{ marginBottom: 16 }}>
                    <label>Item Name <span style={{ color: 'red' }}>*</span></label>
                    <input type="text" placeholder="e.g. Paneer Tikka" value={newItem.name} onChange={(e) => setNewItem({...newItem, name: e.target.value})} required style={{ width: '100%' }} />
                  </div>

                  <div className="form-group">
                    <label>Item Description</label>
                    <textarea rows={2} placeholder="Ingredients, taste, etc..." value={newItem.description} onChange={(e) => setNewItem({...newItem, description: e.target.value})} style={{ width: '100%', padding: '12px', border: '1px solid var(--border-color)', borderRadius: 8 }}></textarea>
                  </div>

                  {/* Pricing & Prep */}
                  <div style={{ display: 'grid', gridTemplateColumns: newItem.isAddon ? '1fr' : '1fr 1fr', gap: 16 }}>
                    <div className="form-group">
                      <label>Price (₹) <span style={{ color: 'red' }}>*</span></label>
                      <input type="number" placeholder="0.00" value={newItem.price} onChange={(e) => setNewItem({...newItem, price: e.target.value})} required />
                    </div>
                    {!newItem.isAddon && (
                      <div className="form-group">
                        <label>Prep Time (min)</label>
                        <input type="number" placeholder="15" value={newItem.prepTime} onChange={(e) => setNewItem({...newItem, prepTime: e.target.value})} />
                      </div>
                    )}
                  </div>

                  {/* Classification & File */}
                  {!newItem.isAddon && (
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
                  )}

                  <div style={{ display: 'flex', gap: 16, marginTop: 24 }}>
                    <button className="btn btn-prev" style={{ flex: 1 }} onClick={() => { setShowAddItemModal(false); setEditingItemIndex(null); setNewItem({ name: '', category: '', description: '', image: '', price: '', type: 'Veg', available: true, status: 'Active', sku: '', prepTime: '' }); }}>Cancel</button>
                    <button className="btn btn-next" style={{ flex: 1 }} onClick={() => {
                      if (!newItem.name || !newItem.price) return;
                      const newAppData = {...appData};
                      const catToUse = newItem.category || selectedCategory || (newAppData.categories.length > 0 ? (typeof newAppData.categories[0] === 'string' ? newAppData.categories[0] : newAppData.categories[0].name) : 'Uncategorized');
                      
                      const finalItem = {
                         ...newItem,
                         price: `₹${parseFloat(newItem.price).toFixed(2)}`,
                         category: catToUse,
                      };
                      
                      if (editingItemIndex !== null) {
                        const existingItem = newAppData.menu[editingItemIndex];
                        if (existingItem && existingItem.id) {
                          fetch(`http://localhost:3000/menu/${existingItem.id}`, {
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
                    }}>{editingItemIndex !== null ? 'Update Item' : 'Save Item'}</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Addon Create/Edit Modal */}
          {showAddonModal && (
            <div className="modal-overlay" style={{ zIndex: 9999 }}>
              <div className="modal-content" style={{ width: 480, borderRadius: 16, padding: 0, overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #e5e7eb', background: '#f8fafc' }}>
                  <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#1e293b' }}>{editingAddon ? 'Edit Add-on' : 'Create Add-on'}</h2>
                  <button onClick={() => { setShowAddonModal(false); setEditingAddon(null); }} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#64748b' }}>&times;</button>
                </div>
                <div style={{ padding: '24px' }}>
                  <div className="form-group" style={{ marginBottom: 16 }}>
                    <label>Name <span style={{ color: 'red' }}>*</span></label>
                    <input type="text" placeholder="e.g. Extra Cheese" value={addonForm.name} onChange={(e) => setAddonForm({ ...addonForm, name: e.target.value })} style={{ width: '100%' }} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 16 }}>
                    <label>Description</label>
                    <textarea rows={2} placeholder="Short description..." value={addonForm.description} onChange={(e) => setAddonForm({ ...addonForm, description: e.target.value })} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: 8 }} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 24 }}>
                    <label>Price (₹) <span style={{ color: 'red' }}>*</span></label>
                    <input type="number" placeholder="0.00" value={addonForm.price} onChange={(e) => setAddonForm({ ...addonForm, price: e.target.value })} style={{ width: '100%' }} />
                  </div>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button className="btn btn-prev" style={{ flex: 1 }} onClick={() => { setShowAddonModal(false); setEditingAddon(null); }}>Cancel</button>
                    <button className="btn btn-next" style={{ flex: 1 }} onClick={async () => {
                      if (!addonForm.name || !addonForm.price) return;
                      if (editingAddon) {
                        await fetch(`http://localhost:3000/addon/${editingAddon.id}`, {
                          method: 'PATCH', headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(addonForm)
                        });
                      } else {
                        await fetch('http://localhost:3000/addon', {
                          method: 'POST', headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(addonForm)
                        });
                      }
                      setShowAddonModal(false);
                      setEditingAddon(null);
                      setAddonForm({ name: '', description: '', price: '' });
                      fetchBackendData();
                    }}>{editingAddon ? 'Update Add-on' : 'Save Add-on'}</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Configuration Modal */}
          {showConfigModal && configItemIndex !== null && (
            <div className="modal-overlay" style={{ zIndex: 9999 }}>
              <div className="modal-content" style={{ width: 1100, maxHeight: '90vh', display: 'flex', flexDirection: 'column', borderRadius: 16, overflow: 'hidden', padding: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 32px', borderBottom: '1px solid #e5e7eb' }}>
                  <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#2563eb', fontWeight: 700 }}>Configure: {appData.menu[configItemIndex].name}</h2>
                  <button onClick={() => { setShowConfigModal(false); setConfigItemIndex(null); }} style={{ background: 'none', border: 'none', fontSize: '1.5rem', color: '#4b5563', cursor: 'pointer', padding: 0 }}>&times;</button>
                </div>
                <div className="modal-body" style={{ overflowY: 'auto', padding: '32px' }}>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '32px' }}>
                    
                    {/* Column 1: Tax */}
                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                         <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#111827' }}>Tax Setup</h4>
                         <button style={{ padding: '6px 12px', fontSize: '0.8rem', background: '#fff', border: '1px solid #d1d5db', borderRadius: 16, color: '#374151', fontWeight: 500, cursor: 'pointer' }} onClick={() => setTaxes([...taxes, { name: '', rate: '' }])}>+ Add Tax</button>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: 16 }}>Define multiple tax rates.</p>
                      
                      <div style={{ padding: 16, borderRadius: 12, border: '1px solid #e5e7eb', background: '#fafafa', display: 'flex', flexDirection: 'column', gap: 12, maxHeight: '50vh', overflowY: 'auto' }}>
                        {taxes.map((t, i) => (
                          <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                            <input type="text" placeholder="Name (e.g. CGST)" value={t.name} onChange={(e) => {
                              const newTaxes = [...taxes];
                              newTaxes[i].name = e.target.value;
                              setTaxes(newTaxes);
                            }} style={{ flex: 2, padding: '12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: '0.95rem' }} />
                            <input type="number" placeholder="Rate (%)" value={t.rate} onChange={(e) => {
                              const newTaxes = [...taxes];
                              newTaxes[i].rate = e.target.value;
                              setTaxes(newTaxes);
                            }} style={{ flex: 1, padding: '12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: '0.95rem' }} />
                            <button onClick={() => setTaxes(taxes.filter((_, idx) => idx !== i))} style={{ background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: 6, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '1.2rem', padding: 0, flexShrink: 0 }}>&times;</button>
                          </div>
                        ))}
                        {taxes.length === 0 && <p style={{ fontSize: '0.9rem', color: '#9ca3af', margin: 0 }}>No taxes added.</p>}
                      </div>
                    </div>

                    {/* Column 2: Ingredients */}
                    <div className="form-group">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                         <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#111827' }}>Recipe / Ingredients</h4>
                         <button style={{ padding: '6px 12px', fontSize: '0.8rem', background: '#fff', border: '1px solid #d1d5db', borderRadius: 16, color: '#374151', fontWeight: 500, cursor: 'pointer' }} onClick={() => setIngredients([...ingredients, { name: '', quantity: '', unit: 'pcs' }])}>+ Add Ingredient</button>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: 16 }}>Link raw materials. If a material doesn't exist, it will be auto-created in Inventory.</p>
                      
                      <datalist id="inventory-items">
                        {currentBranchData.inventory.map((inv: any, idx: number) => (
                          <option key={idx} value={inv.item || inv.name} />
                        ))}
                      </datalist>

                      <div style={{ padding: 16, borderRadius: 12, border: '1px solid #e5e7eb', background: '#fafafa', display: 'flex', flexDirection: 'column', gap: 12, maxHeight: '50vh', overflowY: 'auto' }}>
                        {ingredients.map((ing, i) => (
                          <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                            <input type="text" list="inventory-items" placeholder="Ingredient Name" value={ing.name} onChange={(e) => {
                              const newIng = [...ingredients];
                              newIng[i].name = e.target.value;
                              setIngredients(newIng);
                            }} style={{ flex: 2, padding: '12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: '0.95rem' }} />
                            <input type="number" placeholder="Qty" value={ing.quantity} onChange={(e) => {
                              const newIng = [...ingredients];
                              newIng[i].quantity = e.target.value;
                              setIngredients(newIng);
                            }} style={{ flex: 1, padding: '12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: '0.95rem' }} />
                            <select value={ing.unit} onChange={(e) => {
                              const newIng = [...ingredients];
                              newIng[i].unit = e.target.value;
                              setIngredients(newIng);
                            }} style={{ flex: 1, padding: '12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: '0.95rem', background: '#fff' }}>
                              <option value="pcs">pcs</option>
                              <option value="kg">kg</option>
                              <option value="g">g</option>
                              <option value="L">L</option>
                              <option value="ml">ml</option>
                            </select>
                            <button onClick={() => setIngredients(ingredients.filter((_, idx) => idx !== i))} style={{ background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: 6, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '1.2rem', padding: 0, flexShrink: 0 }}>&times;</button>
                          </div>
                        ))}
                        {ingredients.length === 0 && <p style={{ fontSize: '0.9rem', color: '#9ca3af', margin: 0 }}>No ingredients added.</p>}
                      </div>
                    </div>

                    {/* Column 3: Add-ons */}
                    <div className="form-group">
                      <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#111827', marginBottom: 8 }}>Allowed Add-ons</h4>
                      <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: 16 }}>Select which add-ons can be ordered with this item.</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: '50vh', overflowY: 'auto', paddingRight: 8 }}>
                        {currentBranchData.addons.length === 0 ? (
                           <span style={{ fontSize: '0.85rem', color: '#9ca3af' }}>No add-ons available. Create some in the Add-ons tab first!</span>
                        ) : currentBranchData.addons.map((addon: any) => {
                           const currentAddonIds = newItem.addonIds ? newItem.addonIds.split(',') : [];
                           const isSelected = currentAddonIds.includes(addon.id.toString());
                           return (
                             <label key={addon.id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', padding: '12px 16px', borderRadius: 8, border: `1px solid ${isSelected ? '#2563eb' : '#e5e7eb'}`, cursor: 'pointer', boxShadow: isSelected ? '0 0 0 1px #2563eb' : 'none', transition: 'all 0.2s' }}>
                               <input type="checkbox" checked={isSelected} onChange={(e) => {
                                 let newIds = [...currentAddonIds];
                                 if (e.target.checked) newIds.push(addon.id.toString());
                                 else newIds = newIds.filter(id => id !== addon.id.toString());
                                 setNewItem({...newItem, addonIds: newIds.join(',')});
                               }} style={{ width: 16, height: 16, cursor: 'pointer' }} />
                               <div style={{ flex: 1 }}>
                                 <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#374151' }}>{addon.name}</span>
                                 {addon.description && <p style={{ margin: 0, fontSize: '0.75rem', color: '#9ca3af' }}>{addon.description}</p>}
                               </div>
                               <span style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 500 }}>₹{parseFloat(addon.price).toFixed(2)}</span>
                             </label>
                           );
                        })}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 16, marginTop: 40 }}>
                    <button style={{ flex: 1, padding: '14px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', color: '#111827', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }} onClick={() => { setShowConfigModal(false); setConfigItemIndex(null); }}>Cancel</button>
                    <button style={{ flex: 1, padding: '14px', borderRadius: 8, border: 'none', background: '#2563eb', color: '#fff', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }} onClick={() => {
                      const newAppData = {...appData};
                      const validIngredients = ingredients.filter(i => i.name && i.quantity);
                      const validTaxes = taxes.filter(t => t.name && t.rate);
                      
                      newAppData.menu[configItemIndex].tax = newItem.tax;
                      newAppData.menu[configItemIndex].taxName = newItem.taxName;
                      newAppData.menu[configItemIndex].ingredients = validIngredients;
                      newAppData.menu[configItemIndex].taxes = validTaxes;
                      
                      const existingItem = newAppData.menu[configItemIndex];
                      if (existingItem && existingItem.id) {
                        fetch(`http://localhost:3000/menu/${existingItem.id}`, {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({...existingItem, addonIds: newItem.addonIds, taxes: validTaxes})
                        }).then(() => fetchBackendData());
                      }
                      
                      setAppData(newAppData);
                      setShowConfigModal(false);
                      setConfigItemIndex(null);
                    }}>Save Configuration</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Add Category Modal */}
          {showAddCategoryModal && (
            <div className="modal-overlay">
              <div className="modal-content" style={{ width: 450 }}>
                <div className="modal-header">
                  <h2>{editingCategoryName ? 'Edit Category' : 'Add New Category'}</h2>
                  <button className="close-btn" onClick={() => { setShowAddCategoryModal(false); setEditingCategoryName(null); setNewCategory({ name: '', description: '', displayOrder: '', status: 'Active' }); }}>&times;</button>
                </div>
                <div className="modal-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #e2e8f0' }}>
                    <div>
                      <span style={{ fontWeight: 600, fontSize: '1.05rem', color: '#1e293b' }}>Category Status</span>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Toggle to make this category {newCategory?.status === 'Active' ? 'inactive' : 'active'}</p>
                    </div>
                    <label style={{ position: 'relative', display: 'inline-block', width: 50, height: 28 }}>
                      <input 
                        type="checkbox" 
                        checked={newCategory?.status === 'Active'} 
                        onChange={(e) => setNewCategory({ ...newCategory, status: e.target.checked ? 'Active' : 'Inactive' })} 
                        style={{ opacity: 0, width: 0, height: 0 }}
                      />
                      <span 
                        style={{
                          position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                          backgroundColor: newCategory?.status === 'Active' ? '#34d399' : '#cbd5e1',
                          transition: '0.4s', borderRadius: 34
                        }}
                      >
                        <span style={{
                          position: 'absolute', height: 20, width: 20, left: 4, bottom: 4,
                          backgroundColor: 'white', transition: '0.4s', borderRadius: '50%',
                          transform: newCategory?.status === 'Active' ? 'translateX(22px)' : 'translateX(0px)'
                        }}></span>
                      </span>
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

                  <div style={{ display: 'flex', gap: 16, marginTop: 32 }}>
                    <button className="btn btn-prev" style={{ flex: 1 }} onClick={() => { setShowAddCategoryModal(false); setEditingCategoryName(null); setNewCategory({ name: '', description: '', displayOrder: '', status: 'Active' }); }}>Cancel</button>
                    <button className="btn btn-next" style={{ flex: 1 }} onClick={() => {
                      if (!newCategory.name) return;
                      const newAppData = { ...appData };
                      
                      const parsedOrder = newCategory.displayOrder ? parseInt(newCategory.displayOrder) : 999;
                      const catObj = { ...newCategory, displayOrder: parsedOrder };

                      if (editingCategoryName) {
                        const existingCat = newAppData.categories.find((c:any) => c.name === editingCategoryName);
                        if (existingCat && existingCat.id) {
                           fetch(`http://localhost:3000/category/${existingCat.id}`, {
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
                    }}>{editingCategoryName ? 'Update Category' : 'Save Category'}</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Update Stock Modal */}
          {showUpdateStockModal && editingInventoryIndex !== null && (
            <div className="modal-overlay">
              <div className="modal-content" style={{ width: 400 }}>
                <div className="modal-header">
                  <h2>Update Stock: {currentBranchData.inventory[editingInventoryIndex].item}</h2>
                  <button className="close-btn" onClick={() => setShowUpdateStockModal(false)}>&times;</button>
                </div>
                <div className="modal-body">
                  <div className="form-group">
                    <label>Current Stock ({currentBranchData.inventory[editingInventoryIndex].unit})</label>
                    <input type="number" value={inventoryUpdateData.stock} onChange={(e) => setInventoryUpdateData({...inventoryUpdateData, stock: e.target.value})} />
                  </div>
                  <div className="form-group" style={{ marginTop: 16 }}>
                    <label>Alert Threshold ({currentBranchData.inventory[editingInventoryIndex].unit})</label>
                    <input type="number" value={inventoryUpdateData.threshold} onChange={(e) => setInventoryUpdateData({...inventoryUpdateData, threshold: e.target.value})} />
                  </div>
                  <div style={{ display: 'flex', gap: 16, marginTop: 32 }}>
                    <button className="btn btn-prev" style={{ flex: 1 }} onClick={() => setShowUpdateStockModal(false)}>Cancel</button>
                    <button className="btn btn-next" style={{ flex: 1 }} onClick={() => {
                      const stockVal = parseFloat(inventoryUpdateData.stock) || 0;
                      const threshVal = parseFloat(inventoryUpdateData.threshold) || 0;
                      let status = 'Good';
                      if (stockVal <= 0) status = 'Out of Stock';
                      else if (stockVal <= threshVal) status = 'Low Stock';
                      
                      const newAppData = {...appData};
                      const item = newAppData.inventory[editingInventoryIndex];
                      
                      if (item.id) {
                        fetch(`http://localhost:3000/inventory/${item.id}`, {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ stock: stockVal, threshold: threshVal })
                        }).then(() => fetchBackendData());
                      } else {
                        // Fallback for hardcoded items without IDs
                        item.stock = stockVal;
                        item.threshold = threshVal;
                        item.status = status;
                        setAppData(newAppData);
                      }
                      
                      setShowUpdateStockModal(false);
                    }}>Save Stock</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* History Modal */}
          {showHistoryModal && historyItemIndex !== null && (
            <div className="modal-overlay">
              <div className="modal-content" style={{ width: 500 }}>
                <div className="modal-header">
                  <h2>Stock History: {currentBranchData.inventory[historyItemIndex].item}</h2>
                  <button className="close-btn" onClick={() => setShowHistoryModal(false)}>&times;</button>
                </div>
                <div className="modal-body" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {!currentBranchData.inventory[historyItemIndex].history || currentBranchData.inventory[historyItemIndex].history.length === 0 ? (
                     <p style={{ color: 'var(--text-muted)' }}>No history available for this item.</p>
                  ) : (
                    <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)' }}>
                          <th style={{ padding: 12 }}>Date</th>
                          <th style={{ padding: 12 }}>Change</th>
                          <th style={{ padding: 12 }}>Type</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentBranchData.inventory[historyItemIndex].history.map((hist: any, i: number) => (
                           <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                             <td style={{ padding: 12 }}>{hist.date}</td>
                             <td style={{ padding: 12, color: hist.change.startsWith('+') ? 'var(--success)' : 'var(--primary-color)' }}>{hist.change} {currentBranchData.inventory[historyItemIndex].unit}</td>
                             <td style={{ padding: 12 }}>{hist.type}</td>
                           </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    );
  }

  if (view === 'pos') {
    const { subtotal, tax, total } = getCartTotals();
    const currentDateStr = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

    return (
      <div className="pos-layout" style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>
        
        {posMode === 'table' && (
          <aside className="pos-tables-sidebar">
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#1e293b' }}>Tables</h3>
              <button className="btn-primary" style={{ padding: '4px 10px', fontSize: '0.85rem' }} onClick={() => setShowAddTableModal(true)}>+ Add</button>
            </div>
            <div className="pos-tables-list" style={{ padding: '0 16px' }}>
              {(() => {
                const tablesByArea: Record<string, any[]> = {};
                const unassignedTables: any[] = [];
                currentBranchData.tables.forEach((t: any) => {
                  if (t.areaId) {
                    if (!tablesByArea[t.areaId]) tablesByArea[t.areaId] = [];
                    tablesByArea[t.areaId].push(t);
                  } else {
                    unassignedTables.push(t);
                  }
                });

                const renderTableList = (tables: any[]) => tables.map((t: any) => {
                  const orderData = tableOrders[t.id];
                  const hasOrder = orderData && (orderData.activeCart.length > 0 || orderData.savedOrders.length > 0);
                  const isSelected = selectedTableId === t.id;
                  return (
                    <div 
                      key={t.id} 
                      onClick={() => {
                        setSelectedTableId(t.id);
                        setCart(orderData?.activeCart || []);
                      }}
                      style={{ 
                        padding: '16px', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12,
                        background: isSelected ? '#eff6ff' : (hasOrder ? '#fff7ed' : '#ffffff'), 
                        border: `2px solid ${isSelected ? '#3b82f6' : (hasOrder ? '#f97316' : '#e2e8f0')}`,
                        cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: '1.6rem' }}>{hasOrder ? '🍽️' : '🛋️'}</span>
                        <span style={{ fontWeight: 600, fontSize: '1.1rem', color: isSelected ? '#1d4ed8' : (hasOrder ? '#c2410c' : '#475569') }}>{t.name}</span>
                      </div>
                      {hasOrder && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                          <span style={{ fontSize: '0.65rem', background: tablePrinted[t.id] ? '#10b981' : '#f97316', color: '#fff', padding: '2px 6px', borderRadius: 12, fontWeight: 700, textTransform: 'uppercase' }}>
                            {tablePrinted[t.id] ? 'Bill Printed' : 'In Use'}
                          </span>
                          {tableStartTimes[t.id] && (
                            <span style={{ fontSize: '0.8rem', color: '#f97316', fontWeight: 700, fontFamily: 'monospace' }}>
                              {(() => {
                                const diffSecs = Math.max(0, Math.floor((now - tableStartTimes[t.id]) / 1000));
                                const m = Math.floor(diffSecs / 60).toString().padStart(2, '0');
                                const s = (diffSecs % 60).toString().padStart(2, '0');
                                return `${m}:${s}`;
                              })()}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                });

                return (
                  <>
                    {currentBranchData.areas?.map((area: any) => {
                      const areaTables = tablesByArea[area.id] || [];
                      if (areaTables.length === 0) return null;
                      return (
                        <div key={area.id} style={{ marginBottom: 24 }}>
                          <h4 style={{ margin: '0 0 12px 4px', fontSize: '1.1rem', color: '#b91c1c' }}>{area.name}</h4>
                          {renderTableList(areaTables)}
                        </div>
                      );
                    })}
                    {unassignedTables.length > 0 && (
                      <div style={{ marginBottom: 24 }}>
                        <h4 style={{ margin: '0 0 12px 4px', fontSize: '1.1rem', color: '#b91c1c' }}>Unassigned</h4>
                        {renderTableList(unassignedTables)}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </aside>
        )}

        <div className="pos-main-wrapper" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <header className="pos-header">
            <h2>
              {posMode === 'table' 
                ? (selectedTableId ? `Table: ${currentBranchData.tables.find((t:any)=>t.id === selectedTableId)?.name}` : 'Table Point of Sale (Select a table)') 
                : 'QSR Point of Sale'}
            </h2>
            <div className="pos-header-actions">
              <span>{currentDateStr}</span>
              
              <button className="btn-outline" onClick={() => setView('dashboard')}>Back to Admin</button>
            </div>
          </header>
          
          {posMode === 'table' && !selectedTableId ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: '#94a3b8' }}>
              <span style={{ fontSize: '4rem', marginBottom: 16 }}>🍽️</span>
              <h2 style={{ color: '#475569' }}>No Table Selected</h2>
              <p>Please select a table from the left sidebar to start taking orders.</p>
            </div>
          ) : (
            <>
              <div className="pos-categories-bar">
                {['All Items', ...currentBranchData.categories.map((c:any) => typeof c === 'string' ? c : c.name)].map((cat: string, i: number) => (
                  <div key={i} className={`pos-category ${posCategory === cat ? 'active' : ''}`} onClick={() => setPosCategory(cat)}>
                    {cat}
                  </div>
                ))}
              </div>

              <main className="pos-main" style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                <div style={{ padding: '16px 24px', background: '#ffffff', borderBottom: '1px solid var(--border-color)' }}>
               <input 
                 type="text" 
                 placeholder="🔍 Search items..." 
                 value={posSearchQuery} 
                 onChange={(e) => setPosSearchQuery(e.target.value)} 
                 style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '1rem', background: '#f8fafc' }} 
               />
            </div>
            
            <div className="pos-items-grid">
              {currentBranchData.menu.filter((m: any) => 
                 !m.isAddon &&
                 m.available !== false && m.status === 'Active' && 
                 (posCategory === 'All Items' || m.category === posCategory) && 
                 m.name.toLowerCase().includes(posSearchQuery.toLowerCase())
              ).map((item: any, i: number) => {
                  const cartItem = cart.find(c => c.name === item.name);
                  const qty = cartItem ? cartItem.quantity : 0;
                  
                  let isLowStock = false;
                  const availableStock = (() => {
                    if (!item.ingredients || item.ingredients.length === 0) return '∞';
                    let minPortions = Infinity;
                    for (const ing of item.ingredients) {
                      const invItem = currentBranchData.inventory.find((inv: any) => inv.item === ing.name);
                      if (!invItem) return 0;
                      const reqQty = parseFloat(ing.quantity);
                      if (reqQty <= 0) continue;
                      const portions = Math.floor(invItem.stock / reqQty);
                      if (portions < minPortions) minPortions = portions;
                    }
                    if (minPortions !== Infinity && minPortions <= 5) isLowStock = true;
                    return minPortions === Infinity ? '∞' : minPortions;
                  })();

                  const displayStock = (typeof availableStock === 'number' && availableStock < 0) ? 0 : availableStock;

                  return (
                    <div key={i} className="pos-item-card" onClick={() => {
                      if (qty === 0) {
                        if (typeof displayStock === 'number' && displayStock <= 0) {
                          alert(`Warning: ${item.name} is currently out of stock!`);
                        }
                        handleAddToCart(item);
                      }
                    }} style={{ position: 'relative', border: isLowStock ? '1px solid #fca5a5' : '', background: isLowStock ? '#fef2f2' : '' }}>
                      <div style={{ position: 'absolute', top: 12, right: 12, fontSize: '0.8rem', color: isLowStock ? '#ef4444' : 'var(--text-muted)', fontWeight: isLowStock ? 600 : 400 }}>Stock: {displayStock}</div>
                      <div className="pos-item-name" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, paddingRight: 60 }}>
                        <div style={{
                          width: 12, height: 12, border: `1px solid ${item.type === 'Non-Veg' ? '#ef4444' : item.type === 'Egg' ? '#eab308' : '#22c55e'}`, 
                          display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 2, flexShrink: 0
                        }}>
                          <div style={{
                            width: 6, height: 6, borderRadius: '50%', background: item.type === 'Non-Veg' ? '#ef4444' : item.type === 'Egg' ? '#eab308' : '#22c55e'
                          }}></div>
                        </div>
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                        <div className="pos-item-price">₹{parseFloat(item.price.toString().replace('₹', '')).toFixed(2)}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} onClick={(e) => e.stopPropagation()}>
                          <button className="cart-qty-btn" onClick={() => updateCartQty(item, -1)} style={{ width: 28, height: 28, padding: 0, borderRadius: 2, background: '#f8fafc', border: '1px solid var(--border-color)', color: '#334155' }}>-</button>
                          <input 
                            type="number" 
                            min="0"
                            value={qty === 0 ? '' : qty} 
                            placeholder="0"
                            onChange={(e) => {
                              let val = parseInt(e.target.value);
                              if (val > qty && typeof displayStock === 'number' && displayStock <= 0) {
                                alert(`Warning: ${item.name} is currently out of stock!`);
                              }
                              if (!isNaN(val)) updateCartQtyExact(item, val);
                              else if (e.target.value === '') updateCartQtyExact(item, 0);
                            }}
                            style={{ width: 40, height: 28, textAlign: 'center', border: '1px solid var(--border-color)', borderRadius: 2, padding: '0 2px', fontWeight: 600 }}
                          />
                          <button className="cart-qty-btn" onClick={() => {
                            if (typeof displayStock === 'number' && displayStock <= 0) {
                              alert(`Warning: ${item.name} is currently out of stock!`);
                            }
                            updateCartQty(item, 1);
                          }} style={{ width: 28, height: 28, padding: 0, borderRadius: 2, background: '#f8fafc', border: '1px solid var(--border-color)', color: '#334155' }}>+</button>
                        </div>
                      </div>
                    </div>
                  );
              })}
            </div>
              </main>
            </>
          )}
        </div>

        {showShiftTableModal && posMode === 'table' && selectedTableId && (
          <div className="modal-overlay" style={{ zIndex: 100 }}>
            <div className="modal-content" style={{ maxWidth: 400 }}>
              <h2>Shift Table</h2>
              <p>Select an empty table to shift the current order to:</p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 16 }}>
                {currentBranchData.tables.filter((t:any) => t.id !== selectedTableId && (!tableOrders[t.id] || (tableOrders[t.id].activeCart.length === 0 && tableOrders[t.id].savedOrders.length === 0))).map((t: any) => (
                  <button key={t.id} className="btn-outline" onClick={() => {
                    setTableOrders(prev => {
                      const newOrders = { ...prev };
                      newOrders[t.id] = newOrders[selectedTableId];
                      delete newOrders[selectedTableId];
                      return newOrders;
                    });
                    setTableStartTimes(prev => {
                      const newTimes = { ...prev };
                      if (newTimes[selectedTableId]) {
                        newTimes[t.id] = newTimes[selectedTableId];
                        delete newTimes[selectedTableId];
                      }
                      return newTimes;
                    });
                    setSelectedTableId(t.id);
                    setShowShiftTableModal(false);
                  }}>{t.name}</button>
                ))}
              </div>
              <div className="modal-actions" style={{ marginTop: 24 }}>
                <button className="btn-outline" onClick={() => setShowShiftTableModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {showAddTableModal && (
          <div className="modal-overlay" style={{ zIndex: 100 }}>
            <div className="modal-content" style={{ maxWidth: 400 }}>
              <h2>Add Custom Table</h2>
              <div className="form-group">
                <label>Table Name (e.g. VIP-1)</label>
                <input type="text" value={newTableName} onChange={e => setNewTableName(e.target.value)} placeholder="Enter table name" />
              </div>
              <div className="modal-actions">
                <button className="btn-outline" onClick={() => setShowAddTableModal(false)}>Cancel</button>
                <button className="btn-primary" onClick={() => {
                  if (!newTableName.trim()) return;
                  const newId = `T${Date.now()}`;
                  setAppData((prev: any) => ({
                     ...prev,
                     tables: [...prev.tables, { id: newId, name: newTableName.trim() }]
                  }));
                  setNewTableName('');
                  setShowAddTableModal(false);
                }}>Add Table</button>
              </div>
            </div>
          </div>
        )}

        <aside className="pos-cart">
          <div className="pos-cart-top" style={{ justifyContent: 'space-between' }}>
            <div>
              {posMode === 'table' && selectedTableId && (
                <button className="btn-outline" style={{ padding: '6px 12px', fontSize: '0.9rem' }} onClick={() => setShowShiftTableModal(true)}>Shift Table</button>
              )}
            </div>
            <div>
              <button className="clear-cart-btn" onClick={() => {
                 setCart([]);
                 if (posMode === 'table' && selectedTableId) {
                    setTableOrders(t => { const nt = {...t}; delete nt[selectedTableId]; return nt; });
                    setTableStartTimes(t => { const nt = {...t}; delete nt[selectedTableId]; return nt; });
                    setTablePrinted(t => { const nt = {...t}; delete nt[selectedTableId]; return nt; });
                 }
              }}>Clear</button>
            </div>
          </div>

          <div className="pos-cart-items">
            {posMode === 'table' && selectedTableId && tableOrders[selectedTableId]?.savedOrders.map((order, orderIdx) => (
              <div key={orderIdx} style={{ marginBottom: 16 }}>
                <div style={{ padding: '8px 12px', background: '#f1f5f9', borderRadius: 6, fontWeight: 600, fontSize: '0.85rem', color: '#475569', marginBottom: 8 }}>
                  Order {orderIdx + 1}
                </div>
                {order.map((item:any, i:number) => (
                  <div key={i} className="cart-item" style={{ opacity: 0.85, paddingBottom: 12, marginBottom: 12 }}>
                    <div className="cart-item-info">
                      <div className="cart-item-name">{item.name}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 24 }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-muted)' }}>x{item.quantity}</div>
                      <div style={{ fontWeight: 600, width: 80, textAlign: 'right' }}>₹{(parseFloat(item.price.replace('₹', '')) * item.quantity).toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>
            ))}

            {cart.length === 0 && !(posMode === 'table' && selectedTableId && tableOrders[selectedTableId]?.savedOrders.length > 0) ? (
              <div style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: 80, fontSize: '1.1rem' }}>Cart is empty. Select items to add.</div>
            ) : cart.length > 0 ? (
              <div>
                {posMode === 'table' && selectedTableId && <div style={{ padding: '8px 12px', background: '#eff6ff', borderRadius: 6, fontWeight: 600, fontSize: '0.85rem', color: '#1d4ed8', marginBottom: 8 }}>Current Order</div>}
                {cart.map((item, i) => (
                <div key={i} className="cart-item">
                  <div className="cart-item-info">
                    <div className="cart-item-name">{item.name}</div>
                  </div>
                  <div className="cart-qty-controls">
                    <button className="qty-btn" onClick={() => updateCartQty(item.name, -1)}>-</button>
                    <input 
                      type="number" 
                      min="0"
                      value={item.quantity === 0 ? '' : item.quantity} 
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val)) updateCartQtyExact(item.name, val);
                        else if (e.target.value === '') updateCartQtyExact(item.name, 0);
                      }}
                      style={{ width: 45, textAlign: 'center', border: '1px solid var(--border-color)', borderRadius: 4, padding: '4px', margin: '0 8px', fontWeight: 600 }}
                    />
                    <button className="qty-btn" onClick={() => updateCartQty(item.name, 1)}>+</button>
                  </div>
                  <div style={{ width: 80, textAlign: 'right', marginLeft: 16, fontWeight: 600 }}>₹{(parseFloat(item.price.replace('₹', '')) * item.quantity).toFixed(2)}</div>
                  <button onClick={() => cancelCartItem(item.name)} style={{ marginLeft: 12, background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.2rem' }}>🗑️</button>
                </div>
              ))}
                {posMode === 'table' && selectedTableId && cart.length > 0 && (
                  <button className="btn-primary" style={{ width: '100%', padding: '10px', fontSize: '0.95rem', fontWeight: 600, borderRadius: '6px', marginTop: '16px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', cursor: 'pointer' }} onClick={saveTableOrder}>
                    Save Order
                  </button>
                )}
              </div>
            ) : null}
          </div>

          <div className="pos-cart-footer">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Tax</span>
              <span>₹{tax.toFixed(2)}</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
            <button className="btn-pay" disabled={total === 0} onClick={() => setShowCheckoutModal(true)}>
              Pay ₹{total.toFixed(2)}
            </button>
          </div>
        </aside>


        {/* Checkout Modal */}
        {showCheckoutModal && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ width: 900, maxWidth: '95vw', padding: 0, overflow: 'hidden' }}>
              <div className="modal-header" style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', background: '#f8fafc' }}>
                <h2 style={{ margin: 0 }}>Confirm Payment</h2>
                <button className="close-btn" onClick={() => setShowCheckoutModal(false)}>&times;</button>
              </div>
              <div className="modal-body" style={{ display: 'flex', flexWrap: 'wrap', padding: 0 }}>
                 
                 {/* Left Side: Order Summary */}
                 <div style={{ flex: '1 1 350px', padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}>
                   <h3 style={{ marginTop: 0, marginBottom: 16 }}>Order Summary</h3>
                   {posMode === 'table' && selectedTableId && tableOrders[selectedTableId]?.savedOrders.map((order, orderIdx) => (
                     <div key={`saved-${orderIdx}`} style={{ marginBottom: 16 }}>
                       <div style={{ padding: '8px 12px', background: '#f1f5f9', borderRadius: 6, fontWeight: 600, fontSize: '0.85rem', color: '#475569', marginBottom: 8 }}>
                         Order {orderIdx + 1}
                       </div>
                       {order.map((item:any, i:number) => (
                         <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, paddingBottom: 12, borderBottom: '1px dashed #e2e8f0', opacity: 0.85 }}>
                           <div>
                             <div style={{ fontWeight: 600 }}>{item.name}</div>
                           </div>
                           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 24 }}>
                             <div style={{ fontWeight: 600, color: 'var(--text-muted)' }}>x{item.quantity}</div>
                             <div style={{ fontWeight: 600, width: 80, textAlign: 'right' }}>₹{(parseFloat(item.price.toString().replace('₹', '')) * item.quantity).toFixed(2)}</div>
                           </div>
                         </div>
                       ))}
                     </div>
                   ))}
                   
                   {cart.length > 0 && (
                     <div style={{ marginBottom: 16 }}>
                       {posMode === 'table' && selectedTableId && <div style={{ padding: '8px 12px', background: '#eff6ff', borderRadius: 6, fontWeight: 600, fontSize: '0.85rem', color: '#1d4ed8', marginBottom: 8 }}>Current Order</div>}
                       {cart.map((item, i) => (
                         <div key={`cart-${i}`} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, paddingBottom: 12, borderBottom: '1px dashed #e2e8f0' }}>
                           <div>
                             <div style={{ fontWeight: 600 }}>{item.name}</div>
                           </div>
                           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 24 }}>
                             <div style={{ fontWeight: 600, color: 'var(--text-muted)' }}>x{item.quantity}</div>
                             <div style={{ fontWeight: 600, width: 80, textAlign: 'right' }}>₹{(parseFloat(item.price.toString().replace('₹', '')) * item.quantity).toFixed(2)}</div>
                           </div>
                         </div>
                       ))}
                     </div>
                   )}
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, color: 'var(--text-muted)' }}>
                     <span>Subtotal</span>
                     <span>₹{getCartTotals().subtotal.toFixed(2)}</span>
                   </div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, color: 'var(--text-muted)' }}>
                     <span>Tax</span>
                     <span>₹{getCartTotals().tax.toFixed(2)}</span>
                   </div>
                   
                   <button className="btn-outline" style={{ width: '100%', marginTop: 24, padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#3b82f6', borderColor: '#3b82f6' }} onClick={() => { window.print(); if (posMode === 'table' && selectedTableId) { setTablePrinted(prev => ({ ...prev, [selectedTableId]: true })); } }}>
                     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                     Print Receipt
                   </button>
                 </div>

                 {/* Right Side: Payment Form */}
                 <div style={{ flex: '1 1 400px', padding: '24px', background: '#fff' }}>
                     <div style={{ background: '#f8fafc', padding: '16px', borderRadius: 8, marginBottom: 20 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, color: 'var(--text-muted)' }}>
                          <span>Original Amount:</span>
                          <span>₹{(() => { const { total: baseTotal } = getCartTotals(); return baseTotal.toFixed(2); })()}</span>
                        </div>
                        {parseFloat(discountValue) > 0 && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, color: '#10b981' }}>
                            <span>Offer Applied:</span>
                            <span>- ₹{(() => { 
                               const { total: baseTotal } = getCartTotals();
                               const dVal = parseFloat(discountValue) || 0;
                               if (discountType === 'percent') return (baseTotal * dVal / 100).toFixed(2);
                               return dVal.toFixed(2);
                            })()}</span>
                          </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.4rem', marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border-color)' }}>
                          <span>Total Amount:</span>
                          <span style={{ color: 'var(--primary-color)' }}>
                            ₹{(() => {
                              const { total: baseTotal } = getCartTotals();
                              const dVal = parseFloat(discountValue) || 0;
                              let finalTotal = baseTotal;
                              if (discountType === 'percent') finalTotal = baseTotal - (baseTotal * dVal / 100);
                              else finalTotal = baseTotal - dVal;
                              return Math.max(0, finalTotal).toFixed(2);
                            })()}
                          </span>
                        </div>
                     </div>
                     
                     <div className="form-group" style={{ marginBottom: 20 }}>
                       <label>Offer / Discount</label>
                       <div style={{ display: 'flex', gap: 12 }}>
                         <select value={discountType} onChange={(e: any) => setDiscountType(e.target.value)} style={{ padding: '12px', borderRadius: 8, border: '1px solid var(--border-color)', width: 120 }}>
                           <option value="fixed">Fixed (₹)</option>
                           <option value="percent">Percent (%)</option>
                         </select>
                         <input type="number" placeholder="Amount" value={discountValue} onChange={e => setDiscountValue(e.target.value)} style={{ flex: 1, padding: '12px', borderRadius: 8, border: '1px solid var(--border-color)' }} />
                       </div>
                     </div>

                     <div className="form-group">
                       <label>Payment Method</label>
                       <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
                         {['Cash', 'Card', 'UPI'].map(method => (
                           <label key={method} style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', padding: '12px', border: `1px solid ${paymentType === method ? 'var(--primary-color)' : 'var(--border-color)'}`, borderRadius: 8, background: paymentType === method ? '#eef2ff' : '#fff', flex: '1 1 30%', minWidth: 100 }}>
                             <input type="radio" name="paymentMethod" value={method} checked={paymentType === method} onChange={(e) => setPaymentType(e.target.value)} style={{ accentColor: 'var(--primary-color)' }} />
                             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                               <span style={{ fontSize: '1.2rem', marginBottom: 4 }}>{method === 'Card' ? '💳' : method === 'UPI' ? '📱' : '💵'}</span>
                               <span style={{ fontWeight: paymentType === method ? 600 : 400, fontSize: '0.9rem' }}>{method}</span>
                             </div>
                           </label>
                         ))}
                       </div>
                     </div>
                     <button className="btn btn-next" style={{ width: '100%', marginTop: 24, padding: '16px', fontSize: '1.1rem', background: '#10b981', borderColor: '#10b981' }} onClick={confirmPaymentAndOrder}>
                       Confirm & Pay ₹{(() => {
                          const { total: baseTotal } = getCartTotals();
                          const dVal = parseFloat(discountValue) || 0;
                          let finalTotal = baseTotal;
                          if (discountType === 'percent') finalTotal = baseTotal - (baseTotal * dVal / 100);
                          else finalTotal = baseTotal - dVal;
                          return Math.max(0, finalTotal).toFixed(2);
                       })()}
                     </button>
                 </div>
              </div>
            </div>
          </div>
        )}




        {addonSelectionItem && (
          <div className="modal-overlay" style={{ zIndex: 9999 }}>
            <div className="modal-content" style={{ width: 450, padding: 24, borderRadius: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Select Add-ons</h3>
                <button onClick={() => { setAddonSelectionItem(null); setSelectedAddonIds([]); }} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>&times;</button>
              </div>
              <div style={{ color: 'var(--text-muted)', marginBottom: 20, fontSize: '0.9rem' }}>
                Customize your {addonSelectionItem.name}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24, maxHeight: '50vh', overflowY: 'auto' }}>
                {addonSelectionItem.addonIds.split(',').map((id: string) => {
                  const addon = currentBranchData.menu.find((m: any) => m.id.toString() === id);
                  if (!addon) return null;
                  const isSelected = selectedAddonIds.includes(id);
                  return (
                    <label key={id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: isSelected ? '#eff6ff' : '#f8fafc', border: `1px solid ${isSelected ? '#3b82f6' : '#e2e8f0'}`, padding: '12px 16px', borderRadius: 8, cursor: 'pointer' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <input type="checkbox" checked={isSelected} onChange={(e) => {
                          if (e.target.checked) setSelectedAddonIds([...selectedAddonIds, id]);
                          else setSelectedAddonIds(selectedAddonIds.filter(x => x !== id));
                        }} style={{ cursor: 'pointer' }} />
                        <span style={{ fontWeight: 500, color: isSelected ? '#1d4ed8' : '#334155' }}>{addon.name}</span>
                      </div>
                      <span style={{ color: '#64748b', fontSize: '0.9rem' }}>+ ₹{parseFloat(addon.price.toString().replace('₹', '')).toFixed(2)}</span>
                    </label>
                  );
                })}
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn-prev" style={{ flex: 1, padding: 12, borderRadius: 8, border: '1px solid #cbd5e1', background: '#f1f5f9', cursor: 'pointer' }} onClick={() => { setAddonSelectionItem(null); setSelectedAddonIds([]); }}>Cancel</button>
                <button className="btn-next" style={{ flex: 1, padding: 12, borderRadius: 8, background: '#3b82f6', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }} onClick={() => {
                  let totalAddonPrice = 0;
                  const addonNames: string[] = [];
                  selectedAddonIds.forEach(id => {
                    const addon = currentBranchData.menu.find((m: any) => m.id.toString() === id);
                    if (addon) {
                      totalAddonPrice += parseFloat(addon.price.toString().replace('₹', ''));
                      addonNames.push(addon.name);
                    }
                  });

                  const originalPrice = parseFloat(addonSelectionItem.price.toString().replace('₹', ''));
                  const modifiedItem = {
                    ...addonSelectionItem,
                    name: addonNames.length > 0 ? `${addonSelectionItem.name} (${addonNames.join(', ')})` : addonSelectionItem.name,
                    price: `₹${(originalPrice + totalAddonPrice).toFixed(2)}`
                  };

                  setAddonSelectionItem(null);
                  setSelectedAddonIds([]);
                  handleAddToCart(modifiedItem, true);
                }}>Add to Cart</button>
              </div>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {orderSuccess && (
          <div className="modal-overlay" style={{ zIndex: 9999 }}>
            <div className="modal" style={{ maxWidth: '400px', textAlign: 'center', padding: '40px 24px', animation: 'slideUp 0.4s ease-out' }}>
              <div style={{ fontSize: '4rem', marginBottom: 16 }}>✅</div>
              <h2 style={{ fontSize: '1.75rem', color: 'var(--text-main)', fontWeight: 800, margin: 0 }}>Payment Successful!</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: 12, marginBottom: 0 }}>Order placed & inventory updated.</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (view === 'register') {
    return (
      <div className="auth-container" style={{ width: '600px' }}>
        <div className="auth-header">
          <h2>New Client Registration</h2>
          <p>Configure your local database & admin credentials</p>
        </div>
        
        <form onSubmit={handleRegister}>
          <div className="section-title">1. Local Database Configuration (MySQL)</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label>Host</label>
              <input type="text" name="dbHost" value={registerData.dbHost} onChange={handleRegisterChange} required />
            </div>
            <div className="form-group">
              <label>Port</label>
              <input type="text" name="dbPort" value={registerData.dbPort} onChange={handleRegisterChange} required />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label>Database User</label>
              <input type="text" name="dbUser" value={registerData.dbUser} onChange={handleRegisterChange} required />
            </div>
            <div className="form-group">
              <label>Database Password</label>
              <input type="password" name="dbPassword" value={registerData.dbPassword} onChange={handleRegisterChange} />
            </div>
          </div>
          <div className="form-group">
            <label>Database Name</label>
            <input type="text" name="dbName" value={registerData.dbName} onChange={handleRegisterChange} required />
          </div>

          <div className="section-title">2. Admin Credentials</div>
          <div className="form-group">
            <label>Restaurant Name</label>
            <input type="text" name="restaurantName" placeholder="e.g. Tasty Bites" value={registerData.restaurantName} onChange={handleRegisterChange} required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label>Admin ID / Username</label>
              <input type="text" name="adminId" value={registerData.adminId} onChange={handleRegisterChange} required />
            </div>
            <div className="form-group">
              <label>Admin Password</label>
              <input type="password" name="adminPassword" value={registerData.adminPassword} onChange={handleRegisterChange} required />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
            <button type="submit" className="btn btn-next" style={{ flex: 1, padding: '16px', fontSize: '1.05rem', borderRadius: 8 }}>Initialize Setup & Register</button>
            <a href="/database_schema.sql" download="database_schema.sql" className="btn-outline" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', padding: '16px', borderRadius: 8, fontSize: '1.05rem' }}>
              ⬇️ Download SQL Schema
            </a>
          </div>
        </form>
        
        <span className="auth-link" onClick={() => setView('login')}>← Back to Login</span>
      </div>
    );
  }

  // Default Login View
  return (
    <div className="auth-container" style={{ padding: '48px 40px', background: '#ffffff', borderRadius: 24, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0,0,0,0.05)', border: 'none' }}>
      <div className="auth-header" style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: 16, background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', color: 'white', fontSize: '1.8rem', fontWeight: 800, marginBottom: 24, boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.5)' }}>QSR</div>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: 8, letterSpacing: '-0.03em' }}>Admin Portal</h2>
        <p style={{ color: '#64748b', fontSize: '1.05rem', margin: 0 }}>Enter your credentials to manage your restaurant</p>
      </div>
      
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div className="form-group" style={{ margin: 0 }}>
          <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Admin ID / Username</label>
          <input 
            type="text" 
            name="adminId" 
            placeholder="admin@restaurant.com" 
            value={loginData.adminId} 
            onChange={handleLoginChange}
            required 
            style={{ width: '100%', padding: '16px', borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0', color: '#0f172a', fontSize: '1.05rem', transition: 'all 0.2s', outline: 'none', boxSizing: 'border-box' }}
            onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'; }}
            onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
          />
        </div>
        <div className="form-group" style={{ margin: 0 }}>
          <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Password</label>
          <input 
            type="password" 
            name="password" 
            placeholder="••••••••" 
            value={loginData.password} 
            onChange={handleLoginChange}
            required 
            style={{ width: '100%', padding: '16px', borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0', color: '#0f172a', fontSize: '1.05rem', transition: 'all 0.2s', outline: 'none', boxSizing: 'border-box' }}
            onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'; }}
            onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
          />
        </div>
        
        <button type="submit" className="btn btn-next" style={{ width: '100%', padding: '18px', fontSize: '1.1rem', fontWeight: 700, marginTop: 12, borderRadius: 12, background: '#3b82f6', color: '#fff', border: 'none', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' }}
          onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)'; }}
          onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)'; }}
        >Sign In</button>
      </form>

      <div style={{ textAlign: 'center', marginTop: 40, paddingTop: 24, borderTop: '1px solid #f1f5f9' }}>
        <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>
          New Restaurant Client?
          <span 
            onClick={() => setView('register')} 
            style={{ color: '#3b82f6', fontWeight: 600, cursor: 'pointer', display: 'block', marginTop: 8, transition: 'color 0.2s' }}
            onMouseOver={(e) => e.currentTarget.style.color = '#1d4ed8'}
            onMouseOut={(e) => e.currentTarget.style.color = '#3b82f6'}
          >
            Register & Setup Database &rarr;
          </span>
        </p>
      </div>
    </div>
  );
}

export default App;
