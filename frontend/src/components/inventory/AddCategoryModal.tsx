import React, { useState } from 'react';
import { inventoryApi } from '../../api/inventoryApi';
import { Modal, Button, Input } from '../ui';
import { FolderPlus, CheckCircle2 } from 'lucide-react';
import type { InventoryCategory } from '../../types/app.types';

interface AddCategoryModalProps {
  show: boolean;
  onClose: () => void;
  onCategoryCreated: (category: InventoryCategory) => void;
}

export const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
  show,
  onClose,
  onCategoryCreated,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (show) {
      setName('');
      setDescription('');
      setError(null);
    }
  }, [show]);

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
      const created = await inventoryApi.createCategory({
        name: name.trim(),
        description: description.trim() || undefined,
      });

      onCategoryCreated(created);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create inventory category.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={show}
      onClose={onClose}
      title="Add Inventory Category"
      description="Create a category to group raw ingredients and track stock efficiently."
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
            Create Category
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

        <Input
          label="Category Name *"
          placeholder="e.g. Dairy, Spices, Bakery, Syrups"
          value={name}
          onChange={(e) => setName(e.target.value)}
          leftIcon={<FolderPlus className="w-4 h-4" />}
          required
        />

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
