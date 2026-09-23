import { Trash2 } from 'lucide-react';
import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

// The app-wide "Delete …" action as a quiet pill: red text + icon on a transparent
// ground, tinted on hover. Full red is reserved for the confirm dialog, so this never
// reads as the loud option on a screen.
export function DeleteButton({ className, children, ...props }: ComponentProps<'button'>) {
  return (
    <button
      type="button"
      className={cn(
        'text-destructive inline-flex h-[38px] items-center gap-[7px] rounded-full px-3.5 text-[13px] font-semibold transition-colors duration-150 ease-in-out outline-none',
        'hover:bg-destructive-tint hover:text-destructive-hover active:bg-destructive-tint-2',
        'focus-visible:ring-destructive/35 focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-destructive/40',
        'disabled:pointer-events-none disabled:opacity-45',
        className,
      )}
      {...props}
    >
      <Trash2 className="size-[15px]" strokeWidth={2} />
      {children}
    </button>
  );
}
