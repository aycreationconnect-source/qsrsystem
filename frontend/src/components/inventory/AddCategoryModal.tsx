import React, { useState, useEffect } from 'react';
import { inventoryApi } from '../../api/inventoryApi';
import { Modal, Button, Input } from '../ui';
import { toast } from '../../context/ToastContext';
import { FolderPlus, Edit2, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { InventoryCategory } from '../../types/app.types';

interface AddCategoryModalProps {
  show: boolean;
  onClose: () => void;
  categoryToEdit?: InventoryCategory | null;
  onCategorySaved: (category: InventoryCategory) => void;
}

export const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
  show,
  onClose,
  categoryToEdit,
  onCategorySaved,
}) => {
  const isEditMode = Boolean(categoryToEdit);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (show) {
      if (categoryToEdit) {
        setName(categoryToEdit.name || '');
        setDescription(categoryToEdit.description || '');
        setStatus(categoryToEdit.status === 'Inactive' ? 'Inactive' : 'Active');
      } else {
        setName('');
        setDescription('');
        setStatus('Active');
      }
      setError(null);
    }
  }, [show, categoryToEdit]);

  if (!show) return null;

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name.trim()) {
      setError('Category name is required.');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      let saved: InventoryCategory;

      if (categoryToEdit && categoryToEdit.id) {
        saved = await inventoryApi.updateCategory(categoryToEdit.id, {
          name: name.trim(),
          description: description.trim() || undefined,
          status,
        });
        toast.success(`Category "${name.trim()}" updated successfully!`);
      } else {
        saved = await inventoryApi.createCategory({
          name: name.trim(),
          description: description.trim() || undefined,
          status,
        });
        toast.success(`Category "${name.trim()}" created successfully!`);
      }

      onCategorySaved(saved);
      onClose();
    } catch (err: any) {
      const msg = err.message || 'Failed to save inventory category.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={show}
      onClose={onClose}
      title={isEditMode ? `Edit Category: ${categoryToEdit?.name}` : 'Add Inventory Category'}
      description={
        isEditMode
          ? 'Update category name, description, or mark this category as Inactive.'
          : 'Create a category to group raw ingredients and track stock efficiently.'
      }
      maxWidth="sm"
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
            {isEditMode ? 'Save Changes' : 'Create Category'}
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

        {/* Category Name */}
        <Input
          label="Category Name *"
          placeholder="e.g. Dairy, Spices, Bakery, Syrups"
          value={name}
          onChange={(e) => setName(e.target.value)}
          leftIcon={isEditMode ? <Edit2 className="w-4 h-4" /> : <FolderPlus className="w-4 h-4" />}
          required
        />

        {/* Category Status Toggle (Active vs Inactive) */}
        <div>
          <label className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider select-none mb-1.5 block">
            Category Status
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setStatus('Active')}
              className={cn(
                'px-3 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer',
                status === 'Active'
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 ring-2 ring-emerald-500/20 shadow-sm'
                  : 'bg-white dark:bg-stone-850 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'
              )}
            >
              <Eye className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Active</span>
            </button>

            <button
              type="button"
              onClick={() => setStatus('Inactive')}
              className={cn(
                'px-3 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer',
                status === 'Inactive'
                  ? 'bg-amber-50 border-amber-500 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 ring-2 ring-amber-500/20 shadow-sm'
                  : 'bg-white dark:bg-stone-850 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'
              )}
            >
              <EyeOff className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Inactive (Hidden)</span>
            </button>
          </div>
          <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-1">
            Inactive categories will be marked as inactive and can be toggled back at any time.
          </p>
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider select-none mb-1.5 block">
            Description (Optional)
          </label>
          <textarea
            rows={2}
            placeholder="Brief description or storage notes..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all resize-none"
          />
        </div>
      </form>
    </Modal>
  );
};
