import React from 'react';
import { useApp } from '../../context/AppContext';
import { menuApi } from '../../api/menuApi';

interface ConfigItemModalProps {
  show: boolean;
  onClose: () => void;
  configItemIndex: number | null;
  newItem: any;
  setNewItem: React.Dispatch<React.SetStateAction<any>>;
  ingredients: any[];
  setIngredients: React.Dispatch<React.SetStateAction<any[]>>;
  taxes: any[];
  setTaxes: React.Dispatch<React.SetStateAction<any[]>>;
}

export const ConfigItemModal: React.FC<ConfigItemModalProps> = ({
  show,
  onClose,
  configItemIndex,
  newItem,
  setNewItem,
  ingredients,
  setIngredients,
  taxes,
  setTaxes,
}) => {
  const { appData, setAppData, fetchBackendData } = useApp();

  if (!show || configItemIndex === null || !appData.menu[configItemIndex]) return null;

  const currentItem = appData.menu[configItemIndex];

  const handleSave = async () => {
    const validIngredients = ingredients.filter((i) => i.name && i.quantity);
    const validTaxes = taxes.filter((t) => t.name && t.rate);

    const newAppData = { ...appData };
    newAppData.menu[configItemIndex].tax = newItem.tax;
    newAppData.menu[configItemIndex].taxName = newItem.taxName;
    newAppData.menu[configItemIndex].ingredients = validIngredients;
    newAppData.menu[configItemIndex].taxes = validTaxes;

    if (currentItem && currentItem.id) {
      await menuApi.updateMenuItem(currentItem.id, {
        ...currentItem,
        addonIds: newItem.addonIds,
        taxes: validTaxes,
      });
      fetchBackendData();
    }

    setAppData(newAppData);
    onClose();
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div
        className="modal-content"
        style={{
          width: 1100,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 16,
          overflow: 'hidden',
          padding: 0,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '24px 32px',
            borderBottom: '1px solid #e5e7eb',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#2563eb', fontWeight: 700 }}>
            Configure: {currentItem.name}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              color: '#4b5563',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            &times;
          </button>
        </div>
        <div className="modal-body" style={{ overflowY: 'auto', padding: '32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '32px' }}>
            {/* Column 1: Tax */}
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#111827' }}>Tax Setup</h4>
                <button
                  style={{
                    padding: '6px 12px',
                    fontSize: '0.8rem',
                    background: '#fff',
                    border: '1px solid #d1d5db',
                    borderRadius: 16,
                    color: '#374151',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                  onClick={() => setTaxes([...taxes, { name: '', rate: '' }])}
                >
                  + Add Tax
                </button>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: 16 }}>Define multiple tax rates.</p>

              <div
                style={{
                  padding: 16,
                  borderRadius: 12,
                  border: '1px solid #e5e7eb',
                  background: '#fafafa',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  maxHeight: '50vh',
                  overflowY: 'auto',
                }}
              >
                {taxes.map((t, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <input
                      type="text"
                      placeholder="Name (e.g. CGST)"
                      value={t.name}
                      onChange={(e) => {
                        const newTaxes = [...taxes];
                        newTaxes[i].name = e.target.value;
                        setTaxes(newTaxes);
                      }}
                      style={{
                        flex: 2,
                        padding: '12px',
                        borderRadius: 8,
                        border: '1px solid #d1d5db',
                        fontSize: '0.95rem',
                      }}
                    />
                    <input
                      type="number"
                      placeholder="Rate (%)"
                      value={t.rate}
                      onChange={(e) => {
                        const newTaxes = [...taxes];
                        newTaxes[i].rate = e.target.value;
                        setTaxes(newTaxes);
                      }}
                      style={{
                        flex: 1,
                        padding: '12px',
                        borderRadius: 8,
                        border: '1px solid #d1d5db',
                        fontSize: '0.95rem',
                      }}
                    />
                    <button
                      onClick={() => setTaxes(taxes.filter((_, idx) => idx !== i))}
                      style={{
                        background: '#fee2e2',
                        color: '#ef4444',
                        border: 'none',
                        borderRadius: 6,
                        width: 36,
                        height: 36,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontSize: '1.2rem',
                        padding: 0,
                        flexShrink: 0,
                      }}
                    >
                      &times;
                    </button>
                  </div>
                ))}
                {taxes.length === 0 && (
                  <p style={{ fontSize: '0.9rem', color: '#9ca3af', margin: 0 }}>No taxes added.</p>
                )}
              </div>
            </div>

            {/* Column 2: Ingredients */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#111827' }}>
                  Recipe / Ingredients
                </h4>
                <button
                  style={{
                    padding: '6px 12px',
                    fontSize: '0.8rem',
                    background: '#fff',
                    border: '1px solid #d1d5db',
                    borderRadius: 16,
                    color: '#374151',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                  onClick={() => setIngredients([...ingredients, { name: '', quantity: '', unit: 'pcs' }])}
                >
                  + Add Ingredient
                </button>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: 16 }}>
                Link raw materials. If a material doesn't exist, it will be auto-created in Inventory.
              </p>

              <datalist id="inventory-items">
                {appData.inventory.map((inv: any, idx: number) => (
                  <option key={idx} value={inv.item || inv.name} />
                ))}
              </datalist>

              <div
                style={{
                  padding: 16,
                  borderRadius: 12,
                  border: '1px solid #e5e7eb',
                  background: '#fafafa',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  maxHeight: '50vh',
                  overflowY: 'auto',
                }}
              >
                {ingredients.map((ing, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <input
                      type="text"
                      list="inventory-items"
                      placeholder="Ingredient Name"
                      value={ing.name}
                      onChange={(e) => {
                        const newIng = [...ingredients];
                        newIng[i].name = e.target.value;
                        setIngredients(newIng);
                      }}
                      style={{
                        flex: 2,
                        padding: '12px',
                        borderRadius: 8,
                        border: '1px solid #d1d5db',
                        fontSize: '0.95rem',
                      }}
                    />
                    <input
                      type="number"
                      placeholder="Qty"
                      value={ing.quantity}
                      onChange={(e) => {
                        const newIng = [...ingredients];
                        newIng[i].quantity = e.target.value;
                        setIngredients(newIng);
                      }}
                      style={{
                        flex: 1,
                        padding: '12px',
                        borderRadius: 8,
                        border: '1px solid #d1d5db',
                        fontSize: '0.95rem',
                      }}
                    />
                    <select
                      value={ing.unit}
                      onChange={(e) => {
                        const newIng = [...ingredients];
                        newIng[i].unit = e.target.value;
                        setIngredients(newIng);
                      }}
                      style={{
                        flex: 1,
                        padding: '12px',
                        borderRadius: 8,
                        border: '1px solid #d1d5db',
                        fontSize: '0.95rem',
                        background: '#fff',
                      }}
                    >
                      <option value="pcs">pcs</option>
                      <option value="kg">kg</option>
                      <option value="g">g</option>
                      <option value="L">L</option>
                      <option value="ml">ml</option>
                    </select>
                    <button
                      onClick={() => setIngredients(ingredients.filter((_, idx) => idx !== i))}
                      style={{
                        background: '#fee2e2',
                        color: '#ef4444',
                        border: 'none',
                        borderRadius: 6,
                        width: 36,
                        height: 36,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontSize: '1.2rem',
                        padding: 0,
                        flexShrink: 0,
                      }}
                    >
                      &times;
                    </button>
                  </div>
                ))}
                {ingredients.length === 0 && (
                  <p style={{ fontSize: '0.9rem', color: '#9ca3af', margin: 0 }}>No ingredients added.</p>
                )}
              </div>
            </div>

            {/* Column 3: Add-ons */}
            <div className="form-group">
              <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#111827', marginBottom: 8 }}>
                Allowed Add-ons
              </h4>
              <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: 16 }}>
                Select which add-ons can be ordered with this item.
              </p>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  maxHeight: '50vh',
                  overflowY: 'auto',
                  paddingRight: 8,
                }}
              >
                {appData.addons.length === 0 ? (
                  <span style={{ fontSize: '0.85rem', color: '#9ca3af' }}>
                    No add-ons available. Create some in the Add-ons tab first!
                  </span>
                ) : (
                  appData.addons.map((addon: any) => {
                    const currentAddonIds = newItem.addonIds ? newItem.addonIds.split(',') : [];
                    const isSelected = currentAddonIds.includes(addon.id.toString());
                    return (
                      <label
                        key={addon.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          background: '#fff',
                          padding: '12px 16px',
                          borderRadius: 8,
                          border: `1px solid ${isSelected ? '#2563eb' : '#e5e7eb'}`,
                          cursor: 'pointer',
                          boxShadow: isSelected ? '0 0 0 1px #2563eb' : 'none',
                          transition: 'all 0.2s',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            let newIds = [...currentAddonIds];
                            if (e.target.checked) newIds.push(addon.id.toString());
                            else newIds = newIds.filter((id) => id !== addon.id.toString());
                            setNewItem({ ...newItem, addonIds: newIds.join(',') });
                          }}
                          style={{ width: 16, height: 16, cursor: 'pointer' }}
                        />
                        <div style={{ flex: 1 }}>
                          <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#374151' }}>
                            {addon.name}
                          </span>
                          {addon.description && (
                            <p style={{ margin: 0, fontSize: '0.75rem', color: '#9ca3af' }}>
                              {addon.description}
                            </p>
                          )}
                        </div>
                        <span style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 500 }}>
                          ₹{parseFloat(addon.price).toFixed(2)}
                        </span>
                      </label>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 16, marginTop: 40 }}>
            <button
              style={{
                flex: 1,
                padding: '14px',
                borderRadius: 8,
                border: '1px solid #d1d5db',
                background: '#fff',
                color: '#111827',
                fontWeight: 700,
                fontSize: '1rem',
                cursor: 'pointer',
              }}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              style={{
                flex: 1,
                padding: '14px',
                borderRadius: 8,
                border: 'none',
                background: '#2563eb',
                color: '#fff',
                fontWeight: 700,
                fontSize: '1rem',
                cursor: 'pointer',
              }}
              onClick={handleSave}
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
