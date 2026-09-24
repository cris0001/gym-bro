import { format, parseISO } from 'date-fns';
import { useState } from 'react';

import type { ExerciseHistoryEntry } from '@gym-bro/shared';

import { useSessionsTranslation } from '../i18n';
import { useExerciseHistory } from '../hooks/use-exercise-history';

// How many more past sessions each "More" reveals.
const STEP = 3;

// Compact set summary, e.g. "100 × 8" (weight × reps). null weight is bodyweight; a
// missing rep count shows as a dash; a top set is prefixed "★".
function formatSet(set: ExerciseHistoryEntry['sets'][number]): string {
  const text = `${set.weight ?? 'BW'} × ${set.reps ?? '–'}`;
  return set.isTopSet ? `★ ${text}` : text;
}

function EntryLine({ entry }: { entry: ExerciseHistoryEntry }) {
  return (
    <p className="text-muted-foreground min-w-0 text-[11.5px] leading-snug">
      <span className="text-subtle-foreground font-semibold">
        {format(parseISO(entry.performedDate), 'MMM d')}
      </span>{' '}
      — {entry.sets.map(formatSet).join(' · ') || '—'}
    </p>
  );
}

interface ExerciseHistoryPanelProps {
  exerciseId: string;
  // Only sessions before this date (exclusive) — excludes the current one. Omit to
  // include everything up to now.
  before?: string | undefined;
}

// "Previous" strip on the workout detail: the most recent past session on one line,
// with a "More" that grows the window by STEP older sessions listed beneath.
export function ExerciseHistoryPanel({ exerciseId, before }: ExerciseHistoryPanelProps) {
  const [limit, setLimit] = useState(1);
  const { data: entries = [], isLoading } = useExerciseHistory(exerciseId, before, limit);
  const t = useSessionsTranslation();

  const box = 'bg-field-muted rounded-[10px] px-2 py-1.5';

  if (isLoading && entries.length === 0) {
    return <p className={`${box} text-muted-foreground text-[11.5px]`}>{t.previous.loading}</p>;
  }
  const [latest, ...older] = entries;
  if (!latest) {
    return <p className={`${box} text-muted-foreground text-[11.5px]`}>{t.previous.none}</p>;
  }

  // A full window may have more behind it; a short one is the end.
  const canShowMore = entries.length >= limit;

  return (
    <div className={`${box} flex flex-col gap-1`}>
      <div className="flex items-start justify-between gap-1">
        <EntryLine entry={latest} />
        {canShowMore && (
          <button
            type="button"
            className="text-primary shrink-0 text-[10.5px] leading-[1.6] font-semibold"
            onClick={() => setLimit((current) => current + STEP)}
          >
            {t.previous.more}
          </button>
        )}
      </div>
      {older.map((entry, index) => (
        <EntryLine key={`${entry.sessionId}-${index}`} entry={entry} />
      ))}
    </div>
  );
}
