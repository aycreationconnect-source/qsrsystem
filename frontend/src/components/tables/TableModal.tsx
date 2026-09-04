import React, { useState } from 'react';
import { tableApi } from '../../api/tableApi';
import { useApp } from '../../context/AppContext';
import { Modal, Button, Input } from '../ui';
import { Armchair, Users, Layers, CheckCircle2 } from 'lucide-react';

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

  const seatPresets = [2, 4, 6, 8, 10];

  return (
    <Modal
      isOpen={show}
      onClose={onClose}
      title={editingTableId ? 'Edit Table' : 'Add New Dining Table'}
      description="Configure table identifier, seating capacity, and assign it to a floor section."
      maxWidth="md"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSaveTable}
            isLoading={isSaving}
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
          >
            {editingTableId ? 'Update Table' : 'Create Table'}
          </Button>
        </>
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
        <div>
          <label className="text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-stone-400" />
            <span>Floor Section / Area</span>
          </label>
          <select
            value={newTableConfig.areaId || (appData.areas[0]?.id ?? '')}
            onChange={(e) => setNewTableConfig({ ...newTableConfig, areaId: e.target.value })}
            className="w-full h-10 px-3 rounded-2xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 text-xs font-semibold text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 cursor-pointer"
          >
            {appData.areas.map((area: any) => (
              <option key={area.id} value={area.id}>
                {area.name}
              </option>
            ))}
          </select>
        </div>

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
        <div>
          <label className="text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5 block">
            Table Availability Status
          </label>
          <select
            value={newTableConfig.status || 'Available'}
            onChange={(e) => setNewTableConfig({ ...newTableConfig, status: e.target.value })}
            className="w-full h-10 px-3 rounded-2xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 text-xs font-semibold text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 cursor-pointer"
          >
            <option value="Available">🟢 Available</option>
            <option value="Reserved">🟡 Reserved</option>
            <option value="Occupied">🔴 Occupied</option>
          </select>
        </div>
      </form>
    </Modal>
  );
};
