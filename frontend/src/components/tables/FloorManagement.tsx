import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AreaModal } from './AreaModal';
import { TableModal } from './TableModal';
import { Button } from '../ui';
import { Plus, Armchair, Edit2, Layers, MapPin } from 'lucide-react';

export const FloorManagement: React.FC = () => {
  const { appData } = useApp();

  const [showAddAreaModal, setShowAddAreaModal] = useState(false);
  const [editingAreaId, setEditingAreaId] = useState<number | null>(null);
  const [newArea, setNewArea] = useState<{ name: string; description: string }>({
    name: '',
    description: '',
  });

  const [showAddTableConfigModal, setShowAddTableConfigModal] = useState(false);
  const [editingTableId, setEditingTableId] = useState<number | string | null>(null);
  const [newTableConfig, setNewTableConfig] = useState<any>({
    name: '',
    seats: 4,
    status: 'Available',
    areaId: '',
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Armchair className="w-5 h-5 text-amber-500" />
            <span>Floor & Table Architecture</span>
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Configure dining sections, seating capacities, and table names for waiter ordering.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditingAreaId(null);
              setNewArea({ name: '', description: '' });
              setShowAddAreaModal(true);
            }}
            leftIcon={<Layers className="w-4 h-4" />}
            className="font-bold"
          >
            Add Section / Area
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setEditingTableId(null);
              setNewTableConfig({
                name: '',
                seats: 4,
                status: 'Available',
                areaId: appData.areas?.[0]?.id || '',
              });
              setShowAddTableConfigModal(true);
            }}
            leftIcon={<Plus className="w-4 h-4" />}
            className="font-bold"
          >
            Add Table
          </Button>
        </div>
      </div>

      {/* Areas & Tables Grid */}
      {appData.areas?.length === 0 ? (
        <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-12 text-center text-stone-400 text-xs">
          <Layers className="w-12 h-12 mx-auto mb-3 opacity-30 stroke-1" />
          <h4 className="font-bold text-sm text-stone-700 dark:text-stone-300">
            No Floor Areas Configured
          </h4>
          <p className="mt-1 max-w-xs mx-auto">
            Create your first area (such as "Main Dining", "AC Hall", or "Outdoor Patio").
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setEditingAreaId(null);
              setNewArea({ name: '', description: '' });
              setShowAddAreaModal(true);
            }}
            className="mt-4 font-bold"
          >
            Create Area First
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {appData.areas?.map((area: any) => {
            const areaTables = (appData.tables || []).filter((t: any) => t.areaId === area.id);

            return (
              <div
                key={area.id}
                className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4"
              >
                {/* Area Header */}
                <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-extrabold text-stone-900 dark:text-stone-100">
                        {area.name}
                      </h3>
                      <span className="text-[11px] text-stone-400">
                        {areaTables.length} Tables Registered
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingAreaId(area.id);
                        setNewArea({ name: area.name, description: area.description || '' });
                        setShowAddAreaModal(true);
                      }}
                      leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                      className="text-xs"
                    >
                      Edit Section
                    </Button>
                  </div>
                </div>

                {/* Table Cards Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {areaTables.map((t: any) => (
                    <div
                      key={t.id}
                      onClick={() => {
                        setEditingTableId(t.id);
                        setNewTableConfig({
                          name: t.name,
                          seats: t.seats,
                          status: t.status,
                          areaId: t.areaId,
                        });
                        setShowAddTableConfigModal(true);
                      }}
                      className="p-4 rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-850 hover:bg-amber-50/40 hover:border-amber-400 dark:hover:bg-amber-950/20 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer group active:scale-95"
                    >
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-stone-800 shadow-sm flex items-center justify-center text-amber-600 group-hover:scale-105 transition-transform">
                        <Armchair className="w-5 h-5" />
                      </div>

                      <div className="text-center">
                        <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">
                          {t.name}
                        </h4>
                        <span className="text-[10px] text-stone-400 font-medium">
                          {t.seats || 4} Seats
                        </span>
                      </div>
                    </div>
                  ))}

                  {/* Add Table Quick Tile */}
                  <button
                    type="button"
                    onClick={() => {
                      setEditingTableId(null);
                      setNewTableConfig({
                        name: '',
                        seats: 4,
                        status: 'Available',
                        areaId: area.id,
                      });
                      setShowAddTableConfigModal(true);
                    }}
                    className="p-4 rounded-2xl border-2 border-dashed border-stone-200 dark:border-stone-800 hover:border-amber-400 text-stone-400 hover:text-amber-600 flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-5 h-5" />
                    <span className="text-xs font-bold">+ New Table</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <AreaModal
        show={showAddAreaModal}
        onClose={() => setShowAddAreaModal(false)}
        editingAreaId={editingAreaId}
        newArea={newArea}
        setNewArea={setNewArea}
      />

      <TableModal
        show={showAddTableConfigModal}
        onClose={() => setShowAddTableConfigModal(false)}
        editingTableId={editingTableId}
        newTableConfig={newTableConfig}
        setNewTableConfig={setNewTableConfig}
      />
    </div>
  );
};
