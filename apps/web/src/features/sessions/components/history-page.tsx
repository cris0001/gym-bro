import { Link } from '@tanstack/react-router';
import { addWeeks, format, parseISO, subWeeks } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';

import { useWorkoutsInRange, weekRange } from '../hooks/use-workouts-in-range';
import { ActivityFormSheet } from './activity-form-sheet';

// Workout history, browsed a week at a time. The week's sessions are listed
// chronologically (Mon→Sun); each links to the detail view. Prev/next move one
// week; Today jumps back to the current week.
export function HistoryPage() {
  const [cursor, setCursor] = useState(() => new Date());
  const [activityOpen, setActivityOpen] = useState(false);
  const { from, to } = weekRange(cursor);
  const { data, isLoading } = useWorkoutsInRange(from, to);

  const items = [...(data?.items ?? [])].sort((a, b) =>
    a.performedDate.localeCompare(b.performedDate),
  );

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 p-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">History</h1>
        <Button variant="outline" className="h-9" onClick={() => setActivityOpen(true)}>
          <Plus className="size-4" />
          Activity
        </Button>
      </div>

      <div className="flex items-center justify-between gap-2">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Previous week"
          onClick={() => setCursor((c) => subWeeks(c, 1))}
        >
          <ChevronLeft className="size-4" />
        </Button>
        <div className="flex flex-col items-center">
          <span className="text-sm font-medium">
            {format(parseISO(from), 'MMM d')} – {format(parseISO(to), 'MMM d')}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-auto py-0 text-xs"
            onClick={() => setCursor(new Date())}
          >
            Today
          </Button>
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Next week"
          onClick={() => setCursor((c) => addWeeks(c, 1))}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground text-sm">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-muted-foreground text-sm">No workouts this week.</p>
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
                  <span>{format(parseISO(session.performedDate), 'EEE, MMM d')}</span>
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

      <ActivityFormSheet open={activityOpen} onClose={() => setActivityOpen(false)} />
    </div>
  );
}
