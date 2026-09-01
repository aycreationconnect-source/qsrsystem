import React from 'react';
import { useApp } from '../../context/AppContext';
import { usePOS } from '../../context/POSContext';

export const CheckoutModal: React.FC = () => {
  const { posMode, appData } = useApp();
  const {
    showCheckoutModal,
    setShowCheckoutModal,
    cart,
    tableOrders,
    selectedTableId,
    setTablePrinted,
    getCartTotals,
    discountType,
    setDiscountType,
    discountValue,
    setDiscountValue,
    paymentType,
    setPaymentType,
    confirmPaymentAndOrder,
  } = usePOS();

  if (!showCheckoutModal) return null;

  const { subtotal, tax, total: baseTotal } = getCartTotals();
  const dVal = parseFloat(discountValue) || 0;
  let finalTotal = baseTotal;
  if (discountType === 'percent') {
    finalTotal = baseTotal - (baseTotal * dVal) / 100;
  } else {
    finalTotal = baseTotal - dVal;
  }
  if (finalTotal < 0) finalTotal = 0;

  return (
    <div className="modal-overlay">
      <div
        className="modal-content"
        style={{ width: 900, maxWidth: '95vw', padding: 0, overflow: 'hidden' }}
      >
        <div
          className="modal-header"
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-color)',
            background: '#f8fafc',
          }}
        >
          <h2 style={{ margin: 0 }}>Confirm Payment</h2>
          <button className="close-btn" onClick={() => setShowCheckoutModal(false)}>
            &times;
          </button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexWrap: 'wrap', padding: 0 }}>
          {/* Left Side: Order Summary */}
          <div style={{ flex: '1 1 350px', padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}>
            <h3 style={{ marginTop: 0, marginBottom: 16 }}>Order Summary</h3>
            {posMode === 'table' &&
              selectedTableId &&
              tableOrders[selectedTableId]?.savedOrders.map((order, orderIdx) => (
                <div key={`saved-${orderIdx}`} style={{ marginBottom: 16 }}>
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
                        {new Date(order.time).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    )}
                  </div>
                  {(order.items || (Array.isArray(order) ? order : [])).map((item: any, i: number) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: 12,
                        paddingBottom: 12,
                        borderBottom: '1px dashed #e2e8f0',
                        opacity: 0.85,
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600 }}>{item.name}</div>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                          gap: 24,
                        }}
                      >
                        <div style={{ fontWeight: 600, color: 'var(--text-muted)' }}>
                          x{item.quantity}
                        </div>
                        <div style={{ fontWeight: 600, width: 80, textAlign: 'right' }}>
                          ₹
                          {(
                            parseFloat(item.price.toString().replace('₹', '')) * item.quantity
                          ).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}

            {cart.length > 0 && (
              <div style={{ marginBottom: 16 }}>
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
                  <div
                    key={`cart-${i}`}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: 12,
                      paddingBottom: 12,
                      borderBottom: '1px dashed #e2e8f0',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600 }}>{item.name}</div>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: 24,
                      }}
                    >
                      <div style={{ fontWeight: 600, color: 'var(--text-muted)' }}>
                        x{item.quantity}
                      </div>
                      <div style={{ fontWeight: 600, width: 80, textAlign: 'right' }}>
                        ₹
                        {(
                          parseFloat(item.price.toString().replace('₹', '')) * item.quantity
                        ).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: 16,
                color: 'var(--text-muted)',
              }}
            >
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: 8,
                color: 'var(--text-muted)',
              }}
            >
              <span>
                Tax {appData.settings?.globalTaxName ? `(${appData.settings.globalTaxName})` : ''}
              </span>
              <span>₹{tax.toFixed(2)}</span>
            </div>

            <button
              className="btn-outline"
              style={{
                width: '100%',
                marginTop: 24,
                padding: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                color: '#3b82f6',
                borderColor: '#3b82f6',
              }}
              onClick={() => {
                window.print();
                if (posMode === 'table' && selectedTableId) {
                  setTablePrinted((prev) => ({ ...prev, [selectedTableId]: true }));
                }
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 6 2 18 2 18 9"></polyline>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                <rect x="6" y="14" width="12" height="8"></rect>
              </svg>
              Print Receipt
            </button>
          </div>

          {/* Right Side: Payment Form */}
          <div style={{ flex: '1 1 400px', padding: '24px', background: '#fff' }}>
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: 8, marginBottom: 20 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 8,
                  color: 'var(--text-muted)',
                }}
              >
                <span>Original Amount:</span>
                <span>₹{baseTotal.toFixed(2)}</span>
              </div>
              {parseFloat(discountValue) > 0 && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 8,
                    color: '#10b981',
                  }}
                >
                  <span>Offer Applied:</span>
                  <span>
                    - ₹
                    {discountType === 'percent'
                      ? ((baseTotal * dVal) / 100).toFixed(2)
                      : dVal.toFixed(2)}
                  </span>
                </div>
              )}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontWeight: 700,
                  fontSize: '1.4rem',
                  marginTop: 12,
                  paddingTop: 12,
                  borderTop: '1px solid var(--border-color)',
                }}
              >
                <span>Total Amount:</span>
                <span style={{ color: 'var(--primary-color)' }}>₹{finalTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 20 }}>
              <label>Offer / Discount</label>
              <div style={{ display: 'flex', gap: 12 }}>
                <select
                  value={discountType}
                  onChange={(e: any) => setDiscountType(e.target.value)}
                  style={{
                    padding: '12px',
                    borderRadius: 8,
                    border: '1px solid var(--border-color)',
                    width: 120,
                  }}
                >
                  <option value="fixed">Fixed (₹)</option>
                  <option value="percent">Percent (%)</option>
                </select>
                <input
                  type="number"
                  placeholder="Amount"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: 8,
                    border: '1px solid var(--border-color)',
                  }}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Payment Method</label>
              <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
                {['Cash', 'Card', 'UPI'].map((method) => (
                  <label
                    key={method}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      cursor: 'pointer',
                      padding: '12px',
                      border: `1px solid ${
                        paymentType === method ? 'var(--primary-color)' : 'var(--border-color)'
                      }`,
                      borderRadius: 8,
                      background: paymentType === method ? '#eef2ff' : '#fff',
                      flex: '1 1 30%',
                      minWidth: 100,
                    }}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method}
                      checked={paymentType === method}
                      onChange={(e) => setPaymentType(e.target.value)}
                      style={{ accentColor: 'var(--primary-color)' }}
                    />
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        width: '100%',
                      }}
                    >
                      <span style={{ fontSize: '1.2rem', marginBottom: 4 }}>
                        {method === 'Card' ? '💳' : method === 'UPI' ? '📱' : '💵'}
                      </span>
                      <span
                        style={{
                          fontWeight: paymentType === method ? 600 : 400,
                          fontSize: '0.9rem',
                        }}
                      >
                        {method}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <button
              className="btn btn-next"
              style={{
                width: '100%',
                marginTop: 24,
                padding: '16px',
                fontSize: '1.1rem',
                background: '#10b981',
                borderColor: '#10b981',
              }}
              onClick={confirmPaymentAndOrder}
            >
              Confirm & Pay ₹{finalTotal.toFixed(2)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
