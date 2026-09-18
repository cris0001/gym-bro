import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { ChevronLeft, ChevronRight, Dumbbell, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

import type { PlannedSessionWithTemplate } from '@gym-bro/shared';

import { Button } from '@/components/ui/button';
import { RouteMap, useStravaSessions } from '@/features/strava';
import { useTemplate } from '@/features/training';
import { cn } from '@/lib/utils';

import { useDeletePlannedSession } from '../hooks/use-delete-planned-session';
import { plannedSessionsQueryOptions } from '../hooks/use-planned-sessions';
import { useStartWorkout } from '../hooks/use-start-workout';
import { useUpdatePlannedSession } from '../hooks/use-update-planned-session';
import { workoutsInRangeQueryOptions } from '../hooks/use-workouts-in-range';
import { AssignTemplateForm } from './assign-template-form';
import { DayWorkoutItem } from './day-workout-item';

// A target rep count for one template exercise: a range, a single number, or AMRAP
// when a set count is given but no reps.
function repRange(min: number | null, max: number | null): string {
  if (min === null && max === null) return 'AMRAP';
  if (max === null || min === max) return String(min ?? max);
  return `${min}–${max}`;
}

// The uppercase "N SETS × M REPS" target for a planned exercise row, or null when the
// template exercise has neither a set count nor a rep target.
function targetLabel(sets: number | null, min: number | null, max: number | null): string | null {
  const hasReps = min !== null || max !== null;
  if (sets === null && !hasReps) return null;
  const reps = repRange(min, max);
  if (sets === null) return `${reps} REPS`;
  if (!hasReps) return `${sets} SETS`;
  return `${sets} SETS × ${reps} REPS`;
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
        <ul className="flex flex-col">
          {exercises.map((item, index) => {
            const target = targetLabel(item.targetSets, item.targetRepsMin, item.targetRepsMax);
            return (
              <li
                key={item.id}
                className={cn(
                  'flex items-baseline gap-3 py-2',
                  index > 0 && 'border-t border-dashed border-[#e4dad2] dark:border-[#40353c]',
                )}
              >
                <span className="font-heading w-4 shrink-0 text-center text-sm text-[#c9bcb2] italic">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold">{item.exercise.name}</p>
                  {target ? (
                    <p className="text-muted-foreground text-[10.5px] font-medium tracking-wide uppercase">
                      {target}
                    </p>
                  ) : null}
                </div>
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

      {workouts.map((workout) => (
        <DayWorkoutItem
          key={workout.id}
          workout={workout}
          defaultExpanded={workouts.length === 1}
        />
      ))}

      {stravaSessions.map((session) => (
        <div key={session.id} className="bg-card flex flex-col gap-2 rounded-2xl border p-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-[#fbe3d4] px-2 py-0.5 text-[10px] font-bold tracking-[0.06em] text-[#d15b28] uppercase dark:bg-[#45291b] dark:text-[#ff7a3d]">
              Strava
            </span>
            <button
              type="button"
              className="flex min-w-0 flex-1 items-center gap-2 text-left"
              onClick={() => void navigate({ to: '/strava', search: { activity: session.id } })}
            >
              <span className="min-w-0 flex-1 truncate font-medium">{session.name}</span>
              <ChevronRight className="text-muted-foreground size-4 shrink-0" />
            </button>
          </div>
          <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-xs">
            {session.distanceM !== null && session.distanceM > 0 ? (
              <span>{(session.distanceM / 1000).toFixed(1)} km</span>
            ) : null}
            {session.movingTimeS !== null && session.movingTimeS > 0 ? (
              <span>{Math.round(session.movingTimeS / 60)} min</span>
            ) : null}
            <span className="capitalize">{session.activityType}</span>
          </div>
          {session.summaryPolyline ? (
            <RouteMap polyline={session.summaryPolyline} className="h-52 rounded-xl" />
          ) : null}
        </div>
      ))}

      {todos.length === 0 && nothingElse ? (
        <p className="text-muted-foreground text-sm">Nothing on this day.</p>
      ) : todos.length > 0 && nothingElse ? (
        <p className="text-muted-foreground text-sm">Nothing else this day.</p>
      ) : null}

      <Button
        variant="ghost"
        className="bg-accent text-accent-foreground hover:bg-accent/70 h-11 rounded-2xl border"
        onClick={() => setAssigning(true)}
      >
        <Plus className="size-4" />
        Add session
      </Button>
    </div>
  );
}
