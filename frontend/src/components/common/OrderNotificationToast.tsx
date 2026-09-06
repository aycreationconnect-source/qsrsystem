import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { cafeAudio } from '../../lib/sound';
import type { Order } from '../../types/app.types';
import { getDailyOrderNumber } from '../../lib/orderUtils';
import {
  BellRing,
  X,
  CheckCircle2,
  Volume2,
} from 'lucide-react';

export const OrderNotificationToast: React.FC = () => {
  const { appData } = useApp();
  const location = useLocation();
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [timeLeftPercent, setTimeLeftPercent] = useState(100);
  const timerRef = useRef<any>(null);
  const progressRef = useRef<any>(null);

  // Sound & Popup Preferences from Settings (Defaults: sound ON, popup ON)
  const soundEnabled =
    appData.settings?.orderSoundEnabled !== 'false' &&
    appData.settings?.orderSoundEnabled !== false;
  const soundTone = appData.settings?.orderSoundTone || 'cafe-bell';
  const soundVolume = parseInt(String(appData.settings?.orderSoundVolume ?? '80'), 10) || 80;

  const popupEnabled =
    appData.settings?.orderPopupEnabled !== 'false' &&
    appData.settings?.orderPopupEnabled !== false;
  const popupDuration =
    parseInt(String(appData.settings?.orderPopupDuration ?? '4'), 10) || 4;

  const dismissToast = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (progressRef.current) clearInterval(progressRef.current);
    setActiveOrder(null);
  };

  const handleOrderNotification = (order: Order) => {
    if (!order) return;

    // STRICT CHECK: Terminal screens (/pos) must NEVER play audio chimes or display popup toasts.
    // Audio alerts and toasts are dedicated to Admin Panel / Dashboard users only.
    const currentPath = window.location.pathname;
    if (currentPath.startsWith('/pos')) {
      return;
    }

    // 1. Play cafe-friendly 3s - 5s chime bell if enabled
    if (soundEnabled) {
      cafeAudio.play(soundTone, soundVolume);
    }

    // 2. Show onscreen popup toast if enabled
    if (popupEnabled) {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressRef.current) clearInterval(progressRef.current);

      setActiveOrder(order);
      setTimeLeftPercent(100);

      const durationMs = popupDuration * 1000;
      const intervalMs = 50;
      const step = (intervalMs / durationMs) * 100;

      progressRef.current = setInterval(() => {
        setTimeLeftPercent((prev) => {
          if (prev <= 0) {
            clearInterval(progressRef.current);
            return 0;
          }
          return Math.max(0, prev - step);
        });
      }, intervalMs);

      timerRef.current = setTimeout(() => {
        setActiveOrder(null);
      }, durationMs);
    }
  };

  // Listen to custom 'velora-order-completed' events dispatched on order completion
  useEffect(() => {
    const onOrderCompleted = (e: CustomEvent<Order>) => {
      if (e.detail) {
        handleOrderNotification(e.detail);
      }
    };

    window.addEventListener('velora-order-completed' as any, onOrderCompleted as EventListener);
    return () => {
      window.removeEventListener('velora-order-completed' as any, onOrderCompleted as EventListener);
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [soundEnabled, soundTone, soundVolume, popupEnabled, popupDuration]);

  if (!activeOrder || location.pathname.startsWith('/pos')) return null;

  const itemCount =
    activeOrder.items?.reduce((sum, it) => sum + (it.quantity || 1), 0) || 1;

  let itemsPreview = '';
  if (activeOrder.items && activeOrder.items.length > 0) {
    const names = activeOrder.items.map(
      (it: any) => `${it.quantity || 1}x ${it.menuItem?.name || it.name || 'Item'}`
    );
    itemsPreview = names.length > 2 ? `${names.slice(0, 2).join(', ')} +more` : names.join(', ');
  }

  return (
    <div
      role="alert"
      className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50 w-88 sm:w-96 rounded-3xl bg-white dark:bg-stone-900 border border-emerald-500/30 dark:border-emerald-500/20 shadow-2xl shadow-emerald-500/10 p-4 overflow-hidden animate-in slide-in-from-top-4 fade-in duration-200"
    >
      <div className="flex items-start gap-3">
        {/* Animated Bell & Chime Icon */}
        <div className="relative shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
            <BellRing className="w-5 h-5 animate-bounce" />
          </div>
          {soundEnabled && (
            <span className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-amber-500 text-stone-950 shadow-xs" title="Chime Played">
              <Volume2 className="w-2.5 h-2.5 stroke-[2.5]" />
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                New Order Completed
              </span>
            </div>

            <button
              type="button"
              onClick={dismissToast}
              className="p-1 rounded-xl text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-1 flex items-baseline justify-between gap-2">
            <h4 className="text-sm font-extrabold text-stone-900 dark:text-stone-100">
              Order #{activeOrder.dailyOrderNumber || getDailyOrderNumber(activeOrder, appData.orders || [])}
            </h4>
            <span className="text-base font-black font-mono text-emerald-600 dark:text-emerald-400">
              ₹{parseFloat(String(activeOrder.total || 0)).toFixed(2)}
            </span>
          </div>

          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 truncate">
            {itemsPreview || `${itemCount} item${itemCount > 1 ? 's' : ''}`}
          </p>

          <div className="flex items-center gap-2 mt-2 text-[10px] text-stone-500">
            <span className="px-1.5 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 font-semibold text-stone-700 dark:text-stone-300">
              {activeOrder.paymentMethod || 'Cash'}
            </span>
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
              <CheckCircle2 className="w-3 h-3" />
              <span>{activeOrder.status || 'Completed'}</span>
            </span>
            <span className="ml-auto text-stone-400 font-mono">
              Auto-dismiss ({popupDuration}s)
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-stone-100 dark:bg-stone-800">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 to-amber-500 transition-all duration-75 ease-linear"
          style={{ width: `${timeLeftPercent}%` }}
        />
      </div>
    </div>
  );
};
