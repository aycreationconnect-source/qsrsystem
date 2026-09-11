import React, { useState } from 'react';
import { tableApi } from '../../api/tableApi';
import { useApp } from '../../context/AppContext';
import { Modal, Button, Input, ConfirmModal } from '../ui';
import { Layers, FileText, CheckCircle2, Trash2, Palette, Check } from 'lucide-react';
import { cn } from '../../lib/utils';
import { AREA_COLOR_THEMES, getAreaColorTheme } from '../../utils/areaColors';

export interface AreaFormData {
  name: string;
  description: string;
  color?: string;
}

interface AreaModalProps {
  show: boolean;
  onClose: () => void;
  editingAreaId: number | null;
  newArea: AreaFormData;
  setNewArea: React.Dispatch<React.SetStateAction<AreaFormData>>;
}

export const AreaModal: React.FC<AreaModalProps> = ({
  show,
  onClose,
  editingAreaId,
  newArea,
  setNewArea,
}) => {
  const { appData, refreshAreas } = useApp();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!show) return null;

  const handleDeleteArea = async () => {
    if (!editingAreaId) return;
    const tablesInArea = (appData.tables || []).filter((t: any) => t.areaId === editingAreaId);
    if (tablesInArea.length > 0) {
      setError(`Cannot delete section "${newArea.name}" because it contains ${tablesInArea.length} registered table(s). Please move or delete the tables in this section first.`);
      setShowConfirmDelete(false);
      return;
    }
    try {
      setIsDeleting(true);
      setError(null);
      await tableApi.deleteArea(editingAreaId);
      await refreshAreas();
      setShowConfirmDelete(false);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to delete section');
    } finally {
      setIsDeleting(false);
    }
  };

  const currentColorTheme = getAreaColorTheme(newArea.color || 'amber');

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
        color: newArea.color || 'amber',
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
    <>
      <Modal
        isOpen={show}
        onClose={onClose}
        title={editingAreaId ? 'Edit Floor Section' : 'Add New Section / Area'}
        description="Group dining tables into operational zones like Main Dining, Balcony, AC Hall, or Bar Area."
        maxWidth="md"
        footer={
          <div className="flex items-center justify-between w-full">
            <div>
              {editingAreaId && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setShowConfirmDelete(true)}
                  disabled={isSaving || isDeleting}
                  leftIcon={<Trash2 className="w-4 h-4" />}
                  className="cursor-pointer"
                >
                  Delete Section
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={onClose} disabled={isSaving || isDeleting}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveArea}
                isLoading={isSaving}
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
                className="cursor-pointer"
              >
                {editingAreaId ? 'Update Section' : 'Create Section'}
              </Button>
            </div>
          </div>
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

        {/* Section Color Theme */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-stone-400" />
              <span>Section Color Theme</span>
            </label>
            <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
              <span className={cn('w-2 h-2 rounded-full inline-block shadow-xs', currentColorTheme.dot)} />
              {currentColorTheme.name}
            </span>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 p-2.5 rounded-2xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800">
            {AREA_COLOR_THEMES.map((theme) => {
              const isSelected = (newArea.color || 'amber').toLowerCase() === theme.id.toLowerCase();
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => setNewArea({ ...newArea, color: theme.id })}
                  className={cn(
                    'flex flex-col items-center gap-1.5 py-2 px-1 rounded-xl border transition-all cursor-pointer group select-none',
                    isSelected
                      ? 'border-stone-900 dark:border-stone-100 bg-white dark:bg-stone-800 shadow-sm scale-105 ring-2 ring-stone-900/10 dark:ring-white/10'
                      : 'border-transparent hover:bg-stone-200/50 dark:hover:bg-stone-800/50 hover:scale-102'
                  )}
                  title={theme.name}
                >
                  <span
                    className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 shadow-xs relative',
                      theme.dot
                    )}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-white drop-shadow-sm stroke-[3]" />}
                  </span>
                  <span className="text-[10px] font-semibold text-stone-600 dark:text-stone-400 truncate max-w-full">
                    {theme.name.split(' ')[1] || theme.name}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-stone-400 mt-1">
            Tables and section cards will be highlighted in this color for easy identification across the POS and floor setup.
          </p>
        </div>

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

    <ConfirmModal
      isOpen={showConfirmDelete}
      onClose={() => setShowConfirmDelete(false)}
      onConfirm={handleDeleteArea}
      title="Delete Floor Section"
      message={
        <span>
          Are you sure you want to delete section <strong>"{newArea.name}"</strong>? This action cannot be undone.
        </span>
      }
      confirmText="Delete Section"
      variant="danger"
      isLoading={isDeleting}
    />
  </>
  );
};
