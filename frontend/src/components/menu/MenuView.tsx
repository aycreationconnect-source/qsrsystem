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
import { Utensils, Layers } from 'lucide-react';
import { cn } from '../../lib/utils';

export const MenuView: React.FC = () => {
  const { appData, fetchBackendData } = useApp();

  const [menuManagementTab, setMenuManagementTab] = useState<'Menu Items' | 'Addons'>('Menu Items');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(() => {
    const firstCat = appData.categories?.[0];
    return firstCat ? (typeof firstCat === 'string' ? firstCat : firstCat.name) : null;
  });

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
  });

  // Category Modal State
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [editingCategoryName, setEditingCategoryName] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState<any>({
    name: '',
    description: '',
    displayOrder: '',
    status: 'Active',
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
            rate: t.rate || '',
          }))
        : [{ name: '', rate: '' }]
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
      sku: item.sku || '',
      prepTime: item.prepTime || '',
      isAddon: item.isAddon || false,
    });
    setShowAddItemModal(true);
  };

  const handleDeleteItem = async (item: any) => {
    if (!confirm(`Are you sure you want to delete ${item.name}?`)) return;
    try {
      if (item.id) {
        await menuApi.deleteMenuItem(item.id);
      }
      await fetchBackendData();
    } catch (e) {
      console.error(e);
      alert('Failed to delete item from backend.');
    }
  };

  const handleDeleteAddon = async (addon: Addon) => {
    if (!confirm(`Delete addon "${addon.name}"?`)) return;
    try {
      await menuApi.deleteAddon(addon.id);
      await fetchBackendData();
    } catch (e) {
      console.error(e);
      alert('Failed to delete addon');
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
              setSelectedCategory={setSelectedCategory}
              onAddCategory={() => {
                setEditingCategoryName(null);
                setNewCategory({ name: '', description: '', displayOrder: '', status: 'Active' });
                setShowAddCategoryModal(true);
              }}
              onEditCategory={(catObj) => {
                const catName = typeof catObj === 'string' ? catObj : catObj.name;
                setEditingCategoryName(catName);
                setNewCategory(
                  typeof catObj === 'object'
                    ? catObj
                    : { name: catName, description: '', displayOrder: 1, status: 'Active' }
                );
                setShowAddCategoryModal(true);
              }}
            />

            <MenuItemsGrid
              selectedCategory={selectedCategory}
              onAddItem={() => {
                setEditingItemIndex(null);
                setNewItem({
                  name: '',
                  category: selectedCategory || '',
                  description: '',
                  image: '',
                  price: '',
                  type: 'Veg',
                  available: true,
                  status: 'Active',
                  sku: '',
                  prepTime: '',
                });
                setShowAddItemModal(true);
              }}
              onConfigItem={handleConfigItem}
              onEditItem={handleEditItem}
              onDeleteItem={handleDeleteItem}
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
              onDeleteAddon={handleDeleteAddon}
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
    </div>
  );
};
