import { Trash2 } from 'lucide-react';
import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

// Icon-only delete for list rows and card headers: grey at rest (so a list of rows
// isn't a column of red), red on a soft tint when hovered. The visual box is 32×32;
// a ::before pad extends the touch target to 44×44 without changing the layout.
export function DeleteIconButton({ className, ...props }: ComponentProps<'button'>) {
  return (
    <button
      type="button"
      className={cn(
        "text-destructive-rest relative inline-flex size-8 shrink-0 items-center justify-center rounded-[10px] transition-colors duration-150 ease-in-out outline-none before:absolute before:-inset-1.5 before:content-['']",
        'hover:bg-destructive-tint hover:text-destructive active:bg-destructive-tint-2',
        'focus-visible:ring-destructive/35 focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-destructive/40',
        'disabled:pointer-events-none disabled:opacity-45',
        className,
      )}
      {...props}
    >
      <Trash2 className="size-[15px]" strokeWidth={2} />
    </button>
  );
}
