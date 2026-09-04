import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { menuApi } from '../../api/menuApi';
import { Modal, Button } from '../ui';
import {
  Boxes,
  Plus,
  Trash2,
  Percent,
  CheckCircle2,
  Sparkles,
  Layers,
} from 'lucide-react';

interface ConfigItemModalProps {
  show: boolean;
  onClose: () => void;
  configItemIndex: number | null;
  newItem: any;
  setNewItem: React.Dispatch<React.SetStateAction<any>>;
  ingredients: any[];
  setIngredients: React.Dispatch<React.SetStateAction<any[]>>;
  taxes: any[];
  setTaxes: React.Dispatch<React.SetStateAction<any[]>>;
}

export const ConfigItemModal: React.FC<ConfigItemModalProps> = ({
  show,
  onClose,
  configItemIndex,
  newItem,
  setNewItem,
  ingredients,
  setIngredients,
  taxes,
  setTaxes,
}) => {
  const { appData, setAppData, refreshMenu, refreshInventory } = useApp();
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'recipe' | 'addons' | 'taxes'>('recipe');

  if (!show || configItemIndex === null || !appData.menu[configItemIndex]) return null;

  const currentItem = appData.menu[configItemIndex];

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const validIngredients = ingredients.filter((i) => i.name && i.quantity);
      const validTaxes = taxes.filter((t) => t.name && t.rate);

      const newAppData = { ...appData };
      newAppData.menu[configItemIndex].tax = newItem.tax;
      newAppData.menu[configItemIndex].taxName = newItem.taxName;
      newAppData.menu[configItemIndex].ingredients = validIngredients;
      newAppData.menu[configItemIndex].taxes = validTaxes;

      if (currentItem && currentItem.id) {
        await menuApi.updateMenuItem(currentItem.id, {
          ...currentItem,
          addonIds: newItem.addonIds,
          taxes: validTaxes,
        });
        await refreshMenu();
        await refreshInventory();
      }

      setAppData(newAppData);
      onClose();
    } catch (e) {
      console.error('Failed to update config:', e);
    } finally {
      setIsSaving(false);
    }
  };

  const currentAddonIds = newItem.addonIds ? newItem.addonIds.split(',') : [];

  const toggleAddon = (addonId: string) => {
    let updatedIds = [...currentAddonIds];
    if (updatedIds.includes(addonId)) {
      updatedIds = updatedIds.filter((id) => id !== addonId);
    } else {
      updatedIds.push(addonId);
    }
    setNewItem({ ...newItem, addonIds: updatedIds.join(',') });
  };

  return (
    <Modal
      isOpen={show}
      onClose={onClose}
      title={`Recipe & Configuration: ${currentItem.name}`}
      description="Manage raw ingredient stock consumption, customer add-ons, and applicable tax rates."
      maxWidth="2xl"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            isLoading={isSaving}
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
          >
            Save Recipe & Settings
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-stone-100 dark:bg-stone-800/80 rounded-2xl">
          <button
            type="button"
            onClick={() => setActiveTab('recipe')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'recipe'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-sm'
                : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
            }`}
          >
            <Boxes className="w-3.5 h-3.5 text-amber-500" />
            <span>Recipe & Stock Consumption ({ingredients.filter((i) => i.name).length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('addons')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'addons'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-sm'
                : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-500" />
            <span>Modifiers & Add-ons ({currentAddonIds.filter(Boolean).length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('taxes')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'taxes'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-sm'
                : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
            }`}
          >
            <Percent className="w-3.5 h-3.5 text-emerald-500" />
            <span>Taxes & GST ({taxes.filter((t) => t.name).length})</span>
          </button>
        </div>

        {/* Tab 1: Recipe / Ingredients */}
        {activeTab === 'recipe' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100">
                  Ingredients Bill of Materials (BOM)
                </h4>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  When this item is ordered, the specified stock will automatically be deducted.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIngredients([...ingredients, { name: '', quantity: '', unit: 'pcs' }])}
                leftIcon={<Plus className="w-3.5 h-3.5 text-amber-500" />}
              >
                Add Ingredient
              </Button>
            </div>

            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {ingredients.map((ing, i) => (
                <div
                  key={i}
                  className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-850 border border-stone-200/80 dark:border-stone-800 grid grid-cols-12 gap-2.5 items-center"
                >
                  <div className="col-span-6">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1 block">
                      Ingredient Name
                    </label>
                    <input
                      type="text"
                      list="inventory-suggestions"
                      placeholder="e.g. Burger Buns, Milk, Coffee Beans"
                      value={ing.name}
                      onChange={(e) => {
                        const newIng = [...ingredients];
                        newIng[i].name = e.target.value;
                        // Auto match unit from inventory if possible
                        const match = appData.inventory.find(
                          (inv) => inv.item.toLowerCase() === e.target.value.toLowerCase()
                        );
                        if (match) newIng[i].unit = match.unit;
                        setIngredients(newIng);
                      }}
                      className="w-full h-9 px-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-750 text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                  </div>

                  <div className="col-span-3">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1 block">
                      Qty per dish
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="1"
                      value={ing.quantity}
                      onChange={(e) => {
                        const newIng = [...ingredients];
                        newIng[i].quantity = e.target.value;
                        setIngredients(newIng);
                      }}
                      className="w-full h-9 px-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-750 text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1 block">
                      Unit
                    </label>
                    <select
                      value={ing.unit || 'pcs'}
                      onChange={(e) => {
                        const newIng = [...ingredients];
                        newIng[i].unit = e.target.value;
                        setIngredients(newIng);
                      }}
                      className="w-full h-9 px-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-750 text-xs font-semibold text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 cursor-pointer"
                    >
                      <option value="pcs">pcs</option>
                      <option value="g">g</option>
                      <option value="kg">kg</option>
                      <option value="ml">ml</option>
                      <option value="L">L</option>
                      <option value="slice">slice</option>
                      <option value="portion">portion</option>
                    </select>
                  </div>

                  <div className="col-span-1 flex justify-end pt-4">
                    <button
                      type="button"
                      onClick={() => setIngredients(ingredients.filter((_, idx) => idx !== i))}
                      className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {ingredients.length === 0 && (
                <div className="p-8 text-center rounded-2xl border border-dashed border-stone-300 dark:border-stone-800 text-stone-400">
                  <Boxes className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-xs font-semibold">No raw ingredients attached to this dish yet.</p>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    Click "Add Ingredient" to deduct stock automatically when billed.
                  </p>
                </div>
              )}
            </div>

            <datalist id="inventory-suggestions">
              {appData.inventory.map((inv, idx) => (
                <option key={idx} value={inv.item}>
                  {inv.unit} (Current: {inv.stock} {inv.unit})
                </option>
              ))}
            </datalist>
          </div>
        )}

        {/* Tab 2: Add-ons & Modifiers */}
        {activeTab === 'addons' && (
          <div className="space-y-3">
            <div>
              <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100">
                Allowable Add-ons for {currentItem.name}
              </h4>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                Cashiers will be able to customize this item with the selected modifiers during checkout.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
              {appData.addons.length === 0 ? (
                <div className="col-span-2 p-8 text-center rounded-2xl border border-dashed border-stone-300 dark:border-stone-800 text-stone-400">
                  <Layers className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-xs font-semibold">No global add-ons created yet.</p>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    Go to Menu Management → Add-ons & Modifiers tab to create extra toppings or shots.
                  </p>
                </div>
              ) : (
                appData.addons.map((addon: any) => {
                  const isSelected = currentAddonIds.includes(addon.id.toString());
                  return (
                    <div
                      key={addon.id}
                      onClick={() => toggleAddon(addon.id.toString())}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50/60 dark:bg-amber-950/20 shadow-sm'
                          : 'border-stone-200/80 dark:border-stone-800 bg-stone-50 dark:bg-stone-850 hover:border-stone-300 dark:hover:border-stone-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}} // Handled by parent div
                          className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 cursor-pointer"
                        />
                        <div>
                          <span className="text-xs font-bold text-stone-900 dark:text-stone-100 block">
                            {addon.name}
                          </span>
                          {addon.description && (
                            <span className="text-[10px] text-stone-400 line-clamp-1">
                              {addon.description}
                            </span>
                          )}
                        </div>
                      </div>

                      <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800">
                        ₹{parseFloat(addon.price).toFixed(2)}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Taxes */}
        {activeTab === 'taxes' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100">
                  Item-Specific Tax Breakdown
                </h4>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  Override or specify applicable taxes (e.g. CGST, SGST, VAT) for this specific dish.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTaxes([...taxes, { name: '', rate: '' }])}
                leftIcon={<Plus className="w-3.5 h-3.5 text-emerald-500" />}
              >
                Add Tax Rate
              </Button>
            </div>

            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {taxes.map((t, i) => (
                <div
                  key={i}
                  className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-850 border border-stone-200/80 dark:border-stone-800 flex items-center gap-3"
                >
                  <div className="flex-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1 block">
                      Tax Label
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. CGST, SGST, VAT"
                      value={t.name}
                      onChange={(e) => {
                        const newTaxes = [...taxes];
                        newTaxes[i].name = e.target.value;
                        setTaxes(newTaxes);
                      }}
                      className="w-full h-9 px-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-750 text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                  </div>

                  <div className="w-28">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1 block">
                      Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="2.5"
                      value={t.rate}
                      onChange={(e) => {
                        const newTaxes = [...taxes];
                        newTaxes[i].rate = e.target.value;
                        setTaxes(newTaxes);
                      }}
                      className="w-full h-9 px-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-750 text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                  </div>

                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={() => setTaxes(taxes.filter((_, idx) => idx !== i))}
                      className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {taxes.length === 0 && (
                <div className="p-8 text-center rounded-2xl border border-dashed border-stone-300 dark:border-stone-800 text-stone-400">
                  <Percent className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-xs font-semibold">No custom taxes added.</p>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    Standard global tax configured in Settings will apply.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
