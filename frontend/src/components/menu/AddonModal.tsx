import React from 'react';
import { useApp } from '../../context/AppContext';
import { menuApi } from '../../api/menuApi';

interface AddonModalProps {
  show: boolean;
  onClose: () => void;
  editingAddon: any;
  addonForm: { name: string; description: string; price: string };
  setAddonForm: React.Dispatch<React.SetStateAction<{ name: string; description: string; price: string }>>;
}

export const AddonModal: React.FC<AddonModalProps> = ({
  show,
  onClose,
  editingAddon,
  addonForm,
  setAddonForm,
}) => {
  const { fetchBackendData } = useApp();

  if (!show) return null;

  const handleSave = async () => {
    if (!addonForm.name || !addonForm.price) return;
    if (editingAddon) {
      await menuApi.updateAddon(editingAddon.id, addonForm);
    } else {
      await menuApi.createAddon(addonForm);
    }
    fetchBackendData();
    onClose();
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div className="modal-content" style={{ width: 480, borderRadius: 16, padding: 0, overflow: 'hidden' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '20px 24px',
            borderBottom: '1px solid #e5e7eb',
            background: '#f8fafc',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#1e293b' }}>
            {editingAddon ? 'Edit Add-on' : 'Create Add-on'}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.4rem',
              cursor: 'pointer',
              color: '#64748b',
            }}
          >
            &times;
          </button>
        </div>
        <div style={{ padding: '24px' }}>
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label>
              Name <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Extra Cheese"
              value={addonForm.name}
              onChange={(e) => setAddonForm({ ...addonForm, name: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label>Description</label>
            <textarea
              rows={2}
              placeholder="Short description..."
              value={addonForm.description}
              onChange={(e) => setAddonForm({ ...addonForm, description: e.target.value })}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid var(--border-color)',
                borderRadius: 8,
              }}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 24 }}>
            <label>
              Price (₹) <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="number"
              placeholder="0.00"
              value={addonForm.price}
              onChange={(e) => setAddonForm({ ...addonForm, price: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-prev" style={{ flex: 1 }} onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-next" style={{ flex: 1 }} onClick={handleSave}>
              {editingAddon ? 'Update Add-on' : 'Save Add-on'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
