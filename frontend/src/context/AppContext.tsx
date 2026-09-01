import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { AppData, Category, Addon, InventoryItem, Area, Table, Order, Settings } from '../types/app.types';
import { menuApi } from '../api/menuApi';
import { inventoryApi } from '../api/inventoryApi';
import { tableApi } from '../api/tableApi';
import { orderApi } from '../api/orderApi';
import { settingsApi } from '../api/settingsApi';

interface AppContextType {
  view: 'login' | 'register' | 'dashboard' | 'pos';
  setView: (view: 'login' | 'register' | 'dashboard' | 'pos') => void;
  posMode: string | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  appData: AppData;
  setAppData: React.Dispatch<React.SetStateAction<AppData>>;
  fetchBackendData: () => Promise<void>;

  // Auth state
  loginData: { adminId: string; password: string };
  setLoginData: React.Dispatch<React.SetStateAction<{ adminId: string; password: string }>>;
  registerData: {
    dbHost: string;
    dbPort: string;
    dbUser: string;
    dbPassword: string;
    dbName: string;
    adminId: string;
    adminPassword: string;
    restaurantName: string;
  };
  setRegisterData: React.Dispatch<
    React.SetStateAction<{
      dbHost: string;
      dbPort: string;
      dbUser: string;
      dbPassword: string;
      dbName: string;
      adminId: string;
      adminPassword: string;
      restaurantName: string;
    }>
  >;
  handleLogin: (e: React.FormEvent) => void;
  handleRegister: (e: React.FormEvent) => Promise<void>;
  handleLogout: () => void;
}

const initialAppData: AppData = {
  stats: { orders: 42, revenue: '₹12,450', tables: '8 / 15' },
  categories: [],
  areas: [],
  tables: [],
  menu: [],
  addons: [],
  inventory: [
    { item: 'Burger Buns', unit: 'pcs', stock: 120, threshold: 20, status: 'Good', history: [] },
    { item: 'Chicken Patty', unit: 'pcs', stock: 85, threshold: 15, status: 'Good', history: [] },
  ],
  settings: {
    globalTaxName: '',
    globalTaxRate: '0',
  },
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [view, setView] = useState<'login' | 'register' | 'dashboard' | 'pos'>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('view') === 'pos' ? 'pos' : 'login';
  });

  const [posMode] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('mode');
  });

  const [activeTab, setActiveTab] = useState('Dashboard');
  const [appData, setAppData] = useState<AppData>(initialAppData);

  const [loginData, setLoginData] = useState({ adminId: '', password: '' });
  const [registerData, setRegisterData] = useState({
    dbHost: 'localhost',
    dbPort: '3306',
    dbUser: 'root',
    dbPassword: '',
    dbName: 'qsr_local',
    adminId: '',
    adminPassword: '',
    restaurantName: '',
  });

  const fetchBackendData = useCallback(async () => {
    try {
      const [catsRes, menusRes, invRes, areasRes, tablesRes, ordersRes, addonsRes, settingsRes] =
        await Promise.allSettled([
          menuApi.getCategories(),
          menuApi.getMenuItems(),
          inventoryApi.getInventory(),
          tableApi.getAreas(),
          tableApi.getTables(),
          orderApi.getOrders(),
          menuApi.getAddons(),
          settingsApi.getSettings(),
        ]);

      const cats: Category[] =
        catsRes.status === 'fulfilled' && Array.isArray(catsRes.value) ? catsRes.value : [];
      const menus: any[] =
        menusRes.status === 'fulfilled' && Array.isArray(menusRes.value) ? menusRes.value : [];
      const inventory: InventoryItem[] =
        invRes.status === 'fulfilled' && Array.isArray(invRes.value) ? invRes.value : [];
      const areas: Area[] =
        areasRes.status === 'fulfilled' && Array.isArray(areasRes.value) ? areasRes.value : [];
      const tables: Table[] =
        tablesRes.status === 'fulfilled' && Array.isArray(tablesRes.value) ? tablesRes.value : [];
      const orders: Order[] =
        ordersRes.status === 'fulfilled' && Array.isArray(ordersRes.value) ? ordersRes.value : [];
      const addons: Addon[] =
        addonsRes.status === 'fulfilled' && Array.isArray(addonsRes.value) ? addonsRes.value : [];
      const settings: Settings =
        settingsRes.status === 'fulfilled' && settingsRes.value ? settingsRes.value : {};

      setAppData((prev) => ({
        ...prev,
        categories: cats,
        areas: areas,
        tables: tables,
        orders: orders,
        addons: addons,
        settings: settings,
        menu: Array.isArray(menus)
          ? menus
              .filter((m: any) => !m.isAddon)
              .map((m: any) => ({
                ...m,
                image: m.imageUrl,
                available: m.isAvailable,
                category: m.category?.name || 'Uncategorized',
                price: `₹${
                  typeof m.price === 'number' ? m.price.toFixed(2) : parseFloat(m.price || 0).toFixed(2)
                }`,
              }))
          : [],
        inventory: Array.isArray(inventory) && inventory.length > 0 ? inventory : prev.inventory,
      }));
    } catch (e) {
      console.error('Backend connection failed:', e);
    }
  }, []);

  useEffect(() => {
    fetchBackendData();
    const intervalId = setInterval(fetchBackendData, 5000);
    return () => clearInterval(intervalId);
  }, [fetchBackendData]);

  // Persist Login
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isAdminLoggedIn');
    const savedAdminId = localStorage.getItem('adminId');
    if (isLoggedIn === 'true') {
      if (savedAdminId) setLoginData((prev) => ({ ...prev, adminId: savedAdminId }));
      const params = new URLSearchParams(window.location.search);
      if (params.get('view') !== 'pos') {
        setView('dashboard');
      }
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('isAdminLoggedIn', 'true');
    localStorage.setItem('adminId', loginData.adminId || 'admin');
    setView('dashboard');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Connecting to MySQL at ${registerData.dbHost}... Saving Admin ${registerData.adminId}...`);
    try {
      setAppData((prev) => ({
        ...prev,
        categories: [],
        areas: [],
        tables: [],
        orders: [],
        menu: [],
        inventory: [],
      }));
      localStorage.setItem('isAdminLoggedIn', 'true');
      localStorage.setItem('adminId', registerData.adminId);
      setView('dashboard');
    } catch (e) {
      console.error(e);
      alert('Error connecting to backend for initialization.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdminLoggedIn');
    setView('login');
  };

  return (
    <AppContext.Provider
      value={{
        view,
        setView,
        posMode,
        activeTab,
        setActiveTab,
        appData,
        setAppData,
        fetchBackendData,
        loginData,
        setLoginData,
        registerData,
        setRegisterData,
        handleLogin,
        handleRegister,
        handleLogout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
