import React from 'react';
import { useApp } from '../../context/AppContext';
import { usePOS } from '../../context/POSContext';

export const POSCartSidebar: React.FC = () => {
  const { posMode, appData } = useApp();
  const {
    cart,
    setCart,
    tableOrders,
    setTableOrders,
    setTableStartTimes,
    setTablePrinted,
    selectedTableId,
    updateCartQty,
    updateCartQtyExact,
    cancelCartItem,
    saveTableOrder,
    getCartTotals,
    setShowCheckoutModal,
    setShowShiftTableModal,
  } = usePOS();

  const { subtotal, tax, total } = getCartTotals();

  return (
    <aside className="pos-cart">
      <div className="pos-cart-top" style={{ justifyContent: 'space-between' }}>
        <div>
          {posMode === 'table' && selectedTableId && (
            <button
              className="btn-outline"
              style={{ padding: '6px 12px', fontSize: '0.9rem' }}
              onClick={() => setShowShiftTableModal(true)}
            >
              Shift Table
            </button>
          )}
        </div>
        <div>
          <button
            className="clear-cart-btn"
            onClick={() => {
              setCart([]);
              if (posMode === 'table' && selectedTableId) {
                setTableOrders((t) => {
                  const nt = { ...t };
                  delete nt[selectedTableId];
                  return nt;
                });
                setTableStartTimes((t) => {
                  const nt = { ...t };
                  delete nt[selectedTableId];
                  return nt;
                });
                setTablePrinted((t) => {
                  const nt = { ...t };
                  delete nt[selectedTableId];
                  return nt;
                });
              }
            }}
          >
            Clear
          </button>
        </div>
      </div>

      <div className="pos-cart-items">
        {posMode === 'table' &&
          selectedTableId &&
          tableOrders[selectedTableId]?.savedOrders.map((order, orderIdx) => (
            <div key={orderIdx} style={{ marginBottom: 16 }}>
              <div
                style={{
                  padding: '8px 12px',
                  background: '#f1f5f9',
                  borderRadius: 6,
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  color: '#475569',
                  marginBottom: 8,
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span>Order {orderIdx + 1}</span>
                {order.time && (
                  <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 500 }}>
                    {new Date(order.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
              {(order.items || (Array.isArray(order) ? order : [])).map((item: any, i: number) => (
                <div
                  key={i}
                  className="cart-item"
                  style={{ opacity: 0.85, paddingBottom: 12, marginBottom: 12 }}
                >
                  <div className="cart-item-info">
                    <div className="cart-item-name">{item.name}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 24 }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-muted)' }}>x{item.quantity}</div>
                    <div style={{ fontWeight: 600, width: 80, textAlign: 'right' }}>
                      ₹{(parseFloat(String(item.price).replace('₹', '')) * item.quantity).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}

        {cart.length === 0 &&
        !(posMode === 'table' && selectedTableId && tableOrders[selectedTableId]?.savedOrders.length > 0) ? (
          <div
            style={{
              color: 'var(--text-muted)',
              textAlign: 'center',
              marginTop: 80,
              fontSize: '1.1rem',
            }}
          >
            Cart is empty. Select items to add.
          </div>
        ) : cart.length > 0 ? (
          <div>
            {posMode === 'table' && selectedTableId && (
              <div
                style={{
                  padding: '8px 12px',
                  background: '#eff6ff',
                  borderRadius: 6,
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  color: '#1d4ed8',
                  marginBottom: 8,
                }}
              >
                Current Order
              </div>
            )}
            {cart.map((item, i) => (
              <div key={i} className="cart-item">
                <div className="cart-item-info">
                  <div className="cart-item-name">{item.name}</div>
                </div>
                <div className="cart-qty-controls">
                  <button className="qty-btn" onClick={() => updateCartQty(item.name, -1)}>
                    -
                  </button>
                  <input
                    type="number"
                    min="0"
                    value={item.quantity === 0 ? '' : item.quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (!isNaN(val)) updateCartQtyExact(item.name, val);
                      else if (e.target.value === '') updateCartQtyExact(item.name, 0);
                    }}
                    style={{
                      width: 45,
                      textAlign: 'center',
                      border: '1px solid var(--border-color)',
                      borderRadius: 4,
                      padding: '4px',
                      margin: '0 8px',
                      fontWeight: 600,
                    }}
                  />
                  <button className="qty-btn" onClick={() => updateCartQty(item.name, 1)}>
                    +
                  </button>
                </div>
                <div style={{ width: 80, textAlign: 'right', marginLeft: 16, fontWeight: 600 }}>
                  ₹{(parseFloat(String(item.price).replace('₹', '')) * item.quantity).toFixed(2)}
                </div>
                <button
                  onClick={() => cancelCartItem(item.name)}
                  style={{
                    marginLeft: 12,
                    background: 'transparent',
                    border: 'none',
                    color: '#ef4444',
                    cursor: 'pointer',
                    fontSize: '1.2rem',
                  }}
                >
                  🗑️
                </button>
              </div>
            ))}
            {posMode === 'table' && selectedTableId && cart.length > 0 && (
              <button
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  borderRadius: '6px',
                  marginTop: '16px',
                  backgroundColor: '#3b82f6',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                }}
                onClick={saveTableOrder}
              >
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
          <span>
            Tax {appData.settings?.globalTaxName ? `(${appData.settings.globalTaxName})` : ''}
          </span>
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
  );
};
