import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useToast, type ToastItem } from '../../context/ToastContext';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ToastCardProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

const ToastCard: React.FC<ToastCardProps> = ({ toast, onDismiss }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [percentRemaining, setPercentRemaining] = useState(100);

  const duration = toast.duration;
  const startTimeRef = useRef<number>(Date.now());
  const elapsedRef = useRef<number>(0);

  // Trigger Tailwind CSS entrance animation after mount
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setIsMounted(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  // Countdown timer with pause on hover
  useEffect(() => {
    if (toast.isExiting) return;

    const intervalTime = 40;
    const interval = setInterval(() => {
      if (isPaused) {
        // Shift start time so paused duration doesn't consume countdown
        startTimeRef.current = Date.now() - elapsedRef.current;
        return;
      }

      elapsedRef.current = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, 100 - (elapsedRef.current / duration) * 100);
      setPercentRemaining(remaining);

      if (elapsedRef.current >= duration) {
        clearInterval(interval);
        onDismiss(toast.id);
      }
    }, intervalTime);

    return () => clearInterval(interval);
  }, [duration, isPaused, onDismiss, toast.id, toast.isExiting]);

  // Visual configuration by Toast type using pure Tailwind CSS
  const config = {
    success: {
      cardBorder: 'border-emerald-500/40 dark:border-emerald-500/30',
      cardShadow: 'shadow-emerald-500/10',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />,
      badgeBg: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30',
      progressBarBg: 'bg-emerald-500 dark:bg-emerald-400',
      defaultTitle: 'Success',
    },
    error: {
      cardBorder: 'border-rose-500/40 dark:border-rose-500/30',
      cardShadow: 'shadow-rose-500/10',
      icon: <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />,
      badgeBg: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30',
      progressBarBg: 'bg-rose-500 dark:bg-rose-400',
      defaultTitle: 'Error',
    },
    warning: {
      cardBorder: 'border-amber-500/40 dark:border-amber-500/30',
      cardShadow: 'shadow-amber-500/10',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />,
      badgeBg: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30',
      progressBarBg: 'bg-amber-500 dark:bg-amber-400',
      defaultTitle: 'Notice',
    },
    info: {
      cardBorder: 'border-sky-500/40 dark:border-sky-500/30',
      cardShadow: 'shadow-sky-500/10',
      icon: <Info className="w-5 h-5 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />,
      badgeBg: 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/30',
      progressBarBg: 'bg-sky-500 dark:bg-sky-400',
      defaultTitle: 'Info',
    },
  }[toast.type];

  const title = toast.title || config.defaultTitle;

  return (
    <div
      onClick={() => onDismiss(toast.id)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="alert"
      aria-live="polite"
      className={cn(
        // Click to close & layout
        'group relative w-full rounded-2xl bg-white/95 dark:bg-stone-900/95 backdrop-blur-md shadow-2xl border pointer-events-auto cursor-pointer select-none overflow-hidden',
        'hover:scale-[1.01] active:scale-[0.99] transition-transform duration-150',
        config.cardBorder,
        config.cardShadow,
        // Pure Tailwind CSS Transition (mount and exit)
        'transition-all duration-300 ease-out transform',
        !isMounted || toast.isExiting
          ? 'opacity-0 translate-x-10 scale-95'
          : 'opacity-100 translate-x-0 scale-100'
      )}
    >
      <div className="p-3.5 sm:p-4 flex items-start gap-3">
        {/* Left Status Icon */}
        <div className="shrink-0">{config.icon}</div>

        {/* Text Content */}
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs font-black tracking-wide text-stone-900 dark:text-stone-100">
              {title}
            </span>
            <span className={cn('text-[10px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-wider', config.badgeBg)}>
              {toast.type}
            </span>
          </div>

          <p className="text-xs text-stone-600 dark:text-stone-300 font-medium leading-relaxed break-words">
            {toast.message}
          </p>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDismiss(toast.id);
          }}
          className="shrink-0 p-1 -mr-1 -mt-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          aria-label="Dismiss notification"
          title="Click to dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Bar indicating countdown */}
      <div className="w-full bg-stone-100/60 dark:bg-stone-800/60 h-1 overflow-hidden">
        <div
          className={cn('h-full transition-all duration-75 ease-linear', config.progressBarBg)}
          style={{ width: `${percentRemaining}%` }}
        />
      </div>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useToast();

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      aria-label="Notifications"
      className="fixed top-4 right-4 sm:top-5 sm:right-5 z-[200] flex flex-col gap-2.5 max-w-sm sm:max-w-md w-full px-3 sm:px-0 pointer-events-none"
    >
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} onDismiss={dismissToast} />
      ))}
    </div>,
    document.body
  );
};
