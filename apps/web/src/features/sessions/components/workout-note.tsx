import { MessageSquare } from 'lucide-react';

import { cn } from '@/lib/utils';

// A workout note as a quiet card with a speech-bubble icon and serif italic text —
// the session's note (default) or, compact, an exercise's note inside its card, so
// both kinds of comment read the same way.
export function WorkoutNote({ note, compact = false }: { note: string; compact?: boolean }) {
  return (
    <div
      className={cn(
        'border-border bg-field-muted flex gap-2.5 border',
        compact ? 'rounded-xl px-3 py-2' : 'rounded-2xl px-3.5 py-3',
      )}
    >
      <MessageSquare
        className={cn(
          'text-faint-foreground shrink-0',
          compact ? 'mt-px size-[13px]' : 'mt-0.5 size-[15px]',
        )}
      />
      <p
        className={cn(
          'font-heading text-subtle-foreground leading-[1.45] break-words whitespace-pre-line italic',
          compact ? 'text-[13px]' : 'text-[14px]',
        )}
      >
        {note}
      </p>
    </div>
  );
}
