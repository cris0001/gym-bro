import { Link } from '@tanstack/react-router';
import { format, parseISO } from 'date-fns';
import { CalendarDays } from 'lucide-react';

import type { PlannedSessionWithTemplate } from '@gym-bro/shared';

interface NextSessionCardProps {
  session: PlannedSessionWithTemplate | null;
}

// The soonest upcoming planned session, or a prompt to plan one.
export function NextSessionCard({ session }: NextSessionCardProps) {
  return (
    <div className="bg-card flex flex-col gap-2 rounded-xl border p-4 transition-shadow hover:shadow-md">
      <div className="flex items-center gap-2 text-sm font-medium">
        <span className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg">
          <CalendarDays className="size-4" />
        </span>
        <span className="text-muted-foreground">Next session</span>
      </div>
      {session ? (
        <>
          <span className="text-xl font-semibold">{session.template.name}</span>
          <span className="text-muted-foreground text-sm">
            {format(parseISO(session.scheduledDate), 'EEEE, MMM d')}
          </span>
        </>
      ) : (
        <>
          <span className="text-muted-foreground text-sm">Nothing planned.</span>
          <Link to="/calendar" className="text-primary text-sm underline">
            Plan one
          </Link>
        </>
      )}
    </div>
  );
}
