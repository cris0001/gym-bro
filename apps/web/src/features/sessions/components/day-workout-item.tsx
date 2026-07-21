import { Link } from '@tanstack/react-router';
import { Activity, ChevronDown, Dumbbell } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import type { WorkoutSessionListItem } from '@gym-bro/shared';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useConfirm } from '@/stores/confirm.store';

import { useDeleteWorkoutSession } from '../hooks/use-delete-workout-session';
import { useEditWorkout } from '../hooks/use-edit-workout';
import { useWorkoutSession } from '../hooks/use-workout-session';
import { WorkoutPerformances } from './workout-performances';

// One finished workout in the day panel: a header (type icon, name, rating,
// duration, tags) that expands to the logged exercises/sets, with Edit, Open
// (full page), and Delete. The full detail is fetched only when expanded.
export function DayWorkoutItem({ workout }: { workout: WorkoutSessionListItem }) {
  const [expanded, setExpanded] = useState(false);
  const { data: detail, isLoading } = useWorkoutSession(workout.id, expanded);
  const editWorkout = useEditWorkout();
  const remove = useDeleteWorkoutSession();
  const confirm = useConfirm();
  const Icon = workout.sessionType === 'activity' ? Activity : Dumbbell;

  async function handleDelete() {
    const ok = await confirm({
      title: 'Delete this workout?',
      description: 'This cannot be undone.',
      confirmText: 'Delete',
      destructive: true,
    });
    if (ok) remove.mutate(workout.id, { onSuccess: () => toast.success('Workout deleted') });
  }

  return (
    <div className="bg-muted/60 overflow-hidden rounded-lg">
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="hover:bg-muted flex w-full items-center gap-2 p-3 text-left transition-colors"
        aria-expanded={expanded}
      >
        <Icon className="size-4 shrink-0 text-green-600" />
        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium">{workout.name}</span>
          <span className="text-muted-foreground text-xs">
            {workout.durationMinutes !== null && `${workout.durationMinutes} min`}
            {workout.rating !== null && (
              <span className="text-yellow-500"> {'★'.repeat(workout.rating)}</span>
            )}
          </span>
        </span>
        {workout.tags.length > 0 && (
          <span className="flex shrink-0 gap-1">
            {workout.tags.map((tag) => (
              <span
                key={tag.id}
                className="size-2.5 rounded-[3px]"
                style={{ backgroundColor: tag.color }}
              />
            ))}
          </span>
        )}
        <ChevronDown
          className={cn('size-4 shrink-0 transition-transform', !expanded && '-rotate-90')}
        />
      </button>

      {expanded && (
        <div className="flex flex-col gap-3 border-t p-3">
          {isLoading || !detail ? (
            <p className="text-muted-foreground text-sm">Loading…</p>
          ) : (
            <>
              {detail.notes !== null && <p className="text-sm">{detail.notes}</p>}
              {detail.performances.length > 0 && (
                <WorkoutPerformances
                  performances={detail.performances}
                  performedDate={detail.performedDate}
                  showPrevious={false}
                />
              )}
              <div className="flex flex-wrap gap-2">
                {detail.sessionType === 'strength' && (
                  <Button size="sm" className="h-9" onClick={() => void editWorkout(detail)}>
                    Edit
                  </Button>
                )}
                <Button asChild size="sm" variant="outline" className="h-9">
                  <Link to="/history/$sessionId" params={{ sessionId: workout.id }}>
                    Open
                  </Link>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-destructive h-9"
                  onClick={() => void handleDelete()}
                  disabled={remove.isPending}
                >
                  Delete
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
