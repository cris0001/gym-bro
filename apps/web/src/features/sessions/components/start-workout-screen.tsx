import { Link } from '@tanstack/react-router';
import { addDays, format } from 'date-fns';
import { CalendarDays, Plus } from 'lucide-react';

import { PageTitle } from '@/components/page-title';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { useSessionsTranslation } from '../i18n';
import { usePlannedSessions } from '../hooks/use-planned-sessions';
import { useStartWorkout } from '../hooks/use-start-workout';
import { StartPlannedCard } from './start-planned-card';
import { StartPlannedCardSkeleton } from './start-planned-card-skeleton';
import { StartWorkoutPicker } from './start-workout-picker';

// How far ahead to look for a "next up" session when nothing is planned today.
const LOOKAHEAD_DAYS = 14;

const EMPTY_BUTTON =
  'h-10 rounded-xl border border-border bg-card font-semibold text-primary hover:bg-muted';

// /session with nothing in progress. Left (top on mobile): today's planned session
// as a hero — or, with nothing today, the next planned one as a "next up" card, or a
// short nothing-planned note. Right: every plan's templates, grouped by plan.
export function StartWorkoutScreen() {
  const { startFromTemplate, startEmpty } = useStartWorkout();
  const t = useSessionsTranslation();

  const now = new Date();
  const todayIso = format(now, 'yyyy-MM-dd');
  const { data: planned = [], isPending: plannedPending } = usePlannedSessions(
    todayIso,
    format(addDays(now, LOOKAHEAD_DAYS), 'yyyy-MM-dd'),
  );
  const open = planned
    .filter((session) => session.status === 'planned')
    .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate));
  const today = open.filter((session) => session.scheduledDate === todayIso);
  const nextUp = today.length === 0 ? open[0] : undefined;

  const emptyButton = (className: string) => (
    <Button
      variant="ghost"
      className={cn(EMPTY_BUTTON, className)}
      onClick={() => void startEmpty()}
    >
      <Plus className="size-4" />
      {t.startWorkout.emptyWorkout}
    </Button>
  );

  return (
    <div className="lg:col-start-2 flex w-full max-w-6xl flex-col gap-4 p-3 md:p-4">
      <PageTitle className="font-heading text-[28px] leading-none font-bold tracking-tight">
        {t.activeSession.startTitle}
      </PageTitle>

      <div className="grid gap-4 lg:grid-cols-[22rem_minmax(0,1fr)] lg:items-start lg:gap-5">
        <div className="flex flex-col gap-3">
          {plannedPending && <StartPlannedCardSkeleton />}
          {today.map((session) => (
            <StartPlannedCard
              key={session.id}
              session={session}
              tone="today"
              onStart={() =>
                void startFromTemplate({
                  templateId: session.template.id,
                  templateName: session.template.name,
                  plannedSessionId: session.id,
                  scheduledDate: session.scheduledDate,
                })
              }
            />
          ))}
          {nextUp && (
            <StartPlannedCard
              session={nextUp}
              tone="upcoming"
              // Started today: the performed date stays today; the planned entry is
              // still linked so the calendar marks it done.
              onStart={() =>
                void startFromTemplate({
                  templateId: nextUp.template.id,
                  templateName: nextUp.template.name,
                  plannedSessionId: nextUp.id,
                })
              }
            />
          )}
          {!plannedPending && today.length === 0 && !nextUp && (
            <div className="bg-card hidden flex-col gap-1 rounded-xl border p-5 lg:flex">
              <p className="font-heading text-lg font-bold">{t.startWorkout.nothingToday}</p>
              <p className="text-muted-foreground text-sm">{t.startWorkout.nothingTodayHint}</p>
              <Link
                to="/calendar"
                className="text-primary mt-2 inline-flex items-center gap-1.5 text-sm font-semibold"
              >
                <CalendarDays className="size-4" />
                {t.startWorkout.planInCalendar}
              </Link>
            </div>
          )}
          {emptyButton('hidden lg:inline-flex')}
        </div>

        <StartWorkoutPicker
          onSelectTemplate={(template) =>
            void startFromTemplate({ templateId: template.id, templateName: template.name })
          }
        />

        {emptyButton('lg:hidden')}
      </div>
    </div>
  );
}
