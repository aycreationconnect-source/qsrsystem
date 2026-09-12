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
  CheckCircle,
  Activity,
  Laptop,
  Coins,
} from 'lucide-react';
import { cn } from '../../lib/utils';

export type SettingsCategory = 'profile' | 'tax' | 'printer' | 'audio' | 'popup';

export const SettingsView: React.FC = () => {
  const { appData, setAppData, refreshSettings, storeProfile, setStoreProfile, licenseStatus, currentUser } =
    useApp();
  const [isStoreProfileModalOpen, setIsStoreProfileModalOpen] = useState(false);

  // Settings Category Navigation
  const [activeTab, setActiveTab] = useState<SettingsCategory>('profile');

  // Saving states
  const [isSavingTax, setIsSavingTax] = useState(false);
  const [taxSuccess, setTaxSuccess] = useState(false);

  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [configSuccess, setConfigSuccess] = useState(false);

  // Local Tax Input states for immediate interactive simulation preview
  const [taxNameInput, setTaxNameInput] = useState<string>(() => {
    return appData.settings?.globalTaxName || 'GST';
  });
  const [taxRateInput, setTaxRateInput] = useState<string>(() => {
    return appData.settings?.globalTaxRate || '5';
  });

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

  const handleSaveTaxSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSavingTax(true);
      await settingsApi.saveSettings({
        globalTaxName: taxNameInput,
        globalTaxRate: taxRateInput,
      });

      setAppData((prev) => ({
        ...prev,
        settings: {
          ...prev.settings,
          globalTaxName: taxNameInput,
          globalTaxRate: taxRateInput,
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

  // Categories configuration
  const categories: {
    id: SettingsCategory;
    label: string;
    subtitle: string;
    icon: React.ReactNode;
    badge: string;
  }[] = [
    {
      id: 'profile',
      label: 'Store Profile',
      subtitle: 'Branding & contact details',
      icon: <Store className="w-4 h-4" />,
      badge: storeProfile?.cafeCode || 'CF-NAG-001',
    },
    {
      id: 'tax',
      label: 'Tax & Billing',
      subtitle: 'GST/VAT rates & plan',
      icon: <Percent className="w-4 h-4" />,
      badge: `${taxRateInput || '0'}% ${taxNameInput || 'Tax'}`,
    },
    {
      id: 'printer',
      label: 'Printer Settings',
      subtitle: 'Receipts, KOT & item labels',
      icon: <Printer className="w-4 h-4" />,
      badge: `${appData.settings?.printer_default_paper_width || appData.settings?.printer_bill_paper_width || '80mm'} Roll`,
    },
    {
      id: 'audio',
      label: 'Audio Chimes',
      subtitle: 'Order bell sounds & volume',
      icon: <Volume2 className="w-4 h-4" />,
      badge: orderSoundEnabled ? `${orderSoundVolume}% Vol` : 'Muted',
    },
    {
      id: 'popup',
      label: 'Popup Alerts',
      subtitle: 'Onscreen order toasts',
      icon: <Receipt className="w-4 h-4" />,
      badge: orderPopupEnabled ? `${orderPopupDuration}s Duration` : 'Disabled',
    },
  ];

  // Tax simulator numbers
  const simulatedRate = parseFloat(taxRateInput) || 0;
  const simulatedSubtotal = 1000;
  const simulatedTaxAmount = (simulatedSubtotal * simulatedRate) / 100;
  const simulatedGrandTotal = simulatedSubtotal + simulatedTaxAmount;

  return (
    <div className="p-4 sm:p-6 lg:p-7 space-y-6 max-w-[1540px] mx-auto min-h-[calc(100vh-100px)]">
      {/* Top Breadcrumb & Status Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1">
        <div>
          <h2 className="text-xl font-black text-stone-900 dark:text-stone-100 tracking-tight flex items-center gap-2.5">
            <span>Store Settings & Configurations</span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-900 dark:text-amber-300 border border-amber-500/30">
              POS v2.4
            </span>
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Manage cafe identity, tax rates, thermal printer roll formats, order audio chimes, and station node health.
          </p>
        </div>

        {/* Live System Badges & Quick Launchers */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Station Online</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
            <span>{licenseStatus?.daysRemaining ?? 85} Days Remaining</span>
          </div>

          <a
            href="/pos?mode=quick"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-extrabold shadow-sm transition-all cursor-pointer"
            title="Open Quick POS in new tab"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Quick POS</span>
          </a>
        </div>
      </div>

      {/* Mobile Category Pill Selector (visible only on small screens < lg) */}
      <div className="lg:hidden flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {categories.map((cat) => {
          const isActive = activeTab === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveTab(cat.id)}
              className={cn(
                'px-3.5 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 shrink-0 border select-none',
                isActive
                  ? 'bg-amber-500 text-stone-950 border-amber-500 shadow-sm ring-1 ring-amber-400'
                  : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
              )}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
              <span
                className={cn(
                  'text-[10px] px-1.5 py-0.2 rounded-full font-bold',
                  isActive
                    ? 'bg-stone-900 text-amber-400'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400'
                )}
              >
                {cat.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main 2-Column Responsive Layout (Desktop & Tablet) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Category Navigation + Station & Hardware Status Widget */}
        <div className="hidden lg:flex lg:col-span-4 xl:col-span-3 flex-col space-y-4 sticky top-4">
          {/* Card 1: Category Menu */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-3 shadow-sm space-y-1">
            <div className="px-3 py-2 text-[10px] font-extrabold uppercase tracking-wider text-stone-400 dark:text-stone-500 flex items-center justify-between">
              <span>Settings Categories</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-stone-100 dark:bg-stone-800 text-stone-500">
                5 Modules
              </span>
            </div>

            {categories.map((cat) => {
              const isActive = activeTab === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveTab(cat.id)}
                  className={cn(
                    'w-full text-left p-3 rounded-2xl transition-all cursor-pointer flex items-center justify-between gap-3 group select-none border',
                    isActive
                      ? 'bg-amber-500/10 dark:bg-amber-500/15 text-amber-950 dark:text-amber-200 border-amber-500/30 shadow-xs'
                      : 'hover:bg-stone-100/80 dark:hover:bg-stone-800/60 text-stone-700 dark:text-stone-300 border-transparent'
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105',
                        isActive
                          ? 'bg-amber-500 text-stone-950 shadow-xs font-bold'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400'
                      )}
                    >
                      {cat.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-extrabold truncate leading-snug">{cat.label}</div>
                      <div className="text-[11px] text-stone-400 dark:text-stone-500 truncate leading-snug mt-0.5">
                        {cat.subtitle}
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={cn(
                      'text-[10px] font-bold px-2 py-0.5 rounded-lg shrink-0 transition-colors truncate max-w-[85px]',
                      isActive
                        ? 'bg-amber-500/25 text-amber-950 dark:text-amber-200 font-extrabold'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400'
                    )}
                  >
                    {cat.badge}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Card 2: Station Node & Health Widget (Eliminates empty space purposefully) */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-4 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400 dark:text-stone-500 flex items-center gap-1.5">
                <Laptop className="w-3.5 h-3.5 text-amber-500" />
                <span>Station Health</span>
              </span>
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Ready</span>
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-stone-100 dark:border-stone-850">
                <span className="text-stone-500 dark:text-stone-400">Database Engine</span>
                <span className="font-mono font-bold text-stone-800 dark:text-stone-200 text-[11px]">
                  Local SQLite
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-stone-100 dark:border-stone-850">
                <span className="text-stone-500 dark:text-stone-400">POS License</span>
                <span className="font-bold text-amber-600 dark:text-amber-400 text-[11px]">
                  {licenseStatus?.planCode || 'PRO Plan'}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-stone-100 dark:border-stone-850">
                <span className="text-stone-500 dark:text-stone-400">Current Staff</span>
                <span className="font-bold text-stone-800 dark:text-stone-200 text-[11px] truncate max-w-[120px]">
                  {currentUser?.fullName || 'Manager'}
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-stone-500 dark:text-stone-400">Default Thermal Roll</span>
                <span className="font-mono font-bold text-stone-800 dark:text-stone-200 text-[11px]">
                  {appData.settings?.printer_default_paper_width || '80mm'} Roll
                </span>
              </div>
            </div>

            {/* Quick Terminal Launcher Buttons */}
            <div className="pt-2 border-t border-stone-100 dark:border-stone-800 grid grid-cols-2 gap-2">
              <a
                href="/pos?mode=quick"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/30 dark:hover:bg-amber-950/50 border border-amber-200/80 dark:border-amber-900/50 text-amber-900 dark:text-amber-200 flex flex-col items-center justify-center text-center transition-all cursor-pointer group"
              >
                <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold">Quick POS</span>
              </a>

              <a
                href="/pos?mode=table"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-stone-50 hover:bg-stone-100 dark:bg-stone-850 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-750 text-stone-700 dark:text-stone-300 flex flex-col items-center justify-center text-center transition-all cursor-pointer group"
              >
                <Utensils className="w-4 h-4 text-stone-500 dark:text-stone-400 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold">Table POS</span>
              </a>
            </div>
          </div>
        </div>

        {/* Right Column: Active Category Details Panel */}
        <div className="lg:col-span-8 xl:col-span-9 min-w-0">
          {/* =========================================================================
              CATEGORY 1: STORE PROFILE & IDENTITY (COMPREHENSIVE REDESIGN)
              ========================================================================= */}
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* 1. Hero Identity Banner */}
              <div className="bg-gradient-to-br from-stone-900 via-stone-850 to-stone-900 text-white rounded-3xl p-6 sm:p-7 shadow-lg border border-stone-800 relative overflow-hidden">
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
                <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-5 shadow-sm space-y-3">
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
                <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-5 shadow-sm space-y-3">
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
                <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-5 shadow-sm space-y-3">
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
                <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-5 shadow-sm space-y-3">
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
                <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-5 shadow-sm space-y-3">
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
                <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-5 shadow-sm space-y-3">
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

              {/* 3. Store Readiness & Operational Checklist Card */}
              <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-stone-900 dark:text-stone-100">
                        Store Operational Readiness
                      </h4>
                      <p className="text-xs text-stone-400">
                        Core modules verification for smooth restaurant counter billing
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    100% Ready
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-2xl bg-stone-50/70 dark:bg-stone-850/50 border border-stone-200/60 dark:border-stone-750 flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    <div>
                      <span className="font-bold block text-stone-800 dark:text-stone-200">Store Profile</span>
                      <span className="text-[10px] text-stone-400">Brand & Monogram Set</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-stone-50/70 dark:bg-stone-850/50 border border-stone-200/60 dark:border-stone-750 flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    <div>
                      <span className="font-bold block text-stone-800 dark:text-stone-200">Tax & Billing</span>
                      <span className="text-[10px] text-stone-400">{taxRateInput}% {taxNameInput} Configured</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-stone-50/70 dark:bg-stone-850/50 border border-stone-200/60 dark:border-stone-750 flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    <div>
                      <span className="font-bold block text-stone-800 dark:text-stone-200">Printer Format</span>
                      <span className="text-[10px] text-stone-400">80mm / 58mm POS Ready</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-stone-50/70 dark:bg-stone-850/50 border border-stone-200/60 dark:border-stone-750 flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    <div>
                      <span className="font-bold block text-stone-800 dark:text-stone-200">Menu & Tables</span>
                      <span className="text-[10px] text-stone-400">{appData.tables.length} Tables • {appData.menu.length} Dishes</span>
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
            <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-5 sm:p-7 shadow-sm space-y-6 animate-in fade-in duration-150">
              <div className="pb-4 border-b border-stone-100 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <Percent className="w-5 h-5 text-amber-500" />
                    <span>Global Tax & Billing Configurations</span>
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    Configure invoice tax titles and percentage rates applied automatically to all customer tickets and printed receipts.
                  </p>
                </div>

                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50 self-start sm:self-auto">
                  Live Rate: {taxRateInput}% {taxNameInput}
                </span>
              </div>

              {taxSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2.5 animate-in zoom-in-95">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Billing and tax configurations saved successfully! Active on all POS tickets.</span>
                </div>
              )}

              <form onSubmit={handleSaveTaxSettings} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Tax Title (Printed on Invoice)"
                    placeholder="e.g. GST, VAT, Service Tax"
                    value={taxNameInput}
                    onChange={(e) => setTaxNameInput(e.target.value)}
                  />

                  <Input
                    label="Global Tax Percentage (%)"
                    type="number"
                    step="0.01"
                    placeholder="e.g. 5"
                    value={taxRateInput}
                    onChange={(e) => setTaxRateInput(e.target.value)}
                  />
                </div>

                {/* Interactive Real-Time Tax Bill Simulation Card */}
                <div className="p-5 rounded-2xl bg-stone-50/80 dark:bg-stone-850/60 border border-stone-200/70 dark:border-stone-750 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-stone-200/60 dark:border-stone-750">
                    <span className="text-xs font-extrabold text-stone-800 dark:text-stone-200 uppercase tracking-wider flex items-center gap-2">
                      <Coins className="w-4 h-4 text-amber-500" />
                      <span>Live Bill Tax Simulation</span>
                    </span>
                    <span className="text-[10px] text-stone-400">Updates live as you type above</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-white dark:bg-stone-800 border border-stone-200/60 dark:border-stone-700">
                      <span className="text-[11px] text-stone-400 block mb-0.5">Sample Subtotal</span>
                      <span className="font-mono font-bold text-stone-900 dark:text-stone-100 text-base">
                        ₹{simulatedSubtotal.toFixed(2)}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-white dark:bg-stone-800 border border-stone-200/60 dark:border-stone-700">
                      <span className="text-[11px] text-stone-400 block mb-0.5">
                        {taxNameInput || 'Tax'} ({simulatedRate.toFixed(2)}%)
                      </span>
                      <span className="font-mono font-bold text-amber-600 dark:text-amber-400 text-base">
                        + ₹{simulatedTaxAmount.toFixed(2)}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50">
                      <span className="text-[11px] text-amber-800 dark:text-amber-300 font-bold block mb-0.5">
                        Simulated Grand Total
                      </span>
                      <span className="font-mono font-black text-amber-950 dark:text-amber-100 text-base">
                        ₹{simulatedGrandTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Offline License Info */}
                {licenseStatus && (
                  <div className="p-4 rounded-2xl bg-stone-50/70 dark:bg-stone-850/60 border border-stone-200/60 dark:border-stone-750 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                      <div>
                        <div className="font-extrabold text-stone-900 dark:text-stone-100">
                          Active License: {licenseStatus.planCode}
                        </div>
                        <div className="text-[11px] text-stone-400">
                          Offline resilience enabled • All POS features unlocked
                        </div>
                      </div>
                    </div>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-extrabold bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800/60 self-start sm:self-auto">
                      {licenseStatus.daysRemaining} Days Left
                    </span>
                  </div>
                )}

                <div className="flex justify-end pt-2 border-t border-stone-100 dark:border-stone-800">
                  <Button
                    type="submit"
                    variant="primary"
                    size="touch"
                    className="px-8 font-extrabold cursor-pointer shadow-md shadow-amber-500/20"
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

              <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-5 sm:p-7 shadow-sm space-y-6">
                {/* Header with Master Switch */}
                <div className="flex items-start justify-between pb-4 border-b border-stone-100 dark:border-stone-800 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
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
                    <div className="w-12 h-6.5 bg-stone-200 peer-focus:outline-none rounded-full peer dark:bg-stone-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2.5px] after:left-[3px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-stone-600 peer-checked:bg-amber-500"></div>
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
                                  ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 shadow-sm ring-1 ring-amber-500'
                                  : 'border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-850/50 hover:border-stone-300 dark:hover:border-stone-700'
                              )}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2.5">
                                  <div
                                    className={cn(
                                      'w-4.5 h-4.5 rounded-full border flex items-center justify-center transition-all',
                                      isSelected
                                        ? 'border-amber-600 bg-amber-500 text-stone-950'
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
                                      ? 'bg-amber-500/20 text-amber-800 dark:text-amber-300'
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
                                      ? 'bg-amber-500 text-stone-950 shadow-xs'
                                      : 'bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-amber-50 dark:hover:bg-amber-950/40'
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
                    <div className="p-4 sm:p-5 rounded-2xl bg-stone-50/70 dark:bg-stone-850/60 border border-stone-200/60 dark:border-stone-750 space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-bold text-stone-700 dark:text-stone-300">
                        <span className="flex items-center gap-2">
                          {orderSoundVolume === 0 ? (
                            <VolumeX className="w-4 h-4 text-rose-500" />
                          ) : (
                            <Volume2 className="w-4 h-4 text-amber-500" />
                          )}
                          <span className="font-extrabold uppercase tracking-wider">Chime Volume Level</span>
                        </span>
                        <span className="font-mono text-amber-600 dark:text-amber-400 font-black text-sm">
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
                        className="w-full accent-amber-500 cursor-pointer h-2 bg-stone-200 dark:bg-stone-700 rounded-lg"
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
                    className="px-8 font-extrabold cursor-pointer shadow-md shadow-amber-500/20"
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

              <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-5 sm:p-7 shadow-sm space-y-6">
                <div className="flex items-start justify-between pb-4 border-b border-stone-100 dark:border-stone-800 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
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
                    <div className="w-12 h-6.5 bg-stone-200 peer-focus:outline-none rounded-full peer dark:bg-stone-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2.5px] after:left-[3px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-stone-600 peer-checked:bg-emerald-500"></div>
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
                                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200 ring-1 ring-emerald-500 font-extrabold'
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
                    className="px-8 font-extrabold cursor-pointer shadow-md shadow-emerald-500/20"
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


