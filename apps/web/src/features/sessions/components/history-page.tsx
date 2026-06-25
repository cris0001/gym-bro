import { Link } from '@tanstack/react-router';
import { format, parseISO } from 'date-fns';
import { useState } from 'react';

import { Button } from '@/components/ui/button';

import { useWorkoutSessions } from '../hooks/use-workout-sessions';

const PAGE_SIZE = 20;

// Workout history: a paginated list of finished sessions, newest first (the API
// orders by performed date). Each row links to the detail view. Paging is
// offset-based; keepPreviousData on the query avoids flicker between pages.
export function HistoryPage() {
  const [offset, setOffset] = useState(0);
  const { data, isLoading } = useWorkoutSessions(PAGE_SIZE, offset);

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const hasPrev = offset > 0;
  const hasNext = offset + PAGE_SIZE < total;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 p-4">
      <h1 className="text-2xl font-bold">History</h1>

      {isLoading ? (
        <p className="text-muted-foreground text-sm">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-muted-foreground text-sm">No workouts logged yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((session) => (
            <li key={session.id}>
              <Link
                to="/history/$sessionId"
                params={{ sessionId: session.id }}
                className="hover:bg-accent block rounded-md border p-3 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate font-medium">{session.name}</span>
                  {session.rating !== null && (
                    <span className="shrink-0 text-sm text-yellow-500">
                      {'★'.repeat(session.rating)}
                    </span>
                  )}
                </div>
                <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-2 text-xs">
                  <span>{format(parseISO(session.performedDate), 'EEE, MMM d, yyyy')}</span>
                  {session.durationMinutes !== null && <span>· {session.durationMinutes} min</span>}
                  {session.sessionType === 'activity' && <span>· activity</span>}
                </div>
                {session.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {session.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="rounded-full px-2 py-0.5 text-xs text-white"
                        style={{ backgroundColor: tag.color }}
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}

      {total > PAGE_SIZE && (
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="outline"
            className="h-10"
            disabled={!hasPrev}
            onClick={() => setOffset((o) => Math.max(0, o - PAGE_SIZE))}
          >
            Previous
          </Button>
          <span className="text-muted-foreground text-xs">
            {offset + 1}–{Math.min(offset + PAGE_SIZE, total)} of {total}
          </span>
          <Button
            variant="outline"
            className="h-10"
            disabled={!hasNext}
            onClick={() => setOffset((o) => o + PAGE_SIZE)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
