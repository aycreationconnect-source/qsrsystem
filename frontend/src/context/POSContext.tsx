import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { CartItem, TableOrderState, OrderPayment } from '../types/app.types';
import { useApp } from './AppContext';
import { orderApi } from '../api/orderApi';
import { inventoryApi } from '../api/inventoryApi';
import { roundPOSAmount, getStoreGlobalTaxRate, getItemTaxRate, mergeOrAddPayment } from '../lib/orderUtils';
import { toast } from './ToastContext';
import type { ReservationData } from '../components/pos/POSReserveTableModal';

export type DietFilterType = 'ALL' | 'Veg' | 'Non-Veg' | 'Egg' | 'Vegan';

interface POSContextType {
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  posCategory: string;
  setPosCategory: (cat: string) => void;
  posSearchQuery: string;
  setPosSearchQuery: (query: string) => void;
  dietFilter: DietFilterType;
  setDietFilter: (filter: DietFilterType) => void;
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  showCheckoutModal: boolean;
  setShowCheckoutModal: (show: boolean) => void;
  showOrderHistoryModal: boolean;
  setShowOrderHistoryModal: (show: boolean) => void;
  paymentType: string;
  setPaymentType: (type: string) => void;
  discountType: 'percent' | 'fixed';
  setDiscountType: (type: 'percent' | 'fixed') => void;
  discountValue: string;
  setDiscountValue: (val: string) => void;
  extraChargeType: 'percent' | 'fixed';
  setExtraChargeType: (type: 'percent' | 'fixed') => void;
  extraChargeValue: string;
  setExtraChargeValue: (val: string) => void;
  orderSuccess: boolean;
  setOrderSuccess: (val: boolean) => void;

  tableOrders: Record<string, TableOrderState>;
  setTableOrders: React.Dispatch<React.SetStateAction<Record<string, TableOrderState>>>;
  tablePayments: Record<string, OrderPayment[]>;
  setTablePayments: React.Dispatch<React.SetStateAction<Record<string, OrderPayment[]>>>;
  tableStartTimes: Record<string, number>;
  setTableStartTimes: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  tablePrinted: Record<string, boolean>;
  setTablePrinted: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  tableReservations: Record<string, ReservationData>;
  setTableReservations: React.Dispatch<React.SetStateAction<Record<string, ReservationData>>>;
  tableCleaningStatus: Record<string, boolean>;
  setTableCleaningStatus: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  selectedTableId: string | null;
  setSelectedTableId: (id: string | null) => void;
  now: number;

  reserveTable: (tableId: string | number, data: ReservationData) => void;
  cancelReservation: (tableId: string | number) => void;
  markTableCleaning: (tableId: string | number, isCleaning: boolean) => void;

  isCategorySidebarCollapsed: boolean;
  setIsCategorySidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  toggleCategorySidebar: () => void;

  showAddTableModal: boolean;
  setShowAddTableModal: (show: boolean) => void;
  newTableName: string;
  setNewTableName: (name: string) => void;
  showShiftTableModal: boolean;
  setShowShiftTableModal: (show: boolean) => void;

  addonSelectionItem: any;
  setAddonSelectionItem: (item: any) => void;
  selectedAddonIds: string[];
  setSelectedAddonIds: React.Dispatch<React.SetStateAction<string[]>>;

