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
  refreshMenu: () => Promise<void>;
  refreshCategories: () => Promise<void>;
  refreshAddons: () => Promise<void>;
  refreshInventory: () => Promise<void>;
  refreshTables: () => Promise<void>;
  refreshAreas: () => Promise<void>;
  refreshOrders: () => Promise<void>;
  refreshSettings: () => Promise<void>;

  // Store & License & Staff Auth State
  storeProfile: StoreProfileState | null;
  setStoreProfile: React.Dispatch<React.SetStateAction<StoreProfileState | null>>;
  licenseStatus: LicenseStatusState | null;
  currentUser: CurrentUserState | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<CurrentUserState | null>>;
  isAuthLoading: boolean;
  checkLicenseStatus: () => Promise<void>;
  handlePinLogin: (pin: string) => Promise<void>;
  handlePasswordLogin: (username: string, pass: string) => Promise<void>;
  handleLogout: () => Promise<void>;
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
  const [isAuthLoading, setIsAuthLoading] = useState(true);

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

      // Verify session via HttpOnly cookie
      try {
        const profile = await authApi.getProfile();
        if (profile && profile.sub) {
          const userObj = {
            id: profile.sub,
            username: profile.username,
            fullName: profile.fullName,
            role: profile.role,
          };
          setCurrentUser(userObj);
          localStorage.setItem('pos_current_user', JSON.stringify(userObj));
          const params = new URLSearchParams(window.location.search);
          setView(params.get('view') === 'pos' ? 'pos' : 'dashboard');
        } else {
          setCurrentUser(null);
          setView('login');
        }
      } catch {
        setCurrentUser(null);
        setView('login');
      }
    } catch (e) {
      console.warn('License check returned offline or unactivated state:', e);
      setView('register');
    } finally {
      setIsAuthLoading(false);
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

  // Lightweight periodic synchronization ONLY for relatable live data (Category visibility, Menu availability, and live Orders)
  const syncRelatableData = useCallback(async () => {
    try {
      const [catsRes, menusRes, ordersRes] = await Promise.allSettled([
        menuApi.getCategories(),
        menuApi.getMenuItems(),
        orderApi.getOrders(),
      ]);

      const cats =
        catsRes.status === 'fulfilled' && Array.isArray(catsRes.value) ? catsRes.value : null;
      const menus =
        menusRes.status === 'fulfilled' && Array.isArray(menusRes.value) ? menusRes.value : null;
      const orders =
        ordersRes.status === 'fulfilled' && Array.isArray(ordersRes.value) ? ordersRes.value : null;

      setAppData((prev) => ({
        ...prev,
        ...(cats !== null ? { categories: cats } : {}),
        ...(orders !== null ? { orders: orders } : {}),
        ...(menus !== null
          ? {
              menu: menus
                .filter((m: any) => !m.isAddon)
                .map((m: any) => ({
                  ...m,
                  image: m.imageUrl,
                  available: m.isAvailable,
                  category: m.category?.name || 'Uncategorized',
                  price: `₹${
                    typeof m.price === 'number'
                      ? m.price.toFixed(2)
                      : parseFloat(m.price || 0).toFixed(2)
                  }`,
                })),
            }
          : {}),
      }));
    } catch (e) {
      console.warn('Relatable live sync skipped:', e);
    }
  }, []);

  // Granular Single-API Refreshers (used on create/update/delete instead of querying all 8 APIs)
  const refreshCategories = useCallback(async () => {
    try {
      const cats = await menuApi.getCategories();
      if (Array.isArray(cats)) {
        setAppData((prev) => ({ ...prev, categories: cats }));
      }
    } catch (e) {
      console.error('Failed to refresh categories:', e);
    }
  }, []);

  const refreshMenu = useCallback(async () => {
    try {
      const menus = await menuApi.getMenuItems();
      if (Array.isArray(menus)) {
        setAppData((prev) => ({
          ...prev,
          menu: menus
            .filter((m: any) => !m.isAddon)
            .map((m: any) => ({
              ...m,
              image: m.imageUrl,
              available: m.isAvailable,
              category: m.category?.name || 'Uncategorized',
              price: `₹${
                typeof m.price === 'number'
                  ? m.price.toFixed(2)
                  : parseFloat(m.price || 0).toFixed(2)
              }`,
            })),
        }));
      }
    } catch (e) {
      console.error('Failed to refresh menu:', e);
    }
  }, []);

  const refreshAddons = useCallback(async () => {
    try {
      const addons = await menuApi.getAddons();
      if (Array.isArray(addons)) {
        setAppData((prev) => ({ ...prev, addons }));
      }
    } catch (e) {
      console.error('Failed to refresh addons:', e);
    }
  }, []);

  const refreshInventory = useCallback(async () => {
    try {
      const inventory = await inventoryApi.getInventory();
      if (Array.isArray(inventory)) {
        setAppData((prev) => ({ ...prev, inventory }));
      }
    } catch (e) {
      console.error('Failed to refresh inventory:', e);
    }
  }, []);

  const refreshTables = useCallback(async () => {
    try {
      const tables = await tableApi.getTables();
      if (Array.isArray(tables)) {
        setAppData((prev) => ({ ...prev, tables }));
      }
    } catch (e) {
      console.error('Failed to refresh tables:', e);
    }
  }, []);

  const refreshAreas = useCallback(async () => {
    try {
      const areas = await tableApi.getAreas();
      if (Array.isArray(areas)) {
        setAppData((prev) => ({ ...prev, areas }));
      }
    } catch (e) {
      console.error('Failed to refresh areas:', e);
    }
  }, []);

  const refreshOrders = useCallback(async () => {
    try {
      const orders = await orderApi.getOrders();
      if (Array.isArray(orders)) {
        setAppData((prev) => ({ ...prev, orders }));
      }
    } catch (e) {
      console.error('Failed to refresh orders:', e);
    }
  }, []);

  const refreshSettings = useCallback(async () => {
    try {
      const settings = await settingsApi.getSettings();
      if (settings) {
        setAppData((prev) => ({ ...prev, settings }));
      }
    } catch (e) {
      console.error('Failed to refresh settings:', e);
    }
  }, []);

  useEffect(() => {
    checkLicenseStatus();
  }, [checkLicenseStatus]);

  // Initial one-time snapshot of complete setup data
  useEffect(() => {
    if (view === 'dashboard' || view === 'pos') {
      fetchBackendData();
    }
  }, [view, fetchBackendData]);

  // Gentle 15-second background sync ONLY for relatable endpoints (Category, Menu, Orders)
  useEffect(() => {
    if (view === 'dashboard' || view === 'pos') {
      const intervalId = setInterval(syncRelatableData, 15000);
      return () => clearInterval(intervalId);
    }
  }, [view, syncRelatableData]);

  // Handle Staff PIN Login
  const handlePinLogin = async (pin: string) => {
    const res = await authApi.login({ pin });
    localStorage.removeItem('pos_jwt_token'); // Ensure legacy token is cleaned up
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
    localStorage.removeItem('pos_jwt_token'); // Ensure legacy token is cleaned up
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

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      console.error('Logout error:', e);
    }
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
        refreshMenu,
        refreshCategories,
        refreshAddons,
        refreshInventory,
        refreshTables,
        refreshAreas,
        refreshOrders,
        refreshSettings,
        storeProfile,
        setStoreProfile,
        licenseStatus,
        currentUser,
        setCurrentUser,
        isAuthLoading,
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
