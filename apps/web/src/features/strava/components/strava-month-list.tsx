import { format, parseISO } from 'date-fns';

import type { StravaSessionItem } from '@gym-bro/shared';

import { formatDistance } from '../utils/format';
import { summarize } from '../utils/stats';
import { StravaActivityRow } from './strava-activity-row';

// Group activities (already newest-first) into month buckets, preserving order.
function groupByMonth(sessions: StravaSessionItem[]) {
  const groups = new Map<string, StravaSessionItem[]>();
  for (const session of sessions) {
    const key = session.localDate.slice(0, 7); // YYYY-MM
    const existing = groups.get(key);
    if (existing) existing.push(session);
    else groups.set(key, [session]);
  }
  return [...groups.entries()].map(([key, items]) => ({
    key,
    label: format(parseISO(items[0]!.localDate), 'LLLL yyyy'),
    items,
  }));
}

// "14 activities · 186 km" — the month header's summary (distance only if any).
function monthSummary(items: StravaSessionItem[]): string {
  const totals = summarize(items);
  const count = `${totals.count} ${totals.count === 1 ? 'activity' : 'activities'}`;
  return totals.distanceM > 0 ? `${count} · ${formatDistance(totals.distanceM)}` : count;
}

// The activity list: one card per month (newest first) with a header line carrying
// the month's count + distance, and the activities as rows inside it.
export function StravaMonthList({
  sessions,
  expandedId,
  onToggle,
}: {
  sessions: StravaSessionItem[];
  expandedId: string | null;
  onToggle: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      {groupByMonth(sessions).map((group) => (
        <section key={group.key} className="flex flex-col gap-2">
          <div className="text-muted-foreground flex justify-between gap-2 px-0.5 text-[11px] font-medium tracking-[0.08em] uppercase">
            <h2>{group.label}</h2>
            <span>{monthSummary(group.items)}</span>
          </div>
          <ul className="bg-card overflow-hidden rounded-xl border">
            {group.items.map((session) => (
              <StravaActivityRow
                key={session.id}
                session={session}
                expanded={expandedId === session.id}
                onToggle={() => onToggle(session.id)}
              />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
