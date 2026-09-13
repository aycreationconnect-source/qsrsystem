import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { menuApi } from '../../api/menuApi';
import { inventoryApi } from '../../api/inventoryApi';
import { Modal, Button, Select, type SelectOption } from '../ui';
import { toast } from '../../context/ToastContext';
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

const INGREDIENT_UNIT_OPTIONS: SelectOption[] = [
  { label: 'Pieces (pcs)', value: 'pcs', badge: 'Count' },
  { label: 'Grams (g)', value: 'g', badge: 'Weight' },
  { label: 'Kilograms (kg)', value: 'kg', badge: 'Weight' },
  { label: 'Milliliters (ml)', value: 'ml', badge: 'Volume' },
  { label: 'Liters (L)', value: 'L', badge: 'Volume' },
  { label: 'Slices (slice)', value: 'slice', badge: 'Portion' },
  { label: 'Portions (portion)', value: 'portion', badge: 'Portion' },
  { label: 'Boxes (box)', value: 'box', badge: 'Package' },
];

const parsePrice = (val: any): number => {
  if (val === null || val === undefined) return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  const cleaned = String(val).replace(/₹/g, '').replace(/,/g, '').trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
};

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

  // Inventory Raw Materials State
  const [rawSearch, setRawSearch] = useState('');
  const [selectedInvCategory, setSelectedInvCategory] = useState('All');
  const [invCategories, setInvCategories] = useState<string[]>([]);

  useEffect(() => {
    if (show) {
      inventoryApi
        .getCategories()
        .then((cats) => {
          if (Array.isArray(cats) && cats.length > 0) {
            setInvCategories(cats.map((c) => c.name));
          }
        })
        .catch((err) => {
          console.error('Failed to load inventory categories:', err);
        });
    }
  }, [show]);

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
          ingredients: validIngredients,
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
      toast.success(`Configuration for "${currentItem.name}" saved successfully!`);
      onClose();
    } catch (e: any) {
      console.error('Failed to update config:', e);
      toast.error(e?.message || 'Failed to save configuration.');
    } finally {
      setIsSaving(false);
    }
  };

  // Computed Inventory Categories & Filtered Available Raw Materials
  const allInvCategories = Array.from(
    new Set([
      ...invCategories,
      ...(appData.inventory || []).map((i) => i.category).filter(Boolean) as string[],
    ])
  );

  const filteredAvailableRawItems = (appData.inventory || []).filter((item) => {
    const matchesCategory =
      selectedInvCategory === 'All' || item.category === selectedInvCategory;
    const matchesSearch =
      !rawSearch.trim() ||
      item.item.toLowerCase().includes(rawSearch.toLowerCase()) ||
      (item.category && item.category.toLowerCase().includes(rawSearch.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleAttachIngredient = (rawItem: any) => {
    const exists = ingredients.some(
      (ing) => ing.name?.toLowerCase().trim() === rawItem.item?.toLowerCase().trim()
    );
    if (exists) {
      toast.info(`"${rawItem.item}" is already attached.`);
      return;
    }
    setIngredients((prev) => [
      ...prev,
      {
        name: rawItem.item,
        quantity: '1',
        unit: rawItem.unit || 'pcs',
      },
    ]);
    toast.success(`Attached "${rawItem.item}" to recipe.`);
  };

  const handleRemoveIngredient = (indexToRemove: number) => {
    setIngredients((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleAddCustomIngredient = () => {
    const hasEmpty = ingredients.some((ing) => !ing.name || !ing.name.trim());
    if (hasEmpty) {
      toast.warning('Please fill in the previous ingredient name before adding another one.');
      return;
    }
    setIngredients((prev) => [...prev, { name: '', quantity: '1', unit: 'pcs' }]);
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
        toast.success(`Add-on "${created.name}" created and attached!`);
      }

      // Reset form
      setNewAddonName('');
      setNewAddonPrice('');
      setNewAddonDesc('');
      setShowAddAddonForm(false);
    } catch (err: any) {
      const msg = err.message || 'Failed to create add-on';
      setAddonError(msg);
      toast.error(msg);
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
      maxWidth="5xl"
      className="sm:max-w-5xl md:max-w-6xl w-full h-[90vh] max-h-[92vh] flex flex-col"
      bodyClassName="p-0 overflow-hidden flex-1 min-h-0"
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
      <div className="flex flex-col md:flex-row h-full min-h-0 overflow-hidden">
        {/* Left Sidebar (Category Navigation style) */}
        <div className="w-full md:w-56 shrink-0 bg-stone-50/80 dark:bg-stone-900/60 border-b md:border-b-0 md:border-r border-stone-200/80 dark:border-stone-800 p-3 sm:p-4 flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto h-full min-h-0">
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
                  ₹{parsePrice(currentItem?.price ?? newItem?.price).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Configuration Form Area */}
        <div className="flex-1 min-w-0 h-full overflow-y-auto p-4 sm:p-5 pb-8 space-y-4">
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
                  onClick={handleAddCustomIngredient}
                  leftIcon={<Plus className="w-3.5 h-3.5 text-amber-500" />}
                  className="shrink-0"
                >
                  Add Custom Ingredient
                </Button>
              </div>

              {/* Dual Panel: Selected Ingredients (Left) vs Available Raw Materials (Right) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Left Column: Selected Ingredients */}
                <div className="p-3.5 rounded-2xl bg-stone-50/80 dark:bg-stone-900/50 border border-stone-200/80 dark:border-stone-800 flex flex-col h-[460px] sm:h-[480px] lg:h-[500px] max-h-[calc(90vh-230px)]">
                  <div className="flex items-center justify-between pb-2 border-b border-stone-200/70 dark:border-stone-800 shrink-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <h5 className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">
                        Selected Ingredients
                      </h5>
                    </div>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 shrink-0">
                      {ingredients.length} Attached
                    </span>
                  </div>

                  <div className="flex-1 min-h-0 overflow-y-auto space-y-2.5 mt-2.5 pr-1">
                    {ingredients.length === 0 ? (
                      <div className="h-full min-h-[220px] flex flex-col items-center justify-center p-6 text-center rounded-xl border border-dashed border-stone-200 dark:border-stone-800 text-stone-400">
                        <Boxes className="w-8 h-8 mb-2 opacity-30 text-amber-500" />
                        <p className="text-xs font-semibold text-stone-700 dark:text-stone-300">No ingredients attached</p>
                        <p className="text-[11px] text-stone-400 mt-1 max-w-[220px]">
                          Click "+ Attach" on any raw material from the right panel, or add a custom ingredient.
                        </p>
                      </div>
                    ) : (
                      ingredients.map((ing, i) => {
                        const matchedInv = (appData.inventory || []).find(
                          (inv) => inv.item?.toLowerCase().trim() === ing.name?.toLowerCase().trim()
                        );

                        return (
                          <div
                            key={i}
                            className="p-3 rounded-2xl bg-white dark:bg-stone-850 border border-emerald-500/30 dark:border-emerald-500/25 hover:border-emerald-500/60 shadow-2xs space-y-2.5 transition-all"
                          >
                            {/* Row 1: Header / Ingredient Name */}
                            <div className="flex items-center justify-between gap-2">
                              {matchedInv ? (
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center shrink-0">
                                    <Check className="w-3.5 h-3.5" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                                        {ing.name}
                                      </span>
                                      {matchedInv.category && (
                                        <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400">
                                          {matchedInv.category}
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-[10px] text-stone-400 dark:text-stone-500 block">
                                      Current Stock: <strong className="font-semibold text-stone-700 dark:text-stone-300">{matchedInv.stock} {matchedInv.unit}</strong>
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex-1 min-w-0">
                                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1 block">
                                    Ingredient Name
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="e.g. Burger Buns, Milk, Coffee"
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
                                    className={cn(
                                      'w-full h-8 px-2.5 rounded-xl bg-stone-50 dark:bg-stone-900 border text-xs font-semibold text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-1',
                                      !ing.name?.trim()
                                        ? 'border-amber-400/90 dark:border-amber-500/80 ring-1 ring-amber-500/20 focus:ring-amber-500 focus:border-amber-500'
                                        : 'border-stone-200 dark:border-stone-750 focus:ring-amber-500'
                                    )}
                                  />
                                </div>
                              )}

                              <button
                                type="button"
                                onClick={() => handleRemoveIngredient(i)}
                                className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer shrink-0 ml-2"
                                title="Remove ingredient from dish"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Row 2: Qty Per Dish & Unit Dropdown */}
                            <div className="grid grid-cols-12 gap-2 pt-1 border-t border-stone-100 dark:border-stone-800">
                              <div className="col-span-6">
                                <label className="text-[9px] font-bold uppercase tracking-wider text-stone-400 mb-1 block">
                                  Qty Per Dish
                                </label>
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  placeholder="1"
                                  value={ing.quantity}
                                  onChange={(e) => {
                                    const newIng = [...ingredients];
                                    newIng[i].quantity = e.target.value;
                                    setIngredients(newIng);
                                  }}
                                  className="w-full min-h-0 h-8 px-2.5 rounded-xl bg-stone-50/80 dark:bg-stone-900/90 border border-stone-200 dark:border-stone-750 text-xs font-bold text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                              </div>

                              <div className="col-span-6">
                                <label className="text-[9px] font-bold uppercase tracking-wider text-stone-400 mb-1 block">
                                  Unit
                                </label>
                                <Select
                                  options={INGREDIENT_UNIT_OPTIONS}
                                  value={ing.unit || 'pcs'}
                                  onChange={(val) => {
                                    const newIng = [...ingredients];
                                    newIng[i].unit = String(val);
                                    setIngredients(newIng);
                                  }}
                                  searchable={false}
                                  triggerClassName="min-h-0 h-8 py-0.5 px-2 text-xs font-semibold rounded-xl bg-stone-50/80 dark:bg-stone-900/90 border-stone-200 dark:border-stone-750"
                                  className="w-full"
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Right Column: Available Raw Materials */}
                <div className="p-3.5 rounded-2xl bg-stone-50/80 dark:bg-stone-900/50 border border-stone-200/80 dark:border-stone-800 flex flex-col h-[460px] sm:h-[480px] lg:h-[500px] max-h-[calc(90vh-230px)]">
                  <div className="space-y-2 pb-2 border-b border-stone-200/70 dark:border-stone-800 shrink-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <Layers className="w-4 h-4 text-amber-500 shrink-0" />
                        <h5 className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">
                          Available Raw Materials
                        </h5>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-200/80 dark:bg-stone-800 text-stone-600 dark:text-stone-300 shrink-0">
                        {filteredAvailableRawItems.length} Items
                      </span>
                    </div>

                    {/* Search Input */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
                      <input
                        type="text"
                        placeholder="Search raw materials..."
                        value={rawSearch}
                        onChange={(e) => setRawSearch(e.target.value)}
                        className="w-full h-8 pl-8 pr-7 rounded-xl bg-white dark:bg-stone-850 border border-stone-200 dark:border-stone-750 text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                      {rawSearch && (
                        <button
                          type="button"
                          onClick={() => setRawSearch('')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Category Filter Chips */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 text-xs slim-scrollbar [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-stone-300/40 dark:[&::-webkit-scrollbar-thumb]:bg-stone-700/40 hover:[&::-webkit-scrollbar-thumb]:bg-stone-400 [scrollbar-width:thin] [scrollbar-color:rgba(214,211,209,0.35)_transparent]">
                      <button
                        type="button"
                        onClick={() => setSelectedInvCategory('All')}
                        className={cn(
                          'px-2.5 py-1 rounded-lg font-bold text-[11px] whitespace-nowrap transition-all cursor-pointer shrink-0',
                          selectedInvCategory === 'All'
                            ? 'bg-amber-500 text-stone-950 shadow-2xs'
                            : 'bg-white dark:bg-stone-850 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200/80 dark:border-stone-800'
                        )}
                      >
                        All ({appData.inventory.length})
                      </button>
                      {allInvCategories.map((catName) => {
                        const count = appData.inventory.filter((i) => i.category === catName).length;
                        const isSelected = selectedInvCategory === catName;
                        return (
                          <button
                            key={catName}
                            type="button"
                            onClick={() => setSelectedInvCategory(catName)}
                            className={cn(
                              'px-2.5 py-1 rounded-lg font-bold text-[11px] whitespace-nowrap transition-all cursor-pointer shrink-0 flex items-center gap-1',
                              isSelected
                                ? 'bg-amber-500 text-stone-950 shadow-2xs'
                                : 'bg-white dark:bg-stone-850 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200/80 dark:border-stone-800'
                            )}
                          >
                            <span>{catName}</span>
                            <span className="text-[9px] opacity-70">({count})</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Available Items List */}
                  <div className="flex-1 min-h-0 overflow-y-auto space-y-2 mt-2.5 pr-1">
                    {appData.inventory.length === 0 ? (
                      <div className="h-full min-h-[220px] flex flex-col items-center justify-center p-6 text-center rounded-xl border border-dashed border-stone-200 dark:border-stone-800 text-stone-400">
                        <Layers className="w-8 h-8 mb-2 opacity-30 text-amber-500" />
                        <p className="text-xs font-semibold text-stone-700 dark:text-stone-300">No raw materials in inventory</p>
                        <p className="text-[11px] text-stone-400 mt-1 max-w-[220px]">
                          Add raw materials in Inventory Management to track recipe stock deduction.
                        </p>
                      </div>
                    ) : filteredAvailableRawItems.length === 0 ? (
                      <div className="h-full min-h-[220px] flex flex-col items-center justify-center p-6 text-center rounded-xl border border-dashed border-stone-200 dark:border-stone-800 text-stone-400">
                        <Search className="w-8 h-8 mb-2 opacity-30 text-amber-500" />
                        <p className="text-xs font-semibold text-stone-700 dark:text-stone-300">No matching items found</p>
                        <p className="text-[11px] text-stone-400 mt-1">Try a different search keyword or category filter.</p>
                      </div>
                    ) : (
                      filteredAvailableRawItems.map((item) => {
                        const isAttached = ingredients.some(
                          (ing) => ing.name?.toLowerCase().trim() === item.item?.toLowerCase().trim()
                        );
                        const isOutOfStock = item.stock <= 0;
                        const isLowStock = !isOutOfStock && item.stock <= (item.threshold || 0);

                        return (
                          <div
                            key={item.id || item.item}
                            className={cn(
                              'p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2.5 group',
                              isAttached
                                ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/30'
                                : 'bg-white dark:bg-stone-850 border-stone-200/80 dark:border-stone-800 hover:border-amber-500/50 hover:shadow-2xs'
                            )}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">
                                  {item.item}
                                </span>
                                {item.category && (
                                  <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 shrink-0">
                                    {item.category}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 mt-0.5 text-[10px]">
                                <span className="text-stone-400">Stock:</span>
                                <span
                                  className={cn(
                                    'font-semibold',
                                    isOutOfStock
                                      ? 'text-rose-600 dark:text-rose-400'
                                      : isLowStock
                                      ? 'text-amber-600 dark:text-amber-400'
                                      : 'text-emerald-600 dark:text-emerald-400'
                                  )}
                                >
                                  {item.stock} {item.unit}
                                </span>
                                <span className="text-stone-300 dark:text-stone-700">•</span>
                                <span
                                  className={cn(
                                    'px-1.5 py-0.2 rounded-full text-[9px] font-bold',
                                    isOutOfStock
                                      ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                                      : isLowStock
                                      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                                      : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                                  )}
                                >
                                  {isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'Good Stock'}
                                </span>
                              </div>
                            </div>

                            <div className="shrink-0">
                              {isAttached ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-xl bg-emerald-100/80 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-800/60">
                                  <Check className="w-3.5 h-3.5" />
                                  Attached
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleAttachIngredient(item)}
                                  className="inline-flex items-center gap-1 text-[11px] font-bold text-stone-800 dark:text-stone-200 hover:text-stone-950 dark:hover:text-white px-2.5 py-1 rounded-xl bg-stone-100 hover:bg-amber-500 hover:text-stone-950 dark:bg-stone-800 dark:hover:bg-amber-500 dark:hover:text-stone-950 border border-stone-200 dark:border-stone-750 transition-all cursor-pointer shadow-2xs"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  Attach
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
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
                        className="w-full h-9 px-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-750 text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
                  <div className="p-3.5 rounded-2xl bg-stone-50/80 dark:bg-stone-900/50 border border-stone-200/80 dark:border-stone-800 flex flex-col h-[460px] sm:h-[480px] lg:h-[500px] max-h-[calc(90vh-230px)]">
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

                    <div className="flex-1 min-h-0 overflow-y-auto space-y-2 mt-2.5 pr-0.5">
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
                                <Check className="w-3.5 h-3.5 group-hover:hidden" />
                                <X className="w-3.5 h-3.5 hidden group-hover:block" />
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
                  <div className="p-3.5 rounded-2xl bg-stone-50/80 dark:bg-stone-900/50 border border-stone-200/80 dark:border-stone-800 flex flex-col h-[460px] sm:h-[480px] lg:h-[500px] max-h-[calc(90vh-230px)]">
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

                    <div className="flex-1 min-h-0 overflow-y-auto space-y-2 mt-2.5 pr-0.5">
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

          {/* Section 3: Taxes */}
          {activeTab === 'taxes' && (() => {
            const dishBasePrice = parsePrice(currentItem?.price ?? newItem?.price);
            const totalManualTaxRate = taxes.reduce(
              (sum: number, t: any) => sum + (parseFloat(t.rate) || 0),
              0
            );
            const effectiveTaxRate = useGlobalTax
              ? parseFloat(String(globalTaxRate || 0)) || 0
              : totalManualTaxRate;
            const calculatedTaxAmount = (dishBasePrice * effectiveTaxRate) / 100;
            const estimatedFinalPrice = dishBasePrice + calculatedTaxAmount;

            return (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100 dark:border-stone-800/80">
                  <div>
                    <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                      <Percent className="w-4 h-4 text-emerald-500" />
                      Tax Configuration for {currentItem.name}
                    </h4>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                      Choose whether this item uses the restaurant-wide global tax or custom dish-specific tax rates.
                    </p>
                  </div>
                </div>

                {/* Two-Column Grid for Wide Modal */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  {/* Left Column: Tax Application Mode & Live Pricing Simulation */}
                  <div className="lg:col-span-5 flex flex-col gap-3.5">
                    {/* Mode Selection Cards */}
                    <div className="p-3.5 rounded-2xl bg-stone-50/80 dark:bg-stone-900/50 border border-stone-200/80 dark:border-stone-800 space-y-2.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 block">
                        Tax Application Policy
                      </span>

                      {/* Option 1: Global Tax */}
                      <div
                        onClick={() => {
                          setUseGlobalTax(true);
                          setTaxes([]);
                        }}
                        className={cn(
                          'p-3 rounded-xl border transition-all cursor-pointer select-none',
                          useGlobalTax
                            ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-500 ring-1 ring-emerald-500/60 shadow-2xs'
                            : 'bg-white dark:bg-stone-850 border-stone-200/80 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700'
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              className={cn(
                                'w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors',
                                useGlobalTax
                                  ? 'border-emerald-500 bg-emerald-500 text-white'
                                  : 'border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900'
                              )}
                            >
                              {useGlobalTax && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                            <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                              Apply Global Tax
                            </span>
                          </div>
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 shrink-0">
                            {globalTaxName} ({globalTaxRate}%)
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 pl-6">
                          Automatically inherits the default restaurant store tax.
                        </p>
                      </div>

                      {/* Option 2: Custom / Exempt Taxes */}
                      <div
                        onClick={() => setUseGlobalTax(false)}
                        className={cn(
                          'p-3 rounded-xl border transition-all cursor-pointer select-none',
                          !useGlobalTax
                            ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-500 ring-1 ring-amber-500/60 shadow-2xs'
                            : 'bg-white dark:bg-stone-850 border-stone-200/80 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700'
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              className={cn(
                                'w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors',
                                !useGlobalTax
                                  ? 'border-amber-500 bg-amber-500 text-stone-950'
                                  : 'border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900'
                              )}
                            >
                              {!useGlobalTax && <div className="w-1.5 h-1.5 rounded-full bg-stone-950" />}
                            </div>
                            <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                              Custom / Exempt Taxes
                            </span>
                          </div>
                          <span
                            className={cn(
                              'text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0',
                              !useGlobalTax && taxes.length > 0
                                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 border border-amber-300/60 dark:border-amber-700/60'
                                : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 border border-stone-200 dark:border-stone-750'
                            )}
                          >
                            {taxes.length > 0 ? `${taxes.length} Slabs (${totalManualTaxRate}%)` : '0% Exempt'}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 pl-6">
                          Configure specific item tax slabs or sell completely tax-free.
                        </p>
                      </div>
                    </div>

                    {/* Live Pricing Breakdown Card */}
                    <div className="p-3.5 rounded-2xl bg-stone-50/80 dark:bg-stone-900/50 border border-stone-200/80 dark:border-stone-800 space-y-2.5">
                      <div className="flex items-center justify-between pb-1.5 border-b border-stone-200/70 dark:border-stone-800">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                          Price & Tax Simulation
                        </span>
                        <span className="text-[10px] font-semibold text-stone-500 dark:text-stone-400">
                          Per Dish
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs">
                        <div className="flex items-center justify-between text-stone-600 dark:text-stone-400">
                          <span>Base Menu Price</span>
                          <span className="font-semibold text-stone-900 dark:text-stone-100">
                            ₹{dishBasePrice.toFixed(2)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-stone-600 dark:text-stone-400">
                          <span>
                            Tax Applied ({useGlobalTax ? globalTaxName : taxes.length > 0 ? 'Custom' : 'Exempt'} {effectiveTaxRate}%)
                          </span>
                          <span className="font-semibold text-stone-900 dark:text-stone-100">
                            +₹{calculatedTaxAmount.toFixed(2)}
                          </span>
                        </div>

                        <div className="pt-2 border-t border-stone-200/70 dark:border-stone-800 flex items-center justify-between">
                          <span className="font-bold text-stone-900 dark:text-stone-100">
                            Estimated Final Price
                          </span>
                          <span className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
                            ₹{estimatedFinalPrice.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Tax Details / Rate Manager */}
                  <div className="lg:col-span-7">
                    {useGlobalTax ? (
                      <div className="p-6 rounded-2xl bg-stone-50/80 dark:bg-stone-900/50 border border-stone-200/80 dark:border-stone-800 flex flex-col items-center justify-center text-center h-[460px] sm:h-[480px] lg:h-[500px] max-h-[calc(90vh-230px)]">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 shadow-xs">
                          <ShieldCheck className="w-7 h-7" />
                        </div>
                        <h5 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                          Global Tax Mode Active
                        </h5>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 font-bold text-xs mt-2 border border-emerald-200/80 dark:border-emerald-800/60">
                          <span>{globalTaxName}</span>
                          <span>•</span>
                          <span>{globalTaxRate}%</span>
                        </div>
                        <p className="text-xs text-stone-500 dark:text-stone-400 mt-3 max-w-sm">
                          This item inherits the restaurant-wide tax configuration. Tax will be calculated and printed on invoices automatically.
                        </p>
                        <button
                          type="button"
                          onClick={() => setUseGlobalTax(false)}
                          className="mt-5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                        >
                          Switch to Custom / Exempt Taxes →
                        </button>
                      </div>
                    ) : (
                      <div className="p-3.5 rounded-2xl bg-stone-50/80 dark:bg-stone-900/50 border border-stone-200/80 dark:border-stone-800 flex flex-col h-[460px] sm:h-[480px] lg:h-[500px] max-h-[calc(90vh-230px)]">
                        <div className="flex items-center justify-between pb-2 border-b border-stone-200/70 dark:border-stone-800 shrink-0">
                          <div className="flex items-center gap-2 min-w-0">
                            <Percent className="w-4 h-4 text-amber-500 shrink-0" />
                            <h5 className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">
                              Manual Tax Slabs
                            </h5>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 border border-amber-300/60 dark:border-amber-700/60">
                              {taxes.length} Slabs
                            </span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setTaxes((prev) => [...prev, { name: '', rate: '' }])}
                            leftIcon={<Plus className="w-3.5 h-3.5 text-amber-500" />}
                            className="shrink-0"
                          >
                            Add Tax Slab
                          </Button>
                        </div>

                        {/* Tax Slabs List */}
                        <div className="flex-1 min-h-0 overflow-y-auto space-y-2.5 mt-2.5 pr-1">
                          {taxes.length === 0 ? (
                            <div className="h-full min-h-[220px] flex flex-col items-center justify-center p-6 text-center rounded-xl border border-dashed border-stone-200 dark:border-stone-800 text-stone-400">
                              <Percent className="w-8 h-8 mb-2 opacity-30 text-amber-500" />
                              <p className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                                0% Tax-Exempt Item
                              </p>
                              <p className="text-[11px] text-stone-400 mt-1 max-w-xs">
                                No manual taxes are attached. This item will be billed with 0% tax (tax-free).
                              </p>
                            </div>
                          ) : (
                            taxes.map((t, i) => (
                              <div
                                key={i}
                                className="p-3 rounded-xl bg-white dark:bg-stone-850 border border-stone-200/80 dark:border-stone-800 flex items-center justify-between gap-3 shadow-2xs"
                              >
                                <div className="flex-1 min-w-0">
                                  <label className="text-[9px] font-bold uppercase tracking-wider text-stone-400 mb-1 block">
                                    Tax Label / Name
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
                                    className="w-full h-8 px-2.5 rounded-lg bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-750 text-xs font-semibold text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                                  />
                                </div>

                                <div className="w-24 sm:w-28 shrink-0">
                                  <label className="text-[9px] font-bold uppercase tracking-wider text-stone-400 mb-1 block">
                                    Rate (%)
                                  </label>
                                  <div className="relative">
                                    <input
                                      type="number"
                                      step="0.1"
                                      placeholder="5.0"
                                      value={t.rate}
                                      onChange={(e) => {
                                        const newTaxes = [...taxes];
                                        newTaxes[i].rate = e.target.value;
                                        setTaxes(newTaxes);
                                      }}
                                      className="w-full min-h-0 h-8 pl-2.5 pr-6 rounded-lg bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-750 text-xs font-bold text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    />
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400">
                                      %
                                    </span>
                                  </div>
                                </div>

                                <div className="shrink-0 pt-4">
                                  <button
                                    type="button"
                                    onClick={() => setTaxes(taxes.filter((_, idx) => idx !== i))}
                                    className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                                    title="Remove tax slab"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </Modal>
  );
};
