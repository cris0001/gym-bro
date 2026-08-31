import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { ChevronLeft, ChevronRight, Dumbbell, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

import type { PlannedSessionWithTemplate } from '@gym-bro/shared';

import { Button } from '@/components/ui/button';
import { useStravaSessions } from '@/features/strava';
import { useTemplate } from '@/features/training';

import { useDeletePlannedSession } from '../hooks/use-delete-planned-session';
import { plannedSessionsQueryOptions } from '../hooks/use-planned-sessions';
import { useStartWorkout } from '../hooks/use-start-workout';
import { useUpdatePlannedSession } from '../hooks/use-update-planned-session';
import { workoutsInRangeQueryOptions } from '../hooks/use-workouts-in-range';
import { AssignTemplateForm } from './assign-template-form';
import { DayWorkoutItem } from './day-workout-item';

const sectionHeading =
  'text-muted-foreground flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.08em]';

// A target rep count for one template exercise: a range, a single number, or AMRAP
// when a set count is given but no reps.
function repRange(min: number | null, max: number | null): string {
  if (min === null && max === null) return 'AMRAP';
  if (max === null || min === max) return String(min ?? max);
  return `${min}–${max}`;
}

// The "sets × reps" suffix, or null when the template exercise has neither a set count
// nor a rep target (so nothing is shown rather than an empty "— × …").
function targetLabel(sets: number | null, min: number | null, max: number | null): string | null {
  const hasReps = min !== null || max !== null;
  if (sets === null && !hasReps) return null;
  const reps = repRange(min, max);
  return sets === null ? reps : `${sets} × ${reps}`;
}

// One planned to-do: the template with a tint icon, its exercises (name · sets × reps),
// and Start / Move (reschedule via a native date picker) pills. Delete stays as a quiet
// icon. The template's exercises are fetched on demand.
function PlannedTodoCard({ session }: { session: PlannedSessionWithTemplate }) {
  const { data: template } = useTemplate(session.template.id);
  const deleteMutation = useDeletePlannedSession();
  const updateMutation = useUpdatePlannedSession();
  const { startFromTemplate } = useStartWorkout();

  const exercises = template?.exercises ?? [];

  return (
    <div className="bg-card flex flex-col gap-3 rounded-2xl border p-4">
      <div className="flex items-start gap-3">
        <span className="bg-accent text-primary flex size-10 shrink-0 items-center justify-center rounded-full">
          <Dumbbell className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-heading truncate text-lg font-semibold">{session.template.name}</p>
          <p className="text-muted-foreground text-xs">
            Planned · {exercises.length} exercise{exercises.length === 1 ? '' : 's'}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground -mt-1 -mr-1 size-8 shrink-0"
          aria-label="Delete planned session"
          onClick={() => deleteMutation.mutate(session.id)}
          disabled={deleteMutation.isPending}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      {exercises.length > 0 && (
        <ul className="flex flex-col gap-1 text-[12.5px] text-[#574c52] dark:text-[#c6b8bd]">
          {exercises.map((item) => {
            const target = targetLabel(item.targetSets, item.targetRepsMin, item.targetRepsMax);
            return (
              <li key={item.id} className="truncate">
                {item.exercise.name}
                {target ? <span className="text-muted-foreground"> · {target}</span> : null}
              </li>
            );
          })}
        </ul>
      )}

      {session.status === 'planned' && (
        <div className="flex gap-2">
          <Button
            className="h-10 flex-1 rounded-full"
            onClick={() => {
              void startFromTemplate({
                templateId: session.template.id,
                templateName: session.template.name,
                plannedSessionId: session.id,
                scheduledDate: session.scheduledDate,
              });
            }}
          >
            Start
          </Button>
          <label className="bg-accent text-primary hover:bg-accent/70 flex h-10 cursor-pointer items-center rounded-full px-4 text-sm font-medium transition-colors">
            Move
            <input
              type="date"
              className="sr-only"
              value={session.scheduledDate}
              onChange={(e) =>
                e.target.value &&
                updateMutation.mutate({ id: session.id, input: { scheduledDate: e.target.value } })
              }
            />
          </label>
        </div>
      )}
    </div>
  );
}

// The body for a single calendar day, shared by the mobile sheet and the desktop side
// panel. Shows the day's still-to-do planned sessions (with their exercises + Start/
// Move), its finished workouts, and any Strava activities. An "Add session" toggle
// swaps the list for the assign form.
export function DayDetail({ date }: { date: string }) {
  const [assigning, setAssigning] = useState(false);

  const { data: planned = [] } = useQuery({
    ...plannedSessionsQueryOptions(date, date),
    enabled: date !== '',
  });
  const { data: workoutsPage } = useQuery({
    ...workoutsInRangeQueryOptions(date, date),
    enabled: date !== '',
  });
  const { data: stravaSessions = [] } = useStravaSessions(date || undefined, date || undefined);
  const navigate = useNavigate();

  const todos = planned.filter((session) => session.status !== 'completed');
  const workouts = workoutsPage?.items ?? [];
  const nothingElse = workouts.length === 0 && stravaSessions.length === 0;

  if (assigning) {
    return (
      <div className="flex flex-col">
        <Button variant="ghost" size="sm" className="w-fit" onClick={() => setAssigning(false)}>
          <ChevronLeft className="size-4" />
          Back
        </Button>
        <AssignTemplateForm date={date} onDone={() => setAssigning(false)} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      {todos.map((session) => (
        <PlannedTodoCard key={session.id} session={session} />
      ))}

      {workouts.length > 0 && (
        <section className="flex flex-col gap-2">
          <h3 className={sectionHeading}>
            <span className="size-2 rounded-full bg-[#5a7a52] dark:bg-[#8fae85]" />
            Done
          </h3>
          {workouts.map((workout) => (
            <DayWorkoutItem
              key={workout.id}
              workout={workout}
              defaultExpanded={workouts.length === 1}
            />
          ))}
        </section>
      )}

      {stravaSessions.length > 0 && (
        <section className="flex flex-col gap-2">
          <h3 className={sectionHeading}>
            <span className="size-2 rounded-full bg-[#d15b28] dark:bg-[#ff7a3d]" />
            Strava
          </h3>
          {stravaSessions.map((session) => (
            <button
              key={session.id}
              type="button"
              className="hover:bg-muted/50 active:bg-muted flex items-center gap-2 rounded-xl border px-3 py-2 text-left transition-colors"
              onClick={() => void navigate({ to: '/strava', search: { activity: session.id } })}
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{session.name}</span>
                <span className="text-muted-foreground text-xs">{session.activityType}</span>
              </span>
              <ChevronRight className="text-muted-foreground size-4 shrink-0" />
            </button>
          ))}
        </section>
      )}

      {todos.length === 0 && nothingElse ? (
        <p className="text-muted-foreground text-sm">Nothing on this day.</p>
      ) : todos.length > 0 && nothingElse ? (
        <p className="text-muted-foreground text-sm">Nothing else this day.</p>
      ) : null}

      <Button
        variant="outline"
        className="h-11 rounded-2xl border-dashed"
        onClick={() => setAssigning(true)}
      >
        <Plus className="size-4" />
        Add session
      </Button>
    </div>
  );
}
