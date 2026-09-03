import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Standard utility for conditionally merging Tailwind CSS classes
 * without style conflicts (used across all Shadcn-style components).
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
