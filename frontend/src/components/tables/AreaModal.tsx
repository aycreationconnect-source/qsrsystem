import React, { useState } from 'react';
import { tableApi } from '../../api/tableApi';
import { useApp } from '../../context/AppContext';
import { Modal, Button, Input } from '../ui';
import { Layers, FileText, CheckCircle2 } from 'lucide-react';

interface AreaModalProps {
  show: boolean;
  onClose: () => void;
  editingAreaId: number | null;
  newArea: { name: string; description: string };
  setNewArea: React.Dispatch<React.SetStateAction<{ name: string; description: string }>>;
}

export const AreaModal: React.FC<AreaModalProps> = ({
  show,
  onClose,
  editingAreaId,
  newArea,
  setNewArea,
}) => {
  const { refreshAreas } = useApp();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!show) return null;

  const handleSaveArea = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newArea.name?.trim()) {
      setError('Section/Area name is required.');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      const payload = {
        name: newArea.name.trim(),
        description: newArea.description || '',
      };

      if (editingAreaId) {
        await tableApi.updateArea(editingAreaId, payload);
      } else {
        await tableApi.createArea(payload);
      }

      await refreshAreas();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save section');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={show}
      onClose={onClose}
      title={editingAreaId ? 'Edit Floor Section' : 'Add New Section / Area'}
      description="Group dining tables into operational zones like Main Dining, Balcony, AC Hall, or Bar Area."
      maxWidth="md"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSaveArea}
            isLoading={isSaving}
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
          >
            {editingAreaId ? 'Update Section' : 'Create Section'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSaveArea} className="space-y-4">
        {error && (
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 text-xs font-semibold border border-rose-200 dark:border-rose-900/50">
            {error}
          </div>
        )}

        <Input
          label="Section / Area Name"
          required
          placeholder="e.g. Main Dining, Terrace, Rooftop, VIP Lounge"
          value={newArea.name || ''}
          onChange={(e) => setNewArea({ ...newArea, name: e.target.value })}
          leftIcon={<Layers className="w-4 h-4" />}
        />

        <div>
          <label className="text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-stone-400" />
            <span>Description (Optional)</span>
          </label>
          <textarea
            rows={3}
            placeholder="Floor location, atmosphere notes, or table range..."
            value={newArea.description || ''}
            onChange={(e) => setNewArea({ ...newArea, description: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-2xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all resize-none"
          />
        </div>
      </form>
    </Modal>
  );
};
