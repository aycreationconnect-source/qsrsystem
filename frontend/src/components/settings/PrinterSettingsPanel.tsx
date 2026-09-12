import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { settingsApi } from '../../api/settingsApi';
import { Button, Input } from '../ui';
import {
  printTestThermalBill,
  printTestKOT,
  printTestItemLabel,
} from '../../lib/thermalPrintUtils';
import {
  Printer,
  Receipt,
  UtensilsCrossed,
  Tag,
  CheckCircle2,
  Sparkles,
  QrCode,
} from 'lucide-react';
import { cn } from '../../lib/utils';

export type PrinterSubTab = 'bill' | 'kot' | 'item';

export const PrinterSettingsPanel: React.FC = () => {
  const { appData, refreshSettings, storeProfile } = useApp();

  // Active Printer Sub-Tab (Default: Bill Print)
  const [activeSubTab, setActiveSubTab] = useState<PrinterSubTab>('bill');

  // Saving states
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // -------------------------------------------------------------
  // Default Printer / Page Settings
  // -------------------------------------------------------------
  const [defaultPaperWidth, setDefaultPaperWidth] = useState<'80mm' | '58mm'>(() => {
    return (appData.settings?.printer_default_paper_width as '80mm' | '58mm') || '80mm';
  });

  // -------------------------------------------------------------
  // 1. Bill / Customer Receipt Settings
  // -------------------------------------------------------------
  const [billPaperWidth, setBillPaperWidth] = useState<'80mm' | '58mm'>(() => {
    return (appData.settings?.printer_bill_paper_width as '80mm' | '58mm') || defaultPaperWidth || '80mm';
  });

  const [billHeaderTitle, setBillHeaderTitle] = useState<string>(() => {
    return appData.settings?.printer_bill_header_title || 'TAX INVOICE';
  });

  const [billShowLogo, setBillShowLogo] = useState<boolean>(() => {
    return appData.settings?.printer_bill_show_logo !== 'false' && appData.settings?.printer_bill_show_logo !== false;
  });

  const [billShowAddress, setBillShowAddress] = useState<boolean>(() => {
    return appData.settings?.printer_bill_show_address !== 'false' && appData.settings?.printer_bill_show_address !== false;
  });

  const [billShowGstin, setBillShowGstin] = useState<boolean>(() => {
    return appData.settings?.printer_bill_show_gstin !== 'false' && appData.settings?.printer_bill_show_gstin !== false;
  });

  const [billShowCashier, setBillShowCashier] = useState<boolean>(() => {
    return appData.settings?.printer_bill_show_cashier !== 'false' && appData.settings?.printer_bill_show_cashier !== false;
  });

  const [billShowTable, setBillShowTable] = useState<boolean>(() => {
    return appData.settings?.printer_bill_show_table !== 'false' && appData.settings?.printer_bill_show_table !== false;
  });

  const [billShowTaxes, setBillShowTaxes] = useState<boolean>(() => {
    return appData.settings?.printer_bill_show_taxes !== 'false' && appData.settings?.printer_bill_show_taxes !== false;
  });

  const [billShowPayments, setBillShowPayments] = useState<boolean>(() => {
    return appData.settings?.printer_bill_show_payments !== 'false' && appData.settings?.printer_bill_show_payments !== false;
  });

  const [billFooterMsg, setBillFooterMsg] = useState<string>(() => {
    return appData.settings?.printer_bill_footer_msg || storeProfile?.receiptFooter || 'Thank you for dining with us! Please visit again.';
  });

  const [billShowQr, setBillShowQr] = useState<boolean>(() => {
    return appData.settings?.printer_bill_show_qr !== 'false' && appData.settings?.printer_bill_show_qr !== false;
  });

  const [billCopies, setBillCopies] = useState<string>(() => {
    return appData.settings?.printer_bill_copies || '1';
  });

  const [billAutoPrint, setBillAutoPrint] = useState<boolean>(() => {
    return appData.settings?.printer_bill_auto_print === 'true' || appData.settings?.printer_bill_auto_print === true;
  });

  // -------------------------------------------------------------
  // 2. KOT (Kitchen Order Ticket) Settings
  // -------------------------------------------------------------
  const [kotPaperWidth, setKotPaperWidth] = useState<'80mm' | '58mm'>(() => {
    return (appData.settings?.printer_kot_paper_width as '80mm' | '58mm') || defaultPaperWidth || '80mm';
  });

  const [kotStation, setKotStation] = useState<string>(() => {
    return appData.settings?.printer_kot_station || 'All Kitchen Stations';
  });

  const [kotShowTable, setKotShowTable] = useState<boolean>(() => {
    return appData.settings?.printer_kot_show_table !== 'false' && appData.settings?.printer_kot_show_table !== false;
  });

  const [kotShowServer, setKotShowServer] = useState<boolean>(() => {
    return appData.settings?.printer_kot_show_server !== 'false' && appData.settings?.printer_kot_show_server !== false;
  });

  const [kotShowNotes, setKotShowNotes] = useState<boolean>(() => {
    return appData.settings?.printer_kot_show_notes !== 'false' && appData.settings?.printer_kot_show_notes !== false;
  });

  const [kotShowDietary, setKotShowDietary] = useState<boolean>(() => {
    return appData.settings?.printer_kot_show_dietary !== 'false' && appData.settings?.printer_kot_show_dietary !== false;
  });

  const [kotAutoPrint, setKotAutoPrint] = useState<boolean>(() => {
    return appData.settings?.printer_kot_auto_print !== 'false' && appData.settings?.printer_kot_auto_print !== false;
  });

  const [kotCopies, setKotCopies] = useState<string>(() => {
    return appData.settings?.printer_kot_copies || '1';
  });

  // -------------------------------------------------------------
  // 3. Item / Label Print Settings
  // -------------------------------------------------------------
  const [itemLabelSize, setItemLabelSize] = useState<'50x25' | '40x30' | 'continuous'>(() => {
    return (appData.settings?.printer_item_label_size as any) || '50x25';
  });

  const [itemShowPrice, setItemShowPrice] = useState<boolean>(() => {
    return appData.settings?.printer_item_show_price !== 'false' && appData.settings?.printer_item_show_price !== false;
  });

  const [itemShowBarcode, setItemShowBarcode] = useState<boolean>(() => {
    return appData.settings?.printer_item_show_barcode !== 'false' && appData.settings?.printer_item_show_barcode !== false;
  });

  const [itemShowDietary, setItemShowDietary] = useState<boolean>(() => {
    return appData.settings?.printer_item_show_dietary !== 'false' && appData.settings?.printer_item_show_dietary !== false;
  });

  const [itemShowToken, setItemShowToken] = useState<boolean>(() => {
    return appData.settings?.printer_item_show_token !== 'false' && appData.settings?.printer_item_show_token !== false;
  });

  const [itemNote, setItemNote] = useState<string>(() => {
    return appData.settings?.printer_item_note || 'Freshly Brewed & Prepared';
  });

  // -------------------------------------------------------------
  // Save All Printer Settings
  // -------------------------------------------------------------
  const handleSaveAllPrinterSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setIsSaving(true);
      const payload: Record<string, string> = {
        printer_default_paper_width: defaultPaperWidth,
        // Bill
        printer_bill_paper_width: billPaperWidth,
        printer_bill_header_title: billHeaderTitle,
        printer_bill_show_logo: String(billShowLogo),
        printer_bill_show_address: String(billShowAddress),
        printer_bill_show_gstin: String(billShowGstin),
        printer_bill_show_cashier: String(billShowCashier),
        printer_bill_show_table: String(billShowTable),
        printer_bill_show_taxes: String(billShowTaxes),
        printer_bill_show_payments: String(billShowPayments),
        printer_bill_footer_msg: billFooterMsg,
        printer_bill_show_qr: String(billShowQr),
        printer_bill_copies: billCopies,
        printer_bill_auto_print: String(billAutoPrint),
        // KOT
        printer_kot_paper_width: kotPaperWidth,
        printer_kot_station: kotStation,
        printer_kot_show_table: String(kotShowTable),
        printer_kot_show_server: String(kotShowServer),
        printer_kot_show_notes: String(kotShowNotes),
        printer_kot_show_dietary: String(kotShowDietary),
        printer_kot_auto_print: String(kotAutoPrint),
        printer_kot_copies: kotCopies,
        // Item
        printer_item_label_size: itemLabelSize,
        printer_item_show_price: String(itemShowPrice),
        printer_item_show_barcode: String(itemShowBarcode),
        printer_item_show_dietary: String(itemShowDietary),
        printer_item_show_token: String(itemShowToken),
        printer_item_note: itemNote,
      };

      await settingsApi.saveSettings(payload);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
      await refreshSettings();
    } catch (err) {
      console.error(err);
      alert('Failed to save printer settings.');
    } finally {
      setIsSaving(false);
    }
  };

  // -------------------------------------------------------------
  // Test Print Triggers
  // -------------------------------------------------------------
  const handleTestPrint = () => {
    if (activeSubTab === 'bill') {
      printTestThermalBill({
        config: {
          paperWidth: billPaperWidth,
          headerTitle: billHeaderTitle,
          showLogo: billShowLogo,
          showAddress: billShowAddress,
          showGstin: billShowGstin,
          showCashier: billShowCashier,
          showTable: billShowTable,
          showTaxes: billShowTaxes,
          showPayments: billShowPayments,
          footerMsg: billFooterMsg,
          showQr: billShowQr,
        },
        storeProfile,
      });
    } else if (activeSubTab === 'kot') {
      printTestKOT({
        config: {
          paperWidth: kotPaperWidth,
          station: kotStation,
          showTable: kotShowTable,
          showServer: kotShowServer,
          showNotes: kotShowNotes,
          showDietary: kotShowDietary,
        },
        storeProfile,
      });
    } else if (activeSubTab === 'item') {
      printTestItemLabel({
        config: {
          labelSize: itemLabelSize,
          showPrice: itemShowPrice,
          showBarcode: itemShowBarcode,
          showDietary: itemShowDietary,
          showToken: itemShowToken,
          note: itemNote,
        },
        storeProfile,
      });
    }
  };

  // -------------------------------------------------------------
  // Render
  // -------------------------------------------------------------
  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Save Success Alert Banner */}
      {saveSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in zoom-in-95">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Printer configuration & default paper format saved successfully!</span>
        </div>
      )}

      {/* Global Default Printer Roll Setup Card */}
      <div className="bg-white dark:bg-stone-900 border border-sky-500/40 dark:border-sky-500/30 rounded-2xl p-3 sm:p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                <Printer className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-xs sm:text-sm font-extrabold text-stone-900 dark:text-stone-100 whitespace-nowrap">
                Default Thermal Page & Paper Format
              </h3>
              <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 shrink-0">
                DEFAULT: {defaultPaperWidth.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 truncate">
              Standard 80mm full-width counter roll or 58mm compact mobile Bluetooth roll.
            </p>
          </div>

          {/* Toggle Switch between 58mm and 80mm */}
          <div className="flex items-center gap-2 shrink-0 select-none bg-stone-100/70 dark:bg-stone-800/60 p-1.5 rounded-xl border border-stone-200/60 dark:border-stone-700/60">
            <span
              onClick={() => {
                setDefaultPaperWidth('58mm');
                setBillPaperWidth('58mm');
                setKotPaperWidth('58mm');
              }}
              className={cn(
                'text-xs font-bold transition-colors cursor-pointer px-1.5',
                defaultPaperWidth === '58mm'
                  ? 'text-sky-600 dark:text-sky-400 font-extrabold'
                  : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300'
              )}
            >
              58mm Mini
            </span>

            <button
              type="button"
              role="switch"
              aria-checked={defaultPaperWidth === '80mm'}
              onClick={() => {
                const next = defaultPaperWidth === '80mm' ? '58mm' : '80mm';
                setDefaultPaperWidth(next);
                setBillPaperWidth(next);
                setKotPaperWidth(next);
              }}
              className={cn(
                'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
                defaultPaperWidth === '80mm' ? 'bg-sky-500' : 'bg-stone-300 dark:bg-stone-600'
              )}
            >
              <span
                className={cn(
                  'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out',
                  defaultPaperWidth === '80mm' ? 'translate-x-5' : 'translate-x-0'
                )}
              />
            </button>

            <span
              onClick={() => {
                setDefaultPaperWidth('80mm');
                setBillPaperWidth('80mm');
                setKotPaperWidth('80mm');
              }}
              className={cn(
                'text-xs font-bold transition-colors cursor-pointer px-1.5',
                defaultPaperWidth === '80mm'
                  ? 'text-sky-600 dark:text-sky-400 font-extrabold'
                  : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300'
              )}
            >
              80mm Standard
            </span>
          </div>
        </div>
      </div>

      {/* Printer Category Tabs / Pills */}
      <div className="flex items-center gap-2 p-1.5 bg-stone-100/80 dark:bg-stone-800/50 rounded-2xl border border-stone-200/60 dark:border-stone-800">
        {[
          {
            id: 'bill' as const,
            label: 'Bill Print',
            subtitle: 'Customer Receipt / Tax Invoice',
            icon: <Receipt className="w-4 h-4" />,
            badge: `${billPaperWidth}`,
          },
          {
            id: 'kot' as const,
            label: 'KOT Print',
            subtitle: 'Kitchen Order Tickets',
            icon: <UtensilsCrossed className="w-4 h-4" />,
            badge: `${kotPaperWidth}`,
          },
          {
            id: 'item' as const,
            label: 'Item Print',
            subtitle: 'Cup & Barcode Labels',
            icon: <Tag className="w-4 h-4" />,
            badge: `${itemLabelSize}mm`,
          },
        ].map((tab) => {
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubTab(tab.id)}
              className={cn(
                'flex-1 py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2 border select-none',
                isActive
                  ? 'bg-white dark:bg-stone-900 text-sky-950 dark:text-sky-200 border-sky-500/40 dark:border-sky-700 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 border-transparent hover:text-stone-900 dark:hover:text-stone-200'
              )}
            >
              <span className={cn(isActive ? 'text-sky-500' : 'text-stone-400')}>{tab.icon}</span>
              <span>{tab.label}</span>
              <span
                className={cn(
                  'text-[10px] px-1.5 py-0.2 rounded-full font-bold hidden sm:inline-block',
                  isActive
                    ? 'bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300'
                    : 'bg-stone-200/60 dark:bg-stone-700/60 text-stone-500 dark:text-stone-400'
                )}
              >
                {tab.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Split Configuration & Live Preview Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* =========================================================================
            LEFT COLUMN: CONFIGURATION CONTROLS (lg:col-span-7)
            ========================================================================= */}
        <div className="lg:col-span-7 space-y-6">
          {/* TAB 1: BILL PRINT CONFIGURATION */}
          {activeSubTab === 'bill' && (
            <div className="bg-white dark:bg-stone-900 border border-sky-500/30 dark:border-sky-500/25 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-stone-900 dark:text-stone-100">
                      Customer Bill / Receipt Setup
                    </h4>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      Configure thermal layout, header details, GST format, and auto-print triggers.
                    </p>
                  </div>
                </div>

                {/* Bill Paper Width Switcher */}
                <div className="flex items-center bg-stone-100 dark:bg-stone-800 p-0.5 rounded-lg border border-stone-200/80 dark:border-stone-700 shrink-0">
                  <button
                    type="button"
                    onClick={() => setBillPaperWidth('80mm')}
                    className={cn(
                      'px-2 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer',
                      billPaperWidth === '80mm'
                        ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                        : 'text-stone-500 hover:text-stone-800'
                    )}
                  >
                    80mm
                  </button>
                  <button
                    type="button"
                    onClick={() => setBillPaperWidth('58mm')}
                    className={cn(
                      'px-2 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer',
                      billPaperWidth === '58mm'
                        ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                        : 'text-stone-500 hover:text-stone-800'
                    )}
                  >
                    58mm
                  </button>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                {/* Header Title */}
                <div>
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider block mb-1">
                    Invoice Header Title
                  </label>
                  <Input
                    value={billHeaderTitle}
                    onChange={(e) => setBillHeaderTitle(e.target.value)}
                    placeholder="TAX INVOICE"
                    className="font-mono text-sm"
                  />
                  <p className="text-[11px] text-stone-400 mt-1">
                    Printed at the very top of the receipt (e.g. TAX INVOICE, CASH MEMO, RETAIL BILL).
                  </p>
                </div>

                {/* Header & Meta Switches */}
                <div className="space-y-2.5 pt-1">
                  <span className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider block">
                    Header & Content Elements
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Store Logo / Badge */}
                    <label className="p-3 rounded-2xl border border-stone-200/80 dark:border-stone-800 flex items-center justify-between cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-850/50">
                      <div>
                        <div className="text-xs font-bold text-stone-800 dark:text-stone-200">Show Brand / Logo</div>
                        <div className="text-[10px] text-stone-400">Prints store name & badge</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={billShowLogo}
                        onChange={(e) => setBillShowLogo(e.target.checked)}
                        className="rounded text-amber-500 focus:ring-amber-400 h-4 w-4"
                      />
                    </label>

                    {/* Address & Phone */}
                    <label className="p-3 rounded-2xl border border-stone-200/80 dark:border-stone-800 flex items-center justify-between cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-850/50">
                      <div>
                        <div className="text-xs font-bold text-stone-800 dark:text-stone-200">Address & Contact</div>
                        <div className="text-[10px] text-stone-400">Outlet address, phone & city</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={billShowAddress}
                        onChange={(e) => setBillShowAddress(e.target.checked)}
                        className="rounded text-amber-500 focus:ring-amber-400 h-4 w-4"
                      />
                    </label>

                    {/* GSTIN */}
                    <label className="p-3 rounded-2xl border border-stone-200/80 dark:border-stone-800 flex items-center justify-between cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-850/50">
                      <div>
                        <div className="text-xs font-bold text-stone-800 dark:text-stone-200">GSTIN / Tax No</div>
                        <div className="text-[10px] text-stone-400">Prints statutory tax ID</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={billShowGstin}
                        onChange={(e) => setBillShowGstin(e.target.checked)}
                        className="rounded text-amber-500 focus:ring-amber-400 h-4 w-4"
                      />
                    </label>

                    {/* Dining Table Info */}
                    <label className="p-3 rounded-2xl border border-stone-200/80 dark:border-stone-800 flex items-center justify-between cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-850/50">
                      <div>
                        <div className="text-xs font-bold text-stone-800 dark:text-stone-200">Table & Section</div>
                        <div className="text-[10px] text-stone-400">Prints table name or Takeaway</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={billShowTable}
                        onChange={(e) => setBillShowTable(e.target.checked)}
                        className="rounded text-amber-500 focus:ring-amber-400 h-4 w-4"
                      />
                    </label>

                    {/* Cashier / Staff */}
                    <label className="p-3 rounded-2xl border border-stone-200/80 dark:border-stone-800 flex items-center justify-between cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-850/50">
                      <div>
                        <div className="text-xs font-bold text-stone-800 dark:text-stone-200">Cashier / Staff Name</div>
                        <div className="text-[10px] text-stone-400">Biller name & bill reference</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={billShowCashier}
                        onChange={(e) => setBillShowCashier(e.target.checked)}
                        className="rounded text-amber-500 focus:ring-amber-400 h-4 w-4"
                      />
                    </label>

                    {/* Tax Breakdown */}
                    <label className="p-3 rounded-2xl border border-stone-200/80 dark:border-stone-800 flex items-center justify-between cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-850/50">
                      <div>
                        <div className="text-xs font-bold text-stone-800 dark:text-stone-200">Taxes & CGST/SGST</div>
                        <div className="text-[10px] text-stone-400">Itemized tax calculations</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={billShowTaxes}
                        onChange={(e) => setBillShowTaxes(e.target.checked)}
                        className="rounded text-amber-500 focus:ring-amber-400 h-4 w-4"
                      />
                    </label>

                    {/* Payment Mode */}
                    <label className="p-3 rounded-2xl border border-stone-200/80 dark:border-stone-800 flex items-center justify-between cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-850/50">
                      <div>
                        <div className="text-xs font-bold text-stone-800 dark:text-stone-200">Payment Breakdown</div>
                        <div className="text-[10px] text-stone-400">Cash, UPI reference & change</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={billShowPayments}
                        onChange={(e) => setBillShowPayments(e.target.checked)}
                        className="rounded text-amber-500 focus:ring-amber-400 h-4 w-4"
                      />
                    </label>

                    {/* QR Code */}
                    <label className="p-3 rounded-2xl border border-stone-200/80 dark:border-stone-800 flex items-center justify-between cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-850/50">
                      <div>
                        <div className="text-xs font-bold text-stone-800 dark:text-stone-200">Payment / Feedback QR</div>
                        <div className="text-[10px] text-stone-400">Printed footer QR box</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={billShowQr}
                        onChange={(e) => setBillShowQr(e.target.checked)}
                        className="rounded text-amber-500 focus:ring-amber-400 h-4 w-4"
                      />
                    </label>
                  </div>
                </div>

                {/* Footer Message */}
                <div>
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider block mb-1">
                    Receipt Footer Note
                  </label>
                  <textarea
                    rows={2}
                    value={billFooterMsg}
                    onChange={(e) => setBillFooterMsg(e.target.value)}
                    placeholder="Thank you for dining with us! Please visit again."
                    className="w-full text-xs font-mono p-3 rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/50 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    Custom greeting, WiFi password, feedback link, or return policy.
                  </p>
                </div>

                {/* Print Copies & Automation Settings */}
                <div className="space-y-3 pt-2">
                  {/* Row 1: Number of Copies */}
                  <div className="p-3.5 rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-850/40 flex items-center justify-between gap-4">
                    <div>
                      <div className="text-xs font-bold text-stone-800 dark:text-stone-200">
                        Print Copies
                      </div>
                      <div className="text-[11px] text-stone-500 dark:text-stone-400">
                        {billCopies === '1' ? '1 Copy for customer only' : '2 Copies (Customer + Merchant record)'}
                      </div>
                    </div>

                    <div className="flex items-center bg-stone-200/70 dark:bg-stone-800 p-1 rounded-xl shrink-0">
                      <button
                        type="button"
                        onClick={() => setBillCopies('1')}
                        className={cn(
                          'px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer select-none',
                          billCopies === '1'
                            ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs font-black'
                            : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                        )}
                      >
                        1 Copy
                      </button>
                      <button
                        type="button"
                        onClick={() => setBillCopies('2')}
                        className={cn(
                          'px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer select-none',
                          billCopies === '2'
                            ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs font-black'
                            : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                        )}
                      >
                        2 Copies
                      </button>
                    </div>
                  </div>

                  {/* Row 2: Auto-Print on Checkout */}
                  <div className="p-3.5 rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-850/40 flex items-center justify-between gap-4">
                    <div>
                      <div className="text-xs font-bold text-stone-800 dark:text-stone-200">
                        Auto-Print on Checkout
                      </div>
                      <div className="text-[11px] text-stone-500 dark:text-stone-400">
                        Automatically trigger receipt printing when payment completes
                      </div>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={billAutoPrint}
                        onChange={(e) => setBillAutoPrint(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer dark:bg-stone-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-stone-600 peer-checked:bg-amber-500" />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: KOT PRINT CONFIGURATION */}
          {activeSubTab === 'kot' && (
            <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <UtensilsCrossed className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-stone-900 dark:text-stone-100">
                      Kitchen Order Ticket (KOT) Setup
                    </h4>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      Configure chef tickets, kitchen station routing, dietary badges, and cooking notes.
                    </p>
                  </div>
                </div>

                {/* KOT Paper Width */}
                <div className="flex items-center bg-stone-100 dark:bg-stone-800 p-0.5 rounded-lg border border-stone-200/80 dark:border-stone-700 shrink-0">
                  <button
                    type="button"
                    onClick={() => setKotPaperWidth('80mm')}
                    className={cn(
                      'px-2 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer',
                      kotPaperWidth === '80mm'
                        ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                        : 'text-stone-500 hover:text-stone-800'
                    )}
                  >
                    80mm
                  </button>
                  <button
                    type="button"
                    onClick={() => setKotPaperWidth('58mm')}
                    className={cn(
                      'px-2 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer',
                      kotPaperWidth === '58mm'
                        ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                        : 'text-stone-500 hover:text-stone-800'
                    )}
                  >
                    58mm
                  </button>
                </div>
              </div>

              {/* KOT Options */}
              <div className="space-y-4">
                {/* Kitchen Station Destination */}
                <div>
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider block mb-1">
                    Kitchen Station Routing
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      'All Stations',
                      'Hot Kitchen',
                      'Beverage Bar',
                      'Bakery & Grill',
                    ].map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setKotStation(st)}
                        className={cn(
                          'p-2.5 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer',
                          kotStation === st
                            ? 'bg-amber-500 text-stone-950 border-amber-500 font-extrabold shadow-xs'
                            : 'bg-stone-50 dark:bg-stone-800/60 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300'
                        )}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* KOT Content Elements */}
                <div className="space-y-2.5 pt-1">
                  <span className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider block">
                    KOT Slip Elements
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Table Name */}
                    <label className="p-3 rounded-2xl border border-stone-200/80 dark:border-stone-800 flex items-center justify-between cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-850/50">
                      <div>
                        <div className="text-xs font-bold text-stone-800 dark:text-stone-200">Table & Area Name</div>
                        <div className="text-[10px] text-stone-400">Large table title for runners</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={kotShowTable}
                        onChange={(e) => setKotShowTable(e.target.checked)}
                        className="rounded text-amber-500 focus:ring-amber-400 h-4 w-4"
                      />
                    </label>

                    {/* Server Name */}
                    <label className="p-3 rounded-2xl border border-stone-200/80 dark:border-stone-800 flex items-center justify-between cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-850/50">
                      <div>
                        <div className="text-xs font-bold text-stone-800 dark:text-stone-200">Steward / Waiter</div>
                        <div className="text-[10px] text-stone-400">Identifies order puncher</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={kotShowServer}
                        onChange={(e) => setKotShowServer(e.target.checked)}
                        className="rounded text-amber-500 focus:ring-amber-400 h-4 w-4"
                      />
                    </label>

                    {/* Cooking Notes */}
                    <label className="p-3 rounded-2xl border border-stone-200/80 dark:border-stone-800 flex items-center justify-between cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-850/50">
                      <div>
                        <div className="text-xs font-bold text-stone-800 dark:text-stone-200">Preparation Notes</div>
                        <div className="text-[10px] text-stone-400">Highlights "less spicy", etc.</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={kotShowNotes}
                        onChange={(e) => setKotShowNotes(e.target.checked)}
                        className="rounded text-amber-500 focus:ring-amber-400 h-4 w-4"
                      />
                    </label>

                    {/* Dietary Indicators */}
                    <label className="p-3 rounded-2xl border border-stone-200/80 dark:border-stone-800 flex items-center justify-between cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-850/50">
                      <div>
                        <div className="text-xs font-bold text-stone-800 dark:text-stone-200">Dietary Badges</div>
                        <div className="text-[10px] text-stone-400">Shows Veg (🟢) / Non-Veg (🔴)</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={kotShowDietary}
                        onChange={(e) => setKotShowDietary(e.target.checked)}
                        className="rounded text-amber-500 focus:ring-amber-400 h-4 w-4"
                      />
                    </label>
                  </div>
                </div>

                {/* KOT Copies & Automation Settings */}
                <div className="space-y-3 pt-2">
                  {/* Row 1: KOT Copies */}
                  <div className="p-3.5 rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-850/40 flex items-center justify-between gap-4">
                    <div>
                      <div className="text-xs font-bold text-stone-800 dark:text-stone-200">
                        Kitchen Ticket Copies
                      </div>
                      <div className="text-[11px] text-stone-500 dark:text-stone-400">
                        {kotCopies === '1' ? '1 Copy for main kitchen' : '2 Copies (Kitchen + Bar/Station dispatch)'}
                      </div>
                    </div>

                    <div className="flex items-center bg-stone-200/70 dark:bg-stone-800 p-1 rounded-xl shrink-0">
                      <button
                        type="button"
                        onClick={() => setKotCopies('1')}
                        className={cn(
                          'px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer select-none',
                          kotCopies === '1'
                            ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs font-black'
                            : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                        )}
                      >
                        1 Copy
                      </button>
                      <button
                        type="button"
                        onClick={() => setKotCopies('2')}
                        className={cn(
                          'px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer select-none',
                          kotCopies === '2'
                            ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs font-black'
                            : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                        )}
                      >
                        2 Copies
                      </button>
                    </div>
                  </div>

                  {/* Row 2: Auto-Print KOT on Punch */}
                  <div className="p-3.5 rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-850/40 flex items-center justify-between gap-4">
                    <div>
                      <div className="text-xs font-bold text-stone-800 dark:text-stone-200">
                        Auto-Print KOT on Order Punch
                      </div>
                      <div className="text-[11px] text-stone-500 dark:text-stone-400">
                        Automatically dispatch tickets to kitchen printers on placement
                      </div>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={kotAutoPrint}
                        onChange={(e) => setKotAutoPrint(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer dark:bg-stone-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-stone-600 peer-checked:bg-amber-500" />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ITEM PRINT CONFIGURATION */}
          {activeSubTab === 'item' && (
            <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <Tag className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-stone-900 dark:text-stone-100">
                      Item Barcode & Packaging Label Setup
                    </h4>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      Configure adhesive cup stickers, snack box barcodes, and shelf tags.
                    </p>
                  </div>
                </div>
              </div>

              {/* Item Label Settings */}
              <div className="space-y-4">
                {/* Sticker Dimensions */}
                <div>
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider block mb-1">
                    Label Sticker Dimensions
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: '50x25', label: '50mm × 25mm', desc: 'Cup / Box Sticker' },
                      { id: '40x30', label: '40mm × 30mm', desc: 'Price / Barcode Tag' },
                      { id: 'continuous', label: 'Continuous', desc: 'Thermal Strip' },
                    ].map((sz) => (
                      <button
                        key={sz.id}
                        type="button"
                        onClick={() => setItemLabelSize(sz.id as any)}
                        className={cn(
                          'p-3 rounded-2xl border text-center transition-all cursor-pointer',
                          itemLabelSize === sz.id
                            ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/20 text-amber-950 dark:text-amber-200 ring-1 ring-amber-500 font-extrabold'
                            : 'border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-850/50 text-stone-600 dark:text-stone-400'
                        )}
                      >
                        <div className="text-xs font-bold">{sz.label}</div>
                        <div className="text-[10px] text-stone-400 mt-0.5">{sz.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Item Label Switches */}
                <div className="space-y-2.5 pt-1">
                  <span className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider block">
                    Sticker Elements
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Price MRP */}
                    <label className="p-3 rounded-2xl border border-stone-200/80 dark:border-stone-800 flex items-center justify-between cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-850/50">
                      <div>
                        <div className="text-xs font-bold text-stone-800 dark:text-stone-200">Show Price (₹ MRP)</div>
                        <div className="text-[10px] text-stone-400">Prints retail selling price</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={itemShowPrice}
                        onChange={(e) => setItemShowPrice(e.target.checked)}
                        className="rounded text-amber-500 focus:ring-amber-400 h-4 w-4"
                      />
                    </label>

                    {/* Barcode */}
                    <label className="p-3 rounded-2xl border border-stone-200/80 dark:border-stone-800 flex items-center justify-between cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-850/50">
                      <div>
                        <div className="text-xs font-bold text-stone-800 dark:text-stone-200">Barcode / SKU Lines</div>
                        <div className="text-[10px] text-stone-400">Scannable 1D barcode</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={itemShowBarcode}
                        onChange={(e) => setItemShowBarcode(e.target.checked)}
                        className="rounded text-amber-500 focus:ring-amber-400 h-4 w-4"
                      />
                    </label>

                    {/* Dietary Marker */}
                    <label className="p-3 rounded-2xl border border-stone-200/80 dark:border-stone-800 flex items-center justify-between cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-850/50">
                      <div>
                        <div className="text-xs font-bold text-stone-800 dark:text-stone-200">Dietary Dot (Veg / Non)</div>
                        <div className="text-[10px] text-stone-400">FSSAI food mark symbol</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={itemShowDietary}
                        onChange={(e) => setItemShowDietary(e.target.checked)}
                        className="rounded text-amber-500 focus:ring-amber-400 h-4 w-4"
                      />
                    </label>

                    {/* Order Token & Customer Name */}
                    <label className="p-3 rounded-2xl border border-stone-200/80 dark:border-stone-800 flex items-center justify-between cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-850/50">
                      <div>
                        <div className="text-xs font-bold text-stone-800 dark:text-stone-200">Token & Customer Name</div>
                        <div className="text-[10px] text-stone-400">For takeaway beverage cups</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={itemShowToken}
                        onChange={(e) => setItemShowToken(e.target.checked)}
                        className="rounded text-amber-500 focus:ring-amber-400 h-4 w-4"
                      />
                    </label>
                  </div>
                </div>

                {/* Custom Note on Sticker */}
                <div>
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider block mb-1">
                    Label Subtext / Note
                  </label>
                  <Input
                    value={itemNote}
                    onChange={(e) => setItemNote(e.target.value)}
                    placeholder="Freshly Brewed & Prepared"
                    className="font-mono text-xs"
                  />
                  <p className="text-[11px] text-stone-400 mt-1">
                    Printed at the bottom of the sticker (e.g. "Consume within 2 hrs", "Store in cool place").
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Row: Save All Settings */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 text-xs text-stone-400">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Settings apply immediately across POS checkout and kitchen printers</span>
            </div>

            <Button
              type="button"
              variant="primary"
              size="touch"
              onClick={() => handleSaveAllPrinterSettings()}
              className="px-8 font-extrabold cursor-pointer shadow-md shadow-amber-500/20 shrink-0"
              isLoading={isSaving}
            >
              Save Printer Settings
            </Button>
          </div>
        </div>

        {/* =========================================================================
            RIGHT COLUMN: INTERACTIVE LIVE THERMAL PREVIEW (lg:col-span-5)
            ========================================================================= */}
        <div className="lg:col-span-5 sticky top-6 space-y-4">
          <div className="bg-stone-900 dark:bg-stone-950 rounded-3xl p-5 border border-stone-800 shadow-xl text-stone-200 space-y-4">
            {/* Header with Test Print Action */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Printer className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold tracking-wide uppercase text-stone-200">
                    Live Thermal Output
                  </h4>
                  <div className="text-[10px] text-stone-400">
                    Real-time preview ({activeSubTab === 'bill' ? billPaperWidth : activeSubTab === 'kot' ? kotPaperWidth : itemLabelSize})
                  </div>
                </div>
              </div>

              {/* Physical Test Print Button */}
              <button
                type="button"
                onClick={handleTestPrint}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 select-none"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Test Print</span>
              </button>
            </div>

            {/* Paper Roll Canvas Area */}
            <div className="bg-stone-800/60 rounded-2xl p-4 flex justify-center items-start overflow-hidden min-h-[420px] max-h-[580px] overflow-y-auto custom-scrollbar">
              {/* THERMAL PAPER SLIP */}
              <div
                className={cn(
                  'bg-[#fdfdfd] text-black font-mono shadow-2xl transition-all duration-200 p-4 border border-stone-300 relative select-none',
                  // Realistic Paper Width constraint
                  activeSubTab === 'item'
                    ? itemLabelSize === '40x30'
                      ? 'w-[200px] rounded-lg'
                      : 'w-[240px] rounded-lg'
                    : (activeSubTab === 'bill' ? billPaperWidth : kotPaperWidth) === '58mm'
                    ? 'w-[220px] text-[10px] leading-tight rounded-sm'
                    : 'w-[280px] text-[11px] leading-normal rounded-sm'
                )}
                style={{
                  boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
                }}
              >
                {/* Serrated Tear Edge Top Effect */}
                <div className="absolute -top-1.5 left-0 right-0 h-1.5 bg-repeat-x bg-[radial-gradient(circle,_#555_1px,_transparent_1px)] bg-[length:6px_6px] opacity-20" />

                {/* -------------------------------------------------------------
                    PREVIEW 1: BILL RECEIPT
                    ------------------------------------------------------------- */}
                {activeSubTab === 'bill' && (
                  <div className="space-y-2">
                    {/* Header */}
                    <div className="text-center space-y-0.5">
                      <div className="text-[10px] font-bold tracking-wider">{billHeaderTitle || 'TAX INVOICE'}</div>
                      <div className="text-xs font-black uppercase tracking-tight">
                        {storeProfile?.businessName || 'Velora Artisan Cafe'}
                      </div>
                      {billShowLogo && (
                        <div className="text-[9px] text-stone-600 font-semibold">
                          ✦ {storeProfile?.cafeCode || 'CF-MUM-001'} ✦
                        </div>
                      )}
                      {billShowAddress && (
                        <div className="text-[9px] text-stone-700 leading-tight">
                          <div>{storeProfile?.address || '102 High Street, Bandra West'}</div>
                          <div>Tel: {storeProfile?.phone || '+91 98765 43210'}</div>
                        </div>
                      )}
                      {billShowGstin && (
                        <div className="text-[9px] text-stone-800 font-bold">
                          GSTIN: {storeProfile?.gstin || '27AADCB2230M1Z2'}
                        </div>
                      )}
                    </div>

                    <div className="border-t-2 border-dashed border-black my-1.5" />

                    {/* Metadata */}
                    <div className="text-[9.5px] space-y-0.5">
                      <div className="flex justify-between">
                        <span>TOKEN: <strong className="text-xs">#042</strong></span>
                        <span>15:45 PM</span>
                      </div>
                      <div className="flex justify-between">
                        <span>DATE: 10 Sep 2026</span>
                        {billShowTable && <span>TABLE: <strong>T-04</strong></span>}
                      </div>
                      {billShowCashier && (
                        <div className="flex justify-between text-stone-700">
                          <span>STAFF: Alex M.</span>
                          <span>BILL: #9981</span>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-dashed border-black my-1" />

                    {/* Sample Items Table */}
                    <div className="text-[10px] space-y-1">
                      <div className="flex justify-between font-bold border-b border-dashed border-black pb-0.5 text-[9px]">
                        <span className="w-1/2">ITEM</span>
                        <span className="text-center w-1/4">QTY</span>
                        <span className="text-right w-1/4">AMT</span>
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="w-1/2 truncate font-medium">Hazelnut Cappuccino</span>
                        <span className="text-center w-1/4">x2</span>
                        <span className="text-right w-1/4 font-bold">₹440.00</span>
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="w-1/2 truncate font-medium">Truffle Parm Fries</span>
                        <span className="text-center w-1/4">x1</span>
                        <span className="text-right w-1/4 font-bold">₹280.00</span>
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="w-1/2 truncate font-medium">Blueberry Cheesecake</span>
                        <span className="text-center w-1/4">x1</span>
                        <span className="text-right w-1/4 font-bold">₹260.00</span>
                      </div>
                    </div>

                    <div className="border-t border-dashed border-black my-1" />

                    {/* Calculations */}
                    <div className="text-[10px] space-y-0.5">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span className="font-bold">₹980.00</span>
                      </div>
                      {billShowTaxes && (
                        <>
                          <div className="flex justify-between text-[9px] text-stone-700">
                            <span>CGST (2.5%):</span>
                            <span>₹24.50</span>
                          </div>
                          <div className="flex justify-between text-[9px] text-stone-700">
                            <span>SGST (2.5%):</span>
                            <span>₹24.50</span>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="border-t-2 border-dashed border-black my-1.5" />

                    {/* Grand Total */}
                    <div className="flex justify-between items-center text-xs font-black">
                      <span>NET TOTAL:</span>
                      <span className="text-sm">₹1029.00</span>
                    </div>

                    <div className="border-t-2 border-dashed border-black my-1.5" />

                    {/* Payments */}
                    {billShowPayments && (
                      <div className="text-[9px] space-y-0.5">
                        <div className="flex justify-between font-bold">
                          <span>• Paid via UPI / QR:</span>
                          <span>₹1029.00</span>
                        </div>
                        <div className="flex justify-between text-stone-600">
                          <span>Ref: UPI/260910042</span>
                          <span>SUCCESS</span>
                        </div>
                      </div>
                    )}

                    {/* QR Code Placeholder */}
                    {billShowQr && (
                      <div className="border border-dashed border-stone-700 p-2 my-2 text-center rounded">
                        <div className="flex items-center justify-center gap-1.5 text-stone-800 mb-0.5">
                          <QrCode className="w-5 h-5 text-black" />
                          <span className="text-[8px] font-extrabold uppercase">UPI Scan & Pay</span>
                        </div>
                        <div className="text-[7.5px] text-stone-600">Scan via GPay / PhonePe / Paytm</div>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="text-center pt-2 space-y-0.5 text-[9px] text-stone-800">
                      <div className="font-bold">{billFooterMsg}</div>
                      <div className="text-[8px] text-stone-500">*** Powered by Velora QSR POS ***</div>
                    </div>
                  </div>
                )}

                {/* -------------------------------------------------------------
                    PREVIEW 2: KOT (KITCHEN ORDER TICKET)
                    ------------------------------------------------------------- */}
                {activeSubTab === 'kot' && (
                  <div className="space-y-2">
                    {/* Big KOT Banner */}
                    <div className="border-2 border-black p-1.5 text-center">
                      <div className="text-sm font-black tracking-wider">KOT #042</div>
                      <div className="text-[9.5px] font-bold text-stone-700">{kotStation.toUpperCase()}</div>
                    </div>

                    <div className="border-t border-dashed border-black my-1" />

                    {/* Table & Time */}
                    <div className="text-[9.5px] space-y-0.5">
                      <div className="flex justify-between">
                        <span>TIME: <strong>15:45 PM</strong></span>
                        <span>DATE: 10/09/2026</span>
                      </div>
                      <div className="flex justify-between items-center">
                        {kotShowTable ? (
                          <span>TABLE: <strong className="text-xs">T-04 (Balcony)</strong></span>
                        ) : (
                          <span>TYPE: <strong>Takeaway</strong></span>
                        )}
                        {kotShowServer && <span>STEWARD: <strong>Alex</strong></span>}
                      </div>
                    </div>

                    <div className="border-t-2 border-dashed border-black my-1.5" />

                    {/* KOT Items */}
                    <div className="space-y-2">
                      <div className="flex items-start gap-2 border-b border-dotted border-stone-400 pb-1.5">
                        <span className="text-sm font-black shrink-0 w-6">x2</span>
                        <div className="flex-1">
                          <div className="text-xs font-black">
                            {kotShowDietary && '🟢 '}Crispy Paneer Burger
                          </div>
                          {kotShowNotes && (
                            <div className="text-[8.5px] bg-stone-200 px-1.5 py-0.5 rounded font-semibold mt-0.5 inline-block">
                              ★ Note: Extra crisp patty, no mayo
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-start gap-2 border-b border-dotted border-stone-400 pb-1.5">
                        <span className="text-sm font-black shrink-0 w-6">x1</span>
                        <div className="flex-1">
                          <div className="text-xs font-black">
                            {kotShowDietary && '🟢 '}Peri Peri Truffle Fries
                          </div>
                          {kotShowNotes && (
                            <div className="text-[8.5px] bg-stone-200 px-1.5 py-0.5 rounded font-semibold mt-0.5 inline-block">
                              ★ Note: Spicy dip on side
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <span className="text-sm font-black shrink-0 w-6">x2</span>
                        <div className="flex-1">
                          <div className="text-xs font-black">
                            {kotShowDietary && '🟢 '}Classic Cold Brew
                          </div>
                          {kotShowNotes && (
                            <div className="text-[8.5px] bg-stone-200 px-1.5 py-0.5 rounded font-semibold mt-0.5 inline-block">
                              ★ Note: Oat milk, low sugar
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="border-t-2 border-dashed border-black my-1.5" />

                    <div className="text-center text-[8.5px] font-bold text-stone-600">
                      *** KITCHEN COPY • {kotPaperWidth} ***
                    </div>
                  </div>
                )}

                {/* -------------------------------------------------------------
                    PREVIEW 3: ITEM / PACKAGING STICKER LABEL
                    ------------------------------------------------------------- */}
                {activeSubTab === 'item' && (
                  <div className="flex flex-col justify-between h-[150px] p-1 text-[9.5px]">
                    {/* Top Header */}
                    <div>
                      <div className="flex justify-between items-center text-[8px] uppercase tracking-wider text-stone-600 font-bold">
                        <span>{storeProfile?.businessName || 'Velora Cafe'}</span>
                        {itemShowToken && (
                          <span className="border border-black px-1 rounded font-black text-black">
                            #TOKEN 42
                          </span>
                        )}
                      </div>

                      <div className="text-xs font-black mt-1 flex items-center gap-1">
                        {itemShowDietary && <span className="text-[9px]">🟢</span>}
                        <span>Caramel Macchiato (L)</span>
                      </div>

                      <div className="text-[8px] text-stone-600 mt-0.5">
                        Customer: Priya S. • Dine-In T4
                      </div>
                    </div>

                    {/* Barcode Center */}
                    {itemShowBarcode && (
                      <div className="text-center my-1">
                        <div className="font-mono text-xs tracking-widest font-black scale-y-125">
                          ||| | |||| | ||| |||| |
                        </div>
                        <div className="text-[7.5px] tracking-wider text-stone-500">
                          SKU: VEL-CM-042
                        </div>
                      </div>
                    )}

                    {/* Bottom Metadata & Price */}
                    <div className="flex justify-between items-end border-t border-stone-300 pt-1 font-bold">
                      <div className="text-[8px] text-stone-600">
                        {itemNote || 'Fresh Brew'}
                      </div>
                      {itemShowPrice && (
                        <div className="text-xs font-black">
                          ₹240.00
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Serrated Tear Edge Bottom Effect */}
                <div className="absolute -bottom-1.5 left-0 right-0 h-1.5 bg-repeat-x bg-[radial-gradient(circle,_#555_1px,_transparent_1px)] bg-[length:6px_6px] opacity-20" />
              </div>
            </div>

            {/* Hint / Instructions */}
            <div className="p-2.5 rounded-xl bg-stone-800/40 border border-stone-800 text-[11px] text-stone-400 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>
                Changes made in the left form immediately render in this live thermal preview.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
