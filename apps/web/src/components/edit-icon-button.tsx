import { Pencil } from 'lucide-react';
import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

// Shape shared with DeleteIconButton (32×32, radius 10, 44×44 touch pad) but amber on
// hover instead of red — the same gold as ratings, so edit never reads as primary or
// destructive. Exported so a <label> wrapping a native picker can wear it.
export const EDIT_ICON_BUTTON_CLASS = cn(
  "text-muted-foreground relative inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-[10px] transition-colors duration-150 ease-in-out outline-none before:absolute before:-inset-1.5 before:content-['']",
  'hover:bg-[#f8eed9] hover:text-[#a37622] active:bg-[#f1e2c2] dark:hover:bg-[#3a3122] dark:hover:text-[#e0b965] dark:active:bg-[#453a28]',
  'focus-visible:ring-2 focus-visible:ring-[#d9a441]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-within:ring-2 focus-within:ring-[#d9a441]/40',
  'disabled:pointer-events-none disabled:opacity-45',
);

// Icon-only edit for rows and card footers — the amber counterpart of DeleteIconButton.
export function EditIconButton({ className, ...props }: ComponentProps<'button'>) {
  return (
    <button type="button" className={cn(EDIT_ICON_BUTTON_CLASS, className)} {...props}>
      <Pencil className="size-[15px]" strokeWidth={2} />
    </button>
  );
}
