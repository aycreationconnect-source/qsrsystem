import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { Addon } from '../../types/app.types';
import { Button, Tooltip, Input } from '../ui';
import { Sparkles, Plus, Search, Edit2, Trash2, Layers } from 'lucide-react';

interface AddonsManagementProps {
  onAddAddon: () => void;
  onEditAddon: (addon: Addon) => void;
  onDeleteAddon: (addon: Addon) => void;
}

export const AddonsManagement: React.FC<AddonsManagementProps> = ({
  onAddAddon,
  onEditAddon,
  onDeleteAddon,
}) => {
  const { appData } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAddons = appData.addons.filter((addon: Addon) => {
    const q = searchQuery.toLowerCase();
    return (
      addon.name.toLowerCase().includes(q) ||
      (addon.description && addon.description.toLowerCase().includes(q))
    );
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-5 sm:p-6 shadow-sm">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-stone-100 dark:border-stone-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-extrabold text-stone-900 dark:text-stone-100">
                Add-ons & Modifiers
              </h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300">
                {appData.addons.length} Total
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Custom choices that can be added to dishes during ordering (toppings, flavors, dips).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-full sm:w-64">
            <Input
              placeholder="Search add-ons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={onAddAddon}
            leftIcon={<Plus className="w-4 h-4" />}
            className="shrink-0 font-bold"
          >
            Create Add-on
          </Button>
        </div>
      </div>

      {/* Add-ons Data Table */}
      <div className="flex-1 overflow-y-auto mt-4 pr-1">
        {filteredAddons.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-stone-400">
            <div className="w-14 h-14 rounded-3xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center mb-3">
              <Layers className="w-7 h-7 stroke-1" />
            </div>
            <h4 className="text-sm font-bold text-stone-700 dark:text-stone-300">
              {searchQuery ? 'No add-ons matched your search' : 'No Add-ons Created Yet'}
            </h4>
            <p className="text-xs text-stone-400 mt-1 max-w-sm">
              {searchQuery
                ? 'Try a different keyword or clear the search filter.'
                : 'Add modifiers like Extra Cheese, Caramel Syrup, Almond Milk, or Dips to customize orders.'}
            </p>
            {!searchQuery && (
              <Button
                variant="outline"
                size="sm"
                onClick={onAddAddon}
                className="mt-4"
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Create First Add-on
              </Button>
            )}
          </div>
        ) : (
          <div className="border border-stone-200/80 dark:border-stone-800 rounded-2xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 dark:bg-stone-850/60 border-b border-stone-200/80 dark:border-stone-800 text-[11px] font-extrabold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4">Modifier Name</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800/80 text-xs">
                {filteredAddons.map((addon: Addon, i: number) => (
                  <tr
                    key={addon.id}
                    className="hover:bg-amber-50/30 dark:hover:bg-amber-950/10 transition-colors"
                  >
                    <td className="py-3 px-4 text-center font-bold text-stone-400">
                      {i + 1}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                        <span>{addon.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-stone-500 dark:text-stone-400 max-w-xs truncate">
                      {addon.description || '—'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50">
                        ₹{parseFloat(String(addon.price)).toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <Tooltip content="Edit modifier" position="top" align="end">
                          <button
                            type="button"
                            onClick={() => onEditAddon(addon)}
                            className="p-1.5 rounded-xl text-stone-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </Tooltip>

                        <Tooltip content="Delete modifier" position="top" align="end">
                          <button
                            type="button"
                            onClick={() => onDeleteAddon(addon)}
                            className="p-1.5 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
