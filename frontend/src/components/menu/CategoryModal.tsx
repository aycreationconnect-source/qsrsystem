import React from 'react';
import { useApp } from '../../context/AppContext';
import { menuApi } from '../../api/menuApi';

interface CategoryModalProps {
  show: boolean;
  onClose: () => void;
  editingCategoryName: string | null;
  newCategory: any;
  setNewCategory: React.Dispatch<React.SetStateAction<any>>;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  show,
  onClose,
  editingCategoryName,
  newCategory,
  setNewCategory,
}) => {
  const { appData, fetchBackendData } = useApp();

  if (!show) return null;

  const handleSave = async () => {
    if (!newCategory.name) return;
    const parsedOrder = newCategory.displayOrder ? parseInt(newCategory.displayOrder) : 999;
    const catObj = { ...newCategory, displayOrder: parsedOrder };

    if (editingCategoryName) {
      const existingCat = appData.categories.find(
        (c: any) => (typeof c === 'string' ? c : c.name) === editingCategoryName
      ) as any;
      if (existingCat && existingCat.id) {
        await menuApi.updateCategory(existingCat.id, catObj);
        fetchBackendData();
      }
    } else {
      await menuApi.createCategory(catObj);
      fetchBackendData();
    }

    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ width: 450 }}>
        <div className="modal-header">
          <h2>{editingCategoryName ? 'Edit Category' : 'Add New Category'}</h2>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-body">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 20,
              paddingBottom: 16,
              borderBottom: '1px solid #e2e8f0',
            }}
          >
            <div>
              <span style={{ fontWeight: 600, fontSize: '1.05rem', color: '#1e293b' }}>Category Status</span>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                Toggle to make this category {newCategory?.status === 'Active' ? 'inactive' : 'active'}
              </p>
            </div>
            <label style={{ position: 'relative', display: 'inline-block', width: 50, height: 28 }}>
              <input
                type="checkbox"
                checked={newCategory?.status === 'Active'}
                onChange={(e) =>
                  setNewCategory({ ...newCategory, status: e.target.checked ? 'Active' : 'Inactive' })
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
                  backgroundColor: newCategory?.status === 'Active' ? '#34d399' : '#cbd5e1',
                  transition: '0.4s',
                  borderRadius: 34,
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    height: 20,
                    width: 20,
                    left: 4,
                    bottom: 4,
                    backgroundColor: 'white',
                    transition: '0.4s',
                    borderRadius: '50%',
                    transform: newCategory?.status === 'Active' ? 'translateX(22px)' : 'translateX(0px)',
                  }}
                ></span>
              </span>
            </label>
          </div>
          <div className="form-group">
            <label>
              Category Name <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Desserts"
              value={newCategory?.name || ''}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Category Description</label>
            <textarea
              rows={3}
              placeholder="Brief description..."
              value={newCategory?.description || ''}
              onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                marginTop: '8px',
                resize: 'vertical',
              }}
            ></textarea>
          </div>

          <div style={{ display: 'flex', gap: 16, marginTop: 32 }}>
            <button className="btn btn-prev" style={{ flex: 1 }} onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-next" style={{ flex: 1 }} onClick={handleSave}>
              {editingCategoryName ? 'Update Category' : 'Save Category'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
