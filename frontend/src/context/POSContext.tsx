import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { CartItem, TableOrderState } from '../types/app.types';
import { useApp } from './AppContext';
import { orderApi } from '../api/orderApi';

interface POSContextType {
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  posCategory: string;
  setPosCategory: (cat: string) => void;
  posSearchQuery: string;
  setPosSearchQuery: (query: string) => void;
  showCheckoutModal: boolean;
  setShowCheckoutModal: (show: boolean) => void;
  paymentType: string;
  setPaymentType: (type: string) => void;
  discountType: 'percent' | 'fixed';
  setDiscountType: (type: 'percent' | 'fixed') => void;
  discountValue: string;
  setDiscountValue: (val: string) => void;
  orderSuccess: boolean;
  setOrderSuccess: (val: boolean) => void;

  tableOrders: Record<string, TableOrderState>;
  setTableOrders: React.Dispatch<React.SetStateAction<Record<string, TableOrderState>>>;
  tableStartTimes: Record<string, number>;
  setTableStartTimes: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  tablePrinted: Record<string, boolean>;
  setTablePrinted: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  selectedTableId: string | null;
  setSelectedTableId: (id: string | null) => void;
  now: number;

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
  getCartTotals: () => { subtotal: number; tax: number; total: number };
  confirmPaymentAndOrder: () => Promise<void>;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

export const POSProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { posMode, appData, refreshOrders, refreshTables, refreshInventory } = useApp();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [posCategory, setPosCategory] = useState<string>('All Items');
  const [posSearchQuery, setPosSearchQuery] = useState('');
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [paymentType, setPaymentType] = useState('Cash');
  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('fixed');
  const [discountValue, setDiscountValue] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);

  const [tableOrders, setTableOrders] = useState<Record<string, TableOrderState>>({});
  const [tableStartTimes, setTableStartTimes] = useState<Record<string, number>>({});
  const [tablePrinted, setTablePrinted] = useState<Record<string, boolean>>({});
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());

  const [showAddTableModal, setShowAddTableModal] = useState(false);
  const [newTableName, setNewTableName] = useState('');
  const [showShiftTableModal, setShowShiftTableModal] = useState(false);

  const [addonSelectionItem, setAddonSelectionItem] = useState<any>(null);
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const updateTableActiveCart = useCallback((tableId: string, newCart: CartItem[]) => {
    setTableOrders((prev) => {
      const existing = prev[tableId] || { savedOrders: [], activeCart: [] };
      return { ...prev, [tableId]: { ...existing, activeCart: newCart } };
    });

    if (newCart.length > 0) {
      setTableStartTimes((prev) => {
        if (!prev[tableId]) {
          return { ...prev, [tableId]: Date.now() };
        }
        return prev;
      });
    }
  }, []);

  const saveTableOrder = useCallback(() => {
    if (posMode !== 'table' || !selectedTableId || cart.length === 0) return;
    setTableOrders((prev) => {
      const existing = prev[selectedTableId] || { savedOrders: [], activeCart: [] };
      return {
        ...prev,
        [selectedTableId]: {
          savedOrders: [...existing.savedOrders, { items: existing.activeCart, time: Date.now() }],
          activeCart: [],
        },
      };
    });
    setCart([]);
  }, [posMode, selectedTableId, cart]);

  const handleAddToCart = useCallback(
    (item: any, skipAddonCheck = false) => {
      if (item.available === false) {
        return;
      }

      if (posMode === 'table' && !selectedTableId) {
        alert('Please select a table from the left sidebar to add items.');
        return;
      }

      if (!skipAddonCheck && item.addonIds && item.addonIds.trim() !== '') {
        setAddonSelectionItem(item);
        setSelectedAddonIds([]);
        return;
      }

      setCart((prev) => {
        let newCart: CartItem[];
        const existing = prev.find((i) => i.name === item.name);
        if (existing) {
          newCart = prev.map((i) => (i.name === item.name ? { ...i, quantity: i.quantity + 1 } : i));
        } else {
          newCart = [...prev, { ...item, quantity: 1 }];
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
        const itemName = typeof itemOrName === 'string' ? itemOrName : itemOrName.name;
        const existing = prev.find((i) => i.name === itemName);
        if (existing) {
          newCart = prev
            .map((i) => (i.name === itemName ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i))
            .filter((i) => i.quantity > 0);
        } else if (delta > 0 && typeof itemOrName !== 'string') {
          newCart = [...prev, { ...itemOrName, quantity: delta }];
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
        const itemName = typeof itemOrName === 'string' ? itemOrName : itemOrName.name;
        const existing = prev.find((i) => i.name === itemName);
        if (existing) {
          newCart = prev
            .map((i) => (i.name === itemName ? { ...i, quantity: Math.max(0, qty) } : i))
            .filter((i) => i.quantity > 0);
        } else if (qty > 0 && typeof itemOrName !== 'string') {
          newCart = [...prev, { ...itemOrName, quantity: qty }];
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
        const newCart = prev.filter((i) => i.name !== itemName);
        if (posMode === 'table' && selectedTableId) updateTableActiveCart(selectedTableId, newCart);
        return newCart;
      });
    },
    [posMode, selectedTableId, updateTableActiveCart]
  );

  const getCartTotals = useCallback(() => {
    let combinedItems: CartItem[] = [...cart];
    if (posMode === 'table' && selectedTableId && tableOrders[selectedTableId]) {
      tableOrders[selectedTableId].savedOrders.forEach((order) => {
        combinedItems = [...combinedItems, ...(order.items || (order as any))];
      });
    }
    let subtotal = 0;
    let tax = 0;
    combinedItems.forEach((item) => {
      const price = parseFloat(String(item.price).replace('₹', ''));
      const itemSubtotal = price * item.quantity;
      subtotal += itemSubtotal;

      let itemTaxRate = 0;
      if (item.taxes && item.taxes.length > 0) {
        itemTaxRate = item.taxes.reduce((sum: number, t: any) => sum + (parseFloat(t.rate) || 0), 0);
      } else if (item.tax) {
        itemTaxRate = parseFloat(String(item.tax));
      }
      tax += itemSubtotal * (itemTaxRate / 100);
    });

    let globalTaxRate = 0;
    if (appData.settings && appData.settings.globalTaxRate) {
      globalTaxRate = parseFloat(appData.settings.globalTaxRate) || 0;
    }
    tax += subtotal * (globalTaxRate / 100);

    return { subtotal, tax, total: subtotal + tax };
  }, [cart, posMode, selectedTableId, tableOrders, appData.settings]);

  const confirmPaymentAndOrder = useCallback(async () => {
    let combinedItems: CartItem[] = [...cart];
    if (posMode === 'table' && selectedTableId && tableOrders[selectedTableId]) {
      tableOrders[selectedTableId].savedOrders.forEach((order) => {
        combinedItems = [...combinedItems, ...(order.items || (order as any))];
      });
    }

    if (combinedItems.length === 0) return;

    const { subtotal, tax, total: baseTotal } = getCartTotals();
    const dVal = parseFloat(discountValue) || 0;
    let finalTotal = baseTotal;
    if (discountType === 'percent') {
      finalTotal = baseTotal - (baseTotal * dVal) / 100;
    } else {
      finalTotal = baseTotal - dVal;
    }
    if (finalTotal < 0) finalTotal = 0;

    const orderDetails = {
      items: combinedItems.map((c) => ({
        menuItemId: c.id,
        quantity: c.quantity,
        price: parseFloat(c.price.toString().replace('₹', '')) || 0,
      })),
      subtotal,
      tax,
      total: finalTotal,
      paymentMethod: paymentType,
    };

    try {
      await orderApi.placeOrder(orderDetails);
      await Promise.allSettled([
        refreshOrders(),
        refreshTables(),
        refreshInventory(),
      ]);
      setCart([]);
      if (posMode === 'table' && selectedTableId) {
        setTableOrders((t) => {
          const newT = { ...t };
          delete newT[selectedTableId];
          return newT;
        });
        setTableStartTimes((t) => {
          const newT = { ...t };
          delete newT[selectedTableId];
          return newT;
        });
        setSelectedTableId(null);
      }
      setDiscountValue('');
      setShowCheckoutModal(false);
      setOrderSuccess(true);
      setTimeout(() => {
        setOrderSuccess(false);
      }, 3000);
    } catch (e) {
      console.error(e);
      alert('Error placing order.');
    }
  }, [
    cart,
    posMode,
    selectedTableId,
    tableOrders,
    getCartTotals,
    discountValue,
    discountType,
    paymentType,
    refreshOrders,
    refreshTables,
    refreshInventory,
  ]);

  return (
    <POSContext.Provider
      value={{
        cart,
        setCart,
        posCategory,
        setPosCategory,
        posSearchQuery,
        setPosSearchQuery,
        showCheckoutModal,
        setShowCheckoutModal,
        paymentType,
        setPaymentType,
        discountType,
        setDiscountType,
        discountValue,
        setDiscountValue,
        orderSuccess,
        setOrderSuccess,
        tableOrders,
        setTableOrders,
        tableStartTimes,
        setTableStartTimes,
        tablePrinted,
        setTablePrinted,
        selectedTableId,
        setSelectedTableId,
        now,
        showAddTableModal,
        setShowAddTableModal,
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
