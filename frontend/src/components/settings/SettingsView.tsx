import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { settingsApi } from '../../api/settingsApi';
import { StoreProfileModal } from './StoreProfileModal';
import { Button, Input, CafeBrandBadge } from '../ui';
import {
  Settings,
  Building,
  Percent,
  ShieldCheck,
  Edit2,
  CheckCircle2,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { appData, setAppData, refreshSettings, storeProfile, setStoreProfile, licenseStatus } =
    useApp();
  const [isStoreProfileModalOpen, setIsStoreProfileModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await settingsApi.saveSettings({
        globalTaxName: appData.settings?.globalTaxName || '',
        globalTaxRate: appData.settings?.globalTaxRate || '0',
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
      await refreshSettings();
    } catch (err) {
      console.error(err);
      alert('Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-5 sm:p-6 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-500" />
            <span>Store Configuration & Preferences</span>
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Manage your cafe branding, tax percentages, and local station node credentials.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
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
          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <h3 className="text-sm font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Percent className="w-4 h-4 text-amber-500" />
                <span>Global Tax & Billing</span>
              </h3>
            </div>

            {savedSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Settings saved successfully!
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
              isLoading={isSaving}
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
