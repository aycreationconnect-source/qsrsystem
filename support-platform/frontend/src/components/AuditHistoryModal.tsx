import React from 'react';
import { X, History, Calendar, User } from 'lucide-react';
import { CafeMaster } from '../types';

interface AuditHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  cafe: CafeMaster | null;
}

export const AuditHistoryModal: React.FC<AuditHistoryModalProps> = ({ isOpen, onClose, cafe }) => {
  if (!isOpen || !cafe) return null;

  const histories = cafe.licenseHistories || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl my-8 transition-colors duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">License Audit Trail</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Complete timeline of activations & renewals for {cafe.businessName} ({cafe.cafeCode})
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

        {/* Content */}
        <div className="p-6 space-y-4 text-xs max-h-[65vh] overflow-y-auto">
          {histories.length === 0 ? (
            <div className="text-center py-8 text-slate-400">No previous audit records found.</div>
          ) : (
            <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              {histories.map((item, idx) => {
                const createdAtFormatted = new Date(item.createdAt).toLocaleString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });
                const expiryFormatted = new Date(item.newExpiry).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                });

                return (
                  <div key={item.id || idx} className="relative flex items-start space-x-4 pl-8">
                    <div className="absolute left-2 top-2 -translate-x-1/2 w-3 h-3 rounded-full bg-amber-500 ring-4 ring-white dark:ring-slate-900" />
                    <div className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide text-[11px]">
                            {item.action.replace(/_/g, ' ')}
                          </span>
                          {item.plan && (
                            <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-slate-800 text-amber-800 dark:text-amber-300 text-[10px] font-semibold border border-amber-200 dark:border-transparent">
                              {item.plan.name}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">{createdAtFormatted}</span>
                      </div>

                      <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                          <span>New Expiry: <strong className="text-slate-900 dark:text-white">{expiryFormatted}</strong></span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <User className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                          <span>Issued by: {item.issuedByAdmin}</span>
                        </div>
                      </div>

                      {item.notes && (
                        <div className="mt-2 text-slate-600 dark:text-slate-400 italic text-[11px] bg-white dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800/50">
                          "{item.notes}"
                        </div>
                      )}

                      <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-800/60 font-mono text-[10px] text-slate-400 dark:text-slate-500 break-all">
                        Key: {item.issuedLicenseKey}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
