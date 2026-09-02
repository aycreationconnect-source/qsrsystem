import React, { useState } from 'react';
import { X, AlertTriangle, LucideIcon } from 'lucide-react';

export type ModalVariant = 'danger' | 'warning' | 'primary' | 'success';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => Promise<void> | void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ModalVariant;
  icon?: LucideIcon;
  showReasonInput?: boolean;
  reasonPlaceholder?: string;
  isLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  icon: Icon = AlertTriangle,
  showReasonInput = false,
  reasonPlaceholder = 'Enter reason or admin note (optional)...',
  isLoading = false,
}) => {
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      iconBg: 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400',
      buttonBg: 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-red-500/20',
      accentColor: 'text-red-600 dark:text-red-400',
    },
    warning: {
      iconBg: 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30 text-amber-600 dark:text-amber-400',
      buttonBg: 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold shadow-orange-500/20',
      accentColor: 'text-amber-600 dark:text-amber-400',
    },
    primary: {
      iconBg: 'bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/30 text-purple-600 dark:text-purple-400',
      buttonBg: 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-500/20',
      accentColor: 'text-purple-600 dark:text-purple-400',
    },
    success: {
      iconBg: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400',
      buttonBg: 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold shadow-emerald-500/20',
      accentColor: 'text-emerald-600 dark:text-emerald-400',
    },
  };

  const currentStyle = variantStyles[variant];

  const handleConfirm = async () => {
    await onConfirm(reason);
    setReason('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl scale-in-95 duration-150 transition-colors duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${currentStyle.iconBg}`}>
              <Icon className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{message}</p>

          {showReasonInput && (
            <div>
              <label className="block text-slate-600 dark:text-slate-400 text-[11px] font-semibold mb-1">
                Reason / Admin Note
              </label>
              <textarea
                rows={2}
                placeholder={reasonPlaceholder}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40 placeholder-slate-400 resize-none"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-end space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isLoading}
              className={`px-4 py-2.5 text-xs font-bold rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 cursor-pointer ${currentStyle.buttonBg}`}
            >
              {isLoading ? 'Processing...' : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
