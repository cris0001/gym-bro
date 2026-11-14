import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

import { Skeleton } from '@/components/ui/skeleton';

import { useSessionsTranslation } from '../i18n';
import { useExerciseHistory } from '../hooks/use-exercise-history';
import type { DraftPerformance } from '../stores/workout-draft.store';
import { HistoryEntry } from './history-entry';

// Past sessions per card: the latest two up front, "More" adds STEP older ones.
const INITIAL = 2;
const STEP = 3;

// The active session's desktop side column: one history card per exercise, in the
// workout's order, so each exercise's past results sit beside the session. (Phones
// show the same history at the bottom of each exercise card instead.)
export function SessionHistoryPanel({
  performances,
  performedDate,
}: {
  performances: DraftPerformance[];
  performedDate: string;
}) {
  if (performances.length === 0) return null;
  return (
    <aside className="hidden flex-col gap-3 min-[1200px]:flex">
      {performances.map((performance) => (
        <ExerciseHistoryCard
          key={performance.id}
          name={performance.exerciseName}
          exerciseId={performance.actualExerciseId}
          before={performedDate}
        />
      ))}
    </aside>
  );
}

function ExerciseHistoryCard({
  name,
  exerciseId,
  before,
}: {
  name: string;
  exerciseId: string;
  before: string;
}) {
  const [limit, setLimit] = useState(INITIAL);
  const { data: entries = [], isLoading } = useExerciseHistory(exerciseId, before, limit);
  const t = useSessionsTranslation();
  // A full window may have more behind it; a short one is the end.
  const canShowMore = entries.length >= limit;

  return (
    <section className="bg-card flex flex-col gap-3 rounded-xl border p-4">
      <div className="flex items-baseline justify-between gap-2">
        <p className="min-w-0 truncate text-sm font-semibold">{name}</p>
        <span className="text-muted-foreground shrink-0 text-[11px] font-medium tracking-[0.08em] uppercase">
          {t.previous.label}
        </span>
      </div>

      {isLoading && entries.length === 0 ? (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-6 w-3/4 rounded-lg" />
        </div>
      ) : entries.length === 0 ? (
        <p className="text-muted-foreground text-xs">{t.previous.none}</p>
      ) : (
        <ol className="flex flex-col gap-3">
          {entries.map((entry, i) => (
            <li key={`${entry.sessionId}-${i}`}>
              <HistoryEntry entry={entry} />
            </li>
          ))}
        </ol>
      )}

      {canShowMore && entries.length > 0 && (
        <button
          type="button"
          aria-label={t.previous.showMore}
          title={t.previous.showMore}
          className="text-primary hover:bg-accent flex size-8 items-center justify-center self-center rounded-full transition-colors"
          onClick={() => setLimit((current) => current + STEP)}
        >
          <ChevronDown className="size-5" />
        </button>
      )}
    </section>
  );
}
