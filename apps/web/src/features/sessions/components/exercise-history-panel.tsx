import { format, parseISO } from 'date-fns';
import { useState } from 'react';

import type { ExerciseHistoryEntry } from '@gym-bro/shared';

import { Button } from '@/components/ui/button';

import { useExerciseHistory } from '../hooks/use-exercise-history';

// How many more past sessions each "Show more" reveals.
const STEP = 3;

// Compact set summary, e.g. "100×8 @2" (weight×reps, optional RIR). null weight
// is bodyweight; a missing rep count shows as a dash.
function formatSet(set: ExerciseHistoryEntry['sets'][number]): string {
  const weight = set.weight ?? 'BW';
  const base = `${weight}×${set.reps ?? '–'}`;
  return set.rir === null ? base : `${base} @${set.rir}`;
}

interface ExerciseHistoryPanelProps {
  exerciseId: string;
  // Only sessions before this date (exclusive) — excludes the current/in-progress
  // one. Omit to include everything up to now.
  before?: string | undefined;
}

// "Previous" panel: the most recent past sessions for an exercise, one by default
// with a "Show more" that grows the window. Shared by the active session card and
// the history detail.
export function ExerciseHistoryPanel({ exerciseId, before }: ExerciseHistoryPanelProps) {
  const [limit, setLimit] = useState(1);
  const { data: entries = [], isLoading } = useExerciseHistory(exerciseId, before, limit);

  if (isLoading && entries.length === 0) {
    return <p className="text-muted-foreground text-xs">Loading previous…</p>;
  }
  if (entries.length === 0) {
    return <p className="text-muted-foreground text-xs">No previous sessions.</p>;
  }

  // A full window may have more behind it; a short one is the end.
  const canShowMore = entries.length >= limit;

  return (
    <div className="bg-muted/40 flex flex-col gap-2 rounded-md p-2">
      <span className="text-muted-foreground text-xs font-medium">Previous</span>
      {entries.map((entry, index) => (
        <div key={`${entry.sessionId}-${index}`} className="flex flex-col">
          <span className="text-muted-foreground text-xs">
            {format(parseISO(entry.performedDate), 'MMM d, yyyy')} · {entry.sessionName}
          </span>
          <span className="text-sm">{entry.sets.map(formatSet).join(', ') || '—'}</span>
        </div>
      ))}
      {canShowMore && (
        <Button
          variant="ghost"
          size="sm"
          className="w-fit"
          onClick={() => setLimit((current) => current + STEP)}
        >
          Show more
        </Button>
      )}
    </div>
  );
}
