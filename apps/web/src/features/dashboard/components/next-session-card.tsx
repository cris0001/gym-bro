import { Link } from '@tanstack/react-router';
import { differenceInCalendarDays, format, parseISO } from 'date-fns';

import { useStartWorkout } from '@/features/sessions';
import { Button } from '@/components/ui/button';

import type { PlannedSessionWithTemplate } from '@gym-bro/shared';

interface NextSessionCardProps {
  session: PlannedSessionWithTemplate | null;
}

const microLabel = 'text-muted-foreground text-[11px] font-medium tracking-[0.08em] uppercase';
const secondaryPill = 'bg-accent text-primary hover:bg-accent/70 h-10 rounded-full px-4';

function relativeDay(days: number): string {
  if (days <= 0) return 'today';
  if (days === 1) return 'tomorrow';
  return `in ${days} days`;
}

// The soonest upcoming planned session, or a prompt to plan one. Text-forward stat card.
export function NextSessionCard({ session }: NextSessionCardProps) {
  const { startFromTemplate } = useStartWorkout();
  return (
    <div className="bg-card flex h-full flex-col gap-1.5 rounded-2xl border p-5">
      <p className={microLabel}>Next session</p>
      {session ? (
        <>
          <div className="flex flex-col gap-0.5">
            <p className="font-heading text-[22px] leading-tight font-semibold">
              {session.template.name}
            </p>
            <p className="text-muted-foreground text-sm">
              {format(parseISO(session.scheduledDate), 'EEEE, MMM d')} ·{' '}
              {relativeDay(differenceInCalendarDays(parseISO(session.scheduledDate), new Date()))}
            </p>
          </div>
          <div className="mt-auto flex flex-wrap gap-2 pt-2">
            <Button
              className="h-10 rounded-full px-4"
              onClick={() =>
                void startFromTemplate({
                  templateId: session.template.id,
                  templateName: session.template.name,
                  plannedSessionId: session.id,
                  scheduledDate: session.scheduledDate,
                })
              }
            >
              Start early
            </Button>
            <Button asChild variant="ghost" className={secondaryPill}>
              <Link to="/calendar">Reschedule</Link>
            </Button>
          </div>
        </>
      ) : (
        <>
          <p className="font-heading text-[22px] leading-tight font-semibold">Nothing planned</p>
          <Button asChild variant="ghost" className={`${secondaryPill} mt-auto w-fit`}>
            <Link to="/calendar">Plan one</Link>
          </Button>
        </>
      )}
    </div>
  );
}
