import { MessageSquare } from 'lucide-react';

// A finished workout's note: a quiet card with a speech-bubble icon and serif italic text.
export function WorkoutNote({ note }: { note: string }) {
  return (
    <div className="border-border bg-field-muted flex gap-2.5 rounded-2xl border px-3.5 py-3">
      <MessageSquare className="text-faint-foreground mt-0.5 size-[15px] shrink-0" />
      <p className="font-heading text-subtle-foreground text-[14px] leading-[1.45] break-words whitespace-pre-line italic">
        {note}
      </p>
    </div>
  );
}