  // Actions
  handleAddToCart: (item: any, skipAddonCheck?: boolean) => void;
  updateCartQty: (itemOrName: any, delta: number) => void;
  updateCartQtyExact: (itemOrName: any, qty: number) => void;
  cancelCartItem: (itemName: string) => void;
  saveTableOrder: () => void;
  cancelKOTItem: (tableId: string | number, orderIdx: number, itemIdx: number) => void;
  cancelKOTBatch: (tableId: string | number, batchIdx: number) => void;
  updateKOTBatch: (tableId: string | number, batchIdx: number, updatedItems: CartItem[], kitchenNote?: string) => void;
  shiftKOTBatch: (sourceTableId: string | number, batchIdx: number, targetTableId: string | number) => void;
  cancelTableOrder: (tableId: string | number, reason: string) => Promise<void>;
  addTablePayment: (tableId: string, payment: OrderPayment) => void;
  removeTablePayment: (tableId: string, index: number) => void;
  getCartTotals: () => { subtotal: number; tax: number; total: number; paidAmount: number; balanceDue: number };
  confirmPaymentAndOrder: (splitPayments?: OrderPayment[], description?: string) => Promise<void>;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

export const getCartItemKey = (item: any): string => {
  if (!item) return '';
  if (item.cartKey) return item.cartKey;
  const addonPart =
    item.selectedAddons && item.selectedAddons.length > 0
      ? item.selectedAddons
          .map((a: any) => `${a.id || a.name}:${a.quantity || 1}`)
          .sort()
          .join('|')
      : 'no-addons';
  return `${item.id || item.name}__${addonPart}`;
};

export const POSProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { posMode, appData, refreshOrders, refreshTables, refreshInventory } = useApp();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [posCategory, setPosCategory] = useState<string>('All Items');
  const [posSearchQuery, setPosSearchQuery] = useState('');
  const [dietFilter, setDietFilter] = useState<DietFilterType>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [isCategorySidebarCollapsed, setIsCategorySidebarCollapsed] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('pos_category_sidebar_collapsed');
      return saved === 'true';
    } catch {
      return false;
    }
  });

  const toggleCategorySidebar = () => {
    setIsCategorySidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('pos_category_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showOrderHistoryModal, setShowOrderHistoryModal] = useState(false);
  const [paymentType, setPaymentType] = useState('Cash');
  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('fixed');
  const [discountValue, setDiscountValue] = useState('');
  const [extraChargeType, setExtraChargeType] = useState<'percent' | 'fixed'>('fixed');
  const [extraChargeValue, setExtraChargeValue] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);

  const [tableOrders, setTableOrders] = useState<Record<string, TableOrderState>>(() => {
    try {
      const saved = localStorage.getItem('pos_table_orders');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [tableStartTimes, setTableStartTimes] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('pos_table_start_times');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [tablePrinted, setTablePrinted] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('pos_table_printed');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [tablePayments, setTablePayments] = useState<Record<string, OrderPayment[]>>(() => {
    try {
      const saved = localStorage.getItem('pos_table_payments');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());

  const [tableReservations, setTableReservations] = useState<Record<string, ReservationData>>(() => {
    try {
      const saved = localStorage.getItem('pos_table_reservations');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [tableCleaningStatus, setTableCleaningStatus] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('pos_table_cleaning');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [showAddTableModal, setShowAddTableModal] = useState(false);
  const [newTableName, setNewTableName] = useState('');
  const [showShiftTableModal, setShowShiftTableModal] = useState(false);

  const [addonSelectionItem, setAddonSelectionItem] = useState<any>(null);
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);

  // Timer interval
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Persist table state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('pos_table_orders', JSON.stringify(tableOrders));
    } catch (e) {
      console.error('Failed to sync table orders to localStorage', e);
    }
  }, [tableOrders]);

  useEffect(() => {
    try {
      localStorage.setItem('pos_table_payments', JSON.stringify(tablePayments));
    } catch (e) {
      console.error('Failed to sync table payments to localStorage', e);
    }
  }, [tablePayments]);

  useEffect(() => {
    try {
      localStorage.setItem('pos_table_start_times', JSON.stringify(tableStartTimes));
    } catch (e) {
      console.error('Failed to sync table start times to localStorage', e);
    }
  }, [tableStartTimes]);

  useEffect(() => {
    try {
      localStorage.setItem('pos_table_printed', JSON.stringify(tablePrinted));
    } catch (e) {
      console.error('Failed to sync table printed status to localStorage', e);
    }
  }, [tablePrinted]);

  useEffect(() => {
    try {
      localStorage.setItem('pos_table_reservations', JSON.stringify(tableReservations));
    } catch (e) {
      console.error('Failed to sync table reservations to localStorage', e);
    }
  }, [tableReservations]);

  useEffect(() => {
    try {
      localStorage.setItem('pos_table_cleaning', JSON.stringify(tableCleaningStatus));
    } catch (e) {
      console.error('Failed to sync table cleaning to localStorage', e);
    }
  }, [tableCleaningStatus]);

  // Sync across tabs / windows via storage event
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'pos_table_orders' && e.newValue) {
        try {
          setTableOrders(JSON.parse(e.newValue));
        } catch {}
      }
      if (e.key === 'pos_table_start_times' && e.newValue) {
        try {
          setTableStartTimes(JSON.parse(e.newValue));
        } catch {}
      }
      if (e.key === 'pos_table_printed' && e.newValue) {
        try {
          setTablePrinted(JSON.parse(e.newValue));
        } catch {}
      }
      if (e.key === 'pos_table_reservations' && e.newValue) {
        try {
          setTableReservations(JSON.parse(e.newValue));
        } catch {}
      }
      if (e.key === 'pos_table_cleaning' && e.newValue) {
        try {
          setTableCleaningStatus(JSON.parse(e.newValue));
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const reserveTable = useCallback((tableId: string | number, data: ReservationData) => {
    const key = String(tableId);
    setTableReservations((prev) => ({ ...prev, [key]: data }));
    setTableCleaningStatus((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  }, []);

  const cancelReservation = useCallback((tableId: string | number) => {
    const key = String(tableId);
    setTableReservations((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  }, []);

  const markTableCleaning = useCallback((tableId: string | number, isCleaning: boolean) => {
    const key = String(tableId);
    setTableCleaningStatus((prev) => {
      const copy = { ...prev };
      if (isCleaning) {
        copy[key] = true;
      } else {
        delete copy[key];
      }
      return copy;
    });
  }, []);

  const updateTableActiveCart = useCallback((tableId: string | number, newCart: CartItem[]) => {
    const key = String(tableId);
    setTableOrders((prev) => {
      const existing = prev[key] || prev[tableId] || { savedOrders: [], activeCart: [] };
      return { ...prev, [key]: { ...existing, activeCart: newCart } };
    });

    if (newCart.length > 0) {
      setTableStartTimes((prev) => {
        if (!prev[key] && !prev[tableId]) {
          return { ...prev, [key]: Date.now() };
        }
        return prev;
      });
    }
  }, []);

  const saveTableOrder = useCallback(async () => {
    if (posMode !== 'table' || !selectedTableId || cart.length === 0) return;
    const key = String(selectedTableId);
    const tableObj = appData.tables.find((t: any) => String(t.id) === key);
    const tableName = tableObj ? tableObj.name : `Table ${key}`;

    const itemsToDeduct = cart.map((item) => ({
      menuItemId: Number(item.id || (item as any).menuItemId),
      quantity: Number(item.quantity) || 1,
    }));
    const itemsWithFlag = cart.map((i) => ({ ...i, kotDeducted: true }));

    setTableOrders((prev) => {
      const existing = prev[key] || prev[selectedTableId] || { savedOrders: [], activeCart: [] };
      return {
        ...prev,
        [key]: {
          savedOrders: [
            ...existing.savedOrders,
            { items: itemsWithFlag, time: Date.now(), kotDeducted: true },
          ],
          activeCart: [],
        },
      };
    });
    setCart([]);

    try {
      await inventoryApi.deductStock(
        itemsToDeduct,
        `KOT: ${tableName} - ${cart.map((c) => `${c.name} x${c.quantity}`).join(', ')}`
      );
      await refreshInventory();
      toast.success('KOT sent to kitchen & inventory stock deducted!');
    } catch (err) {
      console.error('Failed to deduct inventory for KOT:', err);
      toast.error('KOT sent, but failed to sync inventory deduction with server.');
    }
  }, [posMode, selectedTableId, cart, appData.tables, refreshInventory]);

  const handleAddToCart = useCallback(
    (item: any, skipAddonCheck = false) => {
      if (item.available === false) {
        return;
      }

      if (posMode === 'table' && !selectedTableId) {
        toast.warning('Please select a table from the left sidebar to add items.');
        return;
      }

      if (!skipAddonCheck && item.addonIds && item.addonIds.trim() !== '') {
        setAddonSelectionItem(item);
        setSelectedAddonIds([]);
        return;
      }

      setCart((prev) => {
        let newCart: CartItem[];
        const key = item.cartKey || getCartItemKey(item);
        const itemWithKey = { ...item, cartKey: key };
        const existingIndex = prev.findIndex((i) => (i.cartKey || getCartItemKey(i)) === key);
        if (existingIndex > -1) {
          newCart = prev.map((i, idx) =>
            idx === existingIndex ? { ...i, quantity: i.quantity + 1 } : i
          );
        } else {
          newCart = [...prev, { ...itemWithKey, quantity: 1 }];
        }
        if (posMode === 'table' && selectedTableId) updateTableActiveCart(selectedTableId, newCart);
        return newCart;
      });
    },
    [posMode, selectedTableId, updateTableActiveCart]
  );

  const updateCartQty = useCallback(
    (itemOrName: any, delta: number) => {
      setCart((prev) => {
        let newCart: CartItem[];
        const key =
          typeof itemOrName === 'string'
            ? itemOrName
            : itemOrName.cartKey || getCartItemKey(itemOrName);
        const existingIndex = prev.findIndex(
          (i) => (i.cartKey || getCartItemKey(i)) === key || i.name === key
        );
        if (existingIndex > -1) {
          newCart = prev
            .map((i, idx) =>
              idx === existingIndex ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i
            )
            .filter((i) => i.quantity > 0);
        } else if (delta > 0 && typeof itemOrName !== 'string') {
          const itemKey = itemOrName.cartKey || getCartItemKey(itemOrName);
          newCart = [...prev, { ...itemOrName, cartKey: itemKey, quantity: delta }];
        } else {
          newCart = prev;
        }
        if (posMode === 'table' && selectedTableId) updateTableActiveCart(selectedTableId, newCart);
        return newCart;
      });
    },
    [posMode, selectedTableId, updateTableActiveCart]
  );

  const updateCartQtyExact = useCallback(
    (itemOrName: any, qty: number) => {
      setCart((prev) => {
        let newCart: CartItem[];
        const key =
          typeof itemOrName === 'string'
            ? itemOrName
            : itemOrName.cartKey || getCartItemKey(itemOrName);
        const existingIndex = prev.findIndex(
          (i) => (i.cartKey || getCartItemKey(i)) === key || i.name === key
        );
        if (existingIndex > -1) {
          newCart = prev
            .map((i, idx) => (idx === existingIndex ? { ...i, quantity: Math.max(0, qty) } : i))
            .filter((i) => i.quantity > 0);
        } else if (qty > 0 && typeof itemOrName !== 'string') {
          const itemKey = itemOrName.cartKey || getCartItemKey(itemOrName);
          newCart = [...prev, { ...itemOrName, cartKey: itemKey, quantity: qty }];
        } else {
          newCart = prev;
        }
        if (posMode === 'table' && selectedTableId) updateTableActiveCart(selectedTableId, newCart);
        return newCart;
      });
    },
    [posMode, selectedTableId, updateTableActiveCart]
  );

  const cancelCartItem = useCallback(
    (itemName: string) => {
      setCart((prev) => {
        const newCart = prev.filter(
          (i) =>
            (i.cartKey || getCartItemKey(i)) !== itemName &&
            i.name !== itemName
        );
        if (posMode === 'table' && selectedTableId) updateTableActiveCart(selectedTableId, newCart);
        return newCart;
      });
    },
    [posMode, selectedTableId, updateTableActiveCart]
  );

  const cancelKOTItem = useCallback(
    async (tableId: string | number, orderIdx: number, itemIdx: number) => {
      const key = String(tableId);
      const existing = tableOrders[key] || tableOrders[tableId];
      if (!existing || !existing.savedOrders || !existing.savedOrders[orderIdx]) {
        return;
      }

      const targetOrder = existing.savedOrders[orderIdx];
      const rawItems = targetOrder.items || (Array.isArray(targetOrder) ? targetOrder : []);
      const itemToRevert = rawItems[itemIdx];

      // Revert inventory stock if this item/batch was KOT-deducted
      if (itemToRevert && (itemToRevert.kotDeducted !== false || targetOrder.kotDeducted !== false)) {
        const tableObj = appData.tables.find((t: any) => String(t.id) === key);
        const tableName = tableObj ? tableObj.name : `Table ${key}`;
        try {
          await inventoryApi.revertStock(
            [
              {
                menuItemId: Number(itemToRevert.id || (itemToRevert as any).menuItemId),
                quantity: Number(itemToRevert.quantity) || 1,
              },
            ],
            `KOT Item Cancelled: ${tableName} - ${itemToRevert.name} x${itemToRevert.quantity}`
          );
          await refreshInventory();
        } catch (err) {
          console.error('Failed to revert inventory for cancelled KOT item:', err);
        }
      }

      setTableOrders((prev) => {
        const curExisting = prev[key] || prev[tableId];
        if (!curExisting || !curExisting.savedOrders || !curExisting.savedOrders[orderIdx]) {
          return prev;
        }

        const savedOrders = [...curExisting.savedOrders];
        const curTargetOrder = { ...savedOrders[orderIdx] };
        const curRawItems = curTargetOrder.items || (Array.isArray(curTargetOrder) ? curTargetOrder : []);
        const updatedItems = curRawItems.filter((_: any, idx: number) => idx !== itemIdx);

        if (updatedItems.length === 0) {
          savedOrders.splice(orderIdx, 1);
        } else {
          savedOrders[orderIdx] = { ...curTargetOrder, items: updatedItems };
        }

        const hasRemainingItems =
          savedOrders.length > 0 || (curExisting.activeCart && curExisting.activeCart.length > 0);

        if (!hasRemainingItems) {
          const nextState = { ...prev };
          delete nextState[key];
          delete nextState[tableId];

          setTablePayments((tp) => {
            const ntp = { ...tp };
            delete ntp[key];
            delete ntp[tableId];
            return ntp;
          });
          setTableStartTimes((tst) => {
            const ntst = { ...tst };
            delete ntst[key];
            delete ntst[tableId];
            return ntst;
          });
          setTablePrinted((tp) => {
            const ntp = { ...tp };
            delete ntp[key];
            delete ntp[tableId];
            return ntp;
          });

          toast.info('All KOT items removed. Table is now available.');
          return nextState;
        }

        toast.info('Item removed from KOT & stock reverted.');
        return {
          ...prev,
          [key]: {
            ...curExisting,
            savedOrders,
          },
        };
      });
    },
    [tableOrders, appData.tables, refreshInventory]
  );

  const cancelKOTBatch = useCallback(
    async (tableId: string | number, batchIdx: number) => {
      const key = String(tableId);
      const existing = tableOrders[key] || tableOrders[tableId];
      if (!existing || !existing.savedOrders || !existing.savedOrders[batchIdx]) {
        return;
      }

      const batchToCancel = existing.savedOrders[batchIdx];
      const isDeducted = batchToCancel.kotDeducted !== false;
      const itemsToRevert = (batchToCancel.items || []).map((item) => ({
        menuItemId: Number(item.id || (item as any).menuItemId),
        quantity: Number(item.quantity) || 1,
      }));

      if (itemsToRevert.length > 0 && isDeducted) {
        const tableObj = appData.tables.find((t: any) => String(t.id) === key);
        const tableName = tableObj ? tableObj.name : `Table ${key}`;
        try {
          await inventoryApi.revertStock(
            itemsToRevert,
            `KOT Batch #${batchIdx + 1} Cancelled: ${tableName}`
          );
          await refreshInventory();
        } catch (err) {
          console.error('Failed to revert inventory for cancelled KOT batch:', err);
        }
      }

      setTableOrders((prev) => {
        const curExisting = prev[key] || prev[tableId];
        if (!curExisting || !curExisting.savedOrders || !curExisting.savedOrders[batchIdx]) {
          return prev;
        }

        const savedOrders = curExisting.savedOrders.filter((_, idx) => idx !== batchIdx);
        const hasRemainingItems =
          savedOrders.length > 0 || (curExisting.activeCart && curExisting.activeCart.length > 0);

        if (!hasRemainingItems) {
          const nextState = { ...prev };
          delete nextState[key];
          delete nextState[tableId];

          setTablePayments((tp) => {
            const ntp = { ...tp };
            delete ntp[key];
            delete ntp[tableId];
            return ntp;
          });
          setTableStartTimes((tst) => {
            const ntst = { ...tst };
            delete ntst[key];
            delete ntst[tableId];
            return ntst;
          });
          setTablePrinted((tp) => {
            const ntp = { ...tp };
            delete ntp[key];
            delete ntp[tableId];
            return ntp;
          });

          toast.info(`KOT Batch #${batchIdx + 1} cancelled & stock reverted. Table is now available.`);
          return nextState;
        }

        toast.info(`KOT Batch #${batchIdx + 1} cancelled & stock reverted.`);
        return {
          ...prev,
          [key]: {
            ...curExisting,
            savedOrders,
          },
        };
      });
    },
    [tableOrders, appData.tables, refreshInventory]
  );

  const updateKOTBatch = useCallback(
    async (tableId: string | number, batchIdx: number, updatedItems: CartItem[], kitchenNote?: string) => {
      const key = String(tableId);
      const existing = tableOrders[key] || tableOrders[tableId];
      if (!existing || !existing.savedOrders || !existing.savedOrders[batchIdx]) {
        return;
      }

      const currentBatch = existing.savedOrders[batchIdx];
      const prevItems = currentBatch.items || [];
      const validItems = updatedItems.filter((i) => i.quantity > 0).map((i) => ({ ...i, kotDeducted: true }));

      // Calculate inventory differences between previous batch and updated batch
      if (currentBatch.kotDeducted !== false) {
        const prevQtyMap = new Map<number, { name: string; qty: number }>();
        prevItems.forEach((it) => {
          const mid = Number(it.id || (it as any).menuItemId);
          const cur = prevQtyMap.get(mid) || { name: it.name, qty: 0 };
          cur.qty += Number(it.quantity) || 0;
          prevQtyMap.set(mid, cur);
        });

        const newQtyMap = new Map<number, { name: string; qty: number }>();
        validItems.forEach((it) => {
          const mid = Number(it.id || (it as any).menuItemId);
          const cur = newQtyMap.get(mid) || { name: it.name, qty: 0 };
          cur.qty += Number(it.quantity) || 0;
          newQtyMap.set(mid, cur);
        });

        const itemsToRevert: Array<{ menuItemId: number; quantity: number }> = [];
        const itemsToDeduct: Array<{ menuItemId: number; quantity: number }> = [];

        // Check items that were reduced or removed
        prevQtyMap.forEach((prevVal, mid) => {
          const newVal = newQtyMap.get(mid)?.qty || 0;
          if (newVal < prevVal.qty) {
            itemsToRevert.push({ menuItemId: mid, quantity: prevVal.qty - newVal });
          }
        });

        // Check items that were increased or newly added
        newQtyMap.forEach((newVal, mid) => {
          const prevVal = prevQtyMap.get(mid)?.qty || 0;
          if (newVal.qty > prevVal) {
            itemsToDeduct.push({ menuItemId: mid, quantity: newVal.qty - prevVal });
          }
        });

        const tableObj = appData.tables.find((t: any) => String(t.id) === key);
        const tableName = tableObj ? tableObj.name : `Table ${key}`;

        try {
          if (itemsToRevert.length > 0) {
            await inventoryApi.revertStock(
              itemsToRevert,
              `KOT Batch #${batchIdx + 1} Edited (Reduced): ${tableName}`
            );
          }
          if (itemsToDeduct.length > 0) {
            await inventoryApi.deductStock(
              itemsToDeduct,
              `KOT Batch #${batchIdx + 1} Edited (Added): ${tableName}`
            );
          }
          if (itemsToRevert.length > 0 || itemsToDeduct.length > 0) {
            await refreshInventory();
          }
        } catch (err) {
          console.error('Failed to sync inventory on KOT batch edit:', err);
        }
      }

      setTableOrders((prev) => {
        const curExisting = prev[key] || prev[tableId];
        if (!curExisting || !curExisting.savedOrders || !curExisting.savedOrders[batchIdx]) {
          return prev;
        }

        const savedOrders = [...curExisting.savedOrders];
        if (validItems.length === 0) {
          savedOrders.splice(batchIdx, 1);
        } else {
          savedOrders[batchIdx] = {
            ...savedOrders[batchIdx],
            items: validItems,
            note: kitchenNote?.trim() || savedOrders[batchIdx].note,
            updatedAt: Date.now(),
            kotDeducted: true,
          };
        }

        const hasRemainingItems =
          savedOrders.length > 0 || (curExisting.activeCart && curExisting.activeCart.length > 0);

        if (!hasRemainingItems) {
          const nextState = { ...prev };
          delete nextState[key];
          delete nextState[tableId];

          setTablePayments((tp) => {
            const ntp = { ...tp };
            delete ntp[key];
            delete ntp[tableId];
            return ntp;
          });
          setTableStartTimes((tst) => {
            const ntst = { ...tst };
            delete ntst[key];
            delete ntst[tableId];
            return ntst;
          });
          setTablePrinted((tp) => {
            const ntp = { ...tp };
            delete ntp[key];
            delete ntp[tableId];
            return ntp;
          });

          toast.info('All items removed from KOT & stock adjusted. Table is now available.');
          return nextState;
        }

        toast.success(`KOT Batch #${batchIdx + 1} updated & stock synchronized!`);
        return {
          ...prev,
          [key]: {
            ...curExisting,
            savedOrders,
          },
        };
      });
    },
    [tableOrders, appData.tables, refreshInventory]
  );

  const shiftKOTBatch = useCallback(
    (sourceTableId: string | number, batchIdx: number, targetTableId: string | number) => {
      const srcKey = String(sourceTableId);
      const tgtKey = String(targetTableId);
      if (srcKey === tgtKey) return;

      let sourceEmptyAfterShift = false;

      setTableOrders((prev) => {
        const srcOrder = prev[srcKey] || prev[sourceTableId];
        if (!srcOrder || !srcOrder.savedOrders || !srcOrder.savedOrders[batchIdx]) {
          return prev;
        }

        const batchToMove = srcOrder.savedOrders[batchIdx];
        const newSrcSavedOrders = srcOrder.savedOrders.filter((_, idx) => idx !== batchIdx);

        // Target table order
        const tgtOrder = prev[tgtKey] || prev[targetTableId] || { savedOrders: [], activeCart: [] };
        const newTgtSavedOrders = [...tgtOrder.savedOrders, batchToMove];

        const nextState = { ...prev };
        nextState[tgtKey] = {
          ...tgtOrder,
          savedOrders: newTgtSavedOrders,
        };

        // Ensure target table has start time
        setTableStartTimes((tst) => {
          if (!tst[tgtKey] && !tst[targetTableId]) {
            return { ...tst, [tgtKey]: Date.now() };
          }
          return tst;
        });

        // Check if source table is empty
        const srcHasRemaining =
          newSrcSavedOrders.length > 0 || (srcOrder.activeCart && srcOrder.activeCart.length > 0);

        if (!srcHasRemaining) {
          sourceEmptyAfterShift = true;
          delete nextState[srcKey];
          delete nextState[sourceTableId];

          setTablePayments((tp) => {
            const n = { ...tp };
            delete n[srcKey];
            delete n[sourceTableId];
            return n;
          });
          setTableStartTimes((tst) => {
            const n = { ...tst };
            delete n[srcKey];
            delete n[sourceTableId];
            return n;
          });
          setTablePrinted((tp) => {
            const n = { ...tp };
            delete n[srcKey];
            delete n[sourceTableId];
            return n;
          });
        } else {
          nextState[srcKey] = {
            ...srcOrder,
            savedOrders: newSrcSavedOrders,
          };
        }

        return nextState;
      });

      const srcTable = appData.tables.find((t: any) => String(t.id) === srcKey);
      const tgtTable = appData.tables.find((t: any) => String(t.id) === tgtKey);
      toast.success(
        `KOT Batch #${batchIdx + 1} shifted from ${srcTable?.name || `Table ${srcKey}`} to ${tgtTable?.name || `Table ${tgtKey}`}!`
      );

      // If source table is now empty, switch view to target table
      if (sourceEmptyAfterShift || selectedTableId === srcKey) {
        setSelectedTableId(tgtKey);
      }
    },
    [appData.tables, selectedTableId]
  );

  const cancelTableOrder = useCallback(
    async (tableId: string | number, reason: string) => {
      const key = String(tableId);
      const orderData = tableOrders[key] || tableOrders[tableId];
      const tableObj = appData.tables.find((t: any) => String(t.id) === key);
      const tableName = tableObj ? tableObj.name : `Table ${key}`;

      let combinedItems: CartItem[] = [];
      const itemsToRevert: Array<{ menuItemId: number; quantity: number }> = [];

      if (orderData) {
        if (orderData.savedOrders) {
          orderData.savedOrders.forEach((o: any) => {
            const items = o.items || (Array.isArray(o) ? o : []);
            combinedItems = [...combinedItems, ...items];
            if (o.kotDeducted !== false) {
              items.forEach((it: any) => {
                itemsToRevert.push({
                  menuItemId: Number(it.id || it.menuItemId),
                  quantity: Number(it.quantity) || 1,
                });
              });
            }
          });
        }
        if (orderData.activeCart) {
          combinedItems = [...combinedItems, ...orderData.activeCart];
        }
      }

      // Revert any previously deducted KOT stocks
      if (itemsToRevert.length > 0) {
        try {
          await inventoryApi.revertStock(
            itemsToRevert,
            `Table Order Cancelled: ${tableName}${reason ? ` | Reason: ${reason}` : ''}`
          );
        } catch (err) {
          console.error('Failed to revert inventory on table order cancellation:', err);
        }
      }

      // If there are items, compute totals and record a Cancelled order in DB
      if (combinedItems.length > 0) {
        let subtotal = 0;
        let tax = 0;
        let total = 0;
        const globalTaxRate = getStoreGlobalTaxRate(appData.settings);
        const isReverseCalc = appData.settings?.taxCalculationType === 'reverse';

        if (isReverseCalc) {
          let grossTotal = 0;
          let calculatedTax = 0;
          combinedItems.forEach((item) => {
            const price = parseFloat(String(item.price).replace(/[^0-9.]/g, '')) || 0;
            const itemGross = price * item.quantity;
            grossTotal += itemGross;
            const itemTaxRate = getItemTaxRate(item, appData.menu, globalTaxRate);
            if (itemTaxRate > 0) {
              const itemBase = itemGross / (1 + itemTaxRate / 100);
              calculatedTax += itemGross - itemBase;
            }
          });
          tax = parseFloat(calculatedTax.toFixed(2));
          subtotal = parseFloat((grossTotal - tax).toFixed(2));
          total = parseFloat(grossTotal.toFixed(2));
        } else {
          let calculatedTax = 0;
          combinedItems.forEach((item) => {
            const price = parseFloat(String(item.price).replace(/[^0-9.]/g, '')) || 0;
            const itemSubtotal = price * item.quantity;
            subtotal += itemSubtotal;
            const itemTaxRate = getItemTaxRate(item, appData.menu, globalTaxRate);
            if (itemTaxRate > 0) {
              calculatedTax += itemSubtotal * (itemTaxRate / 100);
            }
          });
          tax = parseFloat(calculatedTax.toFixed(2));
          total = parseFloat((subtotal + tax).toFixed(2));
        }

        const orderDetails = {
          items: combinedItems.map((c) => ({
            menuItemId: c.id,
            quantity: c.quantity,
            price: parseFloat(c.price.toString().replace(/[^0-9.]/g, '')) || 0,
          })),
          subtotal,
          tax,
          total: roundPOSAmount(total),
          paymentMethod: 'Cancelled',
          payments: [],
          status: 'Cancelled',
          description: `Cancelled Table Order: ${tableName}${reason ? ` | Reason: ${reason}` : ''}`,
        };

        try {
          const placedOrder = await orderApi.placeOrder(orderDetails);
          if (placedOrder && placedOrder.id) {
            window.dispatchEvent(
              new CustomEvent('velora-order-completed', { detail: placedOrder })
            );
          }
          await Promise.allSettled([
            refreshOrders(),
            refreshTables(),
            refreshInventory(),
          ]);
        } catch (err) {
          console.error('Error logging cancelled order to backend:', err);
        }
      }

      // Clear table states
      setTableOrders((t) => {
        const next = { ...t };
        delete next[key];
        delete next[tableId];
        return next;
      });
      setTablePayments((t) => {
        const next = { ...t };
        delete next[key];
        delete next[tableId];
        return next;
      });
      setTableStartTimes((t) => {
        const next = { ...t };
        delete next[key];
        delete next[tableId];
        return next;
      });
      setTablePrinted((t) => {
        const next = { ...t };
        delete next[key];
        delete next[tableId];
        return next;
      });

      if (selectedTableId === String(tableId) || selectedTableId === tableId) {
        setCart([]);
        setSelectedTableId(null);
      }

      toast.success(`Order for ${tableName} cancelled successfully.`);
    },
    [
      tableOrders,
      appData.tables,
      appData.settings,
      appData.menu,
      selectedTableId,
      refreshOrders,
      refreshTables,
      refreshInventory,
    ]
  );

  const addTablePayment = useCallback((tableId: string, payment: OrderPayment) => {
    const key = String(tableId);
    setTablePayments((prev) => {
      const existing = prev[key] || [];
      return {
        ...prev,
        [key]: mergeOrAddPayment(existing, payment),
      };
    });
  }, []);

  const removeTablePayment = useCallback((tableId: string, index: number) => {
    const key = String(tableId);
    setTablePayments((prev) => {
      const existing = prev[key] || [];
      const updated = existing.filter((_, i) => i !== index);
      return {
        ...prev,
        [key]: updated,
      };
    });
  }, []);

  const getCartTotals = useCallback(() => {
    let combinedItems: CartItem[] = [...cart];
    if (posMode === 'table' && selectedTableId && tableOrders[selectedTableId]) {
      tableOrders[selectedTableId].savedOrders.forEach((order) => {
        combinedItems = [...combinedItems, ...(order.items || (order as any))];
      });
    }
    let subtotal = 0;
    let tax = 0;
    let total = 0;
    const globalTaxRate = getStoreGlobalTaxRate(appData.settings);
    const isReverseCalc = appData.settings?.taxCalculationType === 'reverse';

    if (isReverseCalc) {
      // Reverse Calculation: menu prices already include tax.
      // Total equals sum of gross item amounts, and base subtotal + tax are back-calculated.
      let grossTotal = 0;
      let calculatedTax = 0;

      combinedItems.forEach((item) => {
        const price = parseFloat(String(item.price).replace(/[^0-9.]/g, '')) || 0;
        const itemGross = price * item.quantity;
        grossTotal += itemGross;

        const itemTaxRate = getItemTaxRate(item, appData.menu, globalTaxRate);
        if (itemTaxRate > 0) {
          const itemBase = itemGross / (1 + itemTaxRate / 100);
          calculatedTax += itemGross - itemBase;
        }
      });

      tax = parseFloat(calculatedTax.toFixed(2));
      subtotal = parseFloat((grossTotal - tax).toFixed(2));
      total = parseFloat(grossTotal.toFixed(2));
    } else {
      // Standard Exclusive Calculation: taxes are added on top of item base subtotal.
      let calculatedTax = 0;

      combinedItems.forEach((item) => {
        const price = parseFloat(String(item.price).replace(/[^0-9.]/g, '')) || 0;
        const itemSubtotal = price * item.quantity;
        subtotal += itemSubtotal;

        const itemTaxRate = getItemTaxRate(item, appData.menu, globalTaxRate);
        if (itemTaxRate > 0) {
          calculatedTax += itemSubtotal * (itemTaxRate / 100);
        }
      });

      tax = parseFloat(calculatedTax.toFixed(2));
      total = parseFloat((subtotal + tax).toFixed(2));
    }

    let paidAmount = 0;
    if (posMode === 'table' && selectedTableId) {
      const key = String(selectedTableId);
      const payments = tablePayments[key] || tablePayments[selectedTableId] || [];
      paidAmount = payments.reduce((sum, p) => sum + (parseFloat(String(p.amount)) || 0), 0);
    }
    const balanceDue = Math.max(0, parseFloat((total - paidAmount).toFixed(2)));

    return { subtotal, tax, total, paidAmount, balanceDue };
  }, [cart, posMode, selectedTableId, tableOrders, tablePayments, appData.settings, appData.menu]);

  const confirmPaymentAndOrder = useCallback(
    async (splitPayments?: OrderPayment[], description?: string) => {
      let combinedItems: CartItem[] = [...cart];
      if (posMode === 'table' && selectedTableId) {
        const tableKey = String(selectedTableId);
        const orderData = tableOrders[tableKey] || tableOrders[selectedTableId];
        if (orderData?.savedOrders) {
          orderData.savedOrders.forEach((order) => {
            const isDeducted = order.kotDeducted !== false;
            const items = (order.items || (order as any)).map((it: any) => ({
              ...it,
              kotDeducted: isDeducted,
            }));
            combinedItems = [...combinedItems, ...items];
          });
        }
      }

      if (combinedItems.length === 0) return;

      const { subtotal, tax, total: baseTotal } = getCartTotals();
      const dVal = parseFloat(discountValue) || 0;
      let discountAmount = 0;
      if (discountType === 'percent') {
        discountAmount = (baseTotal * dVal) / 100;
      } else {
        discountAmount = dVal;
      }

      const eVal = parseFloat(extraChargeValue) || 0;
      let extraChargeAmount = 0;
      if (extraChargeType === 'percent') {
        extraChargeAmount = (baseTotal * eVal) / 100;
      } else {
        extraChargeAmount = eVal;
      }

      let finalTotal = Math.max(0, baseTotal - discountAmount + extraChargeAmount);
      const roundedTotal = roundPOSAmount(finalTotal);

      // Determine payments to send
      let paymentsToSend: Array<{ amount: number; paymentMethod: string; reference?: string | null }> = [];
      const tableKey = selectedTableId ? String(selectedTableId) : null;
      const existingTablePayments = tableKey ? tablePayments[tableKey] || [] : [];

      if (splitPayments && splitPayments.length > 0) {
        paymentsToSend = splitPayments.map((p) => ({
          amount: parseFloat(String(p.amount)) || 0,
          paymentMethod: p.paymentMethod,
          reference: p.reference || null,
        }));
      } else if (existingTablePayments.length > 0) {
        paymentsToSend = existingTablePayments.map((p) => ({
          amount: parseFloat(String(p.amount)) || 0,
          paymentMethod: p.paymentMethod,
          reference: p.reference || null,
        }));
      } else {
        paymentsToSend = [
          {
            amount: roundedTotal,
            paymentMethod: paymentType,
            reference: null,
          },
        ];
      }

      const methodToSave =
        paymentsToSend.length > 1
          ? 'Split'
          : paymentsToSend[0]?.paymentMethod || paymentType;

      const orderDetails = {
        items: combinedItems.map((c) => ({
          menuItemId: c.id,
          quantity: c.quantity,
          price: parseFloat(c.price.toString().replace(/[^0-9.]/g, '')) || 0,
          skipInventoryDeduction: Boolean(c.kotDeducted),
        })),
        subtotal,
        tax,
        total: roundedTotal,
        paymentMethod: methodToSave,
        payments: paymentsToSend,
        description: description?.trim() ? description.trim() : undefined,
      };

      try {
        const placedOrder = await orderApi.placeOrder(orderDetails);
        if (placedOrder && placedOrder.id) {
          window.dispatchEvent(
            new CustomEvent('velora-order-completed', { detail: placedOrder })
          );
        }
        await Promise.allSettled([
          refreshOrders(),
          refreshTables(),
          refreshInventory(),
        ]);
        setCart([]);
        if (posMode === 'table' && selectedTableId) {
          const key = String(selectedTableId);
          setTableOrders((t) => {
            const newT = { ...t };
            delete newT[key];
            delete newT[selectedTableId];
            return newT;
          });
          setTablePayments((t) => {
            const newT = { ...t };
            delete newT[key];
            delete newT[selectedTableId];
            return newT;
          });
          setTableStartTimes((t) => {
            const newT = { ...t };
            delete newT[key];
            delete newT[selectedTableId];
            return newT;
          });
          setTablePrinted((t) => {
            const newT = { ...t };
            delete newT[key];
            delete newT[selectedTableId];
            return newT;
          });
          setSelectedTableId(null);
        }
        setDiscountValue('');
        setExtraChargeValue('');
        setShowCheckoutModal(false);
        setOrderSuccess(true);
        setTimeout(() => {
          setOrderSuccess(false);
        }, 3000);
      } catch (e) {
        console.error(e);
        toast.error('Error placing order. Please try again.');
      }
    },
    [
      cart,
      posMode,
      selectedTableId,
      tableOrders,
      tablePayments,
      getCartTotals,
      discountValue,
      discountType,
      extraChargeValue,
      extraChargeType,
      paymentType,
      refreshOrders,
      refreshTables,
      refreshInventory,
    ]
  );

  return (
    <POSContext.Provider
      value={{
        cart,
        setCart,
        posCategory,
        setPosCategory,
        posSearchQuery,
        setPosSearchQuery,
        dietFilter,
        setDietFilter,
        viewMode,
        setViewMode,
        showCheckoutModal,
        setShowCheckoutModal,
        showOrderHistoryModal,
        setShowOrderHistoryModal,
        paymentType,
        setPaymentType,
        discountType,
        setDiscountType,
        discountValue,
        setDiscountValue,
        extraChargeType,
        setExtraChargeType,
        extraChargeValue,
        setExtraChargeValue,
        orderSuccess,
        setOrderSuccess,
        tableOrders,
        setTableOrders,
        tableStartTimes,
        setTableStartTimes,
        tablePrinted,
        setTablePrinted,
        tableReservations,
        setTableReservations,
        tableCleaningStatus,
        setTableCleaningStatus,
        reserveTable,
        cancelReservation,
        markTableCleaning,
        selectedTableId,
        setSelectedTableId,
        now,
        showAddTableModal,
        setShowAddTableModal,
        isCategorySidebarCollapsed,
        setIsCategorySidebarCollapsed,
        toggleCategorySidebar,
        newTableName,
        setNewTableName,
        showShiftTableModal,
        setShowShiftTableModal,
        addonSelectionItem,
        setAddonSelectionItem,
        selectedAddonIds,
        setSelectedAddonIds,
        handleAddToCart,
        updateCartQty,
        updateCartQtyExact,
        cancelCartItem,
        saveTableOrder,
        cancelKOTItem,
        cancelKOTBatch,
        updateKOTBatch,
        shiftKOTBatch,
        cancelTableOrder,
        tablePayments,
        setTablePayments,
        addTablePayment,
        removeTablePayment,
        getCartTotals,
        confirmPaymentAndOrder,
      }}
    >
      {children}
    </POSContext.Provider>
  );
};

export const usePOS = () => {
  const context = useContext(POSContext);
  if (!context) throw new Error('usePOS must be used within a POSProvider');
  return context;
};
