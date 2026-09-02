import React, { useState } from 'react';
import { X, Copy, Check, MessageSquare, ExternalLink, KeyRound } from 'lucide-react';
import { CafeMaster } from '../types';

interface WhatsAppCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  cafe: CafeMaster | null;
  whatsappMessage?: string;
  licenseKey?: string;
}

export const WhatsAppCardModal: React.FC<WhatsAppCardModalProps> = ({
  isOpen,
  onClose,
  cafe,
  whatsappMessage,
  licenseKey,
}) => {
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  if (!isOpen || !cafe) return null;

  const keyToDisplay = licenseKey || cafe.currentLicenseKey;
  const messageToDisplay = whatsappMessage || cafe.whatsappMessage || '';

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(messageToDisplay);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2500);
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(keyToDisplay);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2500);
  };

  const cleanPhone = cafe.ownerPhone.replace(/[^0-9]/g, '');
  const waLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageToDisplay)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl my-8 transition-colors duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Onboarding & License Key Card</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Send activation key & setup instructions to {cafe.ownerName}
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
        <div className="p-6 space-y-4 text-xs">
          {/* Quick License Key Card */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-slate-700 dark:text-slate-300 font-bold flex items-center space-x-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                <span>Signed Offline License Key</span>
              </span>
              <button
                onClick={handleCopyKey}
                className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-[11px] font-semibold transition-all cursor-pointer"
              >
                {copiedKey ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey ? 'Copied!' : 'Copy Key'}</span>
              </button>
            </div>
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 font-mono text-[11px] text-amber-700 dark:text-amber-300 break-all select-all shadow-inner">
              {keyToDisplay}
            </div>
          </div>

          {/* Preformatted WhatsApp Message Preview */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-slate-700 dark:text-slate-300 font-bold flex items-center space-x-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Pre-Formatted WhatsApp Message</span>
              </span>
              <span className="text-[10px] text-slate-400">Ready to dispatch</span>
            </div>
            <pre className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 font-sans text-xs text-slate-800 dark:text-slate-300 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
              {messageToDisplay}
            </pre>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs transition-all cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Open in WhatsApp Web</span>
            </a>

            <button
              onClick={handleCopyMessage}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 shadow-lg shadow-emerald-500/20 active:scale-95 cursor-pointer"
            >
              {copiedMessage ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedMessage ? 'Copied to Clipboard!' : 'Copy WhatsApp Message'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
