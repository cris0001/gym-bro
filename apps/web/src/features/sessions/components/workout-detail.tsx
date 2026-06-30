import { Link, useNavigate } from '@tanstack/react-router';
import { format, parseISO } from 'date-fns';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { useDeleteWorkoutSession } from '../hooks/use-delete-workout-session';
import { useEditWorkout } from '../hooks/use-edit-workout';
import { useWorkoutSession } from '../hooks/use-workout-session';
import { ExerciseHistoryPanel } from './exercise-history-panel';

interface WorkoutDetailProps {
  sessionId: string;
}

const cell = (value: number | null): string => (value === null ? '—' : String(value));

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
      deleteMutation.mutate(sessionId, { onSuccess: () => void navigate({ to: '/history' }) });
    }
  }

  if (isLoading) {
    return <p className="text-muted-foreground p-4 text-sm">Loading…</p>;
  }
  if (isError || !session) {
    return (
      <div className="flex flex-col gap-3 p-4">
        <p className="text-muted-foreground text-sm">Workout not found.</p>
        <Link to="/history" className="text-sm underline">
          Back to history
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 p-4">
      <Link to="/history" className="text-muted-foreground text-sm">
        ← History
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
        <div className="flex flex-col gap-3">
          {session.performances.map((performance) => {
            const swapped = performance.exercise.id !== performance.originalExercise.id;
            return (
              <div key={performance.id} className="flex flex-col gap-2 rounded-lg border p-3">
                <div className="flex flex-col">
                  <span className="font-semibold">{performance.exercise.name}</span>
                  <span className="text-muted-foreground text-xs">
                    {performance.exercise.category}
                    {swapped && ` · swapped from ${performance.originalExercise.name}`}
                  </span>
                </div>
                {performance.notes !== null && (
                  <p className="text-muted-foreground text-sm">{performance.notes}</p>
                )}
                <div className="grid grid-cols-[1.5rem_1fr_1fr_1fr] gap-2 text-center text-xs font-medium text-muted-foreground">
                  <span>#</span>
                  <span>Weight</span>
                  <span>Reps</span>
                  <span>RIR</span>
                </div>
                {performance.sets.map((set, index) => (
                  <div
                    key={set.id}
                    className="grid grid-cols-[1.5rem_1fr_1fr_1fr] items-center gap-2 text-center text-sm"
                  >
                    <span
                      className={cn(
                        'mx-auto flex size-6 items-center justify-center rounded-full text-xs font-semibold',
                        set.isTopSet
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground',
                      )}
                    >
                      {index + 1}
                    </span>
                    {/* A null weight on a finished set means it was bodyweight. */}
                    <span>{set.weight ?? 'BW'}</span>
                    <span>{cell(set.reps)}</span>
                    <span>{cell(set.rir)}</span>
                  </div>
                ))}
                <ExerciseHistoryPanel
                  exerciseId={performance.exercise.id}
                  before={session.performedDate}
                />
              </div>
            );
          })}
        </div>
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
