import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CategorySidebar } from './CategorySidebar';
import { MenuItemsGrid } from './MenuItemsGrid';
import { AddonsManagement } from './AddonsManagement';
import { ItemModal } from './ItemModal';
import { CategoryModal } from './CategoryModal';
import { ConfigItemModal } from './ConfigItemModal';
import { AddonModal } from './AddonModal';
import { menuApi } from '../../api/menuApi';
import type { Addon } from '../../types/app.types';
import { ConfirmModal } from '../ui';
import { Utensils, Layers } from 'lucide-react';
import { cn } from '../../lib/utils';

export const MenuView: React.FC = () => {
  const { appData, refreshMenu, refreshAddons } = useApp();

  const [menuManagementTab, setMenuManagementTab] = useState<'Menu Items' | 'Addons'>('Menu Items');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(() => {
    const firstCat = appData.categories?.[0];
    return firstCat ? (typeof firstCat === 'string' ? firstCat : firstCat.name) : null;
  });
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);

  // Auto-select first category when categories finish loading
  React.useEffect(() => {
    if (!selectedCategory && appData.categories && appData.categories.length > 0) {
      const firstCat = appData.categories[0];
      setSelectedCategory(typeof firstCat === 'string' ? firstCat : firstCat.name);
    }
  }, [appData.categories, selectedCategory]);

  // Item Modal State
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [newItem, setNewItem] = useState<any>({
    name: '',
    category: '',
    description: '',
    image: '',
    price: '',
    tax: '',
    sku: '',
    prepTime: '',
    type: 'Veg',
    available: true,
    status: 'Active',
    isAddon: false,
    subcategory: '',
  });

  // Category Modal State
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [editingCategoryName, setEditingCategoryName] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState<any>({
    name: '',
    description: '',
    status: 'Active',
    subcategories: [],
  });

  // Config Modal State
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [configItemIndex, setConfigItemIndex] = useState<number | null>(null);
  const [ingredients, setIngredients] = useState<any[]>([{ name: '', quantity: '', unit: 'pcs' }]);
  const [taxes, setTaxes] = useState<any[]>([{ name: '', rate: '' }]);

  // Addon Modal State
  const [showAddonModal, setShowAddonModal] = useState(false);
  const [editingAddon, setEditingAddon] = useState<any>(null);
  const [addonForm, setAddonForm] = useState({ name: '', description: '', price: '' });

  const handleConfigItem = (item: any) => {
    setConfigItemIndex(appData.menu.findIndex((m: any) => m.name === item.name));
    setNewItem({
      ...item,
      addonIds: item.addonIds || '',
    });
    setIngredients(
      item.ingredients && item.ingredients.length > 0
        ? item.ingredients.map((ing: any) => ({
            name: ing.name || '',
            quantity: ing.quantity || '',
            unit: ing.unit || 'pcs',
          }))
        : [{ name: '', quantity: '', unit: 'pcs' }]
    );
    setTaxes(
      item.taxes && item.taxes.length > 0
        ? item.taxes.map((t: any) => ({
            name: t.name || '',
            rate: t.rate !== undefined ? String(t.rate) : '',
          }))
        : item.tax && item.tax !== 0
        ? [{ name: item.taxName || 'Tax', rate: String(item.tax) }]
        : []
    );
    setShowConfigModal(true);
  };

  const handleEditItem = (item: any) => {
    const idx = appData.menu.findIndex((m: any) => m.name === item.name);
    setEditingItemIndex(idx);
    setNewItem({
      name: item.name,
      category: item.category,
      description: item.description || '',
      image: item.image || '',
      price: item.price,
      type: item.type || 'Veg',
      available: item.available !== false,
      status: item.status || 'Active',
      subcategory: item.subcategory || '',
      sku: item.sku || '',
      prepTime: item.prepTime || '',
      isAddon: item.isAddon || false,
    });
    setShowAddItemModal(true);
  };

  // Delete Confirmation States
  const [itemToDelete, setItemToDelete] = useState<any | null>(null);
  const [addonToDelete, setAddonToDelete] = useState<Addon | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(null);

  const confirmDeleteItem = async () => {
    if (!itemToDelete) return;
    try {
      setIsDeleting(true);
      setDeleteErrorMessage(null);
      if (itemToDelete.id) {
        await menuApi.deleteMenuItem(itemToDelete.id);
      }
      await refreshMenu();
      setItemToDelete(null);
    } catch (e: any) {
      console.error(e);
      setDeleteErrorMessage(e?.message || 'Failed to delete dish from server.');
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmDeleteAddon = async () => {
    if (!addonToDelete) return;
    try {
      setIsDeleting(true);
      setDeleteErrorMessage(null);
      await menuApi.deleteAddon(addonToDelete.id);
      await refreshAddons();
      setAddonToDelete(null);
    } catch (e: any) {
      console.error(e);
      setDeleteErrorMessage(e?.message || 'Failed to delete modifier addon.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-stone-50/60 dark:bg-stone-950/30">
      {/* Top Tab Bar: Menu Items vs Add-ons */}
      <div className="px-4 sm:px-6 py-2.5 bg-white dark:bg-stone-900 border-b border-stone-200/80 dark:border-stone-800 flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={() => setMenuManagementTab('Menu Items')}
          className={cn(
            'px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer',
            menuManagementTab === 'Menu Items'
              ? 'bg-amber-500 text-stone-950 shadow-sm'
              : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800'
          )}
        >
          <Utensils className="w-3.5 h-3.5" />
          <span>Dishes & Beverages</span>
        </button>

        <button
          type="button"
          onClick={() => setMenuManagementTab('Addons')}
          className={cn(
            'px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer',
            menuManagementTab === 'Addons'
              ? 'bg-amber-500 text-stone-950 shadow-sm'
              : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800'
          )}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Add-ons & Modifiers</span>
        </button>
      </div>

      {/* Main Tab Views */}
      <div className="flex-1 flex overflow-hidden">
        {menuManagementTab === 'Menu Items' ? (
          <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
            <CategorySidebar
              selectedCategory={selectedCategory}
              setSelectedCategory={(cat) => {
                setSelectedCategory(cat);
                setSelectedSubcategory(null);
              }}
              selectedSubcategory={selectedSubcategory}
              setSelectedSubcategory={setSelectedSubcategory}
              onAddCategory={() => {
                setEditingCategoryName(null);
                setNewCategory({ name: '', description: '', status: 'Active', subcategories: [] });
                setShowAddCategoryModal(true);
              }}
              onEditCategory={(catObj) => {
                const catName = typeof catObj === 'string' ? catObj : catObj.name;
                setEditingCategoryName(catName);
                setNewCategory(
                  typeof catObj === 'object'
                    ? catObj
                    : { name: catName, description: '', status: 'Active', subcategories: [] }
                );
                setShowAddCategoryModal(true);
              }}
            />

            <MenuItemsGrid
              selectedCategory={selectedCategory}
              selectedSubcategory={selectedSubcategory}
              setSelectedSubcategory={setSelectedSubcategory}
              onAddItem={(dietType?: string) => {
                setEditingItemIndex(null);
                setNewItem({
                  name: '',
                  category: selectedCategory || '',
                  description: '',
                  image: '',
                  price: '',
                  type: dietType || 'Veg',
                  available: true,
                  status: 'Active',
                  subcategory: selectedSubcategory || '',
                  sku: '',
                  prepTime: '',
                  useGlobalTax: true,
                });
                setShowAddItemModal(true);
              }}
              onConfigItem={handleConfigItem}
              onEditItem={handleEditItem}
              onDeleteItem={(item) => {
                setDeleteErrorMessage(null);
                setItemToDelete(item);
              }}
            />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-5xl mx-auto w-full">
            <AddonsManagement
              onAddAddon={() => {
                setEditingAddon(null);
                setAddonForm({ name: '', description: '', price: '' });
                setShowAddonModal(true);
              }}
              onEditAddon={(addon) => {
                setEditingAddon(addon);
                setAddonForm({
                  name: addon.name,
                  description: addon.description || '',
                  price: String(addon.price),
                });
                setShowAddonModal(true);
              }}
              onDeleteAddon={(addon) => {
                setDeleteErrorMessage(null);
                setAddonToDelete(addon);
              }}
            />
          </div>
        )}
      </div>

      {/* Management Modals */}
      <ItemModal
        show={showAddItemModal}
        onClose={() => {
          setShowAddItemModal(false);
          setEditingItemIndex(null);
        }}
        editingItemIndex={editingItemIndex}
        newItem={newItem}
        setNewItem={setNewItem}
        selectedCategory={selectedCategory}
      />

      <CategoryModal
        show={showAddCategoryModal}
        onClose={() => {
          setShowAddCategoryModal(false);
          setEditingCategoryName(null);
        }}
        editingCategoryName={editingCategoryName}
        newCategory={newCategory}
        setNewCategory={setNewCategory}
      />

      <ConfigItemModal
        show={showConfigModal}
        onClose={() => {
          setShowConfigModal(false);
          setConfigItemIndex(null);
        }}
        configItemIndex={configItemIndex}
        newItem={newItem}
        setNewItem={setNewItem}
        ingredients={ingredients}
        setIngredients={setIngredients}
        taxes={taxes}
        setTaxes={setTaxes}
      />

      <AddonModal
        show={showAddonModal}
        onClose={() => {
          setShowAddonModal(false);
          setEditingAddon(null);
        }}
        editingAddon={editingAddon}
        addonForm={addonForm}
        setAddonForm={setAddonForm}
      />

      {/* Delete Item Confirmation Modal */}
      <ConfirmModal
        isOpen={!!itemToDelete}
        onClose={() => {
          if (!isDeleting) setItemToDelete(null);
        }}
        onConfirm={confirmDeleteItem}
        title="Delete Menu Item"
        message={
          <div>
            <p>
              Are you sure you want to remove{' '}
              <span className="font-bold text-stone-900 dark:text-stone-100">
                {itemToDelete?.name}
              </span>
              ?
            </p>
            <p className="mt-1 text-stone-500 dark:text-stone-400 text-[11px]">
              This will permanently remove the item from the catalog, recipe configurations, and POS terminals.
            </p>
            {deleteErrorMessage && (
              <div className="mt-3 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 text-xs font-semibold border border-rose-200 dark:border-rose-900/50">
                {deleteErrorMessage}
              </div>
            )}
          </div>
        }
        confirmText="Delete Dish"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />

      {/* Delete Addon Confirmation Modal */}
      <ConfirmModal
        isOpen={!!addonToDelete}
        onClose={() => {
          if (!isDeleting) setAddonToDelete(null);
        }}
        onConfirm={confirmDeleteAddon}
        title="Delete Modifier Add-on"
        message={
          <div>
            <p>
              Are you sure you want to remove{' '}
              <span className="font-bold text-stone-900 dark:text-stone-100">
                {addonToDelete?.name}
              </span>
              ?
            </p>
            <p className="mt-1 text-stone-500 dark:text-stone-400 text-[11px]">
              Dishes configured with this modifier will no longer offer it during checkout.
            </p>
            {deleteErrorMessage && (
              <div className="mt-3 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 text-xs font-semibold border border-rose-200 dark:border-rose-900/50">
                {deleteErrorMessage}
              </div>
            )}
          </div>
        }
        confirmText="Delete Modifier"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};
