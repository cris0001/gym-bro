import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { format, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, Dumbbell, Pencil, Play, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

import type { PlannedSessionWithTemplate } from '@gym-bro/shared';

import { Button } from '@/components/ui/button';
import { RouteMap, stravaActivityIcon, useStravaSessions } from '@/features/strava';
import { useTemplate } from '@/features/training';
import { cn } from '@/lib/utils';

import { useSessionsTranslation } from '../i18n';
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
function targetLabel(
  sets: number | null,
  min: number | null,
  max: number | null,
  t: ReturnType<typeof useSessionsTranslation>['dayDetail'],
): string | null {
  const hasReps = min !== null || max !== null;
  if (sets === null && !hasReps) return null;
  const reps = repRange(min, max);
  if (sets === null) return t.targetReps(reps);
  if (!hasReps) return t.targetSets(sets);
  return t.targetFull(sets, reps);
}

// One planned to-do: the template with a tint icon, its exercises (name · sets × reps),
// and Start / Move (reschedule via a native date picker) pills. Delete stays as a quiet
// icon. The template's exercises are fetched on demand.
function PlannedTodoCard({ session }: { session: PlannedSessionWithTemplate }) {
  const { data: template } = useTemplate(session.template.id);
  const deleteMutation = useDeletePlannedSession();
  const updateMutation = useUpdatePlannedSession();
  const { startFromTemplate } = useStartWorkout();
  const t = useSessionsTranslation();

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
            {t.dayDetail.exercisesCount(exercises.length)}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-[#efe6e9] px-2 py-0.5 text-[10px] font-bold tracking-[0.06em] text-[#8d4a5e] uppercase dark:bg-[#3a2f34] dark:text-[#c98fa0]">
          {t.calendar.planned}
        </span>
      </div>

      {exercises.length > 0 && (
        <ul className="flex flex-col">
          {exercises.map((item, index) => {
            const target = targetLabel(
              item.targetSets,
              item.targetRepsMin,
              item.targetRepsMax,
              t.dayDetail,
            );
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
        <div className="flex items-center gap-2">
          <Button
            className="h-11 flex-1 rounded-full"
            onClick={() => {
              void startFromTemplate({
                templateId: session.template.id,
                templateName: session.template.name,
                plannedSessionId: session.id,
                scheduledDate: session.scheduledDate,
              });
            }}
          >
            <Play className="size-4" />
            {t.common.startWorkout}
          </Button>
          {/* Pencil reschedules via a native date picker (spec: no calendar icon,
              the pencil is the date-change action). */}
          <label
            className="text-muted-foreground hover:bg-muted flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full border transition-colors"
            aria-label={t.dayDetail.changeDateAria}
          >
            <Pencil className="size-4" />
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
          <button
            type="button"
            className="text-muted-foreground hover:bg-muted flex size-11 shrink-0 items-center justify-center rounded-full border transition-colors"
            aria-label={t.dayDetail.deletePlannedAria}
            onClick={() => deleteMutation.mutate(session.id)}
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="size-4" />
          </button>
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
  const t = useSessionsTranslation();

  const todos = planned.filter((session) => session.status !== 'completed');
  const workouts = workoutsPage?.items ?? [];
  const nothingElse = workouts.length === 0 && stravaSessions.length === 0;

  if (assigning) {
    return (
      <div className="flex flex-col">
        <Button variant="ghost" size="sm" className="w-fit" onClick={() => setAssigning(false)}>
          <ChevronLeft className="size-4" />
          {t.dayDetail.back}
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

      {stravaSessions.map((session) => {
        const km =
          session.distanceM !== null && session.distanceM > 0
            ? (session.distanceM / 1000).toFixed(1)
            : null;
        const min =
          session.movingTimeS !== null && session.movingTimeS > 0
            ? Math.round(session.movingTimeS / 60)
            : null;
        const kmh =
          session.averageSpeedMs !== null && session.averageSpeedMs > 0
            ? (session.averageSpeedMs * 3.6).toFixed(1)
            : null;
        const Icon = stravaActivityIcon(session.activityType);
        return (
          <div key={session.id} className="bg-card flex flex-col gap-3 rounded-2xl border p-4">
            <div className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#fbe3d4] text-[#d15b28] dark:bg-[#45291b] dark:text-[#ff7a3d]">
                <Icon className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-heading truncate text-lg leading-tight font-semibold">
                  {session.name}
                </p>
                <p className="text-muted-foreground text-xs">
                  <span className="capitalize">{session.activityType}</span> ·{' '}
                  {format(parseISO(session.startedAt), 'HH:mm')}
                </p>
              </div>
            </div>

            {(km !== null || min !== null || kmh !== null) && (
              <div className="grid grid-cols-3 gap-2 border-t border-dashed border-[#e4dad2] pt-3 dark:border-[#40353c]">
                {km && (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-muted-foreground text-[10px] font-semibold tracking-wide uppercase">
                      {t.dayDetail.distance}
                    </span>
                    <span className="font-heading text-lg font-semibold">{km} km</span>
                  </div>
                )}
                {min !== null && (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-muted-foreground text-[10px] font-semibold tracking-wide uppercase">
                      {t.dayDetail.time}
                    </span>
                    <span className="font-heading text-lg font-semibold">{min} min</span>
                  </div>
                )}
                {kmh && (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-muted-foreground text-[10px] font-semibold tracking-wide uppercase">
                      {t.dayDetail.avgSpeed}
                    </span>
                    <span className="font-heading text-lg font-semibold">{kmh} km/h</span>
                  </div>
                )}
              </div>
            )}

            {session.summaryPolyline ? (
              <div className="px-2">
                <RouteMap polyline={session.summaryPolyline} className="h-64 rounded-xl" />
              </div>
            ) : null}

            <button
              type="button"
              className="flex items-center gap-1 self-end text-sm font-semibold text-[#d15b28] dark:text-[#ff7a3d]"
              onClick={() => void navigate({ to: '/strava', search: { activity: session.id } })}
            >
              {t.dayWorkout.open}
              <ChevronRight className="size-4" />
            </button>
          </div>
        );
      })}

      {todos.length === 0 && nothingElse ? (
        <p className="text-muted-foreground text-sm">{t.dayDetail.nothingThisDay}</p>
      ) : todos.length > 0 && nothingElse ? (
        <p className="text-muted-foreground text-sm">{t.dayDetail.nothingElse}</p>
      ) : null}

      <Button
        variant="ghost"
        className="h-11 rounded-2xl border border-[#e0d3d8] bg-[#efe6e9] font-semibold text-[#8d4a5e] hover:bg-[#e6d8dd] dark:border-[#4a3a42] dark:bg-[#3a2f34] dark:text-[#c98fa0] dark:hover:bg-[#43363c]"
        onClick={() => setAssigning(true)}
      >
        <Plus className="size-4" />
        {t.dayDetail.addSession}
      </Button>
    </div>
  );
}
