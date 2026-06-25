import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, Trash2 } from 'lucide-react';
import { useState } from 'react';

import type { PlannedStatus } from '@gym-bro/shared';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { plannedSessionsQueryOptions } from '../hooks/use-planned-sessions';
import { useDeletePlannedSession } from '../hooks/use-delete-planned-session';
import { useUpdatePlannedSession } from '../hooks/use-update-planned-session';
import { useStartWorkout } from '../hooks/use-start-workout';
import { AssignTemplateForm } from './assign-template-form';

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

interface DayDetailProps {
  date: string;
}

// The body for a single calendar day, shared by the mobile sheet and the desktop
// side panel: lists that day's planned sessions (skip/unskip + delete) and an
// "Assign template" toggle that swaps the list for the assign form. The day's
// sessions are fetched as a single-day range, enabled-gated on a real date.
export function DayDetail({ date }: DayDetailProps) {
  const [assigning, setAssigning] = useState(false);

  const { data: sessions = [] } = useQuery({
    ...plannedSessionsQueryOptions(date, date),
    enabled: date !== '',
  });
  const updateMutation = useUpdatePlannedSession();
  const deleteMutation = useDeletePlannedSession();
  const { startFromTemplate } = useStartWorkout();

  function toggleSkip(id: string, status: PlannedStatus) {
    const next: PlannedStatus = status === 'skipped' ? 'planned' : 'skipped';
    updateMutation.mutate({ id, input: { status: next } });
  }

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
    <div className="flex flex-col gap-3 p-4">
      {sessions.length === 0 ? (
        <p className="text-muted-foreground text-sm">No sessions planned.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {sessions.map((session) => (
            <li key={session.id} className="flex flex-col gap-2 rounded-md border p-3">
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
              {session.status !== 'completed' && (
                <div className="flex gap-2">
                  <Button
                    className="h-10 flex-1"
                    onClick={() =>
                      startFromTemplate({
                        templateId: session.template.id,
                        templateName: session.template.name,
                        plannedSessionId: session.id,
                        scheduledDate: session.scheduledDate,
                      })
                    }
                  >
                    Start session
                  </Button>
                  <Button
                    variant="outline"
                    className="h-10"
                    onClick={() => toggleSkip(session.id, session.status)}
                    disabled={updateMutation.isPending}
                  >
                    {session.status === 'skipped' ? 'Unskip' : 'Skip'}
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <Button variant="outline" onClick={() => setAssigning(true)}>
        Assign template
      </Button>
    </div>
  );
}
