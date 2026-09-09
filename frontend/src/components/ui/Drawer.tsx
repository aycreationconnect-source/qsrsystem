import React, { useEffect } from 'react';
import { cn } from '../../lib/utils';
import { X } from 'lucide-react';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  side?: 'left' | 'right' | 'bottom';
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  hideHeader?: boolean;
  contentClassName?: string;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  side = 'right',
  children,
  footer,
  className,
  hideHeader = false,
  contentClassName,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sideClasses = {
    right: 'inset-y-0 right-0 max-w-md w-full rounded-l-3xl border-l',
    left: 'inset-y-0 left-0 max-w-md w-full rounded-r-3xl border-r',
    bottom: 'inset-x-0 bottom-0 max-h-[85vh] w-full rounded-t-3xl border-t',
  };

  return (
    <div className="fixed inset-0 z-50 flex overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div
        className={cn(
          'fixed z-50 bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 shadow-2xl flex flex-col',
          sideClasses[side],
          className
        )}
      >
        {/* Mobile bottom pill */}
        {side === 'bottom' && (
          <div className="w-12 h-1.5 bg-stone-300 dark:bg-stone-700 rounded-full mx-auto mt-3 mb-1" />
        )}

        {/* Header */}
        {!hideHeader && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 dark:border-stone-800/80">
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">{title}</h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className={cn('flex-1 overflow-y-auto', contentClassName || 'p-6')}>{children}</div>

        {/* Footer */}
        {footer && (
          <div className="p-4 bg-stone-50 dark:bg-stone-900/60 border-t border-stone-100 dark:border-stone-800/80">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
