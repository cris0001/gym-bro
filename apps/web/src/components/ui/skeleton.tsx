import { cn } from '@/lib/utils';

// shadcn "skeleton" primitive: a pulsing muted placeholder block sized by className.
// Used for loading states in place of plain "Loading…" text.
export function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn('bg-muted animate-pulse rounded-md', className)}
      {...props}
    />
  );
}
