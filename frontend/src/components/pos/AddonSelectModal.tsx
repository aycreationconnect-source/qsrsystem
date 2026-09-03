import React from 'react';
import { useApp } from '../../context/AppContext';
import { usePOS } from '../../context/POSContext';
import { Modal, Button } from '../ui';
import { Check } from 'lucide-react';
import { cn } from '../../lib/utils';

export const AddonSelectModal: React.FC = () => {
  const { appData } = useApp();
  const {
    addonSelectionItem,
    setAddonSelectionItem,
    selectedAddonIds,
    setSelectedAddonIds,
    handleAddToCart,
  } = usePOS();

  if (!addonSelectionItem) return null;

  const handleClose = () => {
    setAddonSelectionItem(null);
    setSelectedAddonIds([]);
  };

  const handleSkip = () => {
    const baseItem = { ...addonSelectionItem };
    handleClose();
    handleAddToCart(baseItem, true);
  };

  const handleConfirm = () => {
    let totalAddonPrice = 0;
    const addonNames: string[] = [];
    selectedAddonIds.forEach((id) => {
      const addon = appData.addons.find((a: any) => a.id.toString() === id.trim());
      if (addon) {
        totalAddonPrice += parseFloat(addon.price.toString().replace('₹', ''));
        addonNames.push(addon.name);
      }
    });

    const originalPrice = parseFloat(addonSelectionItem.price.toString().replace('₹', ''));
    const modifiedItem = {
      ...addonSelectionItem,
      name:
        addonNames.length > 0
          ? `${addonSelectionItem.name} (${addonNames.join(', ')})`
          : addonSelectionItem.name,
      price: `₹${(originalPrice + totalAddonPrice).toFixed(2)}`,
    };

    handleClose();
    handleAddToCart(modifiedItem, true);
  };

  const addonList = addonSelectionItem.addonIds
    ? addonSelectionItem.addonIds.split(',').map((id: string) => {
        const addon = appData.addons.find((a: any) => a.id.toString() === id.trim());
        return { id: id.trim(), addon };
      }).filter((x: any) => x.addon)
    : [];

  return (
    <Modal
      isOpen={!!addonSelectionItem}
      onClose={handleClose}
      title="Customize Item Add-ons"
      description={`Select optional toppings, sides or modifiers for ${addonSelectionItem.name}`}
      maxWidth="md"
    >
      <div className="space-y-3 py-2">
        <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
          {addonList.map(({ id, addon }: any) => {
            const isSelected = selectedAddonIds.includes(id);
            return (
              <div
                key={id}
                onClick={() => {
                  if (isSelected) {
                    setSelectedAddonIds(selectedAddonIds.filter((x) => x !== id));
                  } else {
                    setSelectedAddonIds([...selectedAddonIds, id]);
                  }
                }}
                className={cn(
                  'p-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer select-none',
                  isSelected
                    ? 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-500 ring-1 ring-amber-500'
                    : 'bg-stone-50 dark:bg-stone-850 border-stone-200/80 dark:border-stone-750 hover:border-stone-300'
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'w-5 h-5 rounded-md flex items-center justify-center border transition-colors',
                      isSelected
                        ? 'bg-amber-500 border-amber-600 text-stone-950'
                        : 'border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800'
                    )}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">
                    {addon.name}
                  </span>
                </div>

                <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                  +₹{parseFloat(addon.price.toString().replace('₹', '')).toFixed(2)}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100 dark:border-stone-800">
          <Button variant="ghost" size="sm" onClick={handleSkip}>
            Skip Add-ons
          </Button>
          <Button variant="primary" size="md" onClick={handleConfirm} className="font-bold">
            Add Customized to Cart
          </Button>
        </div>
      </div>
    </Modal>
  );
};
