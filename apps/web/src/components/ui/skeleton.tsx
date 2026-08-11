import { cn } from '@/lib/utils';

// Warm-Editorial skeleton primitive: a placeholder block that breathes between full and
// 55% opacity (skeleton-pulse, 1.6s, no shimmer). Colour is --muted (#f0e7d9 light /
// #3b3125 dark). Default radius suits a text line (9px); pass rounded-[10px]/rounded-full
// for photos/avatars, and size everything via className. Used in place of "Loading…".
export function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn('bg-muted skeleton-pulse rounded-[9px]', className)}
      {...props}
    />
  );
}
