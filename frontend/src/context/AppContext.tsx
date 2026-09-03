import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { AppData, Category, Addon, InventoryItem, Area, Table, Order, Settings } from '../types/app.types';
import { menuApi } from '../api/menuApi';
import { inventoryApi } from '../api/inventoryApi';
import { tableApi } from '../api/tableApi';
import { orderApi } from '../api/orderApi';
import { settingsApi } from '../api/settingsApi';
import { licenseApi } from '../api/licenseApi';
import { authApi } from '../api/authApi';

interface StoreProfileState {
  cafeCode: string;
  businessName: string;
  currencySymbol: string;
  receiptFooter?: string;
  logoUrl?: string | null;
  ownerName?: string;
  phone?: string;
  city?: string;
  state?: string;
  address?: string;
  gstin?: string;
}

interface LicenseStatusState {
  planCode: string;
  durationDays: number;
  expiresAt: string;
  daysRemaining: number;
  isExpired: boolean;
  isExpiringSoon: boolean;
  allowedModules: string[];
  status: string;
}

interface CurrentUserState {
  id: string;
  username: string;
  fullName: string;
  role: string;
}

interface AppContextType {
  view: 'login' | 'register' | 'dashboard' | 'pos';
  setView: (view: 'login' | 'register' | 'dashboard' | 'pos') => void;
  posMode: string | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  appData: AppData;
  setAppData: React.Dispatch<React.SetStateAction<AppData>>;
  fetchBackendData: () => Promise<void>;

  // Store & License & Staff Auth State
  storeProfile: StoreProfileState | null;
  setStoreProfile: React.Dispatch<React.SetStateAction<StoreProfileState | null>>;
  licenseStatus: LicenseStatusState | null;
  currentUser: CurrentUserState | null;
  checkLicenseStatus: () => Promise<void>;
  handlePinLogin: (pin: string) => Promise<void>;
  handlePasswordLogin: (username: string, pass: string) => Promise<void>;
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
  const [view, setView] = useState<'login' | 'register' | 'dashboard' | 'pos'>('login');

  const [posMode] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('mode');
  });

  const [activeTab, setActiveTab] = useState('Dashboard');
  const [appData, setAppData] = useState<AppData>(initialAppData);

  // Store & License & Staff Auth
  const [storeProfile, setStoreProfile] = useState<StoreProfileState | null>(null);
  const [licenseStatus, setLicenseStatus] = useState<LicenseStatusState | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUserState | null>(() => {
    const saved = localStorage.getItem('pos_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Check Local License Status on startup
  const checkLicenseStatus = useCallback(async () => {
    try {
      const res = await licenseApi.getStatus();
      if (!res.isActivated) {
        setView('register');
        return;
      }

      setStoreProfile(res.store);
      setLicenseStatus(res.license);

      const token = localStorage.getItem('pos_jwt_token');
      if (token && localStorage.getItem('pos_current_user')) {
        const params = new URLSearchParams(window.location.search);
        setView(params.get('view') === 'pos' ? 'pos' : 'dashboard');
      } else {
        setView('login');
      }
    } catch (e) {
      console.warn('License check returned offline or unactivated state:', e);
      setView('register');
    }
  }, []);

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
    checkLicenseStatus();
  }, [checkLicenseStatus]);

  useEffect(() => {
    if (view === 'dashboard' || view === 'pos') {
      fetchBackendData();
      const intervalId = setInterval(fetchBackendData, 5000);
      return () => clearInterval(intervalId);
    }
  }, [view, fetchBackendData]);

  // Handle Staff PIN Login
  const handlePinLogin = async (pin: string) => {
    const res = await authApi.login({ pin });
    localStorage.setItem('pos_jwt_token', res.token);
    localStorage.setItem('pos_current_user', JSON.stringify(res.user));
    setCurrentUser(res.user);
    setStoreProfile(res.store);
    setLicenseStatus({
      ...res.license,
      durationDays: 90,
      isExpired: res.license.daysRemaining <= 0,
      isExpiringSoon: res.license.daysRemaining <= 15,
    });
    setView('dashboard');
  };

  // Handle Owner Password Login
  const handlePasswordLogin = async (username: string, pass: string) => {
    const res = await authApi.login({ username, password: pass });
    localStorage.setItem('pos_jwt_token', res.token);
    localStorage.setItem('pos_current_user', JSON.stringify(res.user));
    setCurrentUser(res.user);
    setStoreProfile(res.store);
    setLicenseStatus({
      ...res.license,
      durationDays: 90,
      isExpired: res.license.daysRemaining <= 0,
      isExpiringSoon: res.license.daysRemaining <= 15,
    });
    setView('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('pos_jwt_token');
    localStorage.removeItem('pos_current_user');
    setCurrentUser(null);
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
        storeProfile,
        setStoreProfile,
        licenseStatus,
        currentUser,
        checkLicenseStatus,
        handlePinLogin,
        handlePasswordLogin,
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
