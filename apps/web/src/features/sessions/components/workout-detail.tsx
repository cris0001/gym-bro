import { Link, useNavigate } from '@tanstack/react-router';
import { format, parseISO } from 'date-fns';

import { Button } from '@/components/ui/button';

import { useDeleteWorkoutSession } from '../hooks/use-delete-workout-session';
import { useEditWorkout } from '../hooks/use-edit-workout';
import { useWorkoutSession } from '../hooks/use-workout-session';
import { WorkoutPerformances } from './workout-performances';

interface WorkoutDetailProps {
  sessionId: string;
}

// Detail view of a finished workout: metadata header (date, rating, duration,
// tags, notes) and each exercise's logged sets. A swapped exercise shows what it
// replaced. Activity sessions have no performances, so only the header renders.
export function WorkoutDetail({ sessionId }: WorkoutDetailProps) {
  const navigate = useNavigate();
  const { data: session, isLoading, isError } = useWorkoutSession(sessionId);
  const deleteMutation = useDeleteWorkoutSession();
  const editWorkout = useEditWorkout();

  function handleDelete() {
    if (window.confirm('Delete this workout? This cannot be undone.')) {
      deleteMutation.mutate(sessionId, { onSuccess: () => void navigate({ to: '/calendar' }) });
    }
  }

  if (isLoading) {
    return <p className="text-muted-foreground p-4 text-sm">Loading…</p>;
  }
  if (isError || !session) {
    return (
      <div className="flex flex-col gap-3 p-4">
        <p className="text-muted-foreground text-sm">Workout not found.</p>
        <Link to="/calendar" className="text-sm underline">
          Back to calendar
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto lg:col-span-3 flex w-full max-w-2xl flex-col gap-4 p-4">
      <Link to="/calendar" className="text-muted-foreground text-sm">
        ← Calendar
      </Link>

      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">{session.name}</h1>
        <div className="text-muted-foreground flex flex-wrap items-center gap-x-2 text-sm">
          <span>{format(parseISO(session.performedDate), 'EEEE, MMM d, yyyy')}</span>
          {session.durationMinutes !== null && <span>· {session.durationMinutes} min</span>}
          {session.rating !== null && (
            <span className="text-yellow-500">{'★'.repeat(session.rating)}</span>
          )}
        </div>
        {session.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
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
        {session.notes !== null && <p className="text-sm">{session.notes}</p>}
      </header>

      {session.performances.length === 0 ? (
        <p className="text-muted-foreground text-sm">No exercises logged.</p>
      ) : (
        <WorkoutPerformances
          performances={session.performances}
          performedDate={session.performedDate}
        />
      )}

      <div className="flex gap-2">
        {session.sessionType === 'strength' && (
          <Button className="h-11 flex-1" onClick={() => editWorkout(session)}>
            Edit
          </Button>
        )}
        <Button
          variant="outline"
          className="text-destructive h-11 flex-1"
          onClick={handleDelete}
          disabled={deleteMutation.isPending}
        >
          Delete
        </Button>
      </div>
    </div>
  );
}
