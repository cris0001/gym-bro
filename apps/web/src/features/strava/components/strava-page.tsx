import { Activity } from 'lucide-react';
import { useEffect, useState } from 'react';

import type { StravaSessionItem } from '@gym-bro/shared';

import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { PageTitle } from '@/components/page-title';
import { Skeleton } from '@/components/ui/skeleton';

import { useStravaSessions } from '../hooks/use-strava-sessions';
import { useStravaStatus } from '../hooks/use-strava-status';
import type { Period } from '../utils/period';
import { StravaConnectionCard } from './strava-connection-card';
import { StravaContentSkeleton } from './strava-content-skeleton';
import { StravaFilters } from './strava-filters';
import { StravaHeaderActions } from './strava-header-actions';
import { StravaMonthList } from './strava-month-list';
import { StravaStatsPanel } from './strava-stats-panel';
import { StravaSyncStatus } from './strava-sync-status';

// Distinct activity types present, most frequent first — the sport filter pills.
function distinctTypes(sessions: StravaSessionItem[]): string[] {
  const counts = new Map<string, number>();
  for (const s of sessions) counts.set(s.activityType, (counts.get(s.activityType) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([type]) => type);
}

// The Strava page. Connected: the header carries the sync status + Import + a "⋯"
// menu; below, the sport/period filter bar, the stats (tiles + weekly bars), then the
// month-grouped activity list. Not connected: the connect card. A calendar deep-link
// (`initialActivityId`) opens that activity and scrolls to it.
export function StravaPage({ initialActivityId }: { initialActivityId?: string | undefined }) {
  const { data: status } = useStravaStatus();
  const { data: sessions = [], isPending, isError, refetch } = useStravaSessions();

  const [expandedId, setExpandedId] = useState<string | null>(initialActivityId ?? null);
  // Selected sport (null = all) — scopes both the stats and the list.
  const [type, setType] = useState<string | null>(null);
  const [period, setPeriod] = useState<Period>('month');

  useEffect(() => {
    if (!initialActivityId) return;
    setExpandedId(initialActivityId);
    const el = document.getElementById(`strava-activity-${initialActivityId}`);
    el?.scrollIntoView({ block: 'center' });
  }, [initialActivityId, sessions.length]);

  const toggle = (id: string) => setExpandedId((current) => (current === id ? null : id));
  const shown = type ? sessions.filter((s) => s.activityType === type) : sessions;

  return (
    <div className="lg:col-start-2 flex w-full max-w-6xl flex-col gap-4 p-3 md:p-4">
      <div className="flex items-center justify-between gap-2">
        <PageTitle className="font-heading text-[28px] leading-none font-bold tracking-tight">
          Strava
        </PageTitle>
        {status?.connected && <StravaHeaderActions status={status} />}
        {status === undefined && <Skeleton className="h-9.5 w-28 rounded-full" />}
      </div>
      {status?.connected && (
        <div className="-mt-2 sm:hidden">
          <StravaSyncStatus status={status} />
        </div>
      )}

      {/* Before the status arrives, assume the connected layout (the common case). */}
      {status === undefined && <StravaContentSkeleton />}

      {status && !status.connected && <StravaConnectionCard />}

      {status?.connected &&
        (isPending ? (
          <StravaContentSkeleton />
        ) : isError ? (
          <ErrorState message="Couldn't load your activities." onRetry={() => void refetch()} />
        ) : sessions.length === 0 ? (
          <EmptyState
            icon={<Activity className="size-6" />}
            title="No activities yet"
            description="Import recent activities from Strava to see them here and on your calendar."
          />
        ) : (
          <>
            <StravaFilters
              types={distinctTypes(sessions)}
              type={type}
              onTypeChange={setType}
              period={period}
              onPeriodChange={setPeriod}
            />
            <StravaStatsPanel sessions={shown} period={period} />
            <StravaMonthList sessions={shown} expandedId={expandedId} onToggle={toggle} />
          </>
        ))}
    </div>
  );
}
