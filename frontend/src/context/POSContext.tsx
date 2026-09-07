import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { CartItem, TableOrderState, OrderPayment } from '../types/app.types';
import { useApp } from './AppContext';
import { orderApi } from '../api/orderApi';
import { roundPOSAmount } from '../lib/orderUtils';

interface POSContextType {
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  posCategory: string;
  setPosCategory: (cat: string) => void;
  posSearchQuery: string;
  setPosSearchQuery: (query: string) => void;
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
  addTablePayment: (tableId: string, payment: OrderPayment) => void;
  removeTablePayment: (tableId: string, index: number) => void;
  getCartTotals: () => { subtotal: number; tax: number; total: number; paidAmount: number; balanceDue: number };
  confirmPaymentAndOrder: (splitPayments?: OrderPayment[]) => Promise<void>;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

export const POSProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { posMode, appData, refreshOrders, refreshTables, refreshInventory } = useApp();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [posCategory, setPosCategory] = useState<string>('All Items');
  const [posSearchQuery, setPosSearchQuery] = useState('');
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showOrderHistoryModal, setShowOrderHistoryModal] = useState(false);
  const [paymentType, setPaymentType] = useState('Cash');
  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('fixed');
  const [discountValue, setDiscountValue] = useState('');
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
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
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

  const saveTableOrder = useCallback(() => {
    if (posMode !== 'table' || !selectedTableId || cart.length === 0) return;
    const key = String(selectedTableId);
    setTableOrders((prev) => {
      const existing = prev[key] || prev[selectedTableId] || { savedOrders: [], activeCart: [] };
      return {
        ...prev,
        [key]: {
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

  const addTablePayment = useCallback((tableId: string, payment: OrderPayment) => {
    const key = String(tableId);
    setTablePayments((prev) => {
      const existing = prev[key] || [];
      return {
        ...prev,
        [key]: [...existing, { ...payment, date: payment.date || new Date().toISOString() }],
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
    combinedItems.forEach((item) => {
      const price = parseFloat(String(item.price).replace(/[^0-9.]/g, '')) || 0;
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

    const total = subtotal + tax;

    let paidAmount = 0;
    if (posMode === 'table' && selectedTableId) {
      const key = String(selectedTableId);
      const payments = tablePayments[key] || tablePayments[selectedTableId] || [];
      paidAmount = payments.reduce((sum, p) => sum + (parseFloat(String(p.amount)) || 0), 0);
    }
    const balanceDue = Math.max(0, parseFloat((total - paidAmount).toFixed(2)));

    return { subtotal, tax, total, paidAmount, balanceDue };
  }, [cart, posMode, selectedTableId, tableOrders, tablePayments, appData.settings]);

  const confirmPaymentAndOrder = useCallback(
    async (splitPayments?: OrderPayment[]) => {
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
        })),
        subtotal,
        tax,
        total: roundedTotal,
        paymentMethod: methodToSave,
        payments: paymentsToSend,
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
        setShowCheckoutModal(false);
        setOrderSuccess(true);
        setTimeout(() => {
          setOrderSuccess(false);
        }, 3000);
      } catch (e) {
        console.error(e);
        alert('Error placing order.');
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
