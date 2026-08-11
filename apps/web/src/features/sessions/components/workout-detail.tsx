import { Link, useNavigate } from '@tanstack/react-router';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';

import { SkeletonList } from '@/components/skeletons';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useConfirm } from '@/stores/confirm.store';

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
  const confirm = useConfirm();

  async function handleDelete() {
    const ok = await confirm({
      title: 'Delete this workout?',
      description: 'This cannot be undone.',
      confirmText: 'Delete',
      destructive: true,
    });
    if (ok) {
      deleteMutation.mutate(sessionId, {
        onSuccess: () => {
          toast.success('Workout deleted');
          void navigate({ to: '/calendar' });
        },
      });
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 p-4">
        <Skeleton className="h-7 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
        <div className="bg-card rounded-2xl border">
          <SkeletonList rows={4} />
        </div>
      </div>
    );
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
    <div className="mx-auto lg:col-span-3 flex w-full max-w-2xl flex-col gap-4 p-3 md:p-4">
      <Link to="/calendar" className="text-muted-foreground text-sm">
        ← Calendar
      </Link>

      <header className="flex flex-col gap-2">
        <h1 className="font-heading text-[28px] font-medium">{session.name}</h1>
        <div className="text-muted-foreground font-heading flex flex-wrap items-center gap-x-2 text-sm italic">
          <span>{format(parseISO(session.performedDate), 'EEEE, MMM d, yyyy')}</span>
          {session.durationMinutes !== null && <span>· {session.durationMinutes} min</span>}
          {session.rating !== null && (
            <span className="text-primary not-italic">{'★'.repeat(session.rating)}</span>
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
          <Button
            variant="ghost"
            className="bg-accent text-primary hover:bg-accent/70 h-11 flex-1 rounded-full"
            onClick={() => void editWorkout(session)}
          >
            Edit
          </Button>
        )}
        <Button
          variant="ghost"
          className="text-destructive h-11 flex-1 rounded-full"
          onClick={() => void handleDelete()}
          disabled={deleteMutation.isPending}
        >
          Delete
        </Button>
      </div>
    </div>
  );
}
