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
    <div className="flex flex-col gap-2 rounded-lg border p-4">
      <div className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
        <CalendarDays className="text-primary size-5" />
        Next session
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
