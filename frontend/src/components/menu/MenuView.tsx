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

export const MenuView: React.FC = () => {
  const { appData, fetchBackendData } = useApp();

  const [menuManagementTab, setMenuManagementTab] = useState<'Menu Items' | 'Addons'>('Menu Items');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

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
      tax: item.tax || '',
    });
    setIngredients(
      item.ingredients && item.ingredients.length > 0
        ? [...item.ingredients]
        : [{ name: '', quantity: '', unit: 'pcs' }]
    );
    setTaxes(item.taxes && item.taxes.length > 0 ? [...item.taxes] : [{ name: '', rate: '' }]);
    setShowConfigModal(true);
  };

  const handleEditItem = (item: any) => {
    setNewItem({
      name: item.name || '',
      category: item.category || '',
      description: item.description || '',
      image: item.image || '',
      price: item.price ? item.price.replace('₹', '') : '',
      tax: item.tax || '',
      taxName: item.taxName || '',
      sku: item.sku || '',
      prepTime: item.prepTime || '',
      type: item.type || 'Veg',
      available: item.available !== undefined ? item.available : true,
      status: item.status || 'Active',
      isAddon: item.isAddon || false,
      addonIds: item.addonIds || '',
    });
    setIngredients(
      item.ingredients && item.ingredients.length > 0
        ? [...item.ingredients]
        : [{ name: '', quantity: '', unit: 'pcs' }]
    );
    setEditingItemIndex(appData.menu.findIndex((m: any) => m.name === item.name));
    setShowAddItemModal(true);
  };

  const handleDeleteItem = async (item: any) => {
    if (window.confirm(`Are you sure you want to delete ${item.name}?`)) {
      try {
        await menuApi.deleteMenuItem(item.id);
        fetchBackendData();
      } catch (err) {
        console.error('Failed to delete item:', err);
        alert('Failed to delete item.');
      }
    }
  };

  const handleDeleteAddon = async (addon: Addon) => {
    if (window.confirm(`Delete "${addon.name}"?`)) {
      await menuApi.deleteAddon(addon.id);
      fetchBackendData();
    }
  };

  return (
    <div
      className="admin-content"
      style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}
    >
      <div
        className="admin-card"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          padding: 24,
          backgroundColor: '#f8fafc',
        }}
      >
        <div style={{ display: 'flex', gap: 16, marginBottom: 20, borderBottom: '1px solid #e2e8f0', paddingBottom: 12 }}>
          <div
            onClick={() => setMenuManagementTab('Menu Items')}
            style={{
              cursor: 'pointer',
              padding: '8px 16px',
              fontWeight: 600,
              color: menuManagementTab === 'Menu Items' ? '#2563eb' : '#64748b',
              borderBottom: menuManagementTab === 'Menu Items' ? '2px solid #2563eb' : 'none',
            }}
          >
            Menu Items
          </div>
          <div
            onClick={() => setMenuManagementTab('Addons')}
            style={{
              cursor: 'pointer',
              padding: '8px 16px',
              fontWeight: 600,
              color: menuManagementTab === 'Addons' ? '#2563eb' : '#64748b',
              borderBottom: menuManagementTab === 'Addons' ? '2px solid #2563eb' : 'none',
            }}
          >
            Add-ons
          </div>
        </div>

        {menuManagementTab === 'Menu Items' && (
          <div className="menu-layout">
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
        )}

        {menuManagementTab === 'Addons' && (
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
        )}
      </div>

      {/* Modals */}
      <ItemModal
        show={showAddItemModal}
        onClose={() => {
          setShowAddItemModal(false);
          setEditingItemIndex(null);
          setNewItem({
            name: '',
            category: '',
            description: '',
            image: '',
            price: '',
            type: 'Veg',
            available: true,
            status: 'Active',
            sku: '',
            prepTime: '',
          });
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
          setNewCategory({ name: '', description: '', displayOrder: '', status: 'Active' });
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
