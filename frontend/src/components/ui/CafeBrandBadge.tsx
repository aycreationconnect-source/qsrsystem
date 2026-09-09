import React from 'react';
import { cn } from '../../lib/utils';

export interface CafeBrandBadgeProps {
  name: string;
  cafeCode?: string;
  logoUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
  showCode?: boolean;
  showStatusDot?: boolean;
  showName?: boolean;
  className?: string;
}

export const CafeBrandBadge: React.FC<CafeBrandBadgeProps> = ({
  name,
  cafeCode,
  logoUrl,
  size = 'md',
  showCode = true,
  showStatusDot = true,
  showName = true,
  className,
}) => {
  // Generate 2-letter monogram (e.g. "Mocha Bliss Cafe" => "MB", "The Urban Bistro" => "UB")
  const getInitials = (str: string): string => {
    if (!str) return 'CF';
    const words = str
      .trim()
      .split(/\s+/)
      .filter((w) => !['the', 'and', '&'].includes(w.toLowerCase()));

    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return str.substring(0, 2).toUpperCase();
  };

  const initials = getInitials(name || 'Velora Cafe');

  const avatarSizes = {
    sm: 'w-7 h-7 text-xs rounded-lg',
    md: 'w-10 h-10 text-sm rounded-xl',
    lg: 'w-12 h-12 text-base rounded-2xl',
  };

  const nameSizes = {
    sm: 'text-xs',
    md: 'text-sm font-bold',
    lg: 'text-base font-extrabold',
  };

  return (
    <div className={cn('flex items-center gap-2.5 select-none', className)}>
      {/* Logo Image OR Monogram Badge */}
      <div className="relative shrink-0">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={name}
            className={cn(
              'object-cover border border-amber-500/30 shadow-sm',
              avatarSizes[size]
            )}
            onError={(e) => {
              // fallback if image link fails
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        ) : (
          <div
            className={cn(
              'flex items-center justify-center font-extrabold tracking-wider',
              'bg-gradient-to-br from-amber-500 to-amber-600 text-stone-950 shadow-sm shadow-amber-500/20 border border-amber-400/40',
              avatarSizes[size]
            )}
          >
            {initials}
          </div>
        )}

        {/* Live Active Status Indicator Dot */}
        {showStatusDot && (
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-stone-900" />
        )}
      </div>

      {/* Name and Cafe ID details */}
      {showName && (
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                'truncate font-bold text-stone-900 dark:text-stone-100 leading-tight',
                nameSizes[size]
              )}
            >
              {name || 'Velora Cafe'}
            </span>
          </div>

          {showCode && cafeCode && (
            <span className="text-[10px] font-mono font-semibold text-amber-600 dark:text-amber-400/90 tracking-wide mt-0.5">
              {cafeCode}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
