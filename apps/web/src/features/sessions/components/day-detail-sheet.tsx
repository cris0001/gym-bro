import { useQuery } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';

import type { PlannedStatus } from '@gym-bro/shared';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

import { plannedSessionsQueryOptions } from '../hooks/use-planned-sessions';
import { useDeletePlannedSession } from '../hooks/use-delete-planned-session';
import { useUpdatePlannedSession } from '../hooks/use-update-planned-session';
import { useCalendarUiStore } from '../stores/calendar-ui.store';
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

// Bottom sheet for a tapped calendar day: lists that day's planned sessions with
// skip/unskip + delete, and an "Assign template" toggle that swaps the list for
// the assign form. Open state is the store's selectedDate; the day's sessions
// are fetched only while open (single-day range, enabled-gated).
export function DayDetailSheet() {
  const selectedDate = useCalendarUiStore((s) => s.selectedDate);
  const closeDay = useCalendarUiStore((s) => s.closeDay);
  const [assigning, setAssigning] = useState(false);

  const open = selectedDate !== null;
  const date = selectedDate ?? '';

  const { data: sessions = [] } = useQuery({
    ...plannedSessionsQueryOptions(date, date),
    enabled: open,
  });
  const updateMutation = useUpdatePlannedSession();
  const deleteMutation = useDeletePlannedSession();

  function handleClose() {
    setAssigning(false);
    closeDay();
  }

  function toggleSkip(id: string, status: PlannedStatus) {
    const next: PlannedStatus = status === 'skipped' ? 'planned' : 'skipped';
    updateMutation.mutate({ id, input: { status: next } });
  }

  return (
    <Sheet open={open} onOpenChange={(next) => !next && handleClose()}>
      <SheetContent side="bottom" className="gap-0">
        <SheetHeader>
          <SheetTitle>{date ? format(parseISO(date), 'EEEE, MMM d') : ''}</SheetTitle>
          <SheetDescription>
            {assigning ? 'Pick a template to plan for this day.' : 'Sessions planned for this day.'}
          </SheetDescription>
        </SheetHeader>

        {assigning ? (
          <AssignTemplateForm date={date} onDone={() => setAssigning(false)} />
        ) : (
          <div className="flex flex-col gap-3 p-4">
            {sessions.length === 0 ? (
              <p className="text-muted-foreground text-sm">No sessions planned.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {sessions.map((session) => (
                  <li
                    key={session.id}
                    className="flex items-center justify-between gap-2 rounded-md border p-3"
                  >
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
                    <div className="flex shrink-0 items-center gap-1">
                      {session.status !== 'completed' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSkip(session.id, session.status)}
                          disabled={updateMutation.isPending}
                        >
                          {session.status === 'skipped' ? 'Unskip' : 'Skip'}
                        </Button>
                      )}
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
                  </li>
                ))}
              </ul>
            )}

            <Button variant="outline" onClick={() => setAssigning(true)}>
              Assign template
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
