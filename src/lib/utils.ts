/**
 * cn — class name utility (shadcn/ui standard helper)
 *
 * Merges Tailwind class names intelligently using clsx + tailwind-merge
 * so conflicting utility classes are resolved correctly.
 *
 * Usage:
 *   cn('px-4 py-2', condition && 'bg-accent', 'px-6') → 'py-2 bg-accent px-6'
 */
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
