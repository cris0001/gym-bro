import { MessageSquare, MessageSquareText } from 'lucide-react';

import { cn } from '@/lib/utils';

// A workout note: an outline speech-bubble icon in the primary color and muted text —
// the session's note (default) or, compact, an exercise's note inside its card, so
// both kinds of comment read the same way. `card` sets it on a soft borderless tint
// (workout detail); `plain` drops the tint, for spots already inside a card (the
// calendar's Finished entry), where a compact note sits under the exercise's sets,
// slightly indented.
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
        !plain && 'bg-field-muted gap-2.5',
        !plain && (compact ? 'rounded-xl px-3 py-2' : 'rounded-xl px-3.5 py-3'),
        plain && !compact && 'gap-2.5 pl-1',
        footnote && 'ml-1 gap-2',
      )}
    >
      <Icon
        className={cn(
          'text-primary shrink-0',
          footnote ? 'mt-0.5 size-3.5' : compact ? 'mt-0.5 size-4' : 'mt-0.5 size-[17px]',
        )}
      />
      <p
        className={cn(
          'text-subtle-foreground leading-[1.45] break-words whitespace-pre-line',
          footnote ? 'text-[12.5px]' : compact ? 'text-[13px]' : 'text-[14px]',
        )}
      >
        {note}
      </p>
    </div>
  );
}
