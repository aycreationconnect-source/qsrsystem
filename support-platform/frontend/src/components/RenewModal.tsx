import React, { useState } from 'react';
import { X, RefreshCw, Check, Sparkles } from 'lucide-react';
import { CafeMaster, PlanTemplate, RenewCafePayload } from '../types';

interface RenewModalProps {
  isOpen: boolean;
  onClose: () => void;
  cafe: CafeMaster | null;
  plans: PlanTemplate[];
  onSubmit: (cafeId: string, payload: RenewCafePayload) => Promise<void>;
  isLoading: boolean;
}

export const RenewModal: React.FC<RenewModalProps> = ({
  isOpen,
  onClose,
  cafe,
  plans,
  onSubmit,
  isLoading,
}) => {
  const [selectedPlanId, setSelectedPlanId] = useState<string>(plans[0]?.id || '');
  const [customDays, setCustomDays] = useState<number | undefined>(undefined);
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !cafe) return null;

  const currentExpiry = new Date(cafe.licenseExpiresAt).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const selectedPlan = plans.find((p) => p.id === selectedPlanId) || plans[0];
  const effectiveDays = customDays || selectedPlan?.durationDays || 30;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await onSubmit(cafe.id, {
        planId: selectedPlanId || plans[0].id,
        customDays: customDays ? Number(customDays) : undefined,
        notes,
        adminName: 'Developer Admin',
      });
    } catch (err: any) {
      setError(err.message || 'Renewal failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl my-8 transition-colors duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Renew / Extend License</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{cafe.businessName} ({cafe.cafeCode})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Current Status Badge */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Current License Expiry</div>
              <div className="text-sm font-bold text-slate-900 dark:text-slate-200 mt-0.5">{currentExpiry}</div>
            </div>
            <div className="text-right">
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Status</div>
              <div className="text-xs font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                {cafe.isExpired ? '🛑 Expired' : `🟢 ${cafe.daysRemaining} Days Left`}
              </div>
            </div>
          </div>

          {/* Plan Selector */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">
              Select Renewal / Extension Plan
            </label>
            <div className="grid grid-cols-2 gap-2">
              {plans.map((p) => {
                const isSelected = selectedPlanId === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setSelectedPlanId(p.id);
                      setCustomDays(undefined);
                    }}
                    className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-50 dark:bg-amber-500/15 border-amber-500 text-amber-900 dark:text-amber-300 ring-2 ring-amber-500/50'
                        : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[11px] truncate">{p.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                      +{p.durationDays} Days • {p.price > 0 ? `₹${p.price}` : 'Free'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Duration Override */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              Custom Duration Override (Days) <span className="text-slate-400 text-[10px]">(Optional)</span>
            </label>
            <input
              type="number"
              min={1}
              placeholder={`Default: ${selectedPlan?.durationDays || 30} days`}
              value={customDays || ''}
              onChange={(e) => setCustomDays(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Admin Audit Notes</label>
            <input
              type="text"
              placeholder="e.g. Paid ₹8999 via UPI ref #12345 or Special 15-day extension"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center space-x-2 px-5 py-2.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 rounded-xl shadow-lg shadow-orange-500/20 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isLoading ? 'Issuing Key...' : `Extend & Generate Key (+${effectiveDays}d)`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
