import React, { useEffect } from 'react';
import { cn } from '../../lib/utils';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  className?: string;
  closeOnBackdrop?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = 'md',
  className,
  closeOnBackdrop = true,
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

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-[95vw]',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-950/60 backdrop-blur-sm transition-opacity"
        onClick={() => closeOnBackdrop && onClose()}
      />

      {/* Modal Dialog Card (Bottom sheet on mobile xs, Centered card on tablet/desktop) */}
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'relative w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl z-10 overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[85vh]',
          'rounded-t-3xl sm:rounded-2xl', // Mobile bottom sheet rounded top
          maxWidthClasses[maxWidth],
          className
        )}
      >
        {/* Mobile Drag Pill Indicator */}
        <div className="sm:hidden w-12 h-1.5 bg-stone-300 dark:bg-stone-700 rounded-full mx-auto mt-3 mb-1" />

        {/* Modal Header */}
        {(title || description) && (
          <div className="flex items-start justify-between px-6 pt-4 sm:pt-6 pb-4 border-b border-stone-100 dark:border-stone-800/80">
            <div>
              {title && (
                <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 leading-snug">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">{description}</p>
              )}
            </div>

            <button
              onClick={onClose}
              className="p-1.5 -mr-1.5 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>

        {/* Modal Footer */}
        {footer && (
          <div className="px-6 py-4 bg-stone-50 dark:bg-stone-900/50 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-end gap-2.5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
