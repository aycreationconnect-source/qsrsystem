import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { menuApi } from '../../api/menuApi';
import { Modal, Input, Button } from '../ui';
import { Tag, FileText, CheckCircle2, Plus, X, Layers } from 'lucide-react';

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
  const [subcatInput, setSubcatInput] = useState('');

  const isActive = newCategory?.status === 'Active';

  // Extract current subcategories array
  const currentSubcats: string[] = Array.isArray(newCategory?.subcategories)
    ? newCategory.subcategories
    : typeof newCategory?.subcategories === 'string'
    ? newCategory.subcategories.split(',').map((s: string) => s.trim()).filter(Boolean)
    : [];

  const handleAddSubcat = () => {
    const trimmed = subcatInput.trim();
    if (!trimmed) return;

    // Support comma-separated batch adding
    const addedItems = trimmed
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !currentSubcats.includes(s));

    if (addedItems.length > 0) {
      setNewCategory({
        ...newCategory,
        subcategories: [...currentSubcats, ...addedItems],
      });
    }
    setSubcatInput('');
  };

  const handleRemoveSubcat = (indexToRemove: number) => {
    const updated = currentSubcats.filter((_, i) => i !== indexToRemove);
    setNewCategory({
      ...newCategory,
      subcategories: updated,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSubcat();
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newCategory?.name?.trim()) {
      setError('Category name is required');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      // Also include anything pending in subcatInput
      let finalSubcats = [...currentSubcats];
      if (subcatInput.trim()) {
        const pending = subcatInput
          .split(',')
          .map((s) => s.trim())
          .filter((s) => s.length > 0 && !finalSubcats.includes(s));
        finalSubcats = [...finalSubcats, ...pending];
      }

      const catObj = {
        name: newCategory.name.trim(),
        description: newCategory.description || '',
        status: newCategory.status || 'Active',
        subcategories: finalSubcats,
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

      setSubcatInput('');
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

        {/* Subcategories Chip Builder */}
        <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-850/60 border border-stone-200/80 dark:border-stone-800 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-500" />
              <span>Subcategories (Optional)</span>
            </label>
            <span className="text-[11px] text-stone-400 font-medium">
              {currentSubcats.length} added
            </span>
          </div>

          {/* Add input with Enter / Button */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="e.g. Chicken, Veg, Mutton (Press Enter or Add)"
              value={subcatInput}
              onChange={(e) => setSubcatInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 h-10 px-3.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-750 text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddSubcat}
              disabled={!subcatInput.trim()}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              className="h-10 text-xs font-bold shrink-0"
            >
              Add
            </Button>
          </div>

          {/* Subcategories Tags List */}
          {currentSubcats.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {currentSubcats.map((subcat, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border border-amber-200/80 dark:border-amber-800/50 shadow-sm transition-all"
                >
                  <span>{subcat}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubcat(idx)}
                    className="w-4 h-4 rounded-full flex items-center justify-center text-amber-700 dark:text-amber-300 hover:bg-amber-200/60 dark:hover:bg-amber-800/60 transition-colors cursor-pointer"
                    aria-label={`Remove ${subcat}`}
                  >
                    <X className="w-3 h-3 stroke-[2.5]" />
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-stone-400 leading-relaxed">
              Add subcategories to organize dishes into tabs (e.g. for "Lunch", add "Chicken", "Mutton", "Veg"). Optional.
            </p>
          )}
        </div>

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
