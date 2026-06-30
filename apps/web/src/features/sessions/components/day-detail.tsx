import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, Trash2 } from 'lucide-react';
import { useState } from 'react';

import type { PlannedStatus } from '@gym-bro/shared';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { useDeletePlannedSession } from '../hooks/use-delete-planned-session';
import { plannedSessionsQueryOptions } from '../hooks/use-planned-sessions';
import { useStartWorkout } from '../hooks/use-start-workout';
import { workoutsInRangeQueryOptions } from '../hooks/use-workouts-in-range';
import { AssignTemplateForm } from './assign-template-form';
import { DayWorkoutItem } from './day-workout-item';

const STATUS_LABEL: Record<PlannedStatus, string> = {
  planned: 'Planned',
  completed: 'Completed',
  skipped: 'Skipped',
};
const STATUS_BADGE: Record<PlannedStatus, string> = {
  planned: 'bg-primary/10 text-primary',
  completed: 'bg-green-500/10 text-green-600',
  skipped: 'bg-muted text-muted-foreground',
};

// The body for a single calendar day, shared by the mobile sheet and the desktop
// side panel. Shows the day's still-to-do planned sessions (Start + delete) and
// its finished workouts (expandable to sets, with edit/delete) — completed plans
// are represented by their workout, so they're not repeated as to-dos. An "Assign
// template" toggle swaps the list for the assign form.
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
  const deleteMutation = useDeletePlannedSession();
  const { startFromTemplate } = useStartWorkout();

  const todos = planned.filter((session) => session.status !== 'completed');
  const workouts = workoutsPage?.items ?? [];

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
      {todos.length === 0 && workouts.length === 0 && (
        <p className="text-muted-foreground text-sm">Nothing on this day.</p>
      )}

      {todos.length > 0 && (
        <section className="flex flex-col gap-2">
          <h3 className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium uppercase">
            <span className="bg-primary size-2 rounded-full" />
            Planned
          </h3>
          {todos.map((session) => (
            <div key={session.id} className="bg-primary/5 flex flex-col gap-2 rounded-lg p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="truncate font-medium">{session.template.name}</span>
                  <span
                    className={cn(
                      'w-fit rounded px-1.5 py-0.5 text-xs font-medium',
                      STATUS_BADGE[session.status],
                    )}
                  >
                    {STATUS_LABEL[session.status]}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Delete planned session"
                  onClick={() => deleteMutation.mutate(session.id)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
              {session.status === 'planned' && (
                <Button
                  className="h-10"
                  onClick={() => {
                    void startFromTemplate({
                      templateId: session.template.id,
                      templateName: session.template.name,
                      plannedSessionId: session.id,
                      scheduledDate: session.scheduledDate,
                    });
                  }}
                >
                  Start session
                </Button>
              )}
            </div>
          ))}
        </section>
      )}

      {workouts.length > 0 && (
        <section className="flex flex-col gap-2">
          <h3 className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium uppercase">
            <span className="size-2 rounded-full bg-green-500" />
            Done
          </h3>
          {workouts.map((workout) => (
            <DayWorkoutItem key={workout.id} workout={workout} />
          ))}
        </section>
      )}

      <Button variant="outline" onClick={() => setAssigning(true)}>
        Assign template
      </Button>
    </div>
  );
}
