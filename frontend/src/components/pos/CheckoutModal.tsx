import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext';
import { usePOS } from '../../context/POSContext';
import type { OrderPayment } from '../../types/app.types';
import { Modal, Button } from '../ui';
import { toast } from '../../context/ToastContext';
import {
  CreditCard,
  Banknote,
  QrCode,
  Printer,
  Plus,
  Trash2,
  CheckCircle2,
  Layers,
  ArrowRight,
  FileText,
  User,
  Phone,
  Tag,
  RotateCcw,
  ChevronDown,
  Check,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import {
  roundPOSAmount,
  getStoreGlobalTaxRate,
  getItemTaxBadge,
  formatTaxLabel,
  mergeOrAddPayment,
} from '../../lib/orderUtils';
import { customerApi, type CustomerSuggestion } from '../../api/customerApi';

/**
 * Reusable sleek dropdown unit selector for Fixed (₹) vs Percentage (%)
 */
const UnitDropdown: React.FC<{
  value: 'fixed' | 'percent';
  onChange: (val: 'fixed' | 'percent') => void;
  percentLabel: string;
}> = ({ value, onChange, percentLabel }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number; width: number } | null>(null);

  const updatePosition = () => {
    if (!dropdownRef.current) return;
    const rect = dropdownRef.current.getBoundingClientRect();
    setDropdownPos({
      top: rect.bottom + 4,
      left: rect.left,
      width: Math.max(124, rect.width),
    });
  };

  useEffect(() => {
    if (!isOpen) return;
    updatePosition();

    const handleDocClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleScrollOrResize = () => {
      updatePosition();
    };

    document.addEventListener('mousedown', handleDocClick);
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);

    return () => {
      document.removeEventListener('mousedown', handleDocClick);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen]);

  const currentLabel = value === 'fixed' ? 'Fixed (₹)' : percentLabel;

  return (
    <div ref={dropdownRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 bg-stone-100 hover:bg-stone-200/80 dark:bg-stone-800 dark:hover:bg-stone-750 text-stone-800 dark:text-stone-200 px-2 py-1.5 text-xs font-bold border-r border-stone-200 dark:border-stone-700 outline-none cursor-pointer transition-colors select-none rounded-l-xl"
      >
        <span>{currentLabel}</span>
        <ChevronDown
          className={cn(
            'w-3.5 h-3.5 text-stone-400 transition-transform duration-200',
            isOpen && 'rotate-180 text-amber-500'
          )}
        />
      </button>

      {isOpen && dropdownPos && createPortal(
        <div
          style={{
            position: 'fixed',
            top: `${dropdownPos.top}px`,
            left: `${dropdownPos.left}px`,
            minWidth: `${dropdownPos.width}px`,
          }}
          className="w-32 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl shadow-2xl z-[150] py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => {
              onChange('fixed');
              setIsOpen(false);
            }}
            className={cn(
              'w-full px-3 py-1.5 text-left text-xs flex items-center justify-between cursor-pointer transition-colors',
              value === 'fixed'
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 font-bold'
                : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 font-medium'
            )}
          >
            <span>Fixed (₹)</span>
            {value === 'fixed' && <Check className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />}
          </button>
          <button
            type="button"
            onClick={() => {
              onChange('percent');
              setIsOpen(false);
            }}
            className={cn(
              'w-full px-3 py-1.5 text-left text-xs flex items-center justify-between cursor-pointer transition-colors',
              value === 'percent'
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 font-bold'
                : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 font-medium'
            )}
          >
            <span>{percentLabel}</span>
            {value === 'percent' && <Check className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />}
          </button>
        </div>,
        document.body
      )}
    </div>
  );
};

