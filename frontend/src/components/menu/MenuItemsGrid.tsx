import React from 'react';
import { useApp } from '../../context/AppContext';
import { Button, Badge, Tooltip } from '../ui';
import { Plus, Settings2, Edit2, Trash2, UtensilsCrossed } from 'lucide-react';
import { cn } from '../../lib/utils';

interface MenuItemsGridProps {
  selectedCategory: string | null;
  onAddItem: () => void;
  onConfigItem: (item: any) => void;
  onEditItem: (item: any) => void;
  onDeleteItem: (item: any) => void;
}

export const MenuItemsGrid: React.FC<MenuItemsGridProps> = ({
  selectedCategory,
  onAddItem,
  onConfigItem,
  onEditItem,
  onDeleteItem,
}) => {
  const { appData } = useApp();

  if (!selectedCategory) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-stone-400">
        <UtensilsCrossed className="w-12 h-12 mb-3 opacity-30 stroke-1" />
        <h4 className="font-bold text-sm text-stone-700 dark:text-stone-300">
          No Category Selected
        </h4>
        <p className="text-xs mt-1 max-w-xs">
          Select a category from the left sidebar to manage its dishes, prices, and recipes.
        </p>
      </div>
    );
  }

  const items = (appData.menu || []).filter(
    (m: any) => m.category === selectedCategory && !m.isAddon
  );

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-stone-50/40 dark:bg-stone-950/20">
      {/* Top Header */}
      <div className="p-4 sm:p-5 bg-white dark:bg-stone-900 border-b border-stone-200/80 dark:border-stone-800 flex items-center justify-between shrink-0">
        <div>
          <h3 className="text-base font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <span>{selectedCategory}</span>
            <span className="text-xs font-semibold text-stone-400">({items.length} items)</span>
          </h3>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={onAddItem}
          leftIcon={<Plus className="w-4 h-4" />}
          className="font-bold"
        >
          Add Dish / Beverage
        </Button>
      </div>

      {/* Items Table Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {items.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center text-stone-400 text-xs">
            <span>No menu items created under "{selectedCategory}" yet.</span>
            <Button
              variant="outline"
              size="sm"
              onClick={onAddItem}
              className="mt-3 font-bold"
            >
              Add First Item
            </Button>
          </div>
        ) : (
          <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-stone-200/80 dark:border-stone-800 bg-stone-50 dark:bg-stone-850/60 text-stone-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4 w-12">#</th>
                  <th className="py-3 px-4">Item Name & Diet</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {items.map((item: any, i: number) => {
                  return (
                    <tr
                      key={item.id || i}
                      className="hover:bg-stone-50/60 dark:hover:bg-stone-800/40 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono text-stone-400 font-medium">
                        {i + 1}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {item.type === 'Non-Veg' ? (
                            <Badge variant="nonveg" size="sm">Non-Veg</Badge>
                          ) : item.type === 'Egg' ? (
                            <Badge variant="egg" size="sm">Egg</Badge>
                          ) : (
                            <Badge variant="veg" size="sm">Veg</Badge>
                          )}
                          <span className="font-bold text-stone-900 dark:text-stone-100">
                            {item.name}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-amber-600 dark:text-amber-400">
                        ₹{parseFloat(item.price.toString().replace('₹', '')).toFixed(2)}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={cn(
                            'text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider',
                            item.available !== false && item.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50'
                              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50'
                          )}
                        >
                          {item.available !== false && item.status === 'Active'
                            ? 'Available'
                            : 'Paused'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Tooltip content="Recipe & Ingredients" position="top">
                            <button
                              type="button"
                              onClick={() => onConfigItem(item)}
                              className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                            >
                              <Settings2 className="w-4 h-4" />
                            </button>
                          </Tooltip>

                          <Tooltip content="Edit Details" position="top">
                            <button
                              type="button"
                              onClick={() => onEditItem(item)}
                              className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </Tooltip>

                          <Tooltip content="Delete Item" position="top">
                            <button
                              type="button"
                              onClick={() => onDeleteItem(item)}
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
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
        )}
      </div>
    </div>
  );
};
