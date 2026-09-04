import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle, Trash2, Info } from 'lucide-react';

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}) => {
  const getIcon = () => {
    switch (variant) {
      case 'danger':
        return (
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-200 dark:border-rose-900/40">
            <Trash2 className="w-6 h-6" />
          </div>
        );
      case 'warning':
        return (
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-200 dark:border-amber-900/40">
            <AlertTriangle className="w-6 h-6" />
          </div>
        );
      default:
        return (
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-900/40">
            <Info className="w-6 h-6" />
          </div>
        );
    }
  };

  const getConfirmButtonVariant = () => {
    switch (variant) {
      case 'danger':
        return 'danger' as const;
      case 'warning':
        return 'primary' as const;
      default:
        return 'primary' as const;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="sm"
      closeOnBackdrop={!isLoading}
      footer={
        <div className="flex items-center justify-end gap-2.5 w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
            className="font-bold text-xs"
          >
            {cancelText}
          </Button>
          <Button
            variant={getConfirmButtonVariant()}
            size="sm"
            onClick={onConfirm}
            isLoading={isLoading}
            className="font-bold text-xs"
          >
            {confirmText}
          </Button>
        </div>
      }
    >
      <div className="p-4 sm:p-5 flex items-start gap-4">
        {getIcon()}
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-extrabold text-stone-900 dark:text-stone-100">
            {title}
          </h3>
          <div className="text-xs text-stone-600 dark:text-stone-400 mt-1.5 leading-relaxed">
            {message}
          </div>
        </div>
      </div>
    </Modal>
  );
};
