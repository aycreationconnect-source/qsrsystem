import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
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
  usePortal?: boolean;
  offset?: number;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  position = 'top',
  align = 'center',
  children,
  className,
  wrapperClassName,
  delay = 120,
  disabled = false,
  usePortal = true,
  offset = 8,
}) => {
  const triggerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; transform: string } | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();

    if (rect.width === 0 && rect.height === 0) {
      setIsVisible(false);
      return;
    }

    const gap = offset;
    let top = 0;
    let left = 0;
    let transform = '';

    if (position === 'top') {
      top = rect.top - gap;
      if (align === 'start') {
        left = rect.left;
        transform = 'translateY(-100%)';
      } else if (align === 'end') {
        left = rect.right;
        transform = 'translate(-100%, -100%)';
      } else {
        left = rect.left + rect.width / 2;
        transform = 'translate(-50%, -100%)';
      }
    } else if (position === 'bottom') {
      top = rect.bottom + gap;
      if (align === 'start') {
        left = rect.left;
        transform = '';
      } else if (align === 'end') {
        left = rect.right;
        transform = 'translateX(-100%)';
      } else {
        left = rect.left + rect.width / 2;
        transform = 'translateX(-50%)';
      }
    } else if (position === 'left') {
      left = rect.left - gap;
      if (align === 'start') {
        top = rect.top;
        transform = 'translateX(-100%)';
      } else if (align === 'end') {
        top = rect.bottom;
        transform = 'translate(-100%, -100%)';
      } else {
        top = rect.top + rect.height / 2;
        transform = 'translate(-100%, -50%)';
      }
    } else {
      // position === 'right'
      left = rect.right + gap;
      if (align === 'start') {
        top = rect.top;
        transform = '';
      } else if (align === 'end') {
        top = rect.bottom;
        transform = 'translateY(-100%)';
      } else {
        top = rect.top + rect.height / 2;
        transform = 'translateY(-50%)';
      }
    }

    setCoords({ top, left, transform });
  }, [position, align, offset]);

  const showTooltip = () => {
    if (disabled || !content) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      updatePosition();
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (disabled || !content) {
      setIsVisible(false);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }
  }, [disabled, content]);

  useEffect(() => {
    if (!isVisible) return;
    updatePosition();

    const handleScrollOrResize = () => {
      updatePosition();
    };

    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isVisible, updatePosition]);

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
      return `top-full ${horizontal} border-t-stone-900 dark:border-t-stone-800 border-x-transparent border-b-0`;
    }
    if (position === 'bottom') {
      const horizontal =
        align === 'end'
          ? 'right-3'
          : align === 'start'
          ? 'left-3'
          : 'left-1/2 -translate-x-1/2';
      return `bottom-full ${horizontal} border-b-stone-900 dark:border-b-stone-800 border-x-transparent border-t-0`;
    }
    if (position === 'left') {
      return 'left-full top-1/2 -translate-y-1/2 border-l-stone-900 dark:border-l-stone-800 border-y-transparent border-r-0';
    }
    return 'right-full top-1/2 -translate-y-1/2 border-r-stone-900 dark:border-r-stone-800 border-y-transparent border-l-0';
  };

  if (disabled || !content) {
    return wrapperClassName ? <div className={wrapperClassName}>{children}</div> : <>{children}</>;
  }

  return (
    <div
      ref={triggerRef}
      className={cn('relative inline-flex items-center', wrapperClassName)}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
      onClick={hideTooltip}
    >
      {children}

      {isVisible &&
        (usePortal ? (
          coords &&
          createPortal(
            <div
              role="tooltip"
              style={{
                position: 'fixed',
                top: `${coords.top}px`,
                left: `${coords.left}px`,
                transform: coords.transform,
                zIndex: 99999,
              }}
              className={cn(
                'px-2.5 py-1 text-xs font-semibold text-white bg-stone-900 dark:bg-stone-800 rounded-lg shadow-xl whitespace-nowrap pointer-events-none select-none tracking-wide',
                'animate-in fade-in zoom-in-95 duration-150',
                className
              )}
            >
              {content}
              <div className={cn('absolute w-0 h-0 border-[5px]', getArrowClass())} />
            </div>,
            document.body
          )
        ) : (
          <div
            role="tooltip"
            className={cn(
              'absolute z-[9999] px-2.5 py-1 text-xs font-semibold text-white bg-stone-900 dark:bg-stone-800 rounded-lg shadow-xl whitespace-nowrap pointer-events-none select-none tracking-wide',
              'animate-in fade-in zoom-in-95 duration-150',
              getPositionClass(),
              className
            )}
          >
            {content}
            <div className={cn('absolute w-0 h-0 border-[5px]', getArrowClass())} />
          </div>
        ))}
    </div>
  );
};
