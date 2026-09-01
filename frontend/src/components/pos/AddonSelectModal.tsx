import React from 'react';
import { useApp } from '../../context/AppContext';
import { usePOS } from '../../context/POSContext';

export const AddonSelectModal: React.FC = () => {
  const { appData } = useApp();
  const {
    addonSelectionItem,
    setAddonSelectionItem,
    selectedAddonIds,
    setSelectedAddonIds,
    handleAddToCart,
  } = usePOS();

  if (!addonSelectionItem) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div className="modal-content" style={{ width: 450, padding: 24, borderRadius: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Select Add-ons</h3>
          <button
            onClick={() => {
              setAddonSelectionItem(null);
              setSelectedAddonIds([]);
            }}
            style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}
          >
            &times;
          </button>
        </div>
        <div style={{ color: 'var(--text-muted)', marginBottom: 20, fontSize: '0.9rem' }}>
          Customize your {addonSelectionItem.name}
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            marginBottom: 24,
            maxHeight: '50vh',
            overflowY: 'auto',
          }}
        >
          {addonSelectionItem.addonIds.split(',').map((id: string) => {
            const addon = appData.addons.find((a: any) => a.id.toString() === id.trim());
            if (!addon) return null;
            const isSelected = selectedAddonIds.includes(id.trim());
            return (
              <label
                key={id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: isSelected ? '#eff6ff' : '#f8fafc',
                  border: `1px solid ${isSelected ? '#3b82f6' : '#e2e8f0'}`,
                  padding: '12px 16px',
                  borderRadius: 8,
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedAddonIds([...selectedAddonIds, id.trim()]);
                      else setSelectedAddonIds(selectedAddonIds.filter((x) => x !== id.trim()));
                    }}
                    style={{ cursor: 'pointer' }}
                  />
                  <span style={{ fontWeight: 500, color: isSelected ? '#1d4ed8' : '#334155' }}>
                    {addon.name}
                  </span>
                </div>
                <span style={{ color: '#64748b', fontSize: '0.9rem' }}>
                  + ₹{parseFloat(addon.price.toString().replace('₹', '')).toFixed(2)}
                </span>
              </label>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            className="btn-prev"
            style={{
              flex: 1,
              padding: 12,
              borderRadius: 8,
              border: '1px solid #cbd5e1',
              background: '#f1f5f9',
              cursor: 'pointer',
            }}
            onClick={() => {
              setAddonSelectionItem(null);
              setSelectedAddonIds([]);
            }}
          >
            Cancel
          </button>
          <button
            className="btn-prev"
            style={{
              flex: 1,
              padding: 12,
              borderRadius: 8,
              border: '1px solid #cbd5e1',
              background: '#f8fafc',
              cursor: 'pointer',
            }}
            onClick={() => {
              const baseItem = { ...addonSelectionItem };
              setAddonSelectionItem(null);
              setSelectedAddonIds([]);
              handleAddToCart(baseItem, true);
            }}
          >
            Skip Add-ons
          </button>
          <button
            className="btn-next"
            style={{
              flex: 1.5,
              padding: 12,
              borderRadius: 8,
              background: '#3b82f6',
              color: '#fff',
              border: 'none',
              fontWeight: 600,
              cursor: 'pointer',
            }}
            onClick={() => {
              let totalAddonPrice = 0;
              const addonNames: string[] = [];
              selectedAddonIds.forEach((id) => {
                const addon = appData.addons.find((a: any) => a.id.toString() === id.trim());
                if (addon) {
                  totalAddonPrice += parseFloat(addon.price.toString().replace('₹', ''));
                  addonNames.push(addon.name);
                }
              });

              const originalPrice = parseFloat(addonSelectionItem.price.toString().replace('₹', ''));
              const modifiedItem = {
                ...addonSelectionItem,
                name:
                  addonNames.length > 0
                    ? `${addonSelectionItem.name} (${addonNames.join(', ')})`
                    : addonSelectionItem.name,
                price: `₹${(originalPrice + totalAddonPrice).toFixed(2)}`,
              };

              setAddonSelectionItem(null);
              setSelectedAddonIds([]);
              handleAddToCart(modifiedItem, true);
            }}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};
