import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { settingsApi } from '../../api/settingsApi';
import { StoreProfileModal } from './StoreProfileModal';
import { Button, Input, CafeBrandBadge } from '../ui';
import { cafeAudio, CAFE_SOUND_OPTIONS } from '../../lib/sound';
import {
  Settings,
  Building,
  Percent,
  ShieldCheck,
  Edit2,
  CheckCircle2,
  Sliders,
  Volume2,
  VolumeX,
  BellRing,
  Play,
  Sparkles,
  Check,
  Receipt,
  Store,
} from 'lucide-react';
import { cn } from '../../lib/utils';

export const SettingsView: React.FC = () => {
  const { appData, setAppData, refreshSettings, storeProfile, setStoreProfile, licenseStatus } =
    useApp();
  const [isStoreProfileModalOpen, setIsStoreProfileModalOpen] = useState(false);

  // Settings Tabs: 'profile' (Store Profile & Tax) vs 'config' (Owner Configuration)
  const [activeTab, setActiveTab] = useState<'profile' | 'config'>('config');

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

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-500" />
            <span>Store Settings & Configuration</span>
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Manage your cafe branding, tax percentages, and owner order completion alerts.
          </p>
        </div>

        {/* Top Tab Selector */}
        <div className="flex p-1 bg-stone-100 dark:bg-stone-800 rounded-2xl shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('config')}
            className={cn(
              'px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2',
              activeTab === 'config'
                ? 'bg-white dark:bg-stone-900 text-amber-600 dark:text-amber-400 shadow-sm font-extrabold'
                : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            )}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Owner Configuration</span>
            <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-amber-500 text-stone-950 font-black">
              Chimes & Alerts
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={cn(
              'px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2',
              activeTab === 'profile'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-sm font-extrabold'
                : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            )}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Store Profile & Tax</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: OWNER CONFIGURATION (SOUND BELL CHIMES, TOAST POPUP, PREFERENCES)
          ========================================================================= */}
      {activeTab === 'config' && (
        <form onSubmit={handleSaveOwnerConfig} className="space-y-6 animate-in fade-in duration-150">
          {configSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in zoom-in-95">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Owner configurations saved successfully! Settings are active in real time.</span>
            </div>
          )}

          {/* Card 1: Order Completion Bell Sound */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
            {/* Header with Master Switch */}
            <div className="flex items-start justify-between pb-4 border-b border-stone-100 dark:border-stone-800 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <BellRing className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-extrabold text-stone-900 dark:text-stone-100">
                    Order Completion Bell Sound (3s – 5s)
                  </h3>
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400 max-w-xl">
                  Plays a soothing, cafe-friendly acoustic chime whenever an order is completed. Specifically designed with warm harmonics to alert owners and cashiers without causing customer annoyance.
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

            {/* Sound Tone Cards & Volume Controls (if sound enabled) */}
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
          </div>

          {/* Card 2: Order Completion Popup Notification Toast */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-start justify-between pb-4 border-b border-stone-100 dark:border-stone-800 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-extrabold text-stone-900 dark:text-stone-100">
                    Order Completion Onscreen Toast Popup
                  </h3>
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400 max-w-xl">
                  Displays a floating popup notification in the upper corner when an order completes, showing the ticket number, amount, items, and tender method.
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
            {orderPopupEnabled && (
              <div className="space-y-2 pt-1">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider block">
                  Popup Display Duration
                </label>

                <div className="grid grid-cols-4 gap-2">
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
                        'p-2.5 rounded-2xl border text-center transition-all cursor-pointer select-none',
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
            )}
          </div>

          {/* Card 3: Extensible Owner Operational Settings (Coming Soon Placeholder) */}
          <div className="bg-stone-50/60 dark:bg-stone-900/60 border border-dashed border-stone-200 dark:border-stone-800 rounded-3xl p-5 text-xs text-stone-500 space-y-2">
            <div className="flex items-center gap-2 font-bold text-stone-700 dark:text-stone-300">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Upcoming Owner Operational Configurations</span>
            </div>
            <p className="text-[11px] text-stone-400">
              Additional cafe owner settings will be unlocked here: Kitchen Display System (KDS) prep chimes, Low-stock ingredient threshold audible warnings, and Auto-print receipt dispatch rules.
            </p>
          </div>

          {/* Submit Action */}
          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="px-8 font-extrabold shadow-lg shadow-amber-500/20"
              isLoading={isSavingConfig}
            >
              Save Owner Configurations
            </Button>
          </div>
        </form>
      )}

      {/* =========================================================================
          TAB 2: STORE PROFILE & GLOBAL TAX (EXISTING STORE SETTINGS)
          ========================================================================= */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-in fade-in duration-150">
          {/* 1. Cafe Identity & Branding Card */}
          <div className="md:col-span-6 bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
                <h3 className="text-sm font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <Building className="w-4 h-4 text-amber-500" />
                  <span>Store Identity & Logo</span>
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsStoreProfileModalOpen(true)}
                  leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                  className="text-xs font-bold"
                >
                  Edit Details
                </Button>
              </div>

              <div className="mt-4 p-4 rounded-2xl bg-stone-50/70 dark:bg-stone-850/60 border border-stone-200/60 dark:border-stone-750">
                <CafeBrandBadge
                  name={storeProfile?.businessName || 'Velora Cafe'}
                  cafeCode={storeProfile?.cafeCode || 'CF-MUM-001'}
                  logoUrl={storeProfile?.logoUrl}
                  size="lg"
                />
              </div>

              <div className="mt-4 space-y-2 text-xs text-stone-600 dark:text-stone-400">
                <div className="flex justify-between py-1 border-b border-stone-100 dark:border-stone-800/80">
                  <span>Manager:</span>
                  <span className="font-bold text-stone-800 dark:text-stone-200">
                    {storeProfile?.ownerName || 'Rajesh Sharma'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-100 dark:border-stone-800/80">
                  <span>Phone:</span>
                  <span className="font-mono font-bold text-stone-800 dark:text-stone-200">
                    {storeProfile?.phone || '9876543210'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-100 dark:border-stone-800/80">
                  <span>Location:</span>
                  <span className="font-semibold text-stone-800 dark:text-stone-200">
                    {storeProfile?.city || 'Mumbai'}, {storeProfile?.state || 'Maharashtra'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-100 dark:border-stone-800/80">
                  <span>GSTIN / Tax ID:</span>
                  <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                    {storeProfile?.gstin || 'Not Provided'}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 text-[11px] text-amber-900 dark:text-amber-300">
              Receipt Note: "{storeProfile?.receiptFooter || 'Thank you for visiting!'}"
            </div>
          </div>

          {/* 2. Global Tax & Rate Settings */}
          <div className="md:col-span-6 bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col justify-between">
            <form onSubmit={handleSaveTaxSettings} className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
                <h3 className="text-sm font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <Percent className="w-4 h-4 text-amber-500" />
                  <span>Global Tax & Billing</span>
                </h3>
              </div>

              {taxSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Settings saved successfully!</span>
                </div>
              )}

              <div className="space-y-3">
                <Input
                  label="Tax Title (Printed on Invoice)"
                  placeholder="e.g. GST or VAT"
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

              <Button
                type="submit"
                variant="primary"
                size="touch"
                className="w-full font-bold mt-4"
                isLoading={isSavingTax}
              >
                Save Billing Settings
              </Button>
            </form>

            {/* Offline License Info */}
            {licenseStatus && (
              <div className="mt-6 pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Plan: <strong className="text-stone-800 dark:text-stone-200">{licenseStatus.planCode}</strong>
                </span>
                <span className="font-mono text-emerald-600 font-bold">
                  {licenseStatus.daysRemaining} Days Left
                </span>
              </div>
            )}
          </div>
        </div>
      )}

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

