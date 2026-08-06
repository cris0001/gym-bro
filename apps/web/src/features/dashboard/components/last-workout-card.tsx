import { Link } from '@tanstack/react-router';
import { format, parseISO } from 'date-fns';
import { Dumbbell, Star } from 'lucide-react';

import { useWorkoutSession, useWorkoutSessions } from '@/features/sessions';

// A small window of recent sessions to find the latest strength one within (ad-hoc
// activities are skipped) — enough for the dashboard without paging.
const RECENT_WINDOW = 10;

// The most recent strength workout, linking to its detail. Ad-hoc activity sessions
// are ignored (they belong to the Strava/activity view).
export function LastWorkoutCard() {
  const { data } = useWorkoutSessions(RECENT_WINDOW, 0);
  const last = data?.items.find((session) => session.sessionType === 'strength') ?? null;
  // Pull the exercise names performed (list items don't carry them); deferred until
  // there's a session to show.
  const { data: detail } = useWorkoutSession(last?.id ?? '', Boolean(last));
  const exercises = detail?.performances.map((performance) => performance.exercise.name) ?? [];

  return (
    <div className="bg-card flex flex-col gap-2 rounded-xl border p-4 transition-shadow hover:shadow-md">
      <div className="flex items-center gap-2 text-sm font-medium">
        <span className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg">
          <Dumbbell className="size-4" />
        </span>
        <span className="text-muted-foreground">Last workout</span>
      </div>
      {last ? (
        <Link
          to="/history/$sessionId"
          params={{ sessionId: last.id }}
          className="flex flex-col gap-1"
        >
          <span className="text-xl font-semibold">{last.name}</span>
          {exercises.length > 0 ? (
            <span className="text-muted-foreground line-clamp-2 text-sm">
              {exercises.join(', ')}
            </span>
          ) : null}
          <span className="text-muted-foreground flex flex-wrap items-center gap-2 text-sm">
            {format(parseISO(last.performedDate), 'EEEE, MMM d')}
            {last.durationMinutes ? <span>· {last.durationMinutes} min</span> : null}
            {last.rating ? (
              <span className="text-foreground inline-flex items-center gap-0.5">
                <Star className="size-3.5 fill-current" />
                {last.rating}
              </span>
            ) : null}
          </span>
        </Link>
      ) : (
        <>
          <span className="text-muted-foreground text-sm">No workouts logged yet.</span>
          <Link to="/session" className="text-primary text-sm underline">
            Start one
          </Link>
        </>
      )}
    </div>
  );
}
