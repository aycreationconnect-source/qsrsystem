import React, { useState } from 'react';
import './index.css';

// Initial mock data removed - will fetch from backend

interface CartItem {
  product: any;
  quantity: number;
}

function App() {
  const [categories, setCategories] = useState<string[]>(['All Items']);
  const [products, setProducts] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState('All Items');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderType, setOrderType] = useState('Dine In');

  React.useEffect(() => {
    const fetchBackendData = async () => {
      try {
        const catRes = await fetch('http://localhost:3000/category');
        const cats = catRes.ok ? await catRes.json() : [];
        
        const menuRes = await fetch('http://localhost:3000/menu');
        const menus = menuRes.ok ? await menuRes.json() : [];

        // filter active categories
        const activeCategories = cats.filter((c: any) => c.status === 'Active').map((c: any) => c.name);
        
        // filter active menu items
        const activeProducts = menus.filter((m: any) => m.isAvailable && m.status === 'Active').map((m: any) => ({
          id: m.id,
          name: m.name,
          price: m.price,
          category: m.category?.name || 'Uncategorized'
        }));
        
        setCategories(['All Items', ...activeCategories]);
        setProducts(activeProducts);
      } catch (e) {
        console.error('Failed to fetch data', e);
      }
    };
    fetchBackendData();
  }, []);

  const filteredProducts = activeCategory === 'All Items' ? products : products.filter(p => p.category === activeCategory);

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        return { ...item, quantity: Math.max(0, item.quantity + delta) };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const tax = subtotal * 0.05; // 5% mock tax
  const total = subtotal + tax;

  return (
    <div className="pos-layout">
      {/* LEFT: Menu Area */}
      <div className="menu-area">
        <header className="header">
          <h1>QSR Point of Sale</h1>
          <div style={{ color: 'var(--text-muted)', fontWeight: 500 }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </div>
        </header>

        <div className="category-tabs">
          {categories.map(cat => (
            <div 
              key={cat} 
              className={`category-tab ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </div>
          ))}
        </div>

        <div className="products-grid">
          {filteredProducts.map(product => (
            <div key={product.id} className="product-card" onClick={() => addToCart(product)}>
              <div className="product-name">{product.name}</div>
              <div className="product-price">₹{product.price.toFixed(2)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT: Cart Area */}
      <div className="cart-area">
        <div className="cart-header">
          <div className="order-type-toggle">
            {['Dine In', 'Take Away'].map(type => (
              <button 
                key={type}
                className={`order-type-btn ${orderType === type ? 'active' : ''}`}
                onClick={() => setOrderType(type)}
              >
                {type}
              </button>
            ))}
          </div>
          <button style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontWeight: 600 }} onClick={() => setCart([])}>
            Clear
          </button>
        </div>

        <div className="cart-items">
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '50px' }}>
              Cart is empty. Select items to add.
            </div>
          ) : (
            cart.map(item => (
              <div key={item.product.id} className="cart-item">
                <div className="item-info">
                  <div className="item-name">{item.product.name}</div>
                  <div className="item-price">₹{item.product.price.toFixed(2)}</div>
                </div>
                <div className="item-actions">
                  <button className="qty-btn" onClick={() => updateQuantity(item.product.id, -1)}>-</button>
                  <span style={{ fontWeight: 600, width: '20px', textAlign: 'center' }}>{item.quantity}</span>
                  <button className="qty-btn" onClick={() => updateQuantity(item.product.id, 1)}>+</button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="cart-footer">
          <div className="totals-row">
            <span>Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="totals-row">
            <span>Tax (5%)</span>
            <span>₹{tax.toFixed(2)}</span>
          </div>
          <div className="grand-total">
            <span>Total</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
          <button className="pay-btn" disabled={cart.length === 0} onClick={async () => {
            const orderDetails = {
              items: cart.map(c => ({
                menuItemId: c.product.id,
                quantity: c.quantity,
                price: c.product.price
              })),
              subtotal,
              tax,
              total,
              paymentMethod: 'Cash'
            };
            try {
              const res = await fetch('http://localhost:3000/order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderDetails)
              });
              if (res.ok) {
                alert(`Payment of ₹${total.toFixed(2)} successful!`);
                setCart([]);
              } else {
                alert("Failed to place order.");
              }
            } catch (e) {
              console.error(e);
              alert("Error placing order.");
            }
          }}>
            Pay ₹{total.toFixed(2)}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
