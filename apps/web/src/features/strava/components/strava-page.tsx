import { format, parseISO, subMonths } from 'date-fns';
import { Activity } from 'lucide-react';
import { useEffect, useState } from 'react';

import type { StravaSessionItem } from '@gym-bro/shared';

import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

import { useStravaSessions } from '../hooks/use-strava-sessions';
import { useStravaStatus } from '../hooks/use-strava-status';
import { StravaActivityRow } from './strava-activity-row';
import { StravaConnectionCard } from './strava-connection-card';

type Period = 'all' | '1m' | '3m' | '6m' | '1y';
const PERIODS: { key: Period; label: string; months: number | null }[] = [
  { key: '1m', label: '1M', months: 1 },
  { key: '3m', label: '3M', months: 3 },
  { key: '6m', label: '6M', months: 6 },
  { key: '1y', label: '1Y', months: 12 },
  { key: 'all', label: 'All', months: null },
];

// Group activities (already newest-first) into month buckets, preserving order.
function groupByMonth(
  sessions: StravaSessionItem[],
): { key: string; label: string; items: StravaSessionItem[] }[] {
  const groups = new Map<string, StravaSessionItem[]>();
  for (const session of sessions) {
    const key = session.localDate.slice(0, 7); // YYYY-MM
    const existing = groups.get(key);
    if (existing) existing.push(session);
    else groups.set(key, [session]);
  }
  return [...groups.entries()].map(([key, items]) => ({
    key,
    label: format(parseISO(items[0]!.localDate), 'MMMM yyyy'),
    items,
  }));
}

// The Strava page: connect/import panel, a period filter, and the imported activities
// (newest first) each expandable to full metrics. `initialActivityId` (from a calendar
// deep-link) opens that activity and scrolls to it. All activities are loaded, so the
// period filter and deep-link both work client-side.
export function StravaPage({ initialActivityId }: { initialActivityId?: string | undefined }) {
  const { data: status } = useStravaStatus();
  const { data: sessions = [], isPending, isError, refetch } = useStravaSessions();

  const [period, setPeriod] = useState<Period>('all');
  const [expandedId, setExpandedId] = useState<string | null>(initialActivityId ?? null);

  // Open + scroll to a deep-linked activity once the list has loaded.
  useEffect(() => {
    if (!initialActivityId) return;
    setExpandedId(initialActivityId);
    const el = document.getElementById(`strava-activity-${initialActivityId}`);
    el?.scrollIntoView({ block: 'center' });
  }, [initialActivityId, sessions.length]);

  const months = PERIODS.find((p) => p.key === period)?.months ?? null;
  const cutoff = months ? subMonths(new Date(), months) : null;
  const filtered = cutoff ? sessions.filter((s) => parseISO(s.localDate) >= cutoff) : sessions;

  return (
    <div className="lg:col-start-2 flex w-full max-w-3xl flex-col gap-4 p-4">
      <h1 className="text-2xl font-bold">Strava</h1>

      {status && <StravaConnectionCard status={status} />}

      {status?.connected && (
        <>
          <div className="bg-muted flex w-fit gap-0.5 rounded-md p-0.5">
            {PERIODS.map((p) => (
              <Button
                key={p.key}
                type="button"
                size="sm"
                variant={period === p.key ? 'default' : 'ghost'}
                className={cn('h-7 px-2', period !== p.key && 'text-muted-foreground')}
                onClick={() => setPeriod(p.key)}
              >
                {p.label}
              </Button>
            ))}
          </div>

          {isPending ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-xl" />
              ))}
            </div>
          ) : isError ? (
            <ErrorState message="Couldn't load your activities." onRetry={() => void refetch()} />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={<Activity className="size-6" />}
              title="No activities yet"
              description="Import recent activities from Strava to see them here and on your calendar."
            />
          ) : (
            <div className="flex flex-col gap-4">
              {groupByMonth(filtered).map((group) => (
                <section key={group.key} className="flex flex-col gap-2">
                  <h2 className="text-muted-foreground bg-background/95 sticky top-14 z-[1] py-1 text-xs font-semibold uppercase backdrop-blur lg:top-0">
                    {group.label}
                  </h2>
                  <ul className="flex flex-col gap-2">
                    {group.items.map((session) => (
                      <StravaActivityRow
                        key={session.id}
                        session={session}
                        expanded={expandedId === session.id}
                        onToggle={() =>
                          setExpandedId((current) => (current === session.id ? null : session.id))
                        }
                      />
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
