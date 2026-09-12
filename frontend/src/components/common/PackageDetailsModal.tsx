import React from 'react';
import { useApp } from '../../context/AppContext';
import { Modal, Button } from '../ui';
import {
  Clock,
  Store,
  CheckCircle2,
  Package,
  Layers,
} from 'lucide-react';
import { cn } from '../../lib/utils';

export interface PackageDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PackageDetailsModal: React.FC<PackageDetailsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { storeProfile, licenseStatus } = useApp();

  if (!isOpen) return null;

  // Plan Name formatting
  const planCode = licenseStatus?.planCode || 'TRIAL_3M';
  const formatPlanName = (code: string) => {
    const upper = code.toUpperCase();
    if (upper === 'TRIAL_3M') return '3-Month Trial Package';
    if (upper.startsWith('TRIAL')) return 'Trial Package';
    if (upper.includes('PRO')) return 'Professional Package';
    if (upper.includes('ENT')) return 'Enterprise Package';
    if (upper.includes('STARTER')) return 'Starter Package';
    return `${code} Package`;
  };

  const planName = formatPlanName(planCode);
  const daysRemaining = licenseStatus?.daysRemaining ?? 0;
  const durationDays = licenseStatus?.durationDays || 90;
  const percentRemaining = Math.min(
    100,
    Math.max(0, Math.round((daysRemaining / durationDays) * 100))
  );

  // Format expiry date
  const formatExpiryDate = (dateStr?: string | Date) => {
    if (!dateStr) return 'Not available';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Not available';
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const expiryDateFormatted = formatExpiryDate(licenseStatus?.expiresAt);

  // Included features in this package
  const packageFeatures = [
    { name: 'Fast Counter POS Billing', desc: 'Instant item lookup, modifiers & quick settlement' },
    { name: 'Dine-In Floor & Tables', desc: 'Multi-area floor map, live occupancy & running bills' },
    { name: 'Kitchen Display & KOT', desc: 'Real-time kitchen order ticket & station routing' },
    { name: 'Inventory & Recipe Deduction', desc: 'Raw material stock, threshold alerts & movements' },
    { name: 'Multi-Tax & Reverse Calculation', desc: 'Custom CGST, SGST, VAT & inclusive tax engine' },
    { name: 'Thermal Slip & Receipts', desc: '80mm & 58mm POS receipt formats & logo printing' },
    { name: 'Business Sales & Analytics', desc: 'Daily order sequence, revenue & payment splits' },
    { name: 'Offline Cryptographic Security', desc: 'Full offline local database with hardware node lock' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="lg"
      className="rounded-3xl overflow-hidden shadow-2xl border-stone-200/80 dark:border-stone-800"
      bodyClassName="p-0 overflow-y-auto max-h-[85vh]"
    >
      {/* Hero Header Card */}
      <div className="relative bg-gradient-to-br from-stone-900 via-stone-850 to-stone-900 text-white p-6 sm:p-7 overflow-hidden border-b border-stone-800">
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                  Package Details
                </span>
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Active
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold text-white mt-0.5">
                {planName}
              </h3>
            </div>
          </div>

          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-xl bg-white/10 text-stone-300 border border-white/10 shrink-0">
            {planCode}
          </span>
        </div>

        {/* Days Left Highlight Card */}
        <div className="mt-5 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-stone-200">Subscription Validity</span>
            </div>
            <span className="text-sm font-black text-emerald-400">
              {daysRemaining} Days Remaining
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-stone-700/60 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                daysRemaining <= 15
                  ? 'bg-rose-500'
                  : daysRemaining <= 30
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              )}
              style={{ width: `${percentRemaining}%` }}
            />
          </div>

          <div className="mt-2 flex items-center justify-between text-[11px] text-stone-400">
            <span>Total Duration: {durationDays} Days</span>
            <span>Expires on {expiryDateFormatted}</span>
          </div>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 sm:p-6 space-y-5 bg-white dark:bg-stone-900">
        {/* Licensed Store Identity */}
        <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-850/60 border border-stone-200/80 dark:border-stone-800 space-y-3">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400 dark:text-stone-500 flex items-center gap-1.5">
            <Store className="w-3.5 h-3.5 text-amber-500" />
            <span>Licensed Establishment</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-stone-400 dark:text-stone-500 text-[11px]">Business Name</span>
              <div className="font-bold text-stone-900 dark:text-stone-100 truncate">
                {storeProfile?.businessName || 'Velora Cafe'}
              </div>
            </div>

            <div>
              <span className="text-stone-400 dark:text-stone-500 text-[11px]">Store / Cafe Code</span>
              <div className="font-mono font-bold text-amber-600 dark:text-amber-400">
                {storeProfile?.cafeCode || 'CF-NAG-001'}
              </div>
            </div>

            <div>
              <span className="text-stone-400 dark:text-stone-500 text-[11px]">Registered Owner</span>
              <div className="font-bold text-stone-800 dark:text-stone-200 truncate">
                {storeProfile?.ownerName || 'Store Owner'}
              </div>
            </div>

            <div>
              <span className="text-stone-400 dark:text-stone-500 text-[11px]">Location</span>
              <div className="font-bold text-stone-800 dark:text-stone-200 truncate">
                {storeProfile?.city ? `${storeProfile.city}, ${storeProfile.state || 'India'}` : 'Local Node'}
              </div>
            </div>
          </div>
        </div>

        {/* Included Package Capabilities */}
        <div>
          <div className="flex items-center gap-1.5 mb-3">
            <Layers className="w-4 h-4 text-amber-500" />
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-stone-700 dark:text-stone-300">
              Included Package Capabilities
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {packageFeatures.map((feat, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-stone-50/70 dark:bg-stone-850/40 border border-stone-200/60 dark:border-stone-800/80 flex items-start gap-2.5"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <div className="text-xs font-bold text-stone-900 dark:text-stone-100 leading-tight">
                    {feat.name}
                  </div>
                  <div className="text-[11px] text-stone-500 dark:text-stone-400 leading-tight mt-0.5">
                    {feat.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dismiss Footer Action */}
        <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-end">
          <Button
            variant="primary"
            size="sm"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2 rounded-xl"
          >
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
};
