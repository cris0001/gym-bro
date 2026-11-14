import { useState } from 'react';

import { useSessionsTranslation } from '../i18n';
import { useExerciseHistory } from '../hooks/use-exercise-history';
import { HistoryEntry } from './history-entry';

// How many more past sessions each "More" reveals.
const STEP = 3;

interface ExerciseHistoryPanelProps {
  exerciseId: string;
  // Only sessions before this date (exclusive) — excludes the current one. Omit to
  // include everything up to now.
  before?: string | undefined;
}

// Past results of one exercise on the workout detail: the most recent session as
// small set pills, with a centered "More" that grows the window by STEP older ones.
export function ExerciseHistoryPanel({ exerciseId, before }: ExerciseHistoryPanelProps) {
  const [limit, setLimit] = useState(1);
  const { data: entries = [], isLoading } = useExerciseHistory(exerciseId, before, limit);
  const t = useSessionsTranslation();

  const box = 'bg-field-muted rounded-[10px] px-2.5 py-2';

  if (isLoading && entries.length === 0) {
    return <p className={`${box} text-muted-foreground text-[11.5px]`}>{t.previous.loading}</p>;
  }
  if (entries.length === 0) {
    return <p className={`${box} text-muted-foreground text-[11.5px]`}>{t.previous.none}</p>;
  }

  // A full window may have more behind it; a short one is the end.
  const canShowMore = entries.length >= limit;

  return (
    <div className={`${box} flex flex-col gap-2`}>
      {entries.map((entry, index) => (
        <HistoryEntry key={`${entry.sessionId}-${index}`} entry={entry} size="sm" />
      ))}
      {canShowMore && (
        <button
          type="button"
          className="text-primary self-center text-[11px] font-semibold hover:underline md:text-xs"
          onClick={() => setLimit((current) => current + STEP)}
        >
          {t.previous.showMore}
        </button>
      )}
    </div>
  );
}
