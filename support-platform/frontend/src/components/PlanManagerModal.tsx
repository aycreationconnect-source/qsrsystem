import React, { useState } from 'react';
import { X, Settings2, Plus, Star, Trash2, Edit3, Save } from 'lucide-react';
import { PlanTemplate, PlanType } from '../types';
import { Tooltip } from './common/Tooltip';

interface PlanManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  plans: PlanTemplate[];
  onCreatePlan: (plan: Partial<PlanTemplate>) => Promise<void>;
  onUpdatePlan: (id: string, plan: Partial<PlanTemplate>) => Promise<void>;
  onRequestDeletePlan: (plan: PlanTemplate) => void;
  isLoading: boolean;
}

export const PlanManagerModal: React.FC<PlanManagerModalProps> = ({
  isOpen,
  onClose,
  plans,
  onCreatePlan,
  onUpdatePlan,
  onRequestDeletePlan,
  isLoading,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [planCode, setPlanCode] = useState('');
  const [name, setName] = useState('');
  const [planType, setPlanType] = useState<PlanType>('FREE_TRIAL');
  const [durationDays, setDurationDays] = useState<number>(90);
  const [price, setPrice] = useState<number>(0);
  const [isDefault, setIsDefault] = useState(false);
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleStartEdit = (plan: PlanTemplate) => {
    setEditingId(plan.id);
    setName(plan.name);
    setDurationDays(plan.durationDays);
    setPrice(plan.price);
    setIsDefault(plan.isDefault);
    setDescription(plan.description || '');
    setIsCreating(false);
  };

  const handleSaveEdit = async (id: string) => {
    await onUpdatePlan(id, {
      name,
      durationDays: Number(durationDays),
      price: Number(price),
      isDefault,
      description,
    });
    setEditingId(null);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planCode || !name || !durationDays) return;

    await onCreatePlan({
      planCode: planCode.toUpperCase(),
      name,
      planType,
      durationDays: Number(durationDays),
      price: Number(price),
      isDefault,
      description,
    });

    setIsCreating(false);
    // Reset form
    setPlanCode('');
    setName('');
    setDurationDays(90);
    setPrice(0);
    setIsDefault(false);
    setDescription('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl my-8 transition-colors duration-200">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 shadow-md shadow-orange-500/20">
              <Settings2 className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Dynamic Plan Manager</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure trial periods (3 Months, 1 Month, 2 Months), Extensions, and Paid Tiers
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

        {/* Modal Body */}
        <div className="p-6 space-y-6 text-xs max-h-[70vh] overflow-y-auto">
          {/* Top Actions */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-slate-900 dark:text-slate-200 text-sm">Configured License Plans</h4>
              <p className="text-slate-500 dark:text-slate-400 text-xs">
                Edit existing trial durations or add custom promotional plans
              </p>
            </div>
            {!isCreating && (
              <button
                onClick={() => {
                  setIsCreating(true);
                  setEditingId(null);
                }}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100 dark:hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-500/30 font-bold transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Custom Plan</span>
              </button>
            )}
          </div>

          {/* Create Plan Form */}
          {isCreating && (
            <form
              onSubmit={handleCreateSubmit}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-amber-500/30 space-y-3 animate-in fade-in duration-150"
            >
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <span className="font-bold text-amber-600 dark:text-amber-400">Create New Subscription / Trial Plan</span>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Plan Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TRIAL_2M"
                    value={planCode}
                    onChange={(e) => setPlanCode(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-slate-200 uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Display Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2 Months Free Trial"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Plan Category</label>
                  <select
                    value={planType}
                    onChange={(e) => setPlanType(e.target.value as PlanType)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-slate-200"
                  >
                    <option value="FREE_TRIAL">Free Trial</option>
                    <option value="PAID">Paid Plan</option>
                    <option value="EXTENSION">Extension / Grace</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Duration (Days)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={durationDays}
                    onChange={(e) => setDurationDays(Number(e.target.value))}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Price (₹)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-slate-200"
                  />
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                    className="rounded border-slate-300 text-amber-500 focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="isDefault" className="text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">
                    Set as Default Plan
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Special festive promo trial for cafes"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-slate-200"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-3 py-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-1.5 rounded-lg font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md cursor-pointer"
                >
                  Save Plan
                </button>
              </div>
            </form>
          )}

          {/* Plans List Table */}
          <div className="space-y-3">
            {plans.map((plan) => {
              const isEditing = editingId === plan.id;

              return (
                <div
                  key={plan.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    plan.isDefault
                      ? 'bg-amber-50/40 dark:bg-slate-950/80 border-amber-300 dark:border-amber-500/30'
                      : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {isEditing ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-slate-500 dark:text-slate-400 text-[10px] mb-1">Plan Name</label>
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-900 dark:text-slate-200"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-500 dark:text-slate-400 text-[10px] mb-1">
                            Duration (Days)
                          </label>
                          <input
                            type="number"
                            value={durationDays}
                            onChange={(e) => setDurationDays(Number(e.target.value))}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-900 dark:text-slate-200"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-500 dark:text-slate-400 text-[10px] mb-1">Price (₹)</label>
                          <input
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(Number(e.target.value))}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-900 dark:text-slate-200"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`def-${plan.id}`}
                            checked={isDefault}
                            onChange={(e) => setIsDefault(e.target.checked)}
                            className="rounded border-slate-300 text-amber-500 cursor-pointer"
                          />
                          <label
                            htmlFor={`def-${plan.id}`}
                            className="text-slate-700 dark:text-slate-300 text-[11px] font-semibold cursor-pointer"
                          >
                            Set as Default Onboarding Plan
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="px-2.5 py-1 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(plan.id)}
                            className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold cursor-pointer"
                          >
                            <Save className="w-3 h-3" />
                            <span>Save Changes</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center font-mono font-bold text-amber-600 dark:text-amber-400 text-xs shadow-sm">
                          {plan.durationDays}d
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-slate-900 dark:text-white text-sm">{plan.name}</span>
                            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {plan.planCode}
                            </span>
                            {plan.isDefault && (
                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-500/30">
                                <Star className="w-2.5 h-2.5 fill-amber-500" />
                                <span>Default Plan</span>
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {plan.description || `${plan.durationDays} days license validity`} •{' '}
                            {plan.price > 0 ? `₹${plan.price}` : 'Free'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Tooltip content="Edit Plan Details" position="top">
                          <button
                            onClick={() => handleStartEdit(plan)}
                            className="p-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </Tooltip>
                        {!plan.isDefault && (
                          <Tooltip content="Delete / Archive Plan" position="top">
                            <button
                              onClick={() => onRequestDeletePlan(plan)}
                              className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-transparent transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </Tooltip>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
