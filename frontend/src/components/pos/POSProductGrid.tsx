import React from 'react';
import { useApp } from '../../context/AppContext';
import { usePOS } from '../../context/POSContext';
import type { MenuItem } from '../../types/app.types';

export const POSProductGrid: React.FC = () => {
  const { appData } = useApp();
  const {
    posCategory,
    posSearchQuery,
    setPosSearchQuery,
    cart,
    handleAddToCart,
    updateCartQty,
    updateCartQtyExact,
  } = usePOS();

  const categoriesToRender =
    posCategory === 'All Items'
      ? ['Uncategorized', ...appData.categories.map((c: any) => (typeof c === 'string' ? c : c.name))]
      : [posCategory];

  return (
    <main className="pos-main" style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <div style={{ padding: '16px 24px', background: '#ffffff', borderBottom: '1px solid var(--border-color)' }}>
        <input
          type="text"
          placeholder="🔍 Search items..."
          value={posSearchQuery}
          onChange={(e) => setPosSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: 8,
            border: '1px solid #cbd5e1',
            fontSize: '1rem',
            background: '#f8fafc',
          }}
        />
      </div>

      <div style={{ overflowY: 'auto', flex: 1, padding: '24px' }}>
        {categoriesToRender.map((catName: string) => {
          const itemsInCat = appData.menu.filter(
            (m: any) =>
              !m.isAddon &&
              m.available !== false &&
              m.status === 'Active' &&
              m.category === catName &&
              m.name.toLowerCase().includes(posSearchQuery.toLowerCase())
          );

          if (itemsInCat.length === 0) return null;

          return (
            <div key={catName} style={{ marginBottom: 32 }}>
              <h3
                style={{
                  marginBottom: 16,
                  fontSize: '1.2rem',
                  color: '#334155',
                  borderBottom: '2px solid #e2e8f0',
                  paddingBottom: 8,
                }}
              >
                {catName}
              </h3>
              <div className="pos-items-grid" style={{ padding: 0, overflowY: 'visible' }}>
                {itemsInCat.map((item: MenuItem, i: number) => {
                  const qty = cart.filter((c) => c.id === item.id).reduce((sum, c) => sum + c.quantity, 0);

                  let isLowStock = false;
                  const availableStock = (() => {
                    if (!item.ingredients || item.ingredients.length === 0) return '∞';
                    let minPortions = Infinity;
                    for (const ing of item.ingredients) {
                      const invItem = appData.inventory.find(
                        (inv: any) => (inv.item || inv.name) === ing.name
                      );
                      if (!invItem) return 0;
                      const reqQty = parseFloat(String(ing.quantity));
                      if (reqQty <= 0) continue;
                      const portions = Math.floor(invItem.stock / reqQty);
                      if (portions < minPortions) minPortions = portions;
                    }
                    if (minPortions !== Infinity && minPortions <= 5) isLowStock = true;
                    return minPortions === Infinity ? '∞' : minPortions;
                  })();

                  const displayStock =
                    typeof availableStock === 'number' && availableStock < 0 ? 0 : availableStock;

                  return (
                    <div
                      key={item.id || i}
                      className="pos-item-card"
                      onClick={() => {
                        if (qty === 0 || (item.addonIds && item.addonIds.trim() !== '')) {
                          if (typeof displayStock === 'number' && displayStock <= 0) {
                            alert(`Warning: ${item.name} is currently out of stock!`);
                          }
                          handleAddToCart(item);
                        }
                      }}
                      style={{
                        position: 'relative',
                        border: isLowStock ? '1px solid #fca5a5' : '',
                        background: isLowStock ? '#fef2f2' : '',
                      }}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          top: 12,
                          right: 12,
                          fontSize: '0.8rem',
                          color: isLowStock ? '#ef4444' : 'var(--text-muted)',
                          fontWeight: isLowStock ? 600 : 400,
                        }}
                      >
                        Stock: {displayStock}
                      </div>
                      <div
                        className="pos-item-name"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          marginBottom: 4,
                          paddingRight: 60,
                        }}
                      >
                        <div
                          style={{
                            width: 12,
                            height: 12,
                            border: `1px solid ${
                              item.type === 'Non-Veg'
                                ? '#ef4444'
                                : item.type === 'Egg'
                                ? '#eab308'
                                : '#22c55e'
                            }`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 2,
                            flexShrink: 0,
                          }}
                        >
                          <div
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              background:
                                item.type === 'Non-Veg'
                                  ? '#ef4444'
                                  : item.type === 'Egg'
                                  ? '#eab308'
                                  : '#22c55e',
                            }}
                          ></div>
                        </div>
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.name}
                        </span>
                      </div>
                      {item.description && (
                        <div
                          style={{
                            fontSize: '0.75rem',
                            color: '#64748b',
                            marginTop: 4,
                            marginBottom: 4,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            lineHeight: '1.4',
                          }}
                        >
                          {item.description}
                        </div>
                      )}
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginTop: 'auto',
                          paddingTop: 12,
                        }}
                      >
                        <div className="pos-item-price">
                          ₹{parseFloat(item.price.toString().replace('₹', '')).toFixed(2)}
                        </div>
                        <div
                          style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            className="cart-qty-btn"
                            onClick={() => {
                              if (item.addonIds && item.addonIds.trim() !== '') {
                                const firstConfig = cart.find((c) => c.id === item.id);
                                if (firstConfig) updateCartQty(firstConfig.name, -1);
                              } else {
                                updateCartQty(item, -1);
                              }
                            }}
                            style={{
                              width: 28,
                              height: 28,
                              padding: 0,
                              borderRadius: 2,
                              background: '#f8fafc',
                              border: '1px solid var(--border-color)',
                              color: '#334155',
                            }}
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="0"
                            value={qty === 0 ? '' : qty}
                            placeholder="0"
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              if (val > qty && typeof displayStock === 'number' && displayStock <= 0) {
                                alert(`Warning: ${item.name} is currently out of stock!`);
                              }
                              if (!isNaN(val)) {
                                if (item.addonIds && item.addonIds.trim() !== '') {
                                  const firstConfig = cart.find((c) => c.id === item.id);
                                  if (firstConfig) updateCartQtyExact(firstConfig.name, val);
                                } else {
                                  updateCartQtyExact(item, val);
                                }
                              } else if (e.target.value === '') {
                                if (item.addonIds && item.addonIds.trim() !== '') {
                                  const firstConfig = cart.find((c) => c.id === item.id);
                                  if (firstConfig) updateCartQtyExact(firstConfig.name, 0);
                                } else {
                                  updateCartQtyExact(item, 0);
                                }
                              }
                            }}
                            style={{
                              width: 40,
                              height: 28,
                              textAlign: 'center',
                              border: '1px solid var(--border-color)',
                              borderRadius: 2,
                              padding: '0 2px',
                              fontWeight: 600,
                            }}
                          />
                          <button
                            className="cart-qty-btn"
                            onClick={() => {
                              if (typeof displayStock === 'number' && displayStock <= 0) {
                                alert(`Warning: ${item.name} is currently out of stock!`);
                              }
                              if (item.addonIds && item.addonIds.trim() !== '') {
                                handleAddToCart(item);
                              } else {
                                updateCartQty(item, 1);
                              }
                            }}
                            style={{
                              width: 28,
                              height: 28,
                              padding: 0,
                              borderRadius: 2,
                              background: '#f8fafc',
                              border: '1px solid var(--border-color)',
                              color: '#334155',
                            }}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
};
