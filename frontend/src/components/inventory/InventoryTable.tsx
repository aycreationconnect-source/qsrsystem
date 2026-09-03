import React from 'react';
import { useApp } from '../../context/AppContext';
import type { InventoryItem } from '../../types/app.types';
import { Tooltip } from '../ui';
import { History, Edit2, AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface InventoryTableProps {
  onUpdateStock: (index: number) => void;
  onViewHistory: (index: number) => void;
}

export const InventoryTable: React.FC<InventoryTableProps> = ({
  onUpdateStock,
  onViewHistory,
}) => {
  const { appData } = useApp();

  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl overflow-hidden shadow-sm">
      <table className="w-full text-left border-collapse text-xs sm:text-sm">
        <thead>
          <tr className="border-b border-stone-200/80 dark:border-stone-800 bg-stone-50 dark:bg-stone-850/60 text-stone-400 font-bold uppercase tracking-wider text-[10px]">
            <th className="py-3 px-4">Raw Ingredient / Item</th>
            <th className="py-3 px-4">Current Stock</th>
            <th className="py-3 px-4">Min Threshold</th>
            <th className="py-3 px-4">Stock Health</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
          {appData.inventory.map((item: InventoryItem, i: number) => {
            const isOutOfStock = item.stock <= 0;
            const isLowStock = !isOutOfStock && item.stock <= item.threshold;

            return (
              <tr
                key={i}
                className="hover:bg-stone-50/60 dark:hover:bg-stone-800/40 transition-colors"
              >
                <td className="py-3.5 px-4 font-bold text-stone-900 dark:text-stone-100">
                  {item.item}
                </td>

                <td className="py-3.5 px-4 font-mono font-bold text-stone-800 dark:text-stone-200">
                  {isOutOfStock ? (
                    <span className="text-rose-600 inline-flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      0 {item.unit}
                    </span>
                  ) : (
                    `${item.stock} ${item.unit}`
                  )}
                </td>

                <td className="py-3.5 px-4 text-stone-400 font-mono">
                  {item.threshold} {item.unit}
                </td>

                <td className="py-3.5 px-4">
                  <span
                    className={cn(
                      'text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider inline-flex items-center gap-1',
                      isOutOfStock
                        ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200'
                        : isLowStock
                        ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200'
                    )}
                  >
                    {isOutOfStock ? 'Depleted' : isLowStock ? 'Low Stock' : 'Optimal'}
                  </span>
                </td>

                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Tooltip content="Stock Movement History" position="top">
                      <button
                        type="button"
                        onClick={() => onViewHistory(i)}
                        className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                      >
                        <History className="w-4 h-4" />
                      </button>
                    </Tooltip>

                    <Tooltip content="Update Current Stock" position="top">
                      <button
                        type="button"
                        onClick={() => onUpdateStock(i)}
                        className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </Tooltip>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
