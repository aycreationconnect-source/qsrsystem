import React, { useState, useRef, useEffect } from 'react';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';
export type TooltipAlign = 'center' | 'start' | 'end' | 'left' | 'right';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: TooltipPosition;
  align?: TooltipAlign;
  delay?: number;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  align = 'center',
  delay = 100,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Compute position and alignment classes
  const getPositionClasses = () => {
    const isEnd = align === 'end' || align === 'right';
    const isStart = align === 'start' || align === 'left';

    switch (position) {
      case 'top':
        if (isEnd) return 'bottom-full right-0 mb-2';
        if (isStart) return 'bottom-full left-0 mb-2';
        return 'bottom-full left-1/2 -translate-x-1/2 mb-2';

      case 'bottom':
        if (isEnd) return 'top-full right-0 mt-2';
        if (isStart) return 'top-full left-0 mt-2';
        return 'top-full left-1/2 -translate-x-1/2 mt-2';

      case 'left':
        return 'right-full top-1/2 -translate-y-1/2 mr-2';

      case 'right':
        return 'left-full top-1/2 -translate-y-1/2 ml-2';

      default:
        return 'bottom-full left-1/2 -translate-x-1/2 mb-2';
    }
  };

  // Compute arrow position classes
  const getArrowClasses = () => {
    const isEnd = align === 'end' || align === 'right';
    const isStart = align === 'start' || align === 'left';

    switch (position) {
      case 'top':
        if (isEnd) {
          return 'top-full right-3 border-t-slate-800 border-x-transparent border-b-transparent border-t-[5px] border-x-[5px] border-b-0';
        }
        if (isStart) {
          return 'top-full left-3 border-t-slate-800 border-x-transparent border-b-transparent border-t-[5px] border-x-[5px] border-b-0';
        }
        return 'top-full left-1/2 -translate-x-1/2 border-t-slate-800 border-x-transparent border-b-transparent border-t-[5px] border-x-[5px] border-b-0';

      case 'bottom':
        if (isEnd) {
          return 'bottom-full right-3 border-b-slate-800 border-x-transparent border-t-transparent border-b-[5px] border-x-[5px] border-t-0';
        }
        if (isStart) {
          return 'bottom-full left-3 border-b-slate-800 border-x-transparent border-t-transparent border-b-[5px] border-x-[5px] border-t-0';
        }
        return 'bottom-full left-1/2 -translate-x-1/2 border-b-slate-800 border-x-transparent border-t-transparent border-b-[5px] border-x-[5px] border-t-0';

      case 'left':
        return 'left-full top-1/2 -translate-y-1/2 border-l-slate-800 border-y-transparent border-r-transparent border-l-[5px] border-y-[5px] border-r-0';

      case 'right':
        return 'right-full top-1/2 -translate-y-1/2 border-r-slate-800 border-y-transparent border-l-transparent border-r-[5px] border-y-[5px] border-l-0';

      default:
        return 'top-full left-1/2 -translate-x-1/2 border-t-slate-800 border-x-transparent border-b-transparent border-t-[5px] border-x-[5px] border-b-0';
    }
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}

      {isVisible && content && (
        <div
          role="tooltip"
          className={`absolute z-50 pointer-events-none transition-all duration-150 ease-out transform ${getPositionClasses()}`}
        >
          <div className="bg-slate-900/95 backdrop-blur-md text-slate-200 text-[11px] font-medium tracking-wide px-2.5 py-1 rounded-lg border border-slate-700/80 shadow-2xl shadow-black/80 whitespace-nowrap animate-in fade-in zoom-in-95 duration-100">
            {content}
          </div>
          {/* Subtle Arrow */}
          <div className={`absolute w-0 h-0 ${getArrowClasses()}`} />
        </div>
      )}
    </div>
  );
};
