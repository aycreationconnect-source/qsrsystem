import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | 'default'
    | 'brand'
    | 'veg'
    | 'nonveg'
    | 'egg'
    | 'drink'
    | 'success'
    | 'warning'
    | 'danger'
    | 'outline';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  size = 'md',
  children,
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center font-bold tracking-wide rounded-lg select-none whitespace-nowrap';

  const variants = {
    default:
      'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300 border border-stone-200 dark:border-stone-700',
    brand:
      'bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300/80 dark:border-amber-700/50',
    veg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/60',
    nonveg:
      'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-300 dark:border-rose-800/60',
    egg: 'bg-yellow-50 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-400 border border-yellow-300 dark:border-yellow-800/60',
    drink:
      'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400 border border-sky-300 dark:border-sky-800/60',
    success:
      'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800',
    warning:
      'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800',
    danger:
      'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-800',
    outline:
      'bg-transparent border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300',
  };

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  };

  return (
    <span className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {variant === 'veg' && <span className="badge-diet-veg shrink-0" />}
      {variant === 'nonveg' && <span className="badge-diet-nonveg shrink-0" />}
      {children}
    </span>
  );
};
