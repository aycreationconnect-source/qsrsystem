import React from 'react';
import { useApp } from '../../context/AppContext';
import { menuApi } from '../../api/menuApi';

interface ItemModalProps {
  show: boolean;
  onClose: () => void;
  editingItemIndex: number | null;
  newItem: any;
  setNewItem: React.Dispatch<React.SetStateAction<any>>;
  selectedCategory: string | null;
}

export const ItemModal: React.FC<ItemModalProps> = ({
  show,
  onClose,
  editingItemIndex,
  newItem,
  setNewItem,
  selectedCategory,
}) => {
  const { appData, fetchBackendData } = useApp();

  if (!show) return null;

  const handleSave = async () => {
    if (!newItem.name || !newItem.price) return;
    const catToUse =
      newItem.category ||
      selectedCategory ||
      (appData.categories.length > 0
        ? typeof appData.categories[0] === 'string'
          ? appData.categories[0]
          : appData.categories[0].name
        : 'Uncategorized');

    const finalItem = {
      ...newItem,
      price: `₹${parseFloat(newItem.price).toFixed(2)}`,
      category: catToUse,
    };

    if (editingItemIndex !== null) {
      const existingItem = appData.menu[editingItemIndex];
      if (existingItem && existingItem.id) {
        await menuApi.updateMenuItem(existingItem.id, finalItem);
        fetchBackendData();
      }
    } else {
      await menuApi.createMenuItem(finalItem);
      fetchBackendData();
    }

    onClose();
  };

  return (
    <div className="modal-overlay">
      <div
        className="modal-content"
        style={{ width: 650, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
      >
        <div className="modal-header">
          <h2>
            {editingItemIndex !== null
              ? newItem.isAddon
                ? 'Edit Add-on'
                : 'Edit Menu Item'
              : newItem.isAddon
              ? 'Create Add-on'
              : 'Add New Menu Item'}
          </h2>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-body" style={{ overflowY: 'auto', paddingRight: 8 }}>
          {/* Status & Availability & Addon Toggles */}
          {!newItem.isAddon && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 24,
                marginBottom: 24,
                paddingBottom: 16,
                borderBottom: '1px solid var(--border-color)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontWeight: 600, fontSize: '1rem' }}>Availability</span>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Is this item currently available?
                  </p>
                </div>
                <label style={{ position: 'relative', display: 'inline-block', width: 44, height: 24 }}>
                  <input
                    type="checkbox"
                    checked={newItem.available}
                    onChange={(e) => setNewItem({ ...newItem, available: e.target.checked })}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      cursor: 'pointer',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: newItem.available ? '#3b82f6' : '#cbd5e1',
                      transition: '0.4s',
                      borderRadius: 24,
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        height: 18,
                        width: 18,
                        left: 3,
                        bottom: 3,
                        backgroundColor: 'white',
                        transition: '0.4s',
                        borderRadius: '50%',
                        transform: newItem.available ? 'translateX(20px)' : 'translateX(0px)',
                      }}
                    ></span>
                  </span>
                </label>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontWeight: 600, fontSize: '1rem' }}>Status</span>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Active or Inactive
                  </p>
                </div>
                <label style={{ position: 'relative', display: 'inline-block', width: 44, height: 24 }}>
                  <input
                    type="checkbox"
                    checked={newItem.status === 'Active'}
                    onChange={(e) =>
                      setNewItem({ ...newItem, status: e.target.checked ? 'Active' : 'Inactive' })
                    }
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      cursor: 'pointer',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: newItem.status === 'Active' ? '#10b981' : '#cbd5e1',
                      transition: '0.4s',
                      borderRadius: 24,
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        height: 18,
                        width: 18,
                        left: 3,
                        bottom: 3,
                        backgroundColor: 'white',
                        transition: '0.4s',
                        borderRadius: '50%',
                        transform: newItem.status === 'Active' ? 'translateX(20px)' : 'translateX(0px)',
                      }}
                    ></span>
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Basic Info */}
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label>
              Item Name <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Paneer Tikka"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              required
              style={{ width: '100%' }}
            />
          </div>

          <div className="form-group">
            <label>Item Description</label>
            <textarea
              rows={2}
              placeholder="Ingredients, taste, etc..."
              value={newItem.description}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid var(--border-color)',
                borderRadius: 8,
              }}
            ></textarea>
          </div>

          {/* Pricing & Prep */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: newItem.isAddon ? '1fr' : '1fr 1fr',
              gap: 16,
            }}
          >
            <div className="form-group">
              <label>
                Price (₹) <span style={{ color: 'red' }}>*</span>
              </label>
              <input
                type="number"
                placeholder="0.00"
                value={newItem.price}
                onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                required
              />
            </div>
            {!newItem.isAddon && (
              <div className="form-group">
                <label>Prep Time (min)</label>
                <input
                  type="number"
                  placeholder="15"
                  value={newItem.prepTime}
                  onChange={(e) => setNewItem({ ...newItem, prepTime: e.target.value })}
                />
              </div>
            )}
          </div>

          {/* Classification & File */}
          {!newItem.isAddon && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label>Dietary Type</label>
                <select
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#fff',
                    border: '1px solid var(--border-color)',
                    borderRadius: 8,
                  }}
                  value={newItem.type}
                  onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
                >
                  <option value="Veg">🟢 Veg</option>
                  <option value="Non-Veg">🔴 Non-Veg</option>
                  <option value="Egg">🟡 Egg</option>
                  <option value="Vegan">🌱 Vegan</option>
                </select>
              </div>
              <div className="form-group">
                <label>Item Code / SKU</label>
                <input
                  type="text"
                  placeholder="e.g. PT-01"
                  value={newItem.sku}
                  onChange={(e) => setNewItem({ ...newItem, sku: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Item Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setNewItem({ ...newItem, image: URL.createObjectURL(file) });
                    }
                  }}
                  style={{ padding: '8px 0' }}
                />
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 16, marginTop: 24 }}>
            <button className="btn btn-prev" style={{ flex: 1 }} onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-next" style={{ flex: 1 }} onClick={handleSave}>
              {editingItemIndex !== null ? 'Update Item' : 'Save Item'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
