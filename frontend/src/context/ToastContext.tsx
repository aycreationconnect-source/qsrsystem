import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastOptions {
  title?: string;
  duration?: number; // Milliseconds, defaults to 3500ms
}

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
  duration: number;
  isExiting: boolean;
  createdAt: number;
}

export interface ToastContextType {
  toasts: ToastItem[];
  showToast: (type: ToastType, message: string, options?: ToastOptions) => string;
  dismissToast: (id: string) => void;
  success: (message: string, options?: ToastOptions) => string;
  error: (message: string, options?: ToastOptions) => string;
  warning: (message: string, options?: ToastOptions) => string;
  info: (message: string, options?: ToastOptions) => string;
}

const ToastContext = createContext<ToastContextType | null>(null);

// Module-level bridge so toast functions can also be called outside React components if needed
let globalShowToast: ((type: ToastType, message: string, options?: ToastOptions) => string) | null = null;
let globalDismissToast: ((id: string) => void) | null = null;

export const toast = {
  success: (message: string, options?: ToastOptions) => {
    if (globalShowToast) return globalShowToast('success', message, options);
    console.log('[Toast:success]', message);
    return '';
  },
  error: (message: string, options?: ToastOptions) => {
    if (globalShowToast) return globalShowToast('error', message, options);
    console.error('[Toast:error]', message);
    return '';
  },
  warning: (message: string, options?: ToastOptions) => {
    if (globalShowToast) return globalShowToast('warning', message, options);
    console.warn('[Toast:warning]', message);
    return '';
  },
  info: (message: string, options?: ToastOptions) => {
    if (globalShowToast) return globalShowToast('info', message, options);
    console.info('[Toast:info]', message);
    return '';
  },
  dismiss: (id: string) => {
    if (globalDismissToast) globalDismissToast(id);
  },
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const exitTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isExiting: true } : t))
    );

    // Wait for the exit animation (250ms) to complete before removing from state
    if (!exitTimersRef.current.has(id)) {
      const timer = setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
        exitTimersRef.current.delete(id);
      }, 250);
      exitTimersRef.current.set(id, timer);
    }
  }, []);

  const showToast = useCallback(
    (type: ToastType, message: string, options?: ToastOptions): string => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
      const duration = options?.duration ?? 3500;

      const newToast: ToastItem = {
        id,
        type,
        message,
        title: options?.title,
        duration,
        isExiting: false,
        createdAt: Date.now(),
      };

      setToasts((prev) => {
        // Limit active toasts to 4 to prevent clutter
        const active = prev.filter((t) => !t.isExiting);
        if (active.length >= 4) {
          const oldest = active[0];
          dismissToast(oldest.id);
        }
        return [...prev, newToast];
      });

      return id;
    },
    [dismissToast]
  );

  const success = useCallback((msg: string, opt?: ToastOptions) => showToast('success', msg, opt), [showToast]);
  const error = useCallback((msg: string, opt?: ToastOptions) => showToast('error', msg, opt), [showToast]);
  const warning = useCallback((msg: string, opt?: ToastOptions) => showToast('warning', msg, opt), [showToast]);
  const info = useCallback((msg: string, opt?: ToastOptions) => showToast('info', msg, opt), [showToast]);

  useEffect(() => {
    globalShowToast = showToast;
    globalDismissToast = dismissToast;
    return () => {
      globalShowToast = null;
      globalDismissToast = null;
      exitTimersRef.current.forEach((t) => clearTimeout(t));
      exitTimersRef.current.clear();
    };
  }, [showToast, dismissToast]);

  return (
    <ToastContext.Provider
      value={{
        toasts,
        showToast,
        dismissToast,
        success,
        error,
        warning,
        info,
      }}
    >
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
