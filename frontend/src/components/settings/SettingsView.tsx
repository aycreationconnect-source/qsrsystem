import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { settingsApi } from '../../api/settingsApi';
import { StoreProfileModal } from './StoreProfileModal';
import { PrinterSettingsPanel } from './PrinterSettingsPanel';
import { Button, Input } from '../ui';
import { cafeAudio, CAFE_SOUND_OPTIONS } from '../../lib/sound';
import {
  Percent,
  ShieldCheck,
  Edit2,
  CheckCircle2,
  Volume2,
  VolumeX,
  BellRing,
  Play,
  Sparkles,
  Check,
  Receipt,
  Store,
  Printer,
  MapPin,
  User,
  Zap,
  Utensils,
  Activity,
  Coins,
  Plus,
  Trash2,
} from 'lucide-react';
import { cn } from '../../lib/utils';

export type SettingsCategory = 'profile' | 'tax' | 'printer' | 'audio' | 'popup';

export const SettingsView: React.FC = () => {
  const { appData, setAppData, refreshSettings, storeProfile, setStoreProfile } =
    useApp();
  const [isStoreProfileModalOpen, setIsStoreProfileModalOpen] = useState(false);

  // Settings Category Navigation
  const [activeTab, setActiveTab] = useState<SettingsCategory>('profile');

  // Saving states
  const [isSavingTax, setIsSavingTax] = useState(false);
  const [taxSuccess, setTaxSuccess] = useState(false);

  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [configSuccess, setConfigSuccess] = useState(false);

  // Tax Calculation Method: 'exclusive' (Manual / Standard) vs 'reverse' (Reverse Calculation / Inclusive)
  const [taxCalculationType, setTaxCalculationType] = useState<'exclusive' | 'reverse'>(() => {
    return (appData.settings?.taxCalculationType as 'exclusive' | 'reverse') || 'exclusive';
  });

  // Custom Taxes State List
  const [customTaxes, setCustomTaxes] = useState<Array<{ id: string; name: string; rate: string }>>(() => {
    if (appData.settings?.customTaxes) {
      try {
        const parsed = JSON.parse(appData.settings.customTaxes);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((t: any, idx: number) => ({
            id: t.id || `tax-${idx}-${Date.now()}`,
            name: String(t.name ?? ''),
            rate: String(t.rate ?? '0'),
          }));
        }
      } catch {
        // fallback
      }
    }
    const defRate = parseFloat(appData.settings?.globalTaxRate || '5') || 5;
    const defName = appData.settings?.globalTaxName || 'GST';
    if (defName.toUpperCase().includes('GST')) {
      const half = (defRate / 2).toString();
      return [
        { id: '1', name: 'CGST', rate: half },
        { id: '2', name: 'SGST', rate: half },
      ];
    }
    return [{ id: '1', name: defName, rate: defRate.toString() }];
  });

  const handleAddTax = () => {
    setCustomTaxes((prev) => [
      ...prev,
      { id: `tax-${Date.now()}`, name: '', rate: '0' },
    ]);
  };

  const handleUpdateTax = (id: string, field: 'name' | 'rate', value: string) => {
    setCustomTaxes((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    );
  };

  const handleRemoveTax = (id: string) => {
    setCustomTaxes((prev) => prev.filter((t) => t.id !== id));
  };

  const handleApplyPreset = (preset: 'notax' | 'gst5' | 'gst12' | 'gst18' | 'vat5') => {
    if (preset === 'notax') {
      setCustomTaxes([
        { id: `tax-notax-${Date.now()}`, name: 'No Tax', rate: '0' },
      ]);
    } else if (preset === 'gst5') {
      setCustomTaxes([
        { id: `tax-cgst-${Date.now()}`, name: 'CGST', rate: '2.5' },
        { id: `tax-sgst-${Date.now() + 1}`, name: 'SGST', rate: '2.5' },
      ]);
    } else if (preset === 'gst12') {
      setCustomTaxes([
        { id: `tax-cgst-${Date.now()}`, name: 'CGST', rate: '6' },
        { id: `tax-sgst-${Date.now() + 1}`, name: 'SGST', rate: '6' },
      ]);
    } else if (preset === 'gst18') {
      setCustomTaxes([
        { id: `tax-cgst-${Date.now()}`, name: 'CGST', rate: '9' },
        { id: `tax-sgst-${Date.now() + 1}`, name: 'SGST', rate: '9' },
      ]);
    } else if (preset === 'vat5') {
      setCustomTaxes([
        { id: `tax-vat-${Date.now()}`, name: 'VAT', rate: '5' },
      ]);
    }
  };

  // Owner Configuration Form States (initialized from appData.settings)
  const [orderSoundEnabled, setOrderSoundEnabled] = useState<boolean>(() => {
    return appData.settings?.orderSoundEnabled !== 'false' && appData.settings?.orderSoundEnabled !== false;
  });

  const [orderSoundTone, setOrderSoundTone] = useState<string>(() => {
    return appData.settings?.orderSoundTone || 'cafe-bell';
  });

  const [orderSoundVolume, setOrderSoundVolume] = useState<number>(() => {
    return parseInt(String(appData.settings?.orderSoundVolume ?? '80'), 10) || 80;
  });

  const [orderPopupEnabled, setOrderPopupEnabled] = useState<boolean>(() => {
    return appData.settings?.orderPopupEnabled !== 'false' && appData.settings?.orderPopupEnabled !== false;
  });

  const [orderPopupDuration, setOrderPopupDuration] = useState<number>(() => {
    return parseInt(String(appData.settings?.orderPopupDuration ?? '4'), 10) || 4;
  });

  // Track currently playing sound preview
  const [playingTone, setPlayingTone] = useState<string | null>(null);

  const handleTestSound = (tone: string) => {
    setPlayingTone(tone);
    cafeAudio.play(tone, orderSoundVolume);
    setTimeout(() => {
      setPlayingTone(null);
    }, 3500);
  };

  const handleSimulateToast = () => {
    window.dispatchEvent(
      new CustomEvent('velora-order-completed', {
        detail: {
          id: 999,
          orderNumber: 108,
          totalAmount: 480,
          paymentMethod: 'Cash',
          items: [
            { item: { name: 'Cappuccino Special' }, quantity: 1, finalPrice: 160 },
            { item: { name: 'Classic Paneer Wrap' }, quantity: 2, finalPrice: 320 },
          ],
        },
      })
    );
  };

  const totalTaxRate = customTaxes.reduce(
    (sum, t) => sum + (parseFloat(t.rate) || 0),
    0
  );
  const combinedTaxName =
    customTaxes
      .filter((t) => t.name.trim() !== '')
      .map((t) => t.name.trim())
      .join(' + ') || 'Tax';

  const handleSaveTaxSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSavingTax(true);
      const validTaxes = customTaxes.filter((t) => t.name.trim() !== '');
      const calcTotalRate = validTaxes.reduce((sum, t) => sum + (parseFloat(t.rate) || 0), 0);
      const calcCombinedName = validTaxes.map((t) => t.name.trim()).join(' + ') || 'Tax';

      const payload: Record<string, string> = {
        customTaxes: JSON.stringify(validTaxes),
        taxCalculationType,
        globalTaxName: calcCombinedName,
        globalTaxRate: calcTotalRate.toString(),
      };

      await settingsApi.saveSettings(payload);

      setAppData((prev) => ({
        ...prev,
        settings: {
          ...prev.settings,
          ...payload,
        },
      }));

      setTaxSuccess(true);
      setTimeout(() => setTaxSuccess(false), 2500);
      await refreshSettings();
    } catch (err) {
      console.error(err);
      alert('Failed to save billing settings.');
    } finally {
      setIsSavingTax(false);
    }
  };

  const handleSaveOwnerConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSavingConfig(true);
      const payload: Record<string, string> = {
        orderSoundEnabled: orderSoundEnabled ? 'true' : 'false',
        orderSoundTone,
        orderSoundVolume: orderSoundVolume.toString(),
        orderPopupEnabled: orderPopupEnabled ? 'true' : 'false',
        orderPopupDuration: orderPopupDuration.toString(),
      };

      await settingsApi.saveSettings(payload);

      setAppData((prev) => ({
        ...prev,
        settings: {
          ...prev.settings,
          ...payload,
        },
      }));

      setConfigSuccess(true);
      setTimeout(() => setConfigSuccess(false), 2500);
      await refreshSettings();
    } catch (err) {
      console.error(err);
      alert('Failed to save owner configurations.');
    } finally {
      setIsSavingConfig(false);
    }
  };

  // Generate 2-letter monogram
  const getInitials = (str: string): string => {
    if (!str) return 'CF';
    const words = str
      .trim()
      .split(/\s+/)
      .filter((w) => !['the', 'and', '&'].includes(w.toLowerCase()));

    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return str.substring(0, 2).toUpperCase();
  };

  const initials = getInitials(storeProfile?.businessName || 'Velora Cafe');

  // Categories configuration (icons with setting category names & descriptions)
  const categories: {
    id: SettingsCategory;
    label: string;
    description: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'profile',
      label: 'Store Profile',
      description: 'Manage cafe identity, store logo, registered address and contact information.',
      icon: <Store className="w-4 h-4" />,
    },
    {
      id: 'tax',
      label: 'Tax & Billing',
      description: 'Configure multi-tax rates (CGST, SGST, VAT), reverse calculation, and POS tax modes.',
      icon: <Percent className="w-4 h-4" />,
    },
    {
      id: 'printer',
      label: 'Printer Settings',
      description: 'Setup thermal receipt paper widths (80mm/58mm), KOT kitchen printing, and templates.',
      icon: <Printer className="w-4 h-4" />,
    },
    {
      id: 'audio',
      label: 'Audio Chimes',
      description: 'Configure order notification audio bells, chime tones, and terminal sound volume.',
      icon: <Volume2 className="w-4 h-4" />,
    },
    {
      id: 'popup',
      label: 'Popup Alerts',
      description: 'Manage on-screen order toast notifications and display durations for cashiers.',
      icon: <BellRing className="w-4 h-4" />,
    },
  ];

  // Category-specific themes for connecting sidebar selection to content borders
  const categoryThemes: Record<
    SettingsCategory,
    {
      sidebarBorder: string;
      sidebarBg: string;
      sidebarText: string;
      sidebarIconBg: string;
      mobileActive: string;
      cardBorder: string;
    }
  > = {
    profile: {
      sidebarBorder: 'border-amber-400 dark:border-amber-500/50',
      sidebarBg: 'bg-amber-500/10 dark:bg-amber-500/15',
      sidebarText: 'text-amber-950 dark:text-amber-200',
      sidebarIconBg: 'bg-amber-500 text-stone-950 shadow-xs',
      mobileActive: 'bg-amber-500 text-stone-950 border-amber-500 shadow-sm ring-1 ring-amber-400',
      cardBorder: 'border-amber-500/40 dark:border-amber-500/30',
    },
    tax: {
      sidebarBorder: 'border-emerald-400 dark:border-emerald-500/50',
      sidebarBg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
      sidebarText: 'text-emerald-950 dark:text-emerald-200',
      sidebarIconBg: 'bg-emerald-500 text-white shadow-xs',
      mobileActive: 'bg-emerald-500 text-white border-emerald-500 shadow-sm ring-1 ring-emerald-400',
      cardBorder: 'border-emerald-500/40 dark:border-emerald-500/30',
    },
    printer: {
      sidebarBorder: 'border-sky-400 dark:border-sky-500/50',
      sidebarBg: 'bg-sky-500/10 dark:bg-sky-500/15',
      sidebarText: 'text-sky-950 dark:text-sky-200',
      sidebarIconBg: 'bg-sky-500 text-white shadow-xs',
      mobileActive: 'bg-sky-500 text-white border-sky-500 shadow-sm ring-1 ring-sky-400',
      cardBorder: 'border-sky-500/40 dark:border-sky-500/30',
    },
    audio: {
      sidebarBorder: 'border-purple-400 dark:border-purple-500/50',
      sidebarBg: 'bg-purple-500/10 dark:bg-purple-500/15',
      sidebarText: 'text-purple-950 dark:text-purple-200',
      sidebarIconBg: 'bg-purple-500 text-white shadow-xs',
      mobileActive: 'bg-purple-500 text-white border-purple-500 shadow-sm ring-1 ring-purple-400',
      cardBorder: 'border-purple-500/40 dark:border-purple-500/30',
    },
    popup: {
      sidebarBorder: 'border-rose-400 dark:border-rose-500/50',
      sidebarBg: 'bg-rose-500/10 dark:bg-rose-500/15',
      sidebarText: 'text-rose-950 dark:text-rose-200',
      sidebarIconBg: 'bg-rose-500 text-white shadow-xs',
      mobileActive: 'bg-rose-500 text-white border-rose-500 shadow-sm ring-1 ring-rose-400',
      cardBorder: 'border-rose-500/40 dark:border-rose-500/30',
    },
  };

  // Tax simulator numbers
  const isReverse = taxCalculationType === 'reverse';
  const simulatedGross = 1000;
  let simulatedSubtotal = 1000;
  let simulatedTaxAmount = 0;
  let simulatedGrandTotal = 1000;

  if (isReverse) {
    simulatedGrandTotal = simulatedGross;
    if (totalTaxRate > 0) {
      simulatedSubtotal = simulatedGross / (1 + totalTaxRate / 100);
      simulatedTaxAmount = simulatedGross - simulatedSubtotal;
    } else {
      simulatedSubtotal = simulatedGross;
      simulatedTaxAmount = 0;
    }
  } else {
    simulatedSubtotal = 1000;
    simulatedTaxAmount = (simulatedSubtotal * totalTaxRate) / 100;
    simulatedGrandTotal = simulatedSubtotal + simulatedTaxAmount;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-7 space-y-6 max-w-[1540px] mx-auto min-h-[calc(100vh-100px)]">
      {/* Mobile Category Pill Selector (visible only on small screens < lg) */}
      <div className="lg:hidden flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {categories.map((cat) => {
          const isActive = activeTab === cat.id;
          const theme = categoryThemes[cat.id];
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveTab(cat.id)}
              className={cn(
                'px-3.5 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 shrink-0 border select-none',
                isActive
                  ? cn(theme.mobileActive, 'font-extrabold')
                  : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
              )}
            >
              <span className="shrink-0">{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main 2-Column Responsive Layout (Desktop & Tablet) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column: Category Navigation (Stretched to bottom) */}
        <div className="hidden lg:flex lg:col-span-4 xl:col-span-3 flex-col sticky top-4 self-start h-[calc(100vh-100px)] min-h-[520px]">
          {/* Category Menu Card */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-3 shadow-sm h-full flex flex-col justify-between">
            <div className="space-y-1.5">
              {categories.map((cat) => {
                const isActive = activeTab === cat.id;
                const theme = categoryThemes[cat.id];
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveTab(cat.id)}
                    className={cn(
                      'w-full text-left p-3 rounded-2xl transition-all cursor-pointer flex items-center gap-3 select-none border group',
                      isActive
                        ? cn(theme.sidebarBg, theme.sidebarText, theme.sidebarBorder, 'font-extrabold shadow-xs')
                        : 'hover:bg-stone-100/80 dark:hover:bg-stone-800/60 text-stone-700 dark:text-stone-300 border-transparent font-bold'
                    )}
                  >
                    <div
                      className={cn(
                        'w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105',
                        isActive
                          ? theme.sidebarIconBg
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400'
                      )}
                    >
                      {cat.icon}
                    </div>
                    <span className="text-xs truncate">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Active Category Details Panel */}
        <div className="lg:col-span-8 xl:col-span-9 min-w-0 space-y-6">
          {/* =========================================================================
              CATEGORY 1: STORE PROFILE & IDENTITY (COMPREHENSIVE REDESIGN)
              ========================================================================= */}
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* 1. Hero Identity Banner */}
              <div className="bg-gradient-to-br from-stone-900 via-stone-850 to-stone-900 text-white rounded-3xl p-6 sm:p-7 shadow-lg border border-amber-500/40 shadow-amber-500/5 relative overflow-hidden">
                {/* Decorative background circle */}
                <div className="absolute -right-12 -top-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  {/* Brand Monogram & Titles */}
                  <div className="flex items-center gap-4">
                    <div className="relative shrink-0">
                      {storeProfile?.logoUrl ? (
                        <img
                          src={storeProfile.logoUrl}
                          alt={storeProfile?.businessName || 'Velora Cafe'}
                          className="w-16 h-16 object-cover rounded-2xl border-2 border-amber-500/40 shadow-md"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-black tracking-wider bg-gradient-to-br from-amber-500 to-amber-600 text-stone-950 shadow-md shadow-amber-500/20 border border-amber-400/50 text-2xl">
                          {initials}
                        </div>
                      )}
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-stone-900" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                          {storeProfile?.businessName || 'Velora Cafe'}
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 font-mono text-xs font-bold">
                          {storeProfile?.cafeCode || 'CF-NAG-001'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-stone-400 font-medium">
                        <span className="flex items-center gap-1 text-emerald-400 font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span>Operational & POS Ready</span>
                        </span>
                        <span>•</span>
                        <span>Currency: {storeProfile?.currencySymbol || '₹ (INR)'}</span>
                        <span>•</span>
                        <span>{storeProfile?.city || 'Mumbai'}, {storeProfile?.state || 'Maharashtra'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Edit Action Button */}
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => setIsStoreProfileModalOpen(true)}
                    leftIcon={<Edit2 className="w-4 h-4" />}
                    className="cursor-pointer font-bold shrink-0 shadow-md shadow-amber-500/20 self-start sm:self-auto"
                  >
                    Edit Store Profile
                  </Button>
                </div>

                {/* Operational KPIs Strip inside Banner */}
                <div className="mt-6 pt-5 border-t border-stone-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div className="bg-stone-800/60 rounded-2xl p-3 border border-stone-750">
                    <span className="text-[11px] text-stone-400 font-bold uppercase tracking-wider block">
                      Floor Tables
                    </span>
                    <span className="text-lg font-black text-amber-400 mt-0.5 block">
                      {appData.tables.length} Tables
                    </span>
                    <span className="text-[10px] text-stone-400">
                      {appData.areas.length} Dining Areas
                    </span>
                  </div>

                  <div className="bg-stone-800/60 rounded-2xl p-3 border border-stone-750">
                    <span className="text-[11px] text-stone-400 font-bold uppercase tracking-wider block">
                      Menu Dishes
                    </span>
                    <span className="text-lg font-black text-white mt-0.5 block">
                      {appData.menu.length} Dishes
                    </span>
                    <span className="text-[10px] text-stone-400">
                      {appData.categories.length} Categories
                    </span>
                  </div>

                  <div className="bg-stone-800/60 rounded-2xl p-3 border border-stone-750">
                    <span className="text-[11px] text-stone-400 font-bold uppercase tracking-wider block">
                      Tracked Inventory
                    </span>
                    <span className="text-lg font-black text-white mt-0.5 block">
                      {appData.inventory.length} Items
                    </span>
                    <span className="text-[10px] text-stone-400">Live Stock Monitored</span>
                  </div>

                  <div className="bg-stone-800/60 rounded-2xl p-3 border border-stone-750">
                    <span className="text-[11px] text-stone-400 font-bold uppercase tracking-wider block">
                      Thermal Format
                    </span>
                    <span className="text-lg font-black text-emerald-400 mt-0.5 block">
                      {appData.settings?.printer_default_paper_width || '80mm'} Roll
                    </span>
                    <span className="text-[10px] text-stone-400">High-Speed POS</span>
                  </div>
                </div>
              </div>

              {/* 2. Structured 6-Card Operations & Business Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {/* Card 1: Store Ownership */}
                <div className="bg-white dark:bg-stone-900 border border-amber-500/25 dark:border-amber-500/20 rounded-3xl p-5 shadow-sm space-y-3 hover:border-amber-500/40 transition-colors">
                  <div className="flex items-center gap-2.5 pb-2 border-b border-stone-100 dark:border-stone-800">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-stone-900 dark:text-stone-100 uppercase tracking-wider">
                        Store Ownership
                      </h4>
                      <p className="text-[10px] text-stone-400">Manager & contact info</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-[11px] text-stone-400 font-medium block">Owner / Manager Name:</span>
                      <span className="font-extrabold text-stone-900 dark:text-stone-100 text-sm">
                        {storeProfile?.ownerName || 'Rajesh Sharma'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] text-stone-400 font-medium block">Phone Number:</span>
                      <span className="font-mono font-bold text-stone-800 dark:text-stone-200">
                        {storeProfile?.phone ? `+91 ${storeProfile.phone}` : '9876543210'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] text-stone-400 font-medium block">System Role:</span>
                      <span className="font-bold text-amber-600 dark:text-amber-400">
                        Primary Store Administrator
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card 2: Physical Location */}
                <div className="bg-white dark:bg-stone-900 border border-amber-500/25 dark:border-amber-500/20 rounded-3xl p-5 shadow-sm space-y-3 hover:border-amber-500/40 transition-colors">
                  <div className="flex items-center gap-2.5 pb-2 border-b border-stone-100 dark:border-stone-800">
                    <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-stone-900 dark:text-stone-100 uppercase tracking-wider">
                        Store Location
                      </h4>
                      <p className="text-[10px] text-stone-400">Postal & operating address</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-[11px] text-stone-400 font-medium block">City & State:</span>
                      <span className="font-extrabold text-stone-900 dark:text-stone-100 text-sm">
                        {storeProfile?.city || 'Mumbai'}, {storeProfile?.state || 'Maharashtra'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] text-stone-400 font-medium block">Store Street Address:</span>
                      <span className="font-medium text-stone-700 dark:text-stone-300 leading-snug block line-clamp-2">
                        {storeProfile?.address || 'Main Commercial Road, Central District'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] text-stone-400 font-medium block">Dispatch Jurisdiction:</span>
                      <span className="font-bold text-stone-800 dark:text-stone-200">
                        Local Dine-In & Counter Takeaway
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card 3: Tax & Legal Compliance */}
                <div className="bg-white dark:bg-stone-900 border border-amber-500/25 dark:border-amber-500/20 rounded-3xl p-5 shadow-sm space-y-3 hover:border-amber-500/40 transition-colors">
                  <div className="flex items-center gap-2.5 pb-2 border-b border-stone-100 dark:border-stone-800">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-stone-900 dark:text-stone-100 uppercase tracking-wider">
                        Tax Compliance
                      </h4>
                      <p className="text-[10px] text-stone-400">GSTIN & registration</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-[11px] text-stone-400 font-medium block">GSTIN / Tax ID:</span>
                      <span className="font-mono font-bold text-amber-600 dark:text-amber-400 text-sm">
                        {storeProfile?.gstin || 'Not Provided'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] text-stone-400 font-medium block">Registration Status:</span>
                      <span
                        className={cn(
                          'text-[11px] font-bold px-2 py-0.5 rounded-md inline-block',
                          storeProfile?.gstin
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-stone-100 dark:bg-stone-800 text-stone-500'
                        )}
                      >
                        {storeProfile?.gstin ? 'GST Registered Entity' : 'Composition / Unregistered'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] text-stone-400 font-medium block">Applied Invoice Tax:</span>
                      <span className="font-bold text-stone-800 dark:text-stone-200">
                        {appData.settings?.globalTaxRate || '0'}% ({appData.settings?.globalTaxName || 'Tax'})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card 4: Printed Receipt Customization */}
                <div className="bg-white dark:bg-stone-900 border border-amber-500/25 dark:border-amber-500/20 rounded-3xl p-5 shadow-sm space-y-3 hover:border-amber-500/40 transition-colors">
                  <div className="flex items-center gap-2.5 pb-2 border-b border-stone-100 dark:border-stone-800">
                    <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                      <Receipt className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-stone-900 dark:text-stone-100 uppercase tracking-wider">
                        Receipt Customization
                      </h4>
                      <p className="text-[10px] text-stone-400">Header & footer message</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-[11px] text-stone-400 font-medium block">Invoice Header:</span>
                      <span className="font-bold text-stone-900 dark:text-stone-100">
                        {appData.settings?.printer_bill_header_title || 'TAX INVOICE'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] text-stone-400 font-medium block">Receipt Footer Note:</span>
                      <div className="p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/25 border border-amber-200/70 dark:border-amber-900/40 text-amber-950 dark:text-amber-200 italic text-xs leading-snug">
                        "{storeProfile?.receiptFooter || 'Thank you for visiting! Please visit again.'}"
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 5: Active Terminal Modes */}
                <div className="bg-white dark:bg-stone-900 border border-amber-500/25 dark:border-amber-500/20 rounded-3xl p-5 shadow-sm space-y-3 hover:border-amber-500/40 transition-colors">
                  <div className="flex items-center gap-2.5 pb-2 border-b border-stone-100 dark:border-stone-800">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-stone-900 dark:text-stone-100 uppercase tracking-wider">
                        Terminal Modes
                      </h4>
                      <p className="text-[10px] text-stone-400">Active checkout workflows</p>
                    </div>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center justify-between p-2 rounded-xl bg-stone-50 dark:bg-stone-850">
                      <span className="font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        <span>Quick Service Mode</span>
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
                        Active
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-xl bg-stone-50 dark:bg-stone-850">
                      <span className="font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                        <Utensils className="w-3.5 h-3.5 text-amber-500" />
                        <span>Table Dine-In Mode</span>
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
                        Active
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card 6: Database & Synchronization */}
                <div className="bg-white dark:bg-stone-900 border border-amber-500/25 dark:border-amber-500/20 rounded-3xl p-5 shadow-sm space-y-3 hover:border-amber-500/40 transition-colors">
                  <div className="flex items-center gap-2.5 pb-2 border-b border-stone-100 dark:border-stone-800">
                    <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                      <Activity className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-stone-900 dark:text-stone-100 uppercase tracking-wider">
                        Sync & Connectivity
                      </h4>
                      <p className="text-[10px] text-stone-400">Local node health</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-stone-500">Offline Resilience:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        Full Local Storage
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-stone-500">Live Polling Sync:</span>
                      <span className="font-mono font-bold text-stone-800 dark:text-stone-200">
                        Every 15 Seconds
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-stone-500">Audio Chimes:</span>
                      <span className="font-bold text-stone-800 dark:text-stone-200">
                        {orderSoundEnabled ? 'Active' : 'Muted'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              CATEGORY 2: TAX & BILLING CONFIGURATIONS
              ========================================================================= */}
          {activeTab === 'tax' && (
            <div className="bg-white dark:bg-stone-900 border border-emerald-500/40 dark:border-emerald-500/30 rounded-3xl p-5 sm:p-7 shadow-sm space-y-6 animate-in fade-in duration-150">
              <div className="pb-4 border-b border-stone-100 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <Percent className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <span>Tax & Billing Configurations</span>
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    Configure custom taxes (CGST, SGST, VAT, Cess) and choose between standard addition or reverse tax calculation.
                  </p>
                </div>

                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50 self-start sm:self-auto">
                  Live Rate: {totalTaxRate.toFixed(2)}% ({combinedTaxName})
                </span>
              </div>

              {taxSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2.5 animate-in zoom-in-95">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Billing and tax configurations saved successfully! Active on all POS tickets.</span>
                </div>
              )}

              <form onSubmit={handleSaveTaxSettings} className="space-y-6">
                {/* 1. Custom Tax Types & Rates List */}
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
                    <div>
                      <label className="text-xs font-bold text-stone-800 dark:text-stone-200 block">
                        Custom Tax Types & Rates
                      </label>
                      <span className="text-[11px] text-stone-400">
                        Add individual custom taxes like CGST, SGST, VAT, or Cess.
                      </span>
                    </div>

                    {/* Quick Presets */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mr-1">
                        Presets:
                      </span>
                      <button
                        type="button"
                        onClick={() => handleApplyPreset('notax')}
                        className="px-2 py-1 text-[11px] font-bold rounded-lg bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 cursor-pointer transition-colors"
                      >
                        No Tax
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyPreset('gst5')}
                        className="px-2 py-1 text-[11px] font-bold rounded-lg bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 cursor-pointer transition-colors"
                      >
                        GST 5%
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyPreset('gst12')}
                        className="px-2 py-1 text-[11px] font-bold rounded-lg bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 cursor-pointer transition-colors"
                      >
                        GST 12%
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyPreset('gst18')}
                        className="px-2 py-1 text-[11px] font-bold rounded-lg bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 cursor-pointer transition-colors"
                      >
                        GST 18%
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyPreset('vat5')}
                        className="px-2 py-1 text-[11px] font-bold rounded-lg bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 cursor-pointer transition-colors"
                      >
                        VAT 5%
                      </button>
                    </div>
                  </div>

                  {/* Tax Rows List */}
                  <div className="space-y-2.5">
                    {customTaxes.map((tax, index) => (
                      <div
                        key={tax.id || index}
                        className="flex items-center gap-3 p-3 rounded-2xl bg-stone-50/70 dark:bg-stone-850/50 border border-stone-200/70 dark:border-stone-750 group"
                      >
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <Input
                            label={index === 0 ? "Tax Title / Name" : undefined}
                            placeholder="e.g. CGST, SGST, VAT"
                            value={tax.name}
                            onChange={(e) => handleUpdateTax(tax.id, 'name', e.target.value)}
                          />
                          <Input
                            label={index === 0 ? "Tax Rate (%)" : undefined}
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            placeholder="e.g. 2.5"
                            value={tax.rate}
                            onChange={(e) => handleUpdateTax(tax.id, 'rate', e.target.value)}
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveTax(tax.id)}
                          className={cn(
                            'p-2.5 rounded-xl border transition-all cursor-pointer shrink-0',
                            index === 0 && 'mt-5 sm:mt-5',
                            customTaxes.length > 1
                              ? 'border-rose-200 text-rose-500 hover:bg-rose-50 dark:border-rose-900/50 dark:hover:bg-rose-950/40'
                              : 'border-stone-200 text-stone-300 dark:border-stone-800 dark:text-stone-600 cursor-not-allowed'
                          )}
                          disabled={customTaxes.length <= 1}
                          title="Delete Tax Type"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Bottom Control Bar: Add Tax Type + Reverse Calculation Toggle */}
                  <div className="p-4 rounded-2xl bg-stone-50/80 dark:bg-stone-850/60 border border-stone-200/70 dark:border-stone-750 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* Left: Add Tax Type Action & Cumulative Rate */}
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <button
                          type="button"
                          onClick={handleAddTax}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-950/70 text-amber-900 dark:text-amber-300 border border-amber-300/60 dark:border-amber-800/60 cursor-pointer transition-colors shadow-2xs"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add Tax Type</span>
                        </button>

                        <span className="text-xs font-mono font-bold text-stone-600 dark:text-stone-300 bg-white dark:bg-stone-800 px-3 py-1.5 rounded-xl border border-stone-200/70 dark:border-stone-700">
                          Total Rate:{' '}
                          <span className="text-amber-600 dark:text-amber-400 font-black">
                            {totalTaxRate.toFixed(2)}%
                          </span>
                        </span>
                      </div>

                      {/* Right: Reverse Calculation Toggle Switch */}
                      <div className="flex items-center gap-3 bg-white dark:bg-stone-800 p-2 sm:px-3.5 sm:py-2 rounded-xl border border-stone-200/70 dark:border-stone-750 justify-between sm:justify-end shadow-2xs">
                        <div className="text-left sm:text-right">
                          <span className="text-xs font-bold text-stone-800 dark:text-stone-200 block leading-tight">
                            Reverse Calculation
                          </span>
                          <span className="text-[10px] text-stone-500 dark:text-stone-400">
                            {taxCalculationType === 'reverse'
                              ? 'Menu prices include tax'
                              : 'Add tax extra on top'}
                          </span>
                        </div>

                        <button
                          type="button"
                          role="switch"
                          aria-checked={taxCalculationType === 'reverse'}
                          onClick={() =>
                            setTaxCalculationType((prev) => (prev === 'reverse' ? 'exclusive' : 'reverse'))
                          }
                          className={cn(
                            'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500',
                            taxCalculationType === 'reverse' ? 'bg-emerald-500' : 'bg-stone-300 dark:bg-stone-600'
                          )}
                        >
                          <span
                            className={cn(
                              'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out',
                              taxCalculationType === 'reverse' ? 'translate-x-5' : 'translate-x-0'
                            )}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Easy-to-Understand Explanation for Cafe Owners */}
                    <div className="pt-2.5 border-t border-stone-200/50 dark:border-stone-700/50 text-xs flex items-start gap-2 text-stone-600 dark:text-stone-300">
                      <span className="text-base leading-none shrink-0 mt-0.5">💡</span>
                      <div className="leading-relaxed">
                        {taxCalculationType === 'reverse' ? (
                          <span>
                            <strong className="text-stone-900 dark:text-stone-100 font-bold">
                              Menu Prices Already Include Tax (Tax Inclusive):
                            </strong>{' '}
                            Customers pay the exact price shown on your menu card. The system automatically back-calculates the base dish price and tax portion for your accounts & GST filing.{' '}
                            <span className="text-stone-500 dark:text-stone-400 italic">
                              (e.g., A ₹100 coffee on your menu = ₹95.24 item price + ₹4.76 GST → Customer pays exactly ₹100).
                            </span>
                          </span>
                        ) : (
                          <span>
                            <strong className="text-stone-900 dark:text-stone-100 font-bold">
                              Taxes Added Extra at Billing (Standard / Exclusive):
                            </strong>{' '}
                            Menu prices do not include taxes. The system calculates taxes and adds them on top of the bill at checkout.{' '}
                            <span className="text-stone-500 dark:text-stone-400 italic">
                              (e.g., A ₹100 coffee on your menu + 5% GST = ₹105 bill → Customer pays ₹105).
                            </span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Interactive Real-Time Tax Bill Simulation Card */}
                <div className="p-5 rounded-2xl bg-stone-50/80 dark:bg-stone-850/60 border border-emerald-500/25 dark:border-emerald-500/20 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-stone-200/60 dark:border-stone-750">
                    <span className="text-xs font-extrabold text-stone-800 dark:text-stone-200 uppercase tracking-wider flex items-center gap-2">
                      <Coins className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Live Bill Tax Simulation</span>
                    </span>
                    <span className="text-[10px] text-stone-400">
                      {isReverse ? 'Reverse Calculation (Tax Inclusive)' : 'Standard Calculation (Tax Added On Top)'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-white dark:bg-stone-800 border border-stone-200/60 dark:border-stone-700">
                      <span className="text-[11px] text-stone-400 block mb-0.5">
                        {isReverse ? 'Net Base Subtotal' : 'Sample Subtotal'}
                      </span>
                      <span className="font-mono font-bold text-stone-900 dark:text-stone-100 text-base">
                        ₹{simulatedSubtotal.toFixed(2)}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-white dark:bg-stone-800 border border-stone-200/60 dark:border-stone-700">
                      <span className="text-[11px] text-stone-400 block mb-0.5">
                        {combinedTaxName || 'Tax'} ({totalTaxRate.toFixed(2)}%)
                      </span>
                      <span className="font-mono font-bold text-amber-600 dark:text-amber-400 text-base">
                        {isReverse ? '' : '+ '}₹{simulatedTaxAmount.toFixed(2)}
                        {isReverse && (
                          <span className="ml-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block sm:inline">
                            (Included)
                          </span>
                        )}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50">
                      <span className="text-[11px] text-emerald-800 dark:text-emerald-300 font-bold block mb-0.5">
                        Simulated Grand Total
                      </span>
                      <span className="font-mono font-black text-emerald-950 dark:text-emerald-100 text-base">
                        ₹{simulatedGrandTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Individual custom tax breakdown if multiple taxes */}
                  {customTaxes.length > 1 && totalTaxRate > 0 && (
                    <div className="pt-2 border-t border-stone-200/50 dark:border-stone-700/50 flex flex-wrap gap-2 text-[11px]">
                      {customTaxes
                        .filter((t) => (parseFloat(t.rate) || 0) > 0 && t.name.trim() !== '')
                        .map((t, idx) => {
                          const rateVal = parseFloat(t.rate) || 0;
                          const portion = (rateVal / totalTaxRate) * simulatedTaxAmount;
                          return (
                            <span
                              key={t.id || idx}
                              className="px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 border border-stone-200/70 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-medium"
                            >
                              <span className="font-bold">{t.name} ({rateVal}%):</span>{' '}
                              <span className="font-mono">₹{portion.toFixed(2)}</span>
                            </span>
                          );
                        })}
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-2 border-t border-stone-100 dark:border-stone-800">
                  <Button
                    type="submit"
                    variant="primary"
                    size="touch"
                    className="px-8 font-extrabold cursor-pointer shadow-md shadow-emerald-500/20"
                    isLoading={isSavingTax}
                  >
                    Save Billing Settings
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* =========================================================================
              CATEGORY 3: PRINTER SETTINGS & LIVE PREVIEW
              ========================================================================= */}
          {activeTab === 'printer' && <PrinterSettingsPanel />}

          {/* =========================================================================
              CATEGORY 4: AUDIO CHIMES & BELL SOUNDS
              ========================================================================= */}
          {activeTab === 'audio' && (
            <form onSubmit={handleSaveOwnerConfig} className="space-y-6 animate-in fade-in duration-150">
              {configSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2.5 animate-in zoom-in-95">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Audio chime configuration saved successfully! Active in real time across the station.</span>
                </div>
              )}

              <div className="bg-white dark:bg-stone-900 border border-purple-500/40 dark:border-purple-500/30 rounded-3xl p-5 sm:p-7 shadow-sm space-y-6">
                {/* Header with Master Switch */}
                <div className="flex items-start justify-between pb-4 border-b border-stone-100 dark:border-stone-800 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                        <BellRing className="w-4.5 h-4.5" />
                      </div>
                      <h3 className="text-base font-extrabold text-stone-900 dark:text-stone-100">
                        Order Completion Acoustic Bell Chime
                      </h3>
                    </div>
                    <p className="text-xs text-stone-500 dark:text-stone-400 max-w-2xl mt-1">
                      Plays a pleasant acoustic chime whenever an order is completed. Specifically tuned with gentle harmonics to clearly alert cashier staff without disrupting customer conversation.
                    </p>
                  </div>

                  {/* Master Toggle Switch */}
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={orderSoundEnabled}
                      onChange={(e) => setOrderSoundEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-12 h-6.5 bg-stone-200 peer-focus:outline-none rounded-full peer dark:bg-stone-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2.5px] after:left-[3px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-stone-600 peer-checked:bg-purple-500"></div>
                  </label>
                </div>

                {/* Sound Tone Cards & Volume Controls */}
                {orderSoundEnabled ? (
                  <div className="space-y-5 pt-1">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-xs font-extrabold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                          Select Chime Tone
                        </label>
                        <span className="text-[11px] text-stone-400">
                          Click "Test Sound" to hear live audio sample
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {CAFE_SOUND_OPTIONS.map((opt) => {
                          const isSelected = orderSoundTone === opt.id;
                          const isPlaying = playingTone === opt.id;

                          return (
                            <div
                              key={opt.id}
                              onClick={() => setOrderSoundTone(opt.id)}
                              className={cn(
                                'p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 group select-none relative',
                                isSelected
                                  ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/20 shadow-sm ring-1 ring-purple-500'
                                  : 'border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-850/50 hover:border-stone-300 dark:hover:border-stone-700'
                              )}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2.5">
                                  <div
                                    className={cn(
                                      'w-4.5 h-4.5 rounded-full border flex items-center justify-center transition-all',
                                      isSelected
                                        ? 'border-purple-600 bg-purple-500 text-white'
                                        : 'border-stone-400 dark:border-stone-600'
                                    )}
                                  >
                                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                                  </div>
                                  <span className="text-xs font-black text-stone-900 dark:text-stone-100">
                                    {opt.name}
                                  </span>
                                </div>

                                <span
                                  className={cn(
                                    'text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0',
                                    isSelected
                                      ? 'bg-purple-500/20 text-purple-800 dark:text-purple-300'
                                      : 'bg-stone-200/70 dark:bg-stone-750 text-stone-600 dark:text-stone-400'
                                  )}
                                >
                                  {opt.tag}
                                </span>
                              </div>

                              <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-snug">
                                {opt.description}
                              </p>

                              <div className="flex items-center justify-between pt-2 border-t border-stone-200/60 dark:border-stone-800">
                                <span className="text-[11px] text-stone-400 font-mono">
                                  Duration: ~{opt.duration}
                                </span>

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOrderSoundTone(opt.id);
                                    handleTestSound(opt.id);
                                  }}
                                  className={cn(
                                    'px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer',
                                    isPlaying
                                      ? 'bg-purple-500 text-white shadow-xs'
                                      : 'bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-purple-50 dark:hover:bg-purple-950/40'
                                  )}
                                >
                                  {isPlaying ? (
                                    <>
                                      <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                                      <span>Playing...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Play className="w-3 h-3 fill-current" />
                                      <span>Test Sound</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Volume Slider */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-stone-50/70 dark:bg-stone-850/60 border border-purple-500/20 dark:border-purple-500/20 space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-bold text-stone-700 dark:text-stone-300">
                        <span className="flex items-center gap-2">
                          {orderSoundVolume === 0 ? (
                            <VolumeX className="w-4 h-4 text-rose-500" />
                          ) : (
                            <Volume2 className="w-4 h-4 text-purple-500" />
                          )}
                          <span className="font-extrabold uppercase tracking-wider">Chime Volume Level</span>
                        </span>
                        <span className="font-mono text-purple-600 dark:text-purple-400 font-black text-sm">
                          {orderSoundVolume}%
                        </span>
                      </div>

                      <input
                        type="range"
                        min="10"
                        max="100"
                        step="5"
                        value={orderSoundVolume}
                        onChange={(e) => setOrderSoundVolume(parseInt(e.target.value, 10))}
                        className="w-full accent-purple-500 cursor-pointer h-2 bg-stone-200 dark:bg-stone-700 rounded-lg"
                      />

                      <div className="flex justify-between text-[10px] text-stone-400 font-medium">
                        <span>Soft & Subtle (10%)</span>
                        <span>Balanced Cafe (80%)</span>
                        <span>High Volume (100%)</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-stone-100 dark:bg-stone-800/50 text-stone-500 text-xs flex items-center gap-2.5">
                    <VolumeX className="w-5 h-5 text-stone-400 shrink-0" />
                    <span>Audible bell chime is currently muted. Order notifications will still appear visually on screen and in the navbar.</span>
                  </div>
                )}

                {/* Submit Action */}
                <div className="flex justify-end pt-3 border-t border-stone-100 dark:border-stone-800">
                  <Button
                    type="submit"
                    variant="primary"
                    size="touch"
                    className="px-8 font-extrabold cursor-pointer shadow-md shadow-purple-500/20"
                    isLoading={isSavingConfig}
                  >
                    Save Audio Settings
                  </Button>
                </div>
              </div>
            </form>
          )}

          {/* =========================================================================
              CATEGORY 5: POPUP ALERTS & ONSCREEN TOASTS
              ========================================================================= */}
          {activeTab === 'popup' && (
            <form onSubmit={handleSaveOwnerConfig} className="space-y-6 animate-in fade-in duration-150">
              {configSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2.5 animate-in zoom-in-95">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Popup notification configuration saved successfully! Active on all terminals.</span>
                </div>
              )}

              <div className="bg-white dark:bg-stone-900 border border-rose-500/40 dark:border-rose-500/30 rounded-3xl p-5 sm:p-7 shadow-sm space-y-6">
                <div className="flex items-start justify-between pb-4 border-b border-stone-100 dark:border-stone-800 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                        <Receipt className="w-4.5 h-4.5" />
                      </div>
                      <h3 className="text-base font-extrabold text-stone-900 dark:text-stone-100">
                        Order Completion Onscreen Toast Popup
                      </h3>
                    </div>
                    <p className="text-xs text-stone-500 dark:text-stone-400 max-w-2xl mt-1">
                      Displays a floating notification toast in the upper corner when an order completes, showing the ticket number, amount, items, and tender method.
                    </p>
                  </div>

                  {/* Popup Toggle Switch */}
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={orderPopupEnabled}
                      onChange={(e) => setOrderPopupEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-12 h-6.5 bg-stone-200 peer-focus:outline-none rounded-full peer dark:bg-stone-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2.5px] after:left-[3px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-stone-600 peer-checked:bg-rose-500"></div>
                  </label>
                </div>

                {/* Popup Duration Selection */}
                {orderPopupEnabled ? (
                  <div className="space-y-4 pt-1">
                    <div className="space-y-2">
                      <label className="text-xs font-extrabold text-stone-700 dark:text-stone-300 uppercase tracking-wider block">
                        Popup Display Duration
                      </label>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                          { sec: 3, label: '3 Seconds', desc: 'Fast dismiss' },
                          { sec: 4, label: '4 Seconds', desc: 'Recommended' },
                          { sec: 5, label: '5 Seconds', desc: 'Moderate' },
                          { sec: 8, label: '8 Seconds', desc: 'Extended display' },
                        ].map((d) => (
                          <button
                            key={d.sec}
                            type="button"
                            onClick={() => setOrderPopupDuration(d.sec)}
                            className={cn(
                              'p-3.5 rounded-2xl border text-center transition-all cursor-pointer select-none',
                              orderPopupDuration === d.sec
                                ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/20 text-rose-900 dark:text-rose-200 ring-1 ring-rose-500 font-extrabold'
                                : 'border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-850/50 text-stone-600 dark:text-stone-400 hover:border-stone-300'
                            )}
                          >
                            <div className="text-xs font-bold">{d.label}</div>
                            <div className="text-[10px] text-stone-400 mt-0.5">{d.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Live Toast Simulator Button */}
                    <div className="p-4 rounded-2xl bg-stone-50/80 dark:bg-stone-850/60 border border-stone-200/60 dark:border-stone-750 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="font-extrabold text-stone-800 dark:text-stone-200">
                          Live Onscreen Toast Simulator
                        </div>
                        <div className="text-[11px] text-stone-400">
                          Click below to trigger an actual order toast in the corner and verify duration.
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={handleSimulateToast}
                        className="cursor-pointer font-bold shrink-0 self-start sm:self-auto"
                      >
                        Simulate Order Toast
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-stone-100 dark:bg-stone-800/50 text-stone-500 text-xs flex items-center gap-2.5">
                    <VolumeX className="w-5 h-5 text-stone-400 shrink-0" />
                    <span>Onscreen toast popups are disabled. Order statuses are visible on the dashboard and tables.</span>
                  </div>
                )}

                {/* Extensible Future Settings Note */}
                <div className="bg-stone-50/60 dark:bg-stone-900/60 border border-dashed border-stone-200 dark:border-stone-800 rounded-2xl p-4 text-xs text-stone-500 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-stone-700 dark:text-stone-300">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Upcoming Automation Rules</span>
                  </div>
                  <p className="text-[11px] text-stone-400">
                    Auto-print receipt dispatch rules, kitchen prep alerts, and inventory depletion warnings will be managed here.
                  </p>
                </div>

                {/* Submit Action */}
                <div className="flex justify-end pt-3 border-t border-stone-100 dark:border-stone-800">
                  <Button
                    type="submit"
                    variant="primary"
                    size="touch"
                    className="px-8 font-extrabold cursor-pointer shadow-md shadow-rose-500/20"
                    isLoading={isSavingConfig}
                  >
                    Save Popup Settings
                  </Button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Modal for Store Profile Editing */}
      <StoreProfileModal
        isOpen={isStoreProfileModalOpen}
        onClose={() => setIsStoreProfileModalOpen(false)}
        storeProfile={storeProfile}
        onProfileUpdated={(updated) => {
          setStoreProfile(updated);
        }}
      />
    </div>
  );
};


