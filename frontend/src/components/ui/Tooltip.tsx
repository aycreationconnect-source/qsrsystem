import React, { useState } from 'react';
import { cn } from '../../lib/utils';

export interface TooltipProps {
  content: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'center' | 'end' | 'start';
  children: React.ReactNode;
  className?: string;
  wrapperClassName?: string;
  delay?: number;
  disabled?: boolean;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  position = 'top',
  align = 'center',
  children,
  className,
  wrapperClassName,
  delay = 150,
  disabled = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<number | null>(null);

  const showTooltip = () => {
    const id = window.setTimeout(() => setIsVisible(true), delay);
    setTimeoutId(id);
  };

  const hideTooltip = () => {
    if (timeoutId) clearTimeout(timeoutId);
    setIsVisible(false);
  };

  const getPositionClass = () => {
    if (position === 'top') {
      if (align === 'end') return 'bottom-full right-0 mb-2';
      if (align === 'start') return 'bottom-full left-0 mb-2';
      return 'bottom-full left-1/2 -translate-x-1/2 mb-2';
    }
    if (position === 'bottom') {
      if (align === 'end') return 'top-full right-0 mt-2';
      if (align === 'start') return 'top-full left-0 mt-2';
      return 'top-full left-1/2 -translate-x-1/2 mt-2';
    }
    if (position === 'left') return 'right-full top-1/2 -translate-y-1/2 mr-2';
    return 'left-full top-1/2 -translate-y-1/2 ml-2';
  };

  const getArrowClass = () => {
    if (position === 'top') {
      const horizontal =
        align === 'end'
          ? 'right-3'
          : align === 'start'
          ? 'left-3'
          : 'left-1/2 -translate-x-1/2';
      return `top-full ${horizontal} border-t-stone-900 dark:border-t-stone-800 border-x-transparent border-b-transparent`;
    }
    if (position === 'bottom') {
      const horizontal =
        align === 'end'
          ? 'right-3'
          : align === 'start'
          ? 'left-3'
          : 'left-1/2 -translate-x-1/2';
      return `bottom-full ${horizontal} border-b-stone-900 dark:border-b-stone-800 border-x-transparent border-t-transparent`;
    }
    if (position === 'left') {
      return 'left-full top-1/2 -translate-y-1/2 border-l-stone-900 dark:border-l-stone-800 border-y-transparent border-r-transparent';
    }
    return 'right-full top-1/2 -translate-y-1/2 border-r-stone-900 dark:border-r-stone-800 border-y-transparent border-l-transparent';
  };

  if (disabled || !content) {
    return wrapperClassName ? <div className={wrapperClassName}>{children}</div> : <>{children}</>;
  }

  return (
    <div
      className={cn('relative inline-flex items-center', wrapperClassName)}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}

      {isVisible && (
        <div
          role="tooltip"
          className={cn(
            'absolute z-[9999] px-2.5 py-1 text-xs font-semibold text-white bg-stone-900 dark:bg-stone-800 rounded-lg shadow-xl whitespace-nowrap pointer-events-none select-none',
            'animate-in fade-in zoom-in-95 duration-150',
            getPositionClass(),
            className
          )}
        >
          {content}
          <div className={cn('absolute border-4', getArrowClass())} />
        </div>
      )}
    </div>
  );
};
