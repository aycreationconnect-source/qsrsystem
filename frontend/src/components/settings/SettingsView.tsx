import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { settingsApi } from '../../api/settingsApi';
import { StoreProfileModal } from './StoreProfileModal';
import { PrinterSettingsPanel } from './PrinterSettingsPanel';
import { Button, Input, CafeBrandBadge } from '../ui';
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
} from 'lucide-react';
import { cn } from '../../lib/utils';

export type SettingsCategory = 'profile' | 'tax' | 'printer' | 'audio' | 'popup';

export const SettingsView: React.FC = () => {
  const { appData, setAppData, refreshSettings, storeProfile, setStoreProfile, licenseStatus } =
    useApp();
  const [isStoreProfileModalOpen, setIsStoreProfileModalOpen] = useState(false);

  // Settings Category Navigation
  const [activeTab, setActiveTab] = useState<SettingsCategory>('profile');

  // Saving states
  const [isSavingTax, setIsSavingTax] = useState(false);
  const [taxSuccess, setTaxSuccess] = useState(false);

  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [configSuccess, setConfigSuccess] = useState(false);

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

  // Track currently playing preview
  const [playingTone, setPlayingTone] = useState<string | null>(null);

  const handleTestSound = (tone: string) => {
    setPlayingTone(tone);
    cafeAudio.play(tone, orderSoundVolume);
    setTimeout(() => {
      setPlayingTone(null);
    }, 3500);
  };

  const handleSaveTaxSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSavingTax(true);
      await settingsApi.saveSettings({
        globalTaxName: appData.settings?.globalTaxName || '',
        globalTaxRate: appData.settings?.globalTaxRate || '0',
      });
      setTaxSuccess(true);
      setTimeout(() => setTaxSuccess(false), 2000);
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
      badge: storeProfile?.cafeCode || 'Profile',
    },
    {
      id: 'tax',
      label: 'Tax & Billing',
      subtitle: 'GST/VAT rates & plan',
      icon: <Percent className="w-4 h-4" />,
      badge: `${appData.settings?.globalTaxRate || '0'}% ${appData.settings?.globalTaxName || 'Tax'}`,
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

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Mobile Category Pill Selector (lg:hidden) */}
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
        {/* Left-Side Category Navigation Sidebar */}
        <div className="hidden lg:block lg:col-span-4 sticky top-6">
          <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-3.5 shadow-sm space-y-1.5">
            <div className="px-3 py-2 text-[10px] font-extrabold uppercase tracking-wider text-stone-400 dark:text-stone-500">
              Settings Categories
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
                      : 'hover:bg-stone-100 dark:hover:bg-stone-800/60 text-stone-700 dark:text-stone-300 border-transparent'
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
                      <div className="text-xs font-bold truncate leading-snug">{cat.label}</div>
                      <div className="text-[11px] text-stone-400 dark:text-stone-500 truncate leading-snug mt-0.5">
                        {cat.subtitle}
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={cn(
                      'text-[10px] font-bold px-2 py-0.5 rounded-lg shrink-0 transition-colors truncate max-w-[90px]',
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
        </div>

        {/* Right-Side Active Category Content */}
        <div className="lg:col-span-8 min-w-0">
          {/* =========================================================================
              CATEGORY 1: STORE PROFILE & IDENTITY
              ========================================================================= */}
          {activeTab === 'profile' && (
            <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5 animate-in fade-in duration-150">
              {/* Category Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100 dark:border-stone-800">
                <div>
                  <h3 className="text-base font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <Store className="w-4.5 h-4.5 text-amber-500" />
                    <span>Store Profile & Identity</span>
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    Manage cafe branding, manager contact details, GSTIN/Tax ID, and invoice receipts.
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsStoreProfileModalOpen(true)}
                  leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                  className="cursor-pointer font-bold shrink-0 self-start sm:self-auto"
                >
                  Edit Store Profile
                </Button>
              </div>

              {/* Visual Cafe Branding Badge Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-stone-50/70 dark:bg-stone-850/60 border border-stone-200/60 dark:border-stone-750">
                <CafeBrandBadge
                  name={storeProfile?.businessName || 'Velora Cafe'}
                  cafeCode={storeProfile?.cafeCode || 'CF-MUM-001'}
                  logoUrl={storeProfile?.logoUrl}
                  size="lg"
                />
              </div>

              {/* Store Info Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-stone-50/50 dark:bg-stone-850/40 border border-stone-100 dark:border-stone-800">
                  <span className="text-[11px] text-stone-400 font-semibold block mb-0.5">Store Manager / Owner</span>
                  <span className="font-bold text-stone-800 dark:text-stone-200 text-sm">
                    {storeProfile?.ownerName || 'Rajesh Sharma'}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-stone-50/50 dark:bg-stone-850/40 border border-stone-100 dark:border-stone-800">
                  <span className="text-[11px] text-stone-400 font-semibold block mb-0.5">Phone Number</span>
                  <span className="font-mono font-bold text-stone-800 dark:text-stone-200 text-sm">
                    {storeProfile?.phone || '9876543210'}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-stone-50/50 dark:bg-stone-850/40 border border-stone-100 dark:border-stone-800">
                  <span className="text-[11px] text-stone-400 font-semibold block mb-0.5">City & State</span>
                  <span className="font-semibold text-stone-800 dark:text-stone-200 text-sm">
                    {storeProfile?.city || 'Mumbai'}, {storeProfile?.state || 'Maharashtra'}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-stone-50/50 dark:bg-stone-850/40 border border-stone-100 dark:border-stone-800">
                  <span className="text-[11px] text-stone-400 font-semibold block mb-0.5">GSTIN / Tax ID</span>
                  <span className="font-mono font-bold text-amber-600 dark:text-amber-400 text-sm">
                    {storeProfile?.gstin || 'Not Provided'}
                  </span>
                </div>
              </div>

              {/* Receipt Footer Message */}
              <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/25 border border-amber-200/70 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                <Receipt className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Printed Receipt Footer Note:</span>
                  <span className="italic mt-0.5 block">"{storeProfile?.receiptFooter || 'Thank you for visiting! Please visit again.'}"</span>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              CATEGORY 2: TAX & BILLING CONFIGURATIONS
              ========================================================================= */}
          {activeTab === 'tax' && (
            <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5 animate-in fade-in duration-150">
              {/* Category Header */}
              <div className="pb-4 border-b border-stone-100 dark:border-stone-800">
                <h3 className="text-base font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <Percent className="w-4.5 h-4.5 text-amber-500" />
                  <span>Global Tax & Billing Configurations</span>
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  Configure default invoice tax rates and labels applied to POS dine-in and takeaway orders.
                </p>
              </div>

              {taxSuccess && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in zoom-in-95">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Billing and tax settings saved successfully!</span>
                </div>
              )}

              <form onSubmit={handleSaveTaxSettings} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Tax Title (Printed on Invoice)"
                    placeholder="e.g. GST, VAT, Service Tax"
                    value={appData.settings?.globalTaxName || ''}
                    onChange={(e) =>
                      setAppData({
                        ...appData,
                        settings: { ...appData.settings, globalTaxName: e.target.value },
                      })
                    }
                  />

                  <Input
                    label="Global Tax Percentage (%)"
                    type="number"
                    step="0.01"
                    placeholder="e.g. 5"
                    value={appData.settings?.globalTaxRate || ''}
                    onChange={(e) =>
                      setAppData({
                        ...appData,
                        settings: { ...appData.settings, globalTaxRate: e.target.value },
                      })
                    }
                  />
                </div>

                {/* Offline License Info */}
                {licenseStatus && (
                  <div className="p-4 rounded-2xl bg-stone-50/70 dark:bg-stone-850/60 border border-stone-200/60 dark:border-stone-750 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      <span className="text-stone-600 dark:text-stone-400">Subscription Plan:</span>
                      <strong className="text-stone-900 dark:text-stone-100">{licenseStatus.planCode}</strong>
                    </div>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800/60">
                      {licenseStatus.daysRemaining} Days Left
                    </span>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="touch"
                    className="px-8 font-extrabold cursor-pointer"
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
                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in zoom-in-95">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Audio configuration saved successfully! Active in real time.</span>
                </div>
              )}

              <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
                {/* Header with Master Switch */}
                <div className="flex items-start justify-between pb-4 border-b border-stone-100 dark:border-stone-800 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                        <BellRing className="w-4 h-4" />
                      </div>
                      <h3 className="text-base font-extrabold text-stone-900 dark:text-stone-100">
                        Order Completion Bell Sound (3s – 5s)
                      </h3>
                    </div>
                    <p className="text-xs text-stone-500 dark:text-stone-400 max-w-xl">
                      Plays an acoustic chime whenever an order is finalized. Designed with soothing harmonics to alert owners and cashiers without causing customer annoyance.
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
                    <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer dark:bg-stone-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-stone-600 peer-checked:bg-amber-500"></div>
                  </label>
                </div>

                {/* Sound Tone Cards & Volume Controls */}
                {orderSoundEnabled ? (
                  <div className="space-y-4 pt-1">
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <label className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                          Select Chime Tone
                        </label>
                        <span className="text-[11px] text-stone-400">
                          Click any card or preview button to hear sample
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {CAFE_SOUND_OPTIONS.map((opt) => {
                          const isSelected = orderSoundTone === opt.id;
                          const isPlaying = playingTone === opt.id;

                          return (
                            <div
                              key={opt.id}
                              onClick={() => setOrderSoundTone(opt.id)}
                              className={cn(
                                'p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 group select-none relative',
                                isSelected
                                  ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 shadow-sm ring-1 ring-amber-500'
                                  : 'border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-850/50 hover:border-stone-300 dark:hover:border-stone-700'
                              )}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <div
                                    className={cn(
                                      'w-4 h-4 rounded-full border flex items-center justify-center transition-all',
                                      isSelected
                                        ? 'border-amber-600 bg-amber-500 text-stone-950'
                                        : 'border-stone-400 dark:border-stone-600'
                                    )}
                                  >
                                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                                  </div>
                                  <span className="text-xs font-extrabold text-stone-900 dark:text-stone-100">
                                    {opt.name}
                                  </span>
                                </div>

                                <span
                                  className={cn(
                                    'text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider shrink-0',
                                    isSelected
                                      ? 'bg-amber-500/20 text-amber-800 dark:text-amber-300'
                                      : 'bg-stone-200/70 dark:bg-stone-750 text-stone-600 dark:text-stone-400'
                                  )}
                                >
                                  {opt.tag} • {opt.duration}
                                </span>
                              </div>

                              <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-snug">
                                {opt.description}
                              </p>

                              <div className="flex items-center justify-between pt-1 border-t border-stone-200/60 dark:border-stone-800">
                                <span className="text-[10px] text-stone-400 font-mono">
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
                                    'px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer',
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
                    <div className="p-4 rounded-2xl bg-stone-50/70 dark:bg-stone-850/60 border border-stone-200/60 dark:border-stone-750 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-stone-700 dark:text-stone-300">
                        <span className="flex items-center gap-1.5">
                          {orderSoundVolume === 0 ? (
                            <VolumeX className="w-4 h-4 text-rose-500" />
                          ) : (
                            <Volume2 className="w-4 h-4 text-amber-500" />
                          )}
                          <span>Chime Volume</span>
                        </span>
                        <span className="font-mono text-amber-600 dark:text-amber-400 font-extrabold">
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
                        <span>Standard Cafe (80%)</span>
                        <span>Maximum (100%)</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-2xl bg-stone-100 dark:bg-stone-800/50 text-stone-500 text-xs flex items-center gap-2">
                    <VolumeX className="w-4 h-4 text-stone-400" />
                    <span>Audible bell chime is currently muted. Order notifications will still appear visually on screen and in the navbar.</span>
                  </div>
                )}

                {/* Submit Action */}
                <div className="flex justify-end pt-2 border-t border-stone-100 dark:border-stone-800">
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
              CATEGORY 4: POPUP NOTIFICATIONS & ONSCREEN TOASTS
              ========================================================================= */}
          {activeTab === 'popup' && (
            <form onSubmit={handleSaveOwnerConfig} className="space-y-6 animate-in fade-in duration-150">
              {configSuccess && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in zoom-in-95">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Popup notification configuration saved successfully!</span>
                </div>
              )}

              <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
                <div className="flex items-start justify-between pb-4 border-b border-stone-100 dark:border-stone-800 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                        <Receipt className="w-4 h-4" />
                      </div>
                      <h3 className="text-base font-extrabold text-stone-900 dark:text-stone-100">
                        Order Completion Onscreen Toast Popup
                      </h3>
                    </div>
                    <p className="text-xs text-stone-500 dark:text-stone-400 max-w-xl">
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
                    <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer dark:bg-stone-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-stone-600 peer-checked:bg-emerald-500"></div>
                  </label>
                </div>

                {/* Popup Duration Selection */}
                {orderPopupEnabled ? (
                  <div className="space-y-2 pt-1">
                    <label className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider block">
                      Popup Display Duration
                    </label>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
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
                            'p-3 rounded-2xl border text-center transition-all cursor-pointer select-none',
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
                ) : (
                  <div className="p-3.5 rounded-2xl bg-stone-100 dark:bg-stone-800/50 text-stone-500 text-xs flex items-center gap-2">
                    <VolumeX className="w-4 h-4 text-stone-400" />
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
                <div className="flex justify-end pt-2 border-t border-stone-100 dark:border-stone-800">
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


