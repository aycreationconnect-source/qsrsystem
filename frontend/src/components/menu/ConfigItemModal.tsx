import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { menuApi } from '../../api/menuApi';
import { Modal, Button } from '../ui';
import { cn } from '../../lib/utils';
import {
  Boxes,
  Plus,
  Trash2,
  Percent,
  CheckCircle2,
  Sparkles,
  Layers,
  X,
  ShieldCheck,
  Check,
  Search,
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
  const { appData, setAppData, refreshMenu, refreshInventory, refreshAddons } = useApp();
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'inventory' | 'addons' | 'taxes'>('inventory');

  // New Add-on Inline Creation State
  const [showAddAddonForm, setShowAddAddonForm] = useState(false);
  const [newAddonName, setNewAddonName] = useState('');
  const [newAddonPrice, setNewAddonPrice] = useState('');
  const [newAddonDesc, setNewAddonDesc] = useState('');
  const [isCreatingAddon, setIsCreatingAddon] = useState(false);
  const [addonError, setAddonError] = useState<string | null>(null);
  const [addonSearch, setAddonSearch] = useState('');

  // Taxes: Global Tax vs Manual Tax toggle
  const [useGlobalTax, setUseGlobalTax] = useState<boolean>(true);

  // Synchronize useGlobalTax whenever the modal opens or the item changes
  useEffect(() => {
    if (show && configItemIndex !== null && appData.menu[configItemIndex]) {
      const item = appData.menu[configItemIndex];
      if (item.useGlobalTax !== undefined && item.useGlobalTax !== null) {
        setUseGlobalTax(Boolean(item.useGlobalTax));
      } else if (item.taxes && item.taxes.length > 0) {
        setUseGlobalTax(false);
      } else {
        setUseGlobalTax(true);
      }
    }
  }, [show, configItemIndex, appData.menu]);

  if (!show || configItemIndex === null || !appData.menu[configItemIndex]) return null;

  const currentItem = appData.menu[configItemIndex];

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const validIngredients = ingredients.filter((i) => i.name && i.quantity);
      const validTaxes = useGlobalTax
        ? []
        : taxes.filter((t) => t.name?.trim() && t.rate !== '' && !isNaN(parseFloat(t.rate)));

      const totalManualTaxRate = validTaxes.reduce(
        (sum: number, t: any) => sum + (parseFloat(t.rate) || 0),
        0
      );
      const manualTaxName = validTaxes.map((t) => t.name.trim()).join(' + ');

      const newAppData = { ...appData };
      newAppData.menu[configItemIndex].useGlobalTax = useGlobalTax;
      newAppData.menu[configItemIndex].tax = useGlobalTax ? null : (validTaxes.length > 0 ? totalManualTaxRate : 0);
      newAppData.menu[configItemIndex].taxName = useGlobalTax ? null : (manualTaxName || null);
      newAppData.menu[configItemIndex].ingredients = validIngredients;
      newAppData.menu[configItemIndex].taxes = validTaxes;
      newAppData.menu[configItemIndex].addonIds = newItem.addonIds;

      if (currentItem && currentItem.id) {
        await menuApi.updateMenuItem(currentItem.id, {
          ...currentItem,
          addonIds: newItem.addonIds,
          useGlobalTax: useGlobalTax,
          taxes: validTaxes,
          tax: useGlobalTax ? null : (validTaxes.length > 0 ? totalManualTaxRate : 0),
          taxName: useGlobalTax ? null : (manualTaxName || null),
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

  const currentAddonIds = newItem.addonIds
    ? newItem.addonIds
        .split(',')
        .map((id: string) => id.trim())
        .filter(Boolean)
    : [];

  const selectedAddons = (appData.addons || []).filter((addon: any) =>
    currentAddonIds.includes(addon.id.toString())
  );
  const availableAddons = (appData.addons || []).filter(
    (addon: any) => !currentAddonIds.includes(addon.id.toString())
  );
  const filteredAvailableAddons = availableAddons.filter(
    (addon: any) =>
      !addonSearch.trim() ||
      addon.name.toLowerCase().includes(addonSearch.toLowerCase()) ||
      (addon.description && addon.description.toLowerCase().includes(addonSearch.toLowerCase()))
  );

  const toggleAddon = (addonId: string) => {
    let updatedIds = [...currentAddonIds];
    if (updatedIds.includes(addonId)) {
      updatedIds = updatedIds.filter((id) => id !== addonId);
    } else {
      updatedIds.push(addonId);
    }
    setNewItem({ ...newItem, addonIds: updatedIds.join(',') });
  };

  const handleCreateAddon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddonName.trim() || !newAddonPrice) {
      setAddonError('Add-on name and price are required.');
      return;
    }

    try {
      setIsCreatingAddon(true);
      setAddonError(null);

      const created = await menuApi.createAddon({
        name: newAddonName.trim(),
        price: parseFloat(newAddonPrice) || 0,
        description: newAddonDesc.trim() || undefined,
      });

      await refreshAddons();

      // Automatically attach the newly created add-on to the current item
      if (created && created.id) {
        const updatedIds = [...currentAddonIds, created.id.toString()];
        setNewItem({ ...newItem, addonIds: updatedIds.join(',') });
      }

      // Reset form
      setNewAddonName('');
      setNewAddonPrice('');
      setNewAddonDesc('');
      setShowAddAddonForm(false);
    } catch (err: any) {
      setAddonError(err.message || 'Failed to create add-on');
    } finally {
      setIsCreatingAddon(false);
    }
  };

  const globalTaxName = appData.settings?.globalTaxName || 'GST';
  const globalTaxRate = appData.settings?.globalTaxRate || '0';

  const navItems = [
    {
      id: 'inventory' as const,
      label: 'Inventory',
      count: `${ingredients.filter((i) => i.name).length}`,
      icon: Boxes,
    },
    {
      id: 'addons' as const,
      label: 'Add-ons',
      count: `${currentAddonIds.filter(Boolean).length}`,
      icon: Sparkles,
    },
    {
      id: 'taxes' as const,
      label: 'Taxes',
      count: useGlobalTax
        ? 'Global'
        : taxes.filter((t) => t.name && t.rate).length > 0
        ? `${taxes.filter((t) => t.name && t.rate).length} Manual`
        : '0% Tax',
      icon: Percent,
    },
  ];

  return (
    <Modal
      isOpen={show}
      onClose={onClose}
      title={`Configure: ${currentItem.name}`}
      description="Manage raw ingredient stock deduction, customer add-ons, and applicable taxes."
      maxWidth="4xl"
      bodyClassName="p-0 overflow-hidden"
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
            Save Configuration
          </Button>
        </>
      }
    >
      <div className="flex flex-col md:flex-row h-[560px] max-h-[75vh]">
        {/* Left Sidebar (Category Navigation style) */}
        <div className="w-full md:w-60 shrink-0 bg-stone-50/80 dark:bg-stone-900/60 border-b md:border-b-0 md:border-r border-stone-200/80 dark:border-stone-800 p-3 sm:p-4 flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto">
          <div className="hidden md:block pb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
              Configuration Sections
            </span>
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isSelected = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  'w-full text-left p-2.5 sm:p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 shrink-0 md:shrink select-none group',
                  isSelected
                    ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-500 ring-1 ring-amber-500/60 shadow-xs'
                    : 'bg-white dark:bg-stone-850/80 border-stone-200/80 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 hover:bg-stone-100/50 dark:hover:bg-stone-800'
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={cn(
                      'w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors',
                      isSelected
                        ? 'bg-amber-500 text-stone-950 shadow-xs'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 group-hover:text-stone-900 dark:group-hover:text-stone-200'
                    )}
                  >
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <span
                    className={cn(
                      'text-xs font-bold truncate',
                      isSelected
                        ? 'text-stone-900 dark:text-stone-100 font-extrabold'
                        : 'text-stone-700 dark:text-stone-300'
                    )}
                  >
                    {item.label}
                  </span>
                </div>

                <span
                  className={cn(
                    'text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0',
                    isSelected
                      ? 'bg-amber-200/70 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 border border-amber-300/60 dark:border-amber-700/60'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400'
                  )}
                >
                  {item.count}
                </span>
              </button>
            );
          })}

          {/* Dish Context Info (Desktop sidebar footer) */}
          <div className="hidden md:block mt-auto pt-3 border-t border-stone-200/70 dark:border-stone-800/80">
            <div className="p-2.5 rounded-xl bg-stone-100/70 dark:bg-stone-800/50 text-[11px] space-y-1">
              <div className="flex items-center justify-between text-stone-500 dark:text-stone-400">
                <span>Category</span>
                <span className="font-semibold text-stone-700 dark:text-stone-200 truncate max-w-[100px]">
                  {typeof currentItem.category === 'object' && currentItem.category
                    ? currentItem.category.name
                    : (currentItem.category || 'General')}
                </span>
              </div>
              <div className="flex items-center justify-between text-stone-500 dark:text-stone-400">
                <span>Base Price</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">
                  ₹{parseFloat(String(currentItem.price || 0)).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Configuration Form Area */}
        <div className="flex-1 min-w-0 p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* Section 1: Inventory (Raw Ingredients Deduction) */}
          {activeTab === 'inventory' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100 dark:border-stone-800/80">
                <div>
                  <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <Boxes className="w-4 h-4 text-amber-500" />
                    Raw Ingredients (Stock Deduction)
                  </h4>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    When this item is ordered at POS, the raw materials below will automatically deduct from inventory.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIngredients([...ingredients, { name: '', quantity: '', unit: 'pcs' }])}
                  leftIcon={<Plus className="w-3.5 h-3.5 text-amber-500" />}
                  className="shrink-0"
                >
                  Add Ingredient
                </Button>
              </div>

              <div className="space-y-2.5">
                {ingredients.map((ing, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-850 border border-stone-200/80 dark:border-stone-800 grid grid-cols-12 gap-2.5 items-center"
                  >
                    <div className="col-span-12 sm:col-span-6">
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
                          const match = appData.inventory.find(
                            (inv) => inv.item.toLowerCase() === e.target.value.toLowerCase()
                          );
                          if (match) newIng[i].unit = match.unit;
                          setIngredients(newIng);
                        }}
                        className="w-full h-9 px-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-750 text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                      />
                    </div>

                    <div className="col-span-5 sm:col-span-3">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1 block">
                        Qty per Dish
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

                    <div className="col-span-5 sm:col-span-2">
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

                    <div className="col-span-2 sm:col-span-1 flex justify-end pt-4">
                      <button
                        type="button"
                        onClick={() => setIngredients(ingredients.filter((_, idx) => idx !== i))}
                        className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title="Remove ingredient"
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
                    {inv.unit} (In Stock: {inv.stock} {inv.unit})
                  </option>
                ))}
              </datalist>
            </div>
          )}

          {/* Section 2: Add-ons */}
          {activeTab === 'addons' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100 dark:border-stone-800/80">
                <div>
                  <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-sky-500" />
                    Available Add-ons for {currentItem.name}
                  </h4>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    Select add-ons customers can choose with this item, or add a brand new add-on.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddAddonForm(!showAddAddonForm)}
                  leftIcon={<Plus className="w-3.5 h-3.5 text-sky-500" />}
                  className="shrink-0"
                >
                  {showAddAddonForm ? 'Cancel' : 'Add New Add-on'}
                </Button>
              </div>

              {/* Inline Add-on Creation Form */}
              {showAddAddonForm && (
                <form
                  onSubmit={handleCreateAddon}
                  className="p-3.5 rounded-2xl bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-900/60 space-y-3 animate-in fade-in"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-sky-950 dark:text-sky-200">
                      <Sparkles className="w-4 h-4 text-sky-600" />
                      <span>Create New Add-on</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAddAddonForm(false)}
                      className="p-1 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {addonError && (
                    <p className="text-xs text-rose-600 font-semibold">{addonError}</p>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                    <div className="sm:col-span-6">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1 block">
                        Add-on Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Extra Cheese, Hazelnut Syrup"
                        value={newAddonName}
                        onChange={(e) => setNewAddonName(e.target.value)}
                        required
                        className="w-full h-9 px-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1 block">
                        Price (₹) *
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        placeholder="30.00"
                        value={newAddonPrice}
                        onChange={(e) => setNewAddonPrice(e.target.value)}
                        required
                        className="w-full h-9 px-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-750 text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1 block">
                        Description (opt)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 1 slice"
                        value={newAddonDesc}
                        onChange={(e) => setNewAddonDesc(e.target.value)}
                        className="w-full h-9 px-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddAddonForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      isLoading={isCreatingAddon}
                      className="bg-sky-600 hover:bg-sky-700 text-white"
                    >
                      Save & Attach Add-on
                    </Button>
                  </div>
                </form>
              )}

              {/* Dual List: Selected Add-ons (Left) & Available Add-ons (Right) */}
              {appData.addons.length === 0 ? (
                <div className="p-8 text-center rounded-2xl border border-dashed border-stone-300 dark:border-stone-800 text-stone-400">
                  <Layers className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-xs font-semibold">No add-ons created yet.</p>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    Click "Add New Add-on" above to create extra toppings, sauces, or sides.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left Column: Selected Add-ons */}
                  <div className="p-3.5 rounded-2xl bg-stone-50/80 dark:bg-stone-900/50 border border-stone-200/80 dark:border-stone-800 flex flex-col min-h-[300px]">
                    <div className="flex items-center justify-between pb-2 border-b border-stone-200/70 dark:border-stone-800">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <div className="min-w-0">
                          <h5 className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">
                            Selected Add-ons
                          </h5>
                          <span className="text-[10px] text-stone-400 block truncate">
                            Active (click to remove)
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 shrink-0">
                        {selectedAddons.length}
                      </span>
                    </div>

                    <div className="flex-1 overflow-y-auto max-h-[340px] space-y-2 mt-2.5 pr-0.5">
                      {selectedAddons.length === 0 ? (
                        <div className="h-full min-h-[180px] flex flex-col items-center justify-center p-6 text-center rounded-xl border border-dashed border-stone-200 dark:border-stone-800 text-stone-400">
                          <Sparkles className="w-6 h-6 mb-1.5 opacity-30 text-emerald-500" />
                          <p className="text-xs font-semibold">No add-ons selected</p>
                          <p className="text-[10px] text-stone-400 mt-0.5">
                            Click any item from Available Add-ons to attach it here.
                          </p>
                        </div>
                      ) : (
                        selectedAddons.map((addon: any) => (
                          <div
                            key={addon.id}
                            onClick={() => toggleAddon(addon.id.toString())}
                            className="p-2.5 rounded-xl border border-emerald-500/40 bg-white dark:bg-stone-850 hover:border-rose-400 hover:bg-rose-50/40 dark:hover:bg-rose-950/30 transition-all cursor-pointer flex items-center justify-between gap-2 group shadow-2xs"
                            title="Click to remove from this dish"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center shrink-0 group-hover:bg-rose-100 dark:group-hover:bg-rose-900/60 group-hover:text-rose-600 transition-colors">
                                <Check className="w-3 h-3 group-hover:hidden" />
                                <X className="w-3 h-3 hidden group-hover:block" />
                              </div>
                              <div className="min-w-0">
                                <span className="text-xs font-bold text-stone-900 dark:text-stone-100 block truncate group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                                  {addon.name}
                                </span>
                                {addon.description && (
                                  <span className="text-[10px] text-stone-400 line-clamp-1 block">
                                    {addon.description}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-800/60">
                                ₹{parseFloat(addon.price).toFixed(2)}
                              </span>
                              <span className="p-1 rounded-lg text-stone-300 group-hover:text-rose-500 transition-colors">
                                <X className="w-3.5 h-3.5" />
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Right Column: Available Add-ons (Not Selected) */}
                  <div className="p-3.5 rounded-2xl bg-stone-50/80 dark:bg-stone-900/50 border border-stone-200/80 dark:border-stone-800 flex flex-col min-h-[300px]">
                    <div className="space-y-2 pb-2 border-b border-stone-200/70 dark:border-stone-800">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Layers className="w-4 h-4 text-sky-500 shrink-0" />
                          <div className="min-w-0">
                            <h5 className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">
                              Available Add-ons
                            </h5>
                            <span className="text-[10px] text-stone-400 block truncate">
                              Not selected (click to attach)
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 border border-stone-200/70 dark:border-stone-750 shrink-0">
                          {availableAddons.length}
                        </span>
                      </div>

                      {availableAddons.length > 3 && (
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Filter available..."
                            value={addonSearch}
                            onChange={(e) => setAddonSearch(e.target.value)}
                            className="w-full h-7 pl-7 pr-2 text-[11px] rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-sky-500"
                          />
                          <Search className="w-3 h-3 text-stone-400 absolute left-2 top-2" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 overflow-y-auto max-h-[340px] space-y-2 mt-2.5 pr-0.5">
                      {availableAddons.length === 0 ? (
                        <div className="h-full min-h-[180px] flex flex-col items-center justify-center p-6 text-center rounded-xl border border-dashed border-stone-200 dark:border-stone-800 text-stone-400">
                          <CheckCircle2 className="w-6 h-6 mb-1.5 opacity-30 text-emerald-500" />
                          <p className="text-xs font-semibold">All add-ons selected</p>
                          <p className="text-[10px] text-stone-400 mt-0.5">
                            Every available add-on is already attached to this dish.
                          </p>
                        </div>
                      ) : filteredAvailableAddons.length === 0 ? (
                        <div className="h-full min-h-[140px] flex flex-col items-center justify-center p-4 text-center text-stone-400">
                          <p className="text-xs">No matching unselected add-ons.</p>
                        </div>
                      ) : (
                        filteredAvailableAddons.map((addon: any) => (
                          <div
                            key={addon.id}
                            onClick={() => toggleAddon(addon.id.toString())}
                            className="p-2.5 rounded-xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-850 hover:border-sky-500 hover:bg-sky-50/40 dark:hover:bg-sky-950/30 transition-all cursor-pointer flex items-center justify-between gap-2 group shadow-2xs"
                            title="Click to attach to this dish"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-5 h-5 rounded-full bg-stone-100 dark:bg-stone-750 text-stone-400 group-hover:bg-sky-500 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                                <Plus className="w-3 h-3" />
                              </div>
                              <div className="min-w-0">
                                <span className="text-xs font-bold text-stone-800 dark:text-stone-200 block truncate group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                                  {addon.name}
                                </span>
                                {addon.description && (
                                  <span className="text-[10px] text-stone-400 line-clamp-1 block">
                                    {addon.description}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-xs font-extrabold text-stone-700 dark:text-stone-300 group-hover:text-sky-600 dark:group-hover:text-sky-400 px-2 py-0.5 rounded-lg bg-stone-50 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800">
                                ₹{parseFloat(addon.price).toFixed(2)}
                              </span>
                              <span className="p-1 rounded-lg text-stone-300 group-hover:text-sky-500 transition-colors">
                                <Plus className="w-3.5 h-3.5" />
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Section 3: Taxes (Global Tax Toggle vs Manual Tax) */}
          {activeTab === 'taxes' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="pb-3 border-b border-stone-100 dark:border-stone-800/80">
                <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <Percent className="w-4 h-4 text-emerald-500" />
                  Tax Configuration
                </h4>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  Configure whether to apply restaurant global tax or custom tax rates for this item.
                </p>
              </div>

              {/* Global Tax Toggle Card */}
              <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-850 border border-stone-200/80 dark:border-stone-800 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                      Apply Global Tax
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        useGlobalTax
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                          : 'bg-stone-200 text-stone-600 dark:bg-stone-800 dark:text-stone-400'
                      }`}
                    >
                      {useGlobalTax ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                    {useGlobalTax
                      ? `Default store global tax of ${globalTaxRate}% (${globalTaxName}) will be applied automatically.`
                      : 'Global tax is disabled for this dish. You can specify custom manual taxes below.'}
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                  <input
                    type="checkbox"
                    checked={useGlobalTax}
                    onChange={(e) => {
                      const active = e.target.checked;
                      setUseGlobalTax(active);
                      if (active) {
                        setTaxes([]);
                      }
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5.5 bg-stone-300 peer-focus:outline-none rounded-full peer dark:bg-stone-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              {/* When Global Tax is Active */}
              {useGlobalTax ? (
                <div className="p-6 text-center rounded-2xl border border-dashed border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300">
                  <ShieldCheck className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
                  <h5 className="text-xs font-bold">Global Tax Applied</h5>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 max-w-md mx-auto">
                    This item inherits the restaurant-wide tax rate: <strong>{globalTaxName} ({globalTaxRate}%)</strong>.
                    If you need custom rates or want this dish tax-exempt, turn off the Global Tax toggle above.
                  </p>
                </div>
              ) : (
                /* When Global Tax is Inactive: Allow Adding Manual Taxes */
                <div className="space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100">
                        Manual Tax Rates
                      </h4>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400">
                        Specify custom taxes for this item (or leave empty for 0% tax-free).
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

                  <div className="space-y-2">
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
                            placeholder="e.g. VAT, Special Cess, Luxury Tax"
                            value={t.name}
                            onChange={(e) => {
                              const newTaxes = [...taxes];
                              newTaxes[i].name = e.target.value;
                              setTaxes(newTaxes);
                            }}
                            className="w-full h-9 px-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-750 text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                          />
                        </div>

                        <div className="w-28">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1 block">
                            Rate (%)
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            placeholder="12.0"
                            value={t.rate}
                            onChange={(e) => {
                              const newTaxes = [...taxes];
                              newTaxes[i].rate = e.target.value;
                              setTaxes(newTaxes);
                            }}
                            className="w-full h-9 px-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-750 text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                          />
                        </div>

                        <div className="pt-4">
                          <button
                            type="button"
                            onClick={() => setTaxes(taxes.filter((_, idx) => idx !== i))}
                            className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                            title="Remove tax rate"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {taxes.length === 0 && (
                      <div className="p-8 text-center rounded-2xl border border-dashed border-stone-300 dark:border-stone-800 text-stone-400">
                        <Percent className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        <p className="text-xs font-semibold">No manual taxes added.</p>
                        <p className="text-[11px] text-stone-400 mt-0.5">
                          This item will be billed with 0% tax (tax-free). Click "Add Tax Rate" to specify a custom rate.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
