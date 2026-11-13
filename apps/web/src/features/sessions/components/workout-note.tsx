import { MessageSquare, MessageSquareText } from 'lucide-react';

import { cn } from '@/lib/utils';

// A workout note: a speech-bubble icon and serif italic text — the session's note
// (default) or, compact, an exercise's note inside its card, so both kinds of comment
// read the same way. `card` frames it as a quiet card (workout detail); `plain` drops
// the frame, for spots already inside a card (the calendar's Finished entry). There a
// compact note sits under the exercise's sets, slightly indented, with a stronger
// accent-tinted icon so it still stands out without a card behind it.
export function WorkoutNote({
  note,
  compact = false,
  variant = 'card',
}: {
  note: string;
  compact?: boolean;
  variant?: 'card' | 'plain';
}) {
  const plain = variant === 'plain';
  const footnote = plain && compact;
  const Icon = footnote ? MessageSquareText : MessageSquare;

  return (
    <div
      className={cn(
        'flex',
        !plain && 'border-border bg-field-muted gap-2.5 border',
        !plain && (compact ? 'rounded-xl px-3 py-2' : 'rounded-2xl px-3.5 py-3'),
        plain && !compact && 'gap-2.5 pl-1',
        footnote && 'ml-1 gap-2',
      )}
    >
      <Icon
        className={cn(
          'shrink-0',
          footnote
            ? 'text-primary mt-0.5 size-3.5'
            : plain
              ? 'text-muted-foreground mt-0.5 size-[15px]'
              : cn('text-faint-foreground', compact ? 'mt-px size-[13px]' : 'mt-0.5 size-[15px]'),
        )}
      />
      <p
        className={cn(
          'font-heading text-subtle-foreground leading-[1.45] break-words whitespace-pre-line italic',
          footnote ? 'text-[12.5px]' : compact ? 'text-[13px]' : 'text-[14px]',
        )}
      >
        {note}
      </p>
    </div>
  );
}
