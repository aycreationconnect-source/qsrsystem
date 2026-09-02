import React, { useState } from 'react';
import { X, Store, User, Phone, Mail, MapPin, Sparkles, Check } from 'lucide-react';
import { PlanTemplate, RegisterCafePayload } from '../types';

interface RegisterCafeModalProps {
  isOpen: boolean;
  onClose: () => void;
  plans: PlanTemplate[];
  onSubmit: (payload: RegisterCafePayload) => Promise<void>;
  isLoading: boolean;
}

export const RegisterCafeModal: React.FC<RegisterCafeModalProps> = ({
  isOpen,
  onClose,
  plans,
  onSubmit,
  isLoading,
}) => {
  const [formData, setFormData] = useState<RegisterCafePayload>({
    businessName: '',
    ownerName: '',
    ownerPhone: '',
    ownerEmail: '',
    city: 'Mumbai',
    state: 'Maharashtra',
    address: '',
    planId: plans.find((p) => p.isDefault)?.id || plans[0]?.id || '',
    customCafeCode: '',
    notes: '',
  });

  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.businessName || !formData.ownerName || !formData.ownerPhone || !formData.city) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    try {
      await onSubmit(formData);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl my-8 transition-colors duration-200">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 shadow-md shadow-orange-500/20">
              <Store className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Onboard New Cafe</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Register store in Golden DB & issue offline cryptographic license
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Plan Selector Badge Group */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">
              Select Subscription / Trial Plan <span className="text-amber-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {plans.map((p) => {
                const isSelected = formData.planId === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, planId: p.id })}
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
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                      {p.durationDays} Days • {p.price > 0 ? `₹${p.price}` : 'Free'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {/* Business Name */}
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Cafe / Restaurant Name <span className="text-amber-500">*</span>
              </label>
              <div className="relative">
                <Store className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Mocha Bliss Cafe"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40 placeholder-slate-400"
                />
              </div>
            </div>

            {/* Custom Cafe Code */}
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Custom Cafe Code <span className="text-slate-400 text-[10px]">(Optional)</span>
              </label>
              <input
                type="text"
                placeholder="Auto-generated e.g. CF-MUM-001"
                value={formData.customCafeCode}
                onChange={(e) => setFormData({ ...formData, customCafeCode: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40 placeholder-slate-400 uppercase font-mono"
              />
            </div>

            {/* Owner Name */}
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Owner Full Name <span className="text-amber-500">*</span>
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Rajesh Sharma"
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40 placeholder-slate-400"
                />
              </div>
            </div>

            {/* Owner Phone */}
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Owner Phone / WhatsApp <span className="text-amber-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9876543210"
                  value={formData.ownerPhone}
                  onChange={(e) => setFormData({ ...formData, ownerPhone: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40 placeholder-slate-400"
                />
              </div>
            </div>

            {/* Owner Email */}
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Owner Email <span className="text-slate-400 text-[10px]">(Optional)</span>
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  placeholder="e.g. owner@mochabliss.com"
                  value={formData.ownerEmail}
                  onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40 placeholder-slate-400"
                />
              </div>
            </div>

            {/* City */}
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                City <span className="text-amber-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Mumbai"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40 placeholder-slate-400"
                />
              </div>
            </div>
          </div>

          {/* State & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">State / Region</label>
              <input
                type="text"
                placeholder="e.g. Maharashtra"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40 placeholder-slate-400"
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Internal Notes</label>
              <input
                type="text"
                placeholder="e.g. 2 Billing Tabs + 3 Waiter Phones"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40 placeholder-slate-400"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center space-x-2 px-5 py-2.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 rounded-xl shadow-lg shadow-orange-500/20 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isLoading ? 'Issuing License...' : 'Register & Generate License'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
