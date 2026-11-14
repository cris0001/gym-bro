import { useState } from 'react';

import { cn } from '@/lib/utils';

import { useSessionsTranslation } from '../i18n';
import { useExerciseHistory } from '../hooks/use-exercise-history';
import { HistoryEntry } from './history-entry';

// Past sessions to load: the most recent shown up front, up to five older ones
// revealed under "More".
const HISTORY_LIMIT = 6;

interface SessionPreviousLineProps {
  exerciseId: string;
  // Only sessions strictly before this date — excludes the in-progress one.
  before?: string | undefined;
}

// The session card's "Previous" strip (phones and narrower desktops): the most recent
// past session as small set pills, with a "More" toggle that reveals up to five older
// ones (scrollable). From 1200px the side column's history cards take over.
export function SessionPreviousLine({ exerciseId, before }: SessionPreviousLineProps) {
  const [open, setOpen] = useState(false);
  const { data: entries = [], isLoading } = useExerciseHistory(exerciseId, before, HISTORY_LIMIT);
  const t = useSessionsTranslation();

  const box = 'rounded-[10px] bg-field-muted px-3 py-2';

  if (isLoading && entries.length === 0) {
    return <p className={cn(box, 'text-muted-foreground text-xs')}>{t.previous.loading}</p>;
  }
  const latest = entries[0];
  if (!latest) {
    return <p className={cn(box, 'text-muted-foreground text-xs')}>{t.previous.none}</p>;
  }
  const older = entries.slice(1);

  return (
    <div className={box}>
      <div className="flex items-start justify-between gap-3">
        <HistoryEntry entry={latest} size="sm" />
        {older.length > 0 && (
          <button
            type="button"
            className="text-primary shrink-0 text-[11px] font-bold"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? t.previous.less : t.previous.more}
          </button>
        )}
      </div>
      {open && older.length > 0 && (
        <div className="no-scrollbar border-border/60 mt-2 flex max-h-48 flex-col gap-2 overflow-y-auto border-t pt-2">
          {older.map((entry, i) => (
            <HistoryEntry key={`${entry.sessionId}-${i}`} entry={entry} size="sm" />
          ))}
        </div>
      )}
    </div>
  );
}
