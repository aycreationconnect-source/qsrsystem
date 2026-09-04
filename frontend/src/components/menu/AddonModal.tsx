import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { menuApi } from '../../api/menuApi';
import { Modal, Input, Button } from '../ui';
import { Sparkles, IndianRupee, FileText, CheckCircle2 } from 'lucide-react';

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
  const { refreshAddons } = useApp();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!addonForm.name?.trim() || !addonForm.price) {
      setError('Add-on Name and Price are required.');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      const numericPrice = parseFloat(String(addonForm.price).replace(/[^0-9.]/g, '')) || 0;
      const payload = {
        name: addonForm.name.trim(),
        description: addonForm.description || '',
        price: numericPrice,
      };

      if (editingAddon) {
        await menuApi.updateAddon(editingAddon.id, payload);
      } else {
        await menuApi.createAddon(payload);
      }

      await refreshAddons();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save add-on');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={show}
      onClose={onClose}
      title={editingAddon ? 'Edit Modifier / Add-on' : 'Create Modifier / Add-on'}
      description="Create custom choices like Extra Cheese, Caramel Syrup, Oat Milk, or Extra Toppings."
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
            {editingAddon ? 'Update Add-on' : 'Save Add-on'}
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
          label="Add-on / Modifier Name"
          required
          placeholder="e.g. Extra Cheese, Vanilla Syrup, Almond Milk"
          value={addonForm.name}
          onChange={(e) => setAddonForm({ ...addonForm, name: e.target.value })}
          leftIcon={<Sparkles className="w-4 h-4" />}
        />

        <Input
          label="Price (₹)"
          required
          type="number"
          step="0.5"
          placeholder="0.00"
          value={
            typeof addonForm.price === 'string'
              ? addonForm.price.replace(/[^0-9.]/g, '')
              : addonForm.price || ''
          }
          onChange={(e) => setAddonForm({ ...addonForm, price: e.target.value })}
          leftIcon={<IndianRupee className="w-4 h-4" />}
        />

        <div>
          <label className="text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-stone-400" />
            <span>Description (Optional)</span>
          </label>
          <textarea
            rows={3}
            placeholder="Portion size, details, or notes..."
            value={addonForm.description}
            onChange={(e) => setAddonForm({ ...addonForm, description: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-2xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all resize-none"
          />
        </div>
      </form>
    </Modal>
  );
};