export const CheckoutModal: React.FC = () => {
  const { posMode, appData, storeProfile, currentUser } = useApp();
  const {
    showCheckoutModal,
    setShowCheckoutModal,
    selectedTableId,
    setTablePrinted,
    getCartTotals,
    discountType,
    setDiscountType,
    discountValue,
    setDiscountValue,
    extraChargeType,
    setExtraChargeType,
    extraChargeValue,
    setExtraChargeValue,
    paymentType,
    setPaymentType,
    confirmPaymentAndOrder,
    cart,
    tableOrders,
    tablePayments,
    addTablePayment,
    removeTablePayment,
  } = usePOS();

  // Mode Selection: 'single' (Full Payment) vs 'split' (Partial / Split Installments)
  const [settleTab, setSettleTab] = useState<'single' | 'split'>('single');

  // Single payment cash tendered state
  const [tenderCash, setTenderCash] = useState('');

  // Quick mode split payments staging
  const [quickSplitPayments, setQuickSplitPayments] = useState<OrderPayment[]>([]);

  // Split installment form states
  const [installmentAmount, setInstallmentAmount] = useState('');
  const [installmentMethod, setInstallmentMethod] = useState<'Cash' | 'UPI' | 'Card'>('Cash');
  const [installmentRef, setInstallmentRef] = useState('');

  // Order Description / Note state
  const [orderDescription, setOrderDescription] = useState('');

  // Customer details state
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');

  // Customer suggestions & autocomplete state
  const [customerSuggestions, setCustomerSuggestions] = useState<CustomerSuggestion[]>([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const customerDropdownRef = useRef<HTMLDivElement>(null);

  // Close customer dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(e.target as Node)) {
        setShowCustomerDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Pre-index known customers from existing orders in appData for zero-latency suggestions
  const historicalCustomers = useMemo(() => {
    const list: CustomerSuggestion[] = [];
    const seen = new Set<string>();

    if (Array.isArray(appData?.orders)) {
      for (const ord of appData.orders) {
        if (!ord.description) continue;
        const nameMatch = ord.description.match(/Customer:\s*([^|]+)/i);
        const phoneMatch = ord.description.match(/Mobile:\s*([^|]+)/i);
        const name = nameMatch ? nameMatch[1].trim() : '';
        const phone = phoneMatch ? phoneMatch[1].trim() : null;

        if (name && !seen.has(name.toLowerCase())) {
          seen.add(name.toLowerCase());
          list.push({
            id: -(list.length + 1),
            name,
            phone,
          });
        }
      }
    }
    return list;
  }, [appData?.orders]);

  // Handle typing in customer name field: filter instantly + query backend DB
  const handleCustomerNameChange = (val: string) => {
    setCustomerName(val);
    const q = val.trim();
    if (!q) {
      setCustomerSuggestions([]);
      setShowCustomerDropdown(false);
      return;
    }

    // Instant local filter matching typed letters / alphabet
    const localMatches = historicalCustomers.filter(
      (c) =>
        c.name.toLowerCase().includes(q.toLowerCase()) ||
        (c.phone && c.phone.includes(q))
    );

    setCustomerSuggestions(localMatches);
    if (localMatches.length > 0) {
      setShowCustomerDropdown(true);
    }

    // Async query to database via customerApi
    customerApi
      .search(q)
      .then((serverResults) => {
        const map = new Map<string, CustomerSuggestion>();
        // Add server results first
        serverResults.forEach((c) => map.set(c.name.toLowerCase(), c));
        // Fill in any local matches
        localMatches.forEach((c) => {
          if (!map.has(c.name.toLowerCase())) {
            map.set(c.name.toLowerCase(), c);
          }
        });
        const merged = Array.from(map.values());
        setCustomerSuggestions(merged);
        if (merged.length > 0) {
          setShowCustomerDropdown(true);
        }
      })
      .catch((err) => {
        console.warn('Customer search error:', err);
      });
  };

  const handleSelectCustomer = (cust: CustomerSuggestion) => {
    setCustomerName(cust.name);
    if (cust.phone) {
      setCustomerMobile(cust.phone);
    }
    setShowCustomerDropdown(false);
  };

  // Helper to compile customer details and order notes for backend storage
  const getOrderDescriptionPayload = () => {
    const parts: string[] = [];
    if (customerName.trim()) parts.push(`Customer: ${customerName.trim()}`);
    if (customerMobile.trim()) parts.push(`Mobile: ${customerMobile.trim()}`);
    if (orderDescription.trim()) parts.push(`Note: ${orderDescription.trim()}`);
    return parts.length > 0 ? parts.join(' | ') : undefined;
  };

  const tableKey = selectedTableId ? String(selectedTableId) : '';
  const tableData =
    posMode === 'table' && selectedTableId
      ? tableOrders[tableKey] || tableOrders[selectedTableId]
      : null;

  // Extract cart items including saved table items
  let combinedItems: any[] = [...cart];
  if (tableData && tableData.savedOrders && Array.isArray(tableData.savedOrders)) {
    tableData.savedOrders.forEach((so: any) => {
      if (so && Array.isArray(so.items)) {
        combinedItems = [...combinedItems, ...so.items];
      } else if (Array.isArray(so)) {
        combinedItems = [...combinedItems, ...so];
      }
    });
  }

  // Group items by KOT batches or active cart
  interface OrderGroup {
    id: string;
    title: string;
    time?: number | string;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
  }

  const orderGroups: OrderGroup[] = [];

  if (tableData?.savedOrders && Array.isArray(tableData.savedOrders) && tableData.savedOrders.length > 0) {
    tableData.savedOrders.forEach((so: any, idx: number) => {
      const itemsList = Array.isArray(so.items) ? so.items : Array.isArray(so) ? so : [];
      if (itemsList.length > 0) {
        orderGroups.push({
          id: `kot-${idx}`,
          title: `Order ${idx + 1}`,
          time: so.time || undefined,
          items: itemsList.map((it: any) => ({
            name: it.name,
            quantity: it.quantity || 1,
            price: parseFloat(String(it.price).replace(/[^0-9.]/g, '')) || 0,
          })),
        });
      }
    });

    if (cart.length > 0) {
      orderGroups.push({
        id: `kot-active`,
        title: `Order ${orderGroups.length + 1}`,
        time: Date.now(),
        items: cart.map((it) => ({
          name: it.name,
          quantity: it.quantity || 1,
          price: parseFloat(String(it.price).replace(/[^0-9.]/g, '')) || 0,
        })),
      });
    }
  } else if (cart.length > 0) {
    orderGroups.push({
      id: `kot-cart`,
      title: 'Order 1',
      time: Date.now(),
      items: cart.map((it) => ({
        name: it.name,
        quantity: it.quantity || 1,
        price: parseFloat(String(it.price).replace(/[^0-9.]/g, '')) || 0,
      })),
    });
  }

  // Calculate bill totals
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

  const finalTotal = Math.max(0, baseTotal - discountAmount + extraChargeAmount);
  const roundedTotal = roundPOSAmount(finalTotal);
  const storeGlobalTaxRate = getStoreGlobalTaxRate(appData.settings);

  // Active payments for current session
  const currentPayments: OrderPayment[] =
    posMode === 'table' && selectedTableId
      ? tablePayments[tableKey] || tablePayments[selectedTableId] || []
      : quickSplitPayments;

  const currentPaid = currentPayments.reduce(
    (sum, p) => sum + (parseFloat(String(p.amount ?? '').replace(/[^0-9.]/g, '')) || 0),
    0
  );
  const currentRemaining = Math.max(0, parseFloat((roundedTotal - currentPaid).toFixed(2)));

  // Cash tender change calculation (for single payment tab)
  const tenderedAmount = parseFloat(tenderCash) || 0;
  const changeDue = Math.max(0, tenderedAmount - roundedTotal);

  // Smart dynamic cash suggestions based on the rounded total bill
  const smartCashOptions = useMemo(() => {
    if (roundedTotal <= 0) return [];
    const options: Array<{ amount: number; label: string; change: number }> = [];

    // Option 1: Exact Amount
    options.push({
      amount: roundedTotal,
      label: `Exact (₹${roundedTotal})`,
      change: 0,
    });

    // Options 2+: Compute sensible higher currency notes that a customer would realistically give
    const higherValues = new Set<number>();

    if (roundedTotal < 100) {
      if (roundedTotal < 50) higherValues.add(50);
      higherValues.add(100);
      higherValues.add(200);
      higherValues.add(500);
    } else if (roundedTotal < 500) {
      const next50 = Math.ceil(roundedTotal / 50) * 50;
      if (next50 > roundedTotal) higherValues.add(next50);
      const next100 = Math.ceil(roundedTotal / 100) * 100;
      if (next100 > roundedTotal) higherValues.add(next100);
      higherValues.add(500);
    } else if (roundedTotal < 2000) {
      const next100 = Math.ceil(roundedTotal / 100) * 100;
      if (next100 > roundedTotal) higherValues.add(next100);
      const next500 = Math.ceil(roundedTotal / 500) * 500;
      if (next500 > roundedTotal) higherValues.add(next500);
      if (next500 + 500 > roundedTotal && next500 + 500 <= 3000) higherValues.add(next500 + 500);
    } else {
      const next500 = Math.ceil(roundedTotal / 500) * 500;
      if (next500 > roundedTotal) higherValues.add(next500);
      const next1000 = Math.ceil(roundedTotal / 1000) * 1000;
      if (next1000 > roundedTotal) higherValues.add(next1000);
    }

    // Filter, sort, and take up to 3 higher denomination options
    Array.from(higherValues)
      .filter((amt) => amt > roundedTotal)
      .sort((a, b) => a - b)
      .slice(0, 3)
      .forEach((amt) => {
        options.push({
          amount: amt,
          label: `₹${amt}`,
          change: amt - roundedTotal,
        });
      });

    return options;
  }, [roundedTotal]);

  // Reset order description, customer details, split payments staging, and tab on open/close
  useEffect(() => {
    if (showCheckoutModal) {
      setOrderDescription('');
      setTenderCash('');
      setCustomerName('');
      setCustomerMobile('');
      setCustomerSuggestions([]);
      setShowCustomerDropdown(false);
      setQuickSplitPayments([]); // Always start fresh for new orders!
      setInstallmentRef('');

      // Auto-switch to split tab ONLY if this active table already has recorded advance deposits
      const tKey = selectedTableId ? String(selectedTableId) : '';
      const tableAdvancePayments =
        posMode === 'table' && selectedTableId
          ? tablePayments[tKey] || tablePayments[selectedTableId] || []
          : [];

      if (tableAdvancePayments.length > 0) {
        setSettleTab('split');
      } else {
        setSettleTab('single');
      }
    } else {
      // Clear staging on close
      setQuickSplitPayments([]);
      setSettleTab('single');
      setCustomerSuggestions([]);
      setShowCustomerDropdown(false);
    }
  }, [showCheckoutModal, posMode, selectedTableId, tablePayments]);

  // Update prefilled installment amount when remaining changes
  useEffect(() => {
    if (currentRemaining > 0 && (!installmentAmount || parseFloat(installmentAmount) <= 0)) {
      setInstallmentAmount(currentRemaining.toFixed(2));
    }
  }, [currentRemaining, installmentAmount]);

  // Handler: Modal Close & Cleanup
  const handleCloseModal = () => {
    setShowCheckoutModal(false);
    setQuickSplitPayments([]);
    setSettleTab('single');
    setOrderDescription('');
    setCustomerName('');
    setCustomerMobile('');
    setCustomerSuggestions([]);
    setShowCustomerDropdown(false);
  };

  // Handler: Confirm Order & Cleanup
  const handleConfirmOrder = async (payments?: OrderPayment[]) => {
    // If customer name was entered, persist to DB in background
    if (customerName.trim()) {
      customerApi
        .saveCustomer({
          name: customerName.trim(),
          phone: customerMobile.trim() || undefined,
        })
        .catch((err) => console.warn('Customer auto-save error:', err));
    }

    await confirmPaymentAndOrder(payments, getOrderDescriptionPayload());
    setQuickSplitPayments([]);
    setSettleTab('single');
    setCustomerSuggestions([]);
    setShowCustomerDropdown(false);
  };

  if (!showCheckoutModal) return null;

  // Handler: Add Installment Payment (sums up duplicate payment methods)
  const handleAddInstallment = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanAmt = String(installmentAmount).replace(/[^0-9.]/g, '');
    const amt = parseFloat(cleanAmt) || 0;
    if (amt <= 0) return;

    if (amt > currentRemaining + 0.05) {
      toast.warning(`Installment amount (₹${amt.toFixed(2)}) cannot exceed remaining balance (₹${currentRemaining.toFixed(2)})`);
      return;
    }

    const newPayment: OrderPayment = {
      amount: amt,
      paymentMethod: installmentMethod,
      reference: installmentRef.trim() || undefined,
      date: new Date().toISOString(),
    };

    if (posMode === 'table' && selectedTableId) {
      addTablePayment(selectedTableId, newPayment);
    } else {
      setQuickSplitPayments((prev) => mergeOrAddPayment(prev, newPayment));
    }

    const nextRemaining = Math.max(0, parseFloat((currentRemaining - amt).toFixed(2)));
    setInstallmentAmount(nextRemaining > 0 ? nextRemaining.toFixed(2) : '');
    setInstallmentRef('');
  };

  // Handler: Remove Installment Payment
  const handleRemoveInstallment = (index: number) => {
    if (posMode === 'table' && selectedTableId) {
      removeTablePayment(selectedTableId, index);
    } else {
      setQuickSplitPayments((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case 'upi':
      case 'qr':
        return <QrCode className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'card':
      case 'pos':
        return <CreditCard className="w-4 h-4 text-sky-600 dark:text-sky-400" />;
      case 'cash':
      default:
        return <Banknote className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
    }
  };

  // Handler: Thermal Receipt Printing for Settlement & Payment
  const handlePrintThermalReceipt = () => {
    if (posMode === 'table' && selectedTableId) {
      setTablePrinted((prev) => ({ ...prev, [selectedTableId]: true }));
    }

    const storeName = storeProfile?.businessName || appData?.settings?.storeName || 'Velora Cafe';
    const cafeCode = storeProfile?.cafeCode || '';
    const address = storeProfile?.address || appData?.settings?.address || '';
    const cityState = [storeProfile?.city, storeProfile?.state].filter(Boolean).join(', ');
    const phone = storeProfile?.phone || appData?.settings?.phone || '';
    const gstin = storeProfile?.gstin || appData?.settings?.taxNo || '';
    const receiptFooter = storeProfile?.receiptFooter || 'Thank you for dining with us! Please visit again.';

    const tableName = posMode === 'table'
      ? (appData.tables?.find((t) => String(t.id) === String(selectedTableId))?.name || `Table #${selectedTableId}`)
      : 'Quick POS / Counter';

    const orderDate = new Date();
    const dateFormatted = orderDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeFormatted = orderDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

    // Generate batches or items HTML
    let itemsHtml = '';
    if (orderGroups.length > 0) {
      itemsHtml = orderGroups.map((group) => {
        const groupHeader = orderGroups.length > 1
          ? `<tr><td colspan="3" style="padding: 4px 0 2px 0; font-weight: bold; border-bottom: 1px dotted #000; font-size: 10px; text-transform: uppercase;">${escapeXml(group.title)}${group.time ? ` (${new Date(group.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })})` : ''}</td></tr>`
          : '';
        const itemsList = group.items.map((it) => `
          <tr>
            <td style="padding: 2.5px 0; vertical-align: top;">${escapeXml(it.name)}</td>
            <td style="padding: 2.5px 0; text-align: center; vertical-align: top; white-space: nowrap;">x${it.quantity}</td>
            <td style="padding: 2.5px 0; text-align: right; vertical-align: top; font-weight: bold; white-space: nowrap;">₹${(it.price * it.quantity).toFixed(2)}</td>
          </tr>
        `).join('');
        return `${groupHeader}${itemsList}`;
      }).join('');
    } else {
      itemsHtml = combinedItems.map((it) => {
        const p = parseFloat(String(it.price).replace(/[^0-9.]/g, '')) || 0;
        const q = it.quantity || 1;
        return `
          <tr>
            <td style="padding: 2.5px 0; vertical-align: top;">${escapeXml(it.name)}</td>
            <td style="padding: 2.5px 0; text-align: center; vertical-align: top; white-space: nowrap;">x${q}</td>
            <td style="padding: 2.5px 0; text-align: right; vertical-align: top; font-weight: bold; white-space: nowrap;">₹${(p * q).toFixed(2)}</td>
          </tr>
        `;
      }).join('');
    }

    // Payment details HTML
    let paymentLinesHtml = '';
    if (currentPayments.length > 0) {
      paymentLinesHtml = currentPayments.map((p) => `
        <div style="display: flex; justify-content: space-between; padding: 1px 0;">
          <span>• ${escapeXml(p.paymentMethod)}${p.reference ? ` (${escapeXml(p.reference)})` : ''}:</span>
          <span style="font-weight: bold;">₹${parseFloat(String(p.amount)).toFixed(2)}</span>
        </div>
      `).join('');
    } else {
      paymentLinesHtml = `
        <div style="display: flex; justify-content: space-between; padding: 1px 0;">
          <span>• Mode: ${escapeXml(paymentType)}</span>
          <span style="font-weight: bold;">₹${roundedTotal}</span>
        </div>
      `;
      if (paymentType.toLowerCase() === 'cash' && tenderedAmount > 0) {
        paymentLinesHtml += `
          <div style="display: flex; justify-content: space-between; padding: 1px 0; color: #333;">
            <span>  Tendered:</span>
            <span>₹${tenderedAmount.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 1px 0; color: #333;">
            <span>  Change Return:</span>
            <span>₹${changeDue.toFixed(2)}</span>
          </div>
        `;
      }
    }

    const receiptHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Receipt - ${escapeXml(tableName)}</title>
        <style>
          @page {
            size: 80mm auto;
            margin: 0mm 2mm;
          }
          * {
            box-sizing: border-box;
          }
          body {
            font-family: 'JetBrains Mono', 'Courier New', Courier, monospace;
            width: 74mm;
            max-width: 74mm;
            margin: 0 auto;
            padding: 8px 2px 24px 2px;
            font-size: 11px;
            line-height: 1.35;
            color: #000;
            background: #fff;
          }
          .center { text-align: center; }
          .right { text-align: right; }
          .bold { font-weight: bold; }
          .store-name {
            font-size: 16px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 2px;
          }
          .store-info {
            font-size: 10px;
            color: #222;
            margin: 1px 0;
          }
          .divider {
            border-top: 1px dashed #000;
            margin: 6px 0;
          }
          .divider-double {
            border-top: 2px dashed #000;
            margin: 6px 0;
          }
          .order-meta {
            font-size: 10.5px;
            margin: 4px 0;
          }
          .order-meta div {
            display: flex;
            justify-content: space-between;
            padding: 1px 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
            margin: 4px 0;
          }
          th {
            font-size: 10px;
            font-weight: bold;
            text-align: left;
            padding-bottom: 3px;
            border-bottom: 1px dashed #000;
          }
          .calc-row {
            display: flex;
            justify-content: space-between;
            padding: 1.5px 0;
            font-size: 11px;
          }
          .total-banner {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 15px;
            font-weight: 900;
            padding: 4px 0;
          }
          .footer {
            margin-top: 10px;
            text-align: center;
            font-size: 10px;
            line-height: 1.4;
          }
        </style>
      </head>
      <body>
        <div class="center">
          <div class="store-name">${escapeXml(storeName)}</div>
          ${cafeCode ? `<div class="store-info">Code: ${escapeXml(cafeCode)}</div>` : ''}
          ${address ? `<div class="store-info">${escapeXml(address)}</div>` : ''}
          ${cityState ? `<div class="store-info">${escapeXml(cityState)}</div>` : ''}
          ${phone ? `<div class="store-info">Tel: ${escapeXml(phone)}</div>` : ''}
          ${gstin ? `<div class="store-info">GSTIN: ${escapeXml(gstin)}</div>` : ''}
        </div>

        <div class="divider-double"></div>

        <div class="order-meta">
          <div>
            <span>Order Type: <strong>${escapeXml(tableName)}</strong></span>
            <span>${timeFormatted}</span>
          </div>
          <div>
            <span>Date: ${dateFormatted}</span>
            <span>Staff: ${escapeXml(currentUser?.fullName || currentUser?.username || 'Counter')}</span>
          </div>
          ${customerName || customerMobile ? `
          <div style="margin-top: 2px;">
            <span>Customer: <strong>${escapeXml(customerName || 'Walk-in')}</strong></span>
            ${customerMobile ? `<span>Tel: ${escapeXml(customerMobile)}</span>` : ''}
          </div>` : ''}
          ${orderDescription ? `
          <div style="margin-top: 3px; font-style: italic;">
            <span>Note / Desc:</span>
            <span>${escapeXml(orderDescription)}</span>
          </div>` : ''}
        </div>

        <div class="divider"></div>

        <table>
          <thead>
            <tr>
              <th style="width: 55%;">ITEM</th>
              <th style="width: 18%; text-align: center;">QTY</th>
              <th style="width: 27%; text-align: right;">AMT</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="divider"></div>

        <div class="calc-row">
          <span>Subtotal:</span>
          <span class="bold">₹${subtotal.toFixed(2)}</span>
        </div>

        <div class="calc-row">
          <span>${formatTaxLabel(appData.settings, storeGlobalTaxRate, tax)}${appData.settings?.taxCalculationType === 'reverse' ? ' (Incl.)' : ''}:</span>
          <span class="bold">₹${tax.toFixed(2)}</span>
        </div>

        ${discountAmount > 0 ? `
          <div class="calc-row bold" style="color: #000;">
            <span>Discount Applied${discountType === 'percent' ? ` (${dVal}%)` : ''}:</span>
            <span>-₹${discountAmount.toFixed(2)}</span>
          </div>
        ` : ''}

        ${extraChargeAmount > 0 ? `
          <div class="calc-row bold" style="color: #000;">
            <span>Extra Charges${extraChargeType === 'percent' ? ` (${eVal}%)` : ''}:</span>
            <span>+₹${extraChargeAmount.toFixed(2)}</span>
          </div>
        ` : ''}

        ${roundedTotal !== finalTotal ? `
          <div class="calc-row" style="color: #222;">
            <span>Round Off:</span>
            <span>${roundedTotal > finalTotal ? '+' : ''}₹${(roundedTotal - finalTotal).toFixed(2)}</span>
          </div>
        ` : ''}

        <div class="divider-double"></div>

        <div class="total-banner">
          <span>NET PAYABLE:</span>
          <span>₹${roundedTotal}</span>
        </div>

        <div class="divider-double"></div>

        <div style="font-size: 10.5px; margin: 4px 0;">
          <div class="bold" style="margin-bottom: 2px;">PAYMENT DETAILS:</div>
          ${paymentLinesHtml}
          <div style="display: flex; justify-content: space-between; margin-top: 3px; font-weight: bold; border-top: 1px dotted #000; padding-top: 2px;">
            <span>Paid Amount:</span>
            <span>₹${currentPaid.toFixed(2)}</span>
          </div>
          ${currentRemaining > 0 ? `
            <div style="display: flex; justify-content: space-between; font-weight: bold; color: #000;">
              <span>Balance Due:</span>
              <span>₹${currentRemaining.toFixed(2)}</span>
            </div>
          ` : ''}
        </div>

        <div class="divider"></div>

        <div class="footer">
          <div class="bold">${escapeXml(receiptFooter)}</div>
          <div style="margin-top: 4px; font-size: 9px; opacity: 0.7;">*** Velora QSR POS ***</div>
        </div>
      </body>
      </html>
    `;

    // Trigger isolated iframe printing
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      document.body.removeChild(iframe);
      window.print();
      return;
    }

    doc.open();
    doc.write(receiptHtml);
    doc.close();

    iframe.contentWindow?.focus();
    setTimeout(() => {
      try {
        iframe.contentWindow?.print();
      } catch (e) {
        console.error('Receipt print failed:', e);
      } finally {
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 1000);
      }
    }, 350);
  };

  return (
    <>
      <Modal
        isOpen={showCheckoutModal}
        onClose={handleCloseModal}
        title="Settlement & Payment"
        maxWidth="4xl"
        className="sm:max-w-4xl w-full h-[90vh] max-h-[740px] flex flex-col"
        headerClassName="py-2.5 sm:py-3 px-5 sm:px-6"
        bodyClassName="p-0 overflow-hidden flex flex-col flex-1"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-3.5 sm:p-4 h-full flex-1 overflow-hidden">
          {/* ======================================================== */}
          {/* LEFT COLUMN: Order Docket & Complete Bill Breakdown */}
          {/* ======================================================== */}
          <div className="md:col-span-5 flex flex-col h-full bg-stone-50/70 dark:bg-stone-850/40 rounded-2xl p-3 sm:p-3.5 border border-stone-200/80 dark:border-stone-800 overflow-hidden justify-between">
            {/* Docket Header */}
            <div className="flex items-center justify-between pb-2 border-b border-stone-200/70 dark:border-stone-800 shrink-0">
              <div className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
                <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wide">
                  Order Summary
                </h4>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300">
                  {combinedItems.length}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {customerName && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 truncate max-w-[100px]" title={customerName}>
                    {customerName}
                  </span>
                )}
                {posMode === 'table' && selectedTableId && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300/60 dark:border-amber-800/60">
                    Table #{selectedTableId}
                  </span>
                )}
              </div>
            </div>

            {/* Scrollable Items List */}
            <div className="flex-1 overflow-y-auto min-h-0 py-2 pr-1 space-y-2">
              {orderGroups.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-stone-300 dark:border-stone-700 text-center text-xs text-stone-400">
                  No items in this order
                </div>
              ) : (
                orderGroups.map((group) => (
                  <div
                    key={group.id}
                    className="rounded-xl border border-stone-200/70 dark:border-stone-800 overflow-hidden bg-white dark:bg-stone-900 shadow-2xs"
                  >
                    {orderGroups.length > 1 && (
                      <div className="flex items-center justify-between px-2.5 py-1 bg-stone-100/80 dark:bg-stone-800/80 text-stone-700 dark:text-stone-300 font-bold text-[11px] border-b border-stone-200/60 dark:border-stone-800">
                        <span>{group.title}</span>
                        {group.time && (
                          <span className="text-[10px] font-mono text-stone-400">
                            {new Date(group.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="p-1.5 divide-y divide-stone-100 dark:divide-stone-800/60">
                      {group.items.map((it, i) => {
                        const taxBadge = getItemTaxBadge(it, appData.menu, storeGlobalTaxRate);
                        return (
                          <div
                            key={i}
                            className="flex items-center justify-between text-xs py-1 px-1 hover:bg-stone-50/50 dark:hover:bg-stone-800/30 rounded-lg"
                          >
                            <div className="flex-1 min-w-0 pr-1.5">
                              <span className="text-stone-800 dark:text-stone-200 font-medium truncate block leading-tight">
                                {it.name}
                              </span>
                              {taxBadge && (
                                <span
                                  className={cn(
                                    'text-[9px] font-semibold px-1 py-0.2 rounded inline-block mt-0.5 leading-none border',
                                    taxBadge.variant === 'exempt' && 'text-stone-500 bg-stone-100 dark:bg-stone-800 border-stone-200',
                                    taxBadge.variant === 'applicable' && 'text-amber-700 bg-amber-50 dark:bg-amber-950/40 border-amber-200/80',
                                    taxBadge.variant === 'custom' && 'text-sky-700 bg-sky-50 dark:bg-sky-950/40 border-sky-200/80'
                                  )}
                                >
                                  {taxBadge.text}
                                </span>
                              )}
                            </div>
                            <span className="text-stone-400 dark:text-stone-500 font-mono text-[11px] w-8 text-center shrink-0">
                              x{it.quantity}
                            </span>
                            <span className="text-stone-900 dark:text-stone-100 font-mono font-bold text-xs w-16 text-right shrink-0">
                              ₹{(it.price * it.quantity).toFixed(2)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Left Column Bottom: Bill Breakdown & Print Receipt */}
            <div className="shrink-0 pt-2 border-t border-dashed border-stone-200 dark:border-stone-750 space-y-2 mt-auto">
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-stone-500 dark:text-stone-400">
                  <span>Subtotal</span>
                  <span className="font-mono font-semibold text-stone-800 dark:text-stone-200">
                    ₹{subtotal.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between text-stone-500 dark:text-stone-400">
                  <span>
                    {formatTaxLabel(appData.settings, storeGlobalTaxRate, tax)}
                    {appData.settings?.taxCalculationType === 'reverse' && (
                      <span className="ml-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                        (Incl.)
                      </span>
                    )}
                  </span>
                  <span className="font-mono font-semibold text-stone-800 dark:text-stone-200">
                    ₹{tax.toFixed(2)}
                  </span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between font-semibold text-emerald-600 dark:text-emerald-400">
                    <span>Discount Applied</span>
                    <span className="font-mono">-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}

                {extraChargeAmount > 0 && (
                  <div className="flex justify-between font-semibold text-amber-700 dark:text-amber-400">
                    <span>Extra Charges</span>
                    <span className="font-mono">+₹{extraChargeAmount.toFixed(2)}</span>
                  </div>
                )}

                {roundedTotal !== finalTotal && (
                  <div className="flex justify-between text-[11px] text-stone-400">
                    <span>Round Off</span>
                    <span className="font-mono">
                      {roundedTotal > finalTotal ? '+' : ''}₹{(roundedTotal - finalTotal).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              {/* Net Payable Pill & Print Receipt */}
              <div className="p-2.5 sm:p-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-750 flex items-center justify-between shadow-2xs">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400 block leading-none">
                    Net Payable
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-2xl sm:text-3xl font-black font-mono text-blue-900 dark:text-blue-400 leading-none">
                      ₹{roundedTotal}
                    </span>
                    {roundedTotal !== finalTotal && (
                      <span className="text-xs font-mono text-stone-400">
                        (₹{finalTotal.toFixed(2)})
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handlePrintThermalReceipt}
                  leftIcon={<Printer className="w-3.5 h-3.5 text-stone-600 dark:text-stone-300" />}
                  className="font-bold text-xs py-1.5 px-2.5 rounded-xl border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
                >
                  Print Bill
                </Button>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* RIGHT COLUMN: Payment & Settlement Controls */}
          {/* ======================================================== */}
          <div className="md:col-span-7 flex flex-col h-full overflow-hidden justify-between pl-0 md:pl-1">
            {/* Top Fixed Area: Customer Info + Discount/Charges + Payment Mode Tabs */}
            <div className="shrink-0 space-y-3.5 sm:space-y-4 pb-2 sm:pb-2.5">
              {/* Customer Information Card (Referred Fig 2) */}
              <div className="p-2.5 sm:p-3 rounded-2xl bg-stone-50/80 dark:bg-stone-850/60 border border-stone-200/80 dark:border-stone-750/70 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="font-bold text-xs text-stone-900 dark:text-stone-100">
                      Customer Information
                    </span>
                  </div>
                  {(customerName || customerMobile) && (
                    <button
                      type="button"
                      onClick={() => {
                        setCustomerName('');
                        setCustomerMobile('');
                      }}
                      className="text-[11px] font-semibold text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 flex items-center gap-1 cursor-pointer transition-colors"
                      title="Clear customer details"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Clear</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div ref={customerDropdownRef} className="relative">
                    <User className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => handleCustomerNameChange(e.target.value)}
                      onFocus={() => {
                        if (customerSuggestions.length > 0) setShowCustomerDropdown(true);
                      }}
                      placeholder="Customer name (optional)..."
                      className="w-full bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl pl-8.5 pr-2.5 py-1.5 text-xs font-medium text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 focus:outline-none"
                    />

                    {/* Customer Auto-Suggestion Dropdown */}
                    {showCustomerDropdown && customerSuggestions.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto py-1 divide-y divide-stone-100 dark:divide-stone-800">
                        {customerSuggestions.map((cust, idx) => (
                          <button
                            key={cust.id || idx}
                            type="button"
                            onClick={() => handleSelectCustomer(cust)}
                            className="w-full text-left px-3 py-2 hover:bg-amber-50/80 dark:hover:bg-amber-950/30 transition-colors flex items-center justify-between gap-2 group cursor-pointer"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-6 h-6 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-500 group-hover:bg-amber-100 group-hover:text-amber-700 shrink-0">
                                <User className="w-3 h-3" />
                              </div>
                              <div className="min-w-0">
                                <span className="font-bold text-xs text-stone-900 dark:text-stone-100 group-hover:text-amber-700 dark:group-hover:text-amber-400 capitalize truncate block leading-tight">
                                  {cust.name}
                                </span>
                                {cust.phone && (
                                  <span className="text-[10.5px] text-stone-400 dark:text-stone-400 font-mono tracking-tight flex items-center gap-1 mt-0.5">
                                    <Phone className="w-2.5 h-2.5 inline text-stone-400" />
                                    {cust.phone}
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className="text-[10px] text-stone-400 font-medium group-hover:text-amber-600 shrink-0">
                              Select
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="tel"
                      maxLength={10}
                      value={customerMobile}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        setCustomerMobile(val);
                      }}
                      placeholder="10-digit mobile (optional)..."
                      className="w-full bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl pl-8.5 pr-2.5 py-1.5 text-xs font-mono font-medium text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Offer / Discount & Extra Charges in neat 2-col row with icons */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wide flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Offer / Discount</span>
                  </label>
                  <div className="flex items-center rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 focus-within:border-amber-500 focus-within:ring-1 focus-within:ring-amber-500/20">
                    <UnitDropdown
                      value={discountType}
                      onChange={setDiscountType}
                      percentLabel="% Off"
                    />
                    <input
                      type="number"
                      min="0"
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-2.5 py-1.5 text-xs font-mono font-bold bg-transparent outline-none text-stone-900 dark:text-stone-100 placeholder-stone-400 min-w-0 rounded-r-xl"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wide flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    <span>Extra Charges</span>
                  </label>
                  <div className="flex items-center rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 focus-within:border-amber-500 focus-within:ring-1 focus-within:ring-amber-500/20">
                    <UnitDropdown
                      value={extraChargeType}
                      onChange={setExtraChargeType}
                      percentLabel="% Extra"
                    />
                    <input
                      type="number"
                      min="0"
                      value={extraChargeValue}
                      onChange={(e) => setExtraChargeValue(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-2.5 py-1.5 text-xs font-mono font-bold bg-transparent outline-none text-stone-900 dark:text-stone-100 placeholder-stone-400 min-w-0 rounded-r-xl"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Mode Selector Tabs */}
              <div className="flex p-0.5 bg-stone-100 dark:bg-stone-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => setSettleTab('single')}
                  className={cn(
                    'flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5',
                    settleTab === 'single'
                      ? 'bg-white dark:bg-stone-900 shadow-xs text-stone-950 dark:text-stone-100 font-extrabold'
                      : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                  )}
                >
                  <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Single Full Payment</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSettleTab('split')}
                  className={cn(
                    'flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5',
                    settleTab === 'split'
                      ? 'bg-white dark:bg-stone-900 shadow-xs text-amber-600 dark:text-amber-400 font-extrabold'
                      : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                  )}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Partial Payment</span>
                  {currentPayments.length > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-stone-950 font-black">
                      {currentPayments.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* TAB 1: SINGLE FULL PAYMENT (Seamless ergonomics, NO scrollbar needed) */}
            {settleTab === 'single' && (
              <div className="flex-1 flex flex-col justify-between min-h-0 space-y-2">
                {/* Payment Method Selector Tiles */}
                <div className="space-y-1">
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      {
                        id: 'Cash',
                        label: 'Cash',
                        icon: Banknote,
                        activeStyle: 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-500/20',
                        color: 'text-emerald-600 dark:text-emerald-400',
                      },
                      {
                        id: 'Card',
                        label: 'Card',
                        icon: CreditCard,
                        activeStyle: 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 ring-2 ring-sky-500/20',
                        color: 'text-sky-600 dark:text-sky-400',
                      },
                      {
                        id: 'UPI',
                        label: 'UPI / QR',
                        icon: QrCode,
                        activeStyle: 'border-purple-500 bg-purple-50/70 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 ring-2 ring-purple-500/20',
                        color: 'text-purple-600 dark:text-purple-400',
                      },
                    ].map((m) => {
                      const isSelected = paymentType === m.id;
                      const Icon = m.icon;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setPaymentType(m.id)}
                          className={cn(
                            'py-2 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer select-none',
                            isSelected
                              ? cn(m.activeStyle, 'shadow-xs font-black')
                              : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-850'
                          )}
                        >
                          <Icon className={cn('w-4 h-4 shrink-0', m.color)} />
                          <span>{m.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Cash Payment Tender & Smart Suggestions */}
                {paymentType === 'Cash' && (
                  <div className="p-2.5 rounded-2xl bg-stone-50 dark:bg-stone-850/60 border border-stone-200/80 dark:border-stone-800 space-y-1.5">
                    {/* Header with live Change feedback */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-stone-700 dark:text-stone-300">
                        Cash Tendered:
                      </span>
                      {tenderCash && tenderedAmount > roundedTotal ? (
                        <span className="font-mono font-black text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-lg border border-emerald-300 dark:border-emerald-800">
                          Return Change: ₹{changeDue.toFixed(2)}
                        </span>
                      ) : tenderCash && tenderedAmount > 0 && tenderedAmount < roundedTotal ? (
                        <span className="font-mono font-black text-xs text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-950 px-2 py-0.5 rounded-lg border border-rose-300 dark:border-rose-800">
                          Short by: ₹{(roundedTotal - tenderedAmount).toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-[11px] font-mono text-stone-400">
                          Change: ₹0.00
                        </span>
                      )}
                    </div>

                    {/* Cash Input with ₹ prefix and clear button */}
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-bold font-mono text-sm">
                        ₹
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        placeholder={`Enter cash given (e.g. ${roundedTotal})`}
                        value={tenderCash}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '' || parseFloat(val) >= 0) setTenderCash(val);
                        }}
                        className="w-full bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl pl-7 pr-8 py-1.5 text-sm font-mono font-bold text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:border-amber-500 focus:outline-none"
                      />
                      {tenderCash && (
                        <button
                          type="button"
                          onClick={() => setTenderCash('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1 text-xs cursor-pointer"
                          title="Clear"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* Smart Quick-Pick Chips (single row, fully visible) */}
                    {smartCashOptions.length > 0 && (
                      <div className="flex gap-1.5 flex-wrap pt-0.5">
                        {smartCashOptions.map((opt) => {
                          const isSelected = tenderCash === opt.amount.toString();
                          return (
                            <button
                              key={opt.amount}
                              type="button"
                              onClick={() => setTenderCash(opt.amount.toString())}
                              className={cn(
                                'flex-1 min-w-[70px] py-1 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center',
                                isSelected
                                  ? 'bg-amber-500 text-stone-950 border-amber-500 shadow-xs'
                                  : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                              )}
                            >
                              <span>{opt.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Order Description / Note (Optional) */}
                <div className="relative">
                  <textarea
                    rows={2}
                    value={orderDescription}
                    onChange={(e) => setOrderDescription(e.target.value)}
                    placeholder="Order note / customer instruction (optional)..."
                    className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-3 py-1.5 text-xs text-stone-800 dark:text-stone-200 placeholder-stone-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 focus:outline-none resize-none"
                  />
                </div>

                {/* Settle Order Action Button */}
                <div className="pt-1 mt-auto">
                  <button
                    type="button"
                    onClick={() => handleConfirmOrder(undefined)}
                    className="w-full font-bold text-sm py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Confirm & Pay</span>
                    <span className="font-mono text-base font-black">₹{roundedTotal}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: PARTIAL PAYMENT */}
            {settleTab === 'split' && (
              <div className="flex-1 flex flex-col justify-between min-h-0 space-y-2">
                <div className="flex-1 overflow-y-auto min-h-0 pr-1 space-y-2.5">
                  {/* Custom Installment Input Form */}
                  {currentRemaining > 0.01 ? (
                    <div className="p-2.5 rounded-2xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-750 space-y-2">
                      <div className="text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wide flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Plus className="w-3.5 h-3.5 text-amber-500" />
                          <span>Add Partial Payment</span>
                        </span>
                        <span className="text-[11px] font-mono text-stone-400 font-normal">
                          Max: ₹{currentRemaining.toFixed(2)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                        {/* Amount Input */}
                        <div className="sm:col-span-5">
                          <label className="text-[10px] font-bold text-stone-500 block mb-0.5">
                            Amount (₹)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="1"
                            max={currentRemaining}
                            value={installmentAmount}
                            onChange={(e) => setInstallmentAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold focus:border-amber-500 focus:outline-none"
                          />
                        </div>

                        {/* Method Selector */}
                        <div className="sm:col-span-4">
                          <label className="text-[10px] font-bold text-stone-500 block mb-0.5">
                            Method
                          </label>
                          <div className="flex bg-white dark:bg-stone-900 p-0.5 rounded-xl border border-stone-300 dark:border-stone-700">
                            {(['Cash', 'UPI', 'Card'] as const).map((m) => (
                              <button
                                key={m}
                                type="button"
                                onClick={() => setInstallmentMethod(m)}
                                className={cn(
                                  'flex-1 py-1 text-[11px] font-bold rounded-lg transition-all',
                                  installmentMethod === m
                                    ? 'bg-amber-500 text-stone-950 shadow-xs'
                                    : 'text-stone-600 dark:text-stone-400'
                                )}
                              >
                                {m}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Ref / Note */}
                        <div className="sm:col-span-3">
                          <label className="text-[10px] font-bold text-stone-500 block mb-0.5">
                            Ref / Note
                          </label>
                          <input
                            type="text"
                            value={installmentRef}
                            onChange={(e) => setInstallmentRef(e.target.value)}
                            placeholder="Optional"
                            className="w-full bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl px-2.5 py-1.5 text-xs focus:border-amber-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={handleAddInstallment}
                        disabled={!installmentAmount || parseFloat(installmentAmount) <= 0}
                        leftIcon={<Plus className="w-3.5 h-3.5" />}
                        className="w-full font-bold text-xs py-1.5"
                      >
                        + Add ₹{(parseFloat(installmentAmount) || 0).toFixed(2)} ({installmentMethod})
                      </Button>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                      <div className="text-xs">
                        <strong>Bill is 100% Paid!</strong> You can now confirm and close below.
                      </div>
                    </div>
                  )}

                  {/* Recorded Partial Payments Ledger */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                      <span className="flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-stone-400" />
                        <span>Installments ({currentPayments.length})</span>
                      </span>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400">
                        Total: ₹{currentPaid.toFixed(2)}
                      </span>
                    </div>

                    {currentPayments.length === 0 ? (
                      <div className="p-2 rounded-xl border border-dashed border-stone-300 dark:border-stone-800 text-center text-xs text-stone-400">
                        No payments recorded yet. Enter an installment above.
                      </div>
                    ) : (
                      <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                        {currentPayments.map((p, idx) => (
                          <div
                            key={idx}
                            className="p-1.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/70 dark:border-stone-700/60 flex items-center justify-between gap-2 text-xs"
                          >
                            <div className="flex items-center gap-1.5">
                              <div className="p-1 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700">
                                {getMethodIcon(p.paymentMethod)}
                              </div>
                              <span className="font-bold text-stone-900 dark:text-stone-100">
                                {p.paymentMethod}
                              </span>
                              {p.reference && (
                                <span className="text-[10px] text-stone-400">
                                  • {p.reference}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                                ₹{parseFloat(String(p.amount)).toFixed(2)}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveInstallment(idx)}
                                className="p-0.5 text-stone-400 hover:text-rose-600 rounded cursor-pointer"
                                aria-label="Delete installment"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Order Description / Note (Optional) */}
                  <div className="relative">
                    <textarea
                      rows={2}
                      value={orderDescription}
                      onChange={(e) => setOrderDescription(e.target.value)}
                      placeholder="Order note / customer instruction (optional)..."
                      className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-3 py-1.5 text-xs text-stone-800 dark:text-stone-200 placeholder-stone-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 focus:outline-none resize-none"
                    />
                  </div>
                </div>

                {/* Partial Payment Actions */}
                <div className="pt-1 mt-auto">
                  {currentRemaining <= 0.01 ? (
                    <button
                      type="button"
                      onClick={() => handleConfirmOrder(currentPayments)}
                      className="w-full font-bold text-sm py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>Confirm & Settle Final Bill</span>
                      <span className="font-mono text-base font-black">₹{roundedTotal}</span>
                    </button>
                  ) : posMode === 'table' && selectedTableId ? (
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={handleCloseModal}
                      className="w-full font-extrabold text-sm py-2.5"
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                    >
                      Save Partial Deposit & Keep Table Open
                    </Button>
                  ) : (
                    <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-[11px] text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40 text-center font-medium">
                      Remaining due: <strong>₹{currentRemaining.toFixed(2)}</strong>. Please add balance to settle.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* 🖨️ Thermal Receipt Printable Container (Rendered off-screen, visible only on print) */}
      {/* 🖨️ Thermal Receipt Printable Container (Rendered off-screen, visible on direct print fallback) */}
      <div id="thermal-receipt" className="hidden print:block">
        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
          <div style={{ fontSize: '15px', fontWeight: 'bold', textTransform: 'uppercase' }}>
            {storeProfile?.businessName || appData?.settings?.storeName || 'VELORA QSR'}
          </div>
          {storeProfile?.cafeCode && (
            <div style={{ fontSize: '10px' }}>Code: {storeProfile.cafeCode}</div>
          )}
          {(storeProfile?.address || appData?.settings?.address) && (
            <div style={{ fontSize: '10px' }}>{storeProfile?.address || appData?.settings?.address}</div>
          )}
          {[storeProfile?.city, storeProfile?.state].filter(Boolean).length > 0 && (
            <div style={{ fontSize: '10px' }}>{[storeProfile?.city, storeProfile?.state].filter(Boolean).join(', ')}</div>
          )}
          {(storeProfile?.phone || appData?.settings?.phone) && (
            <div style={{ fontSize: '10px' }}>Phone: {storeProfile?.phone || appData?.settings?.phone}</div>
          )}
          {(storeProfile?.gstin || appData?.settings?.taxNo) && (
            <div style={{ fontSize: '10px' }}>GSTIN: {storeProfile?.gstin || appData?.settings?.taxNo}</div>
          )}
          <div style={{ borderBottom: '2px dashed #000', margin: '6px 0' }} />
        </div>

        <div style={{ fontSize: '10px', display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
          <span>Date: {new Date().toLocaleDateString('en-GB')}</span>
          <span>Time: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
        </div>
        <div style={{ fontSize: '10px', display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
          <span>Type: {posMode === 'table' ? `Table #${selectedTableId}` : 'Quick Counter'}</span>
          <span>Staff: {currentUser?.fullName || currentUser?.username || 'Counter'}</span>
        </div>
        {(customerName || customerMobile) && (
          <div style={{ fontSize: '10px', display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span>Customer: <strong>{customerName || 'Walk-in'}</strong></span>
            {customerMobile && <span>Tel: {customerMobile}</span>}
          </div>
        )}
        {orderDescription && (
          <div style={{ fontSize: '9.5px', fontStyle: 'italic', marginBottom: '4px' }}>
            <span>Note: {orderDescription}</span>
          </div>
        )}

        <div style={{ borderBottom: '1px dashed #000', margin: '4px 0' }} />

        {/* Itemized Table */}
        <table style={{ width: '100%', fontSize: '10.5px', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px dashed #000', textAlign: 'left' }}>
              <th style={{ paddingBottom: '3px', width: '55%' }}>Item</th>
              <th style={{ textAlign: 'center', paddingBottom: '3px', width: '18%' }}>Qty</th>
              <th style={{ textAlign: 'right', paddingBottom: '3px', width: '27%' }}>Amt</th>
            </tr>
          </thead>
          <tbody>
            {orderGroups.length > 0
              ? orderGroups.map((group) => (
                  <React.Fragment key={group.id}>
                    {orderGroups.length > 1 && (
                      <tr>
                        <td colSpan={3} style={{ fontWeight: 'bold', fontSize: '10px', paddingTop: '4px', borderBottom: '1px dotted #ccc' }}>
                          {group.title}
                        </td>
                      </tr>
                    )}
                    {group.items.map((it, i) => (
                      <tr key={i}>
                        <td style={{ padding: '2px 0' }}>{it.name}</td>
                        <td style={{ textAlign: 'center' }}>x{it.quantity}</td>
                        <td style={{ textAlign: 'right', fontWeight: 'bold' }}>₹{(it.price * it.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))
              : combinedItems.map((it: any, i: number) => {
                  const p = parseFloat(String(it.price).replace(/[^0-9.]/g, '')) || 0;
                  const q = it.quantity || 1;
                  return (
                    <tr key={i}>
                      <td style={{ padding: '2px 0' }}>{it.name}</td>
                      <td style={{ textAlign: 'center' }}>x{q}</td>
                      <td style={{ textAlign: 'right', fontWeight: 'bold' }}>₹{(p * q).toFixed(2)}</td>
                    </tr>
                  );
                })}
          </tbody>
        </table>

        <div style={{ borderBottom: '1px dashed #000', margin: '6px 0' }} />

        {/* Totals */}
        <div style={{ fontSize: '10.5px', lineHeight: '1.4' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Subtotal:</span>
            <span style={{ fontWeight: 'bold' }}>₹{subtotal.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>{formatTaxLabel(appData.settings, storeGlobalTaxRate, tax)}{appData.settings?.taxCalculationType === 'reverse' ? ' (Incl.)' : ''}:</span>
            <span style={{ fontWeight: 'bold' }}>₹{tax.toFixed(2)}</span>
          </div>
          {discountAmount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
              <span>Discount Applied:</span>
              <span>-₹{discountAmount.toFixed(2)}</span>
            </div>
          )}
          {extraChargeAmount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
              <span>Extra Charges{extraChargeType === 'percent' ? ` (${eVal}%)` : ''}:</span>
              <span>+₹{extraChargeAmount.toFixed(2)}</span>
            </div>
          )}
          {roundedTotal !== finalTotal && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Round Off:</span>
              <span>{roundedTotal > finalTotal ? '+' : ''}₹{(roundedTotal - finalTotal).toFixed(2)}</span>
            </div>
          )}
          <div style={{ borderBottom: '2px dashed #000', margin: '5px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: '900' }}>
            <span>NET PAYABLE:</span>
            <span>₹{roundedTotal}</span>
          </div>
          <div style={{ borderBottom: '2px dashed #000', margin: '5px 0' }} />
        </div>

        {/* Payment Breakdown */}
        <div style={{ fontSize: '10.5px', marginTop: '4px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>PAYMENT DETAILS:</div>
          {currentPayments.length > 0 ? (
            currentPayments.map((cp, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '1px 0' }}>
                <span>• {cp.paymentMethod}{cp.reference ? ` (${cp.reference})` : ''}:</span>
                <span style={{ fontWeight: 'bold' }}>₹{parseFloat(String(cp.amount)).toFixed(2)}</span>
              </div>
            ))
          ) : (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>• Mode: {paymentType}:</span>
              <span style={{ fontWeight: 'bold' }}>₹{roundedTotal}</span>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3px', fontWeight: 'bold', borderTop: '1px dotted #000', paddingTop: '2px' }}>
            <span>Paid Amount:</span>
            <span>₹{currentPaid.toFixed(2)}</span>
          </div>
          {currentRemaining > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
              <span>Balance Due:</span>
              <span>₹{currentRemaining.toFixed(2)}</span>
            </div>
          )}
        </div>

        <div style={{ borderBottom: '1px dashed #000', margin: '6px 0' }} />

        <div style={{ textAlign: 'center', fontSize: '9px', marginTop: '6px' }}>
          <div style={{ fontWeight: 'bold' }}>{storeProfile?.receiptFooter || 'THANK YOU FOR DINING WITH US!'}</div>
          <div style={{ fontStyle: 'italic', marginTop: '2px' }}>*** Velora QSR POS Terminal ***</div>
        </div>
      </div>
    </>
  );
};

function escapeXml(unsafe: string): string {
  return (unsafe || '').replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

