import { format, parseISO } from 'date-fns';
import { Fragment, useState } from 'react';

import type { ExerciseHistoryEntry } from '@gym-bro/shared';

import { cn } from '@/lib/utils';

import { useSessionsTranslation } from '../i18n';
import { useExerciseHistory } from '../hooks/use-exercise-history';

// Past sessions to load: the most recent shown inline, up to five older ones
// revealed under "More".
const HISTORY_LIMIT = 6;

// One set in the compact summary, e.g. "100 × 8 @2" (weight × reps, optional RIR).
// A null weight is bodyweight; a top set is starred and plum-tinted.
function SetSummary({ set }: { set: ExerciseHistoryEntry['sets'][number] }) {
  const weight = set.weight ?? 'BW';
  const rir = set.rir === null ? '' : ` @${set.rir}`;
  const text = `${weight} × ${set.reps ?? '–'}${rir}`;
  return set.isTopSet ? (
    <span className="font-semibold text-[#75394c] dark:text-[#f0bccb]">★ {text}</span>
  ) : (
    <span>{text}</span>
  );
}

// A past session as one italic line: "[label · ]MMM d — set · set · …".
function SessionLine({ label, entry }: { label?: string; entry: ExerciseHistoryEntry }) {
  return (
    <p className="font-heading text-foreground/70 text-[12.5px] leading-snug italic">
      {label ? `${label} · ` : ''}
      {format(parseISO(entry.performedDate), 'MMM d')} —{' '}
      {entry.sets.length === 0
        ? '—'
        : entry.sets.map((set, i) => (
            <Fragment key={i}>
              {i > 0 && ' · '}
              <SetSummary set={set} />
            </Fragment>
          ))}
    </p>
  );
}

interface SessionPreviousLineProps {
  exerciseId: string;
  // Only sessions strictly before this date — excludes the in-progress one.
  before?: string | undefined;
}

// The session card's "Previous" strip: the most recent past session inline, with a
// "More" toggle that reveals up to five older ones (scrollable). Session-view only;
// the workout-detail screen keeps its own stacked ExerciseHistoryPanel.
export function SessionPreviousLine({ exerciseId, before }: SessionPreviousLineProps) {
  const [open, setOpen] = useState(false);
  const { data: entries = [], isLoading } = useExerciseHistory(exerciseId, before, HISTORY_LIMIT);
  const t = useSessionsTranslation();

  const box =
    'rounded-[10px] border border-[#efe8e2] bg-[#faf6f3] px-3 py-2 dark:border-[#2f292d] dark:bg-[#171316]';

  if (isLoading && entries.length === 0) {
    return <p className={cn(box, 'text-muted-foreground text-xs italic')}>{t.previous.loading}</p>;
  }
  const latest = entries[0];
  if (!latest) {
    return <p className={cn(box, 'text-muted-foreground text-xs italic')}>{t.previous.none}</p>;
  }
  const older = entries.slice(1);

  return (
    <div className={box}>
      <div className="flex items-start justify-between gap-3">
        <SessionLine entry={latest} />
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
        <div className="no-scrollbar border-border/60 mt-2 flex max-h-40 flex-col gap-1.5 overflow-y-auto border-t pt-2">
          {older.map((entry, i) => (
            <SessionLine key={`${entry.sessionId}-${i}`} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}
