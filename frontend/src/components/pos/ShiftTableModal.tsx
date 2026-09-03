import React from 'react';
import { useApp } from '../../context/AppContext';
import { usePOS } from '../../context/POSContext';
import type { Table } from '../../types/app.types';
import { Modal, Button } from '../ui';
import { Armchair } from 'lucide-react';

export const ShiftTableModal: React.FC = () => {
  const { posMode, appData } = useApp();
  const {
    showShiftTableModal,
    setShowShiftTableModal,
    selectedTableId,
    setSelectedTableId,
    tableOrders,
    setTableOrders,
    setTableStartTimes,
  } = usePOS();

  if (!showShiftTableModal || posMode !== 'table' || !selectedTableId) return null;

  const currentTable = appData.tables.find((t: Table) => String(t.id) === selectedTableId);

  const emptyTables = appData.tables.filter(
    (t: Table) =>
      String(t.id) !== selectedTableId &&
      (!tableOrders[t.id] ||
        (tableOrders[t.id].activeCart.length === 0 && tableOrders[t.id].savedOrders.length === 0))
  );

  const areas = appData.areas || [];
  const tablesByArea = emptyTables.reduce((acc: any, table: Table) => {
    const area = areas.find((a: any) => a.id === table.areaId) || { name: 'Main Floor' };
    if (!acc[area.name]) acc[area.name] = [];
    acc[area.name].push(table);
    return acc;
  }, {});

  const handleShiftToTable = (targetTable: Table) => {
    setTableOrders((prev) => {
      const newOrders = { ...prev };
      newOrders[targetTable.id] = newOrders[selectedTableId];
      delete newOrders[selectedTableId];
      return newOrders;
    });
    setTableStartTimes((prev) => {
      const newTimes = { ...prev };
      if (newTimes[selectedTableId]) {
        newTimes[targetTable.id] = newTimes[selectedTableId];
        delete newTimes[selectedTableId];
      }
      return newTimes;
    });
    setSelectedTableId(String(targetTable.id));
    setShowShiftTableModal(false);
  };

  return (
    <Modal
      isOpen={showShiftTableModal}
      onClose={() => setShowShiftTableModal(false)}
      title="Transfer / Shift Table"
      description={`Move active order from ${currentTable?.name || 'Table'} to an available table.`}
      maxWidth="md"
    >
      <div className="space-y-4 py-2">
        {emptyTables.length === 0 ? (
          <div className="p-8 text-center text-xs text-stone-400">
            No empty tables available right now to transfer this order.
          </div>
        ) : (
          <div className="max-h-72 overflow-y-auto space-y-4 pr-1">
            {Object.entries(tablesByArea).map(([areaName, tbls]: [string, any]) => (
              <div key={areaName}>
                <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400 mb-2">
                  {areaName}
                </h4>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {tbls.map((t: Table) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleShiftToTable(t)}
                      className="p-3 rounded-xl border border-stone-200 dark:border-stone-750 bg-stone-50 dark:bg-stone-850 hover:bg-amber-50 hover:border-amber-500 dark:hover:bg-amber-950/30 text-stone-900 dark:text-stone-100 font-bold text-xs transition-all flex flex-col items-center justify-center gap-1 active:scale-95 cursor-pointer"
                    >
                      <Armchair className="w-4 h-4 text-amber-500" />
                      <span>{t.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end pt-3 border-t border-stone-100 dark:border-stone-800">
          <Button variant="outline" size="sm" onClick={() => setShowShiftTableModal(false)}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
};
