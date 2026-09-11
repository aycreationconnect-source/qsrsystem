import React, { useState } from 'react';
import { tableApi } from '../../api/tableApi';
import { useApp } from '../../context/AppContext';
import { Modal, Button, Input, ConfirmModal, Select, type SelectOption } from '../ui';
import { Armchair, Users, Layers, CheckCircle2, Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { getAreaColorTheme } from '../../utils/areaColors';

interface TableModalProps {
  show: boolean;
  onClose: () => void;
  editingTableId: number | string | null;
  newTableConfig: any;
  setNewTableConfig: React.Dispatch<React.SetStateAction<any>>;
}

export const TableModal: React.FC<TableModalProps> = ({
  show,
  onClose,
  editingTableId,
  newTableConfig,
  setNewTableConfig,
}) => {
  const { appData, refreshTables } = useApp();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!show) return null;

  const handleSaveTable = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newTableConfig.name?.trim()) {
      setError('Table name or number is required.');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      const parsedSeats = parseInt(newTableConfig.seats) || 4;
      const defaultAreaId =
        appData.areas && appData.areas.length > 0 ? appData.areas[0].id : 1;
      const parsedAreaId = parseInt(newTableConfig.areaId) || defaultAreaId;

      const payload = {
        name: newTableConfig.name.trim(),
        seats: parsedSeats,
        status: newTableConfig.status || 'Available',
        areaId: parsedAreaId,
      };

      if (editingTableId) {
        await tableApi.updateTable(Number(editingTableId), payload);
      } else {
        await tableApi.createTable(payload);
      }

      await refreshTables();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save table');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTable = async () => {
    if (!editingTableId) return;
    try {
      setIsDeleting(true);
      setError(null);
      await tableApi.deleteTable(Number(editingTableId));
      await refreshTables();
      setShowConfirmDelete(false);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to delete table');
    } finally {
      setIsDeleting(false);
    }
  };

  const seatPresets = [2, 4, 6, 8, 10];

  const areaOptions: SelectOption[] = (appData.areas || []).map((area: any, idx: number) => {
    const tableCount =
      appData.tables?.filter((t: any) => Number(t.areaId) === Number(area.id)).length ??
      (area.tables?.length ?? 0);
    const theme = getAreaColorTheme(area, idx);
    return {
      value: area.id,
      label: area.name,
      description: area.description || undefined,
      badge: `${tableCount} ${tableCount === 1 ? 'Table' : 'Tables'}`,
      icon: <span className={cn('w-2.5 h-2.5 rounded-full shrink-0 shadow-xs', theme.dot)} />,
    };
  });

  const statusOptions: SelectOption[] = [
    {
      value: 'Available',
      label: 'Available',
      badge: 'Ready',
      description: 'Clean & ready for new guests',
      icon: (
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-sm shadow-emerald-500/50"></span>
        </span>
      ),
    },
    {
      value: 'Reserved',
      label: 'Reserved',
      badge: 'Booked',
      description: 'Pre-booked or held for reservation',
      icon: (
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500 shadow-sm shadow-amber-500/50"></span>
        </span>
      ),
    },
    {
      value: 'Occupied',
      label: 'Occupied',
      badge: 'In Use',
      description: 'Guests currently seated & dining',
      icon: (
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 shadow-sm shadow-rose-500/50"></span>
        </span>
      ),
    },
  ];

  return (
    <>
      <Modal
        isOpen={show}
        onClose={onClose}
        title={editingTableId ? 'Edit Table' : 'Add New Dining Table'}
        description="Configure table identifier, seating capacity, and assign it to a floor section."
        maxWidth="md"
        footer={
          <div className="flex items-center justify-between w-full">
            <div>
              {editingTableId && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setShowConfirmDelete(true)}
                  disabled={isSaving || isDeleting}
                  leftIcon={<Trash2 className="w-4 h-4" />}
                  className="cursor-pointer"
                >
                  Delete Table
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
                onClick={handleSaveTable}
                isLoading={isSaving}
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
                className="cursor-pointer"
              >
                {editingTableId ? 'Update Table' : 'Create Table'}
              </Button>
            </div>
          </div>
        }
      >
      <form onSubmit={handleSaveTable} className="space-y-4">
        {error && (
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 text-xs font-semibold border border-rose-200 dark:border-rose-900/50">
            {error}
          </div>
        )}

        {/* Table Name */}
        <Input
          label="Table Identifier / Name"
          required
          placeholder="e.g. Table 1, T-04, Booth A"
          value={newTableConfig.name || ''}
          onChange={(e) => setNewTableConfig({ ...newTableConfig, name: e.target.value })}
          leftIcon={<Armchair className="w-4 h-4" />}
        />

        {/* Section / Area Assignment */}
        <Select
          label="Floor Section / Area"
          options={areaOptions}
          value={newTableConfig.areaId || (appData.areas[0]?.id ?? '')}
          onChange={(val) => setNewTableConfig({ ...newTableConfig, areaId: val })}
          searchable={areaOptions.length > 5}
          leftIcon={<Layers className="w-4 h-4" />}
          placeholder="Select floor section..."
        />

        {/* Seating Capacity */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-stone-400" />
              <span>Seat Capacity</span>
            </label>
            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
              {newTableConfig.seats || 4} Guests
            </span>
          </div>

          <div className="flex items-center gap-2 mb-2">
            {seatPresets.map((preset) => {
              const isSelected = (parseInt(newTableConfig.seats) || 4) === preset;
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setNewTableConfig({ ...newTableConfig, seats: preset })}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500 text-stone-950 border-amber-500 shadow-sm'
                      : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                  }`}
                >
                  {preset}
                </button>
              );
            })}
          </div>

          <Input
            type="number"
            min="1"
            max="50"
            placeholder="Custom seats count"
            value={newTableConfig.seats || ''}
            onChange={(e) => setNewTableConfig({ ...newTableConfig, seats: e.target.value })}
          />
        </div>

        {/* Initial Status */}
        <Select
          label="Table Availability Status"
          options={statusOptions}
          value={newTableConfig.status || 'Available'}
          onChange={(val) => setNewTableConfig({ ...newTableConfig, status: val })}
          searchable={false}
          dropdownDirection="up"
          placeholder="Select table status..."
        />
      </form>
    </Modal>

    <ConfirmModal
      isOpen={showConfirmDelete}
      onClose={() => setShowConfirmDelete(false)}
      onConfirm={handleDeleteTable}
      title="Delete Dining Table"
      message={
        <span>
          Are you sure you want to delete table <strong>"{newTableConfig.name}"</strong>? This table will be permanently removed.
        </span>
      }
      confirmText="Delete Table"
      variant="danger"
      isLoading={isDeleting}
    />
  </>
  );
};
