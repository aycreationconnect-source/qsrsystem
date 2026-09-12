import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { menuApi } from '../../api/menuApi';
import { Modal, Input, Button } from '../ui';
import { Tag, FileText, CheckCircle2 } from 'lucide-react';

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
  const { appData, refreshCategories, refreshMenu } = useApp();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isActive = newCategory?.status === 'Active';

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newCategory?.name?.trim()) {
      setError('Category name is required');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      const catObj = {
        name: newCategory.name.trim(),
        description: newCategory.description || '',
        status: newCategory.status || 'Active',
      };

      if (editingCategoryName) {
        const existingCat = appData.categories.find(
          (c: any) => (typeof c === 'string' ? c : c.name) === editingCategoryName
        ) as any;
        if (existingCat && existingCat.id) {
          await menuApi.updateCategory(existingCat.id, catObj);
          await refreshCategories();
          if (editingCategoryName !== catObj.name) {
            await refreshMenu();
          }
        }
      } else {
        await menuApi.createCategory(catObj);
        await refreshCategories();
      }

      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save category');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={show}
      onClose={onClose}
      title={editingCategoryName ? 'Edit Category' : 'Add New Category'}
      description="Organize your food & beverage items into distinct menu sections."
      maxWidth="md"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            isLoading={isSaving}
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
          >
            {editingCategoryName ? 'Update Category' : 'Save Category'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSave} className="space-y-4">
        {error && (
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 text-xs font-semibold border border-rose-200 dark:border-rose-900/50">
            {error}
          </div>
        )}

        {/* Status Toggle Card */}
        <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-850 border border-stone-200/80 dark:border-stone-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-stone-900 dark:text-stone-100 block">
              Category Visibility
            </span>
            <span className="text-[11px] text-stone-500 dark:text-stone-400">
              {isActive ? 'Visible to staff and POS terminals' : 'Hidden from POS ordering'}
            </span>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) =>
                setNewCategory({ ...newCategory, status: e.target.checked ? 'Active' : 'Inactive' })
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer dark:bg-stone-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div>

        {/* Category Name */}
        <Input
          label="Category Name"
          required
          placeholder="e.g. Hot Coffees, Pastries, Main Course"
          value={newCategory?.name || ''}
          onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
          leftIcon={<Tag className="w-4 h-4" />}
        />

        {/* Description */}
        <div>
          <label className="text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-stone-400" />
            <span>Description</span>
          </label>
          <textarea
            rows={3}
            placeholder="Brief description of items included in this section..."
            value={newCategory?.description || ''}
            onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-2xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all resize-none"
          />
        </div>
      </form>
    </Modal>
  );
};
