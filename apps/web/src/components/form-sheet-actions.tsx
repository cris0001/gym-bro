import { Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';

interface FormSheetActionsProps {
  submitLabel: string;
  isPending: boolean;
  onCancel: () => void;
  pendingLabel?: string;
}

// Footer for a FormSheet form. Phones get one full-width submit pill (the sheet's
// grab/× already cover "cancel"); desktop gets Cancel + Submit side by side on the
// right, like a dialog. While saving the submit shows a spinner and fades.
export function FormSheetActions({
  submitLabel,
  isPending,
  onCancel,
  pendingLabel = 'Saving…',
}: FormSheetActionsProps) {
  return (
    <div className="mt-1 flex gap-2 sm:justify-end">
      <button
        type="button"
        className="hidden h-10 rounded-full border border-border bg-field px-5 text-[13px] font-semibold transition-colors hover:bg-muted sm:inline-flex sm:items-center"
        onClick={onCancel}
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={isPending}
        className={cn(
          'bg-primary text-primary-foreground hover:bg-primary-hover inline-flex h-11 w-full items-center justify-center gap-2 rounded-full px-6 text-[14px] font-semibold transition-colors sm:h-10 sm:w-auto sm:text-[13px]',
          'disabled:bg-primary/60 disabled:pointer-events-none',
        )}
      >
        {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
        {isPending ? pendingLabel : submitLabel}
      </button>
    </div>
  );
}
