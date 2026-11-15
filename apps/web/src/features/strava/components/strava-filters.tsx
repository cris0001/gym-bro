import { cn } from '@/lib/utils';
import { useHScroll } from '@/hooks/use-h-scroll';

import { stravaActivityIcon } from '../utils/activity-icon';
import { type Period, PERIODS } from '../utils/period';
import { activityTypeLabel, useStravaTranslation } from '../i18n';

interface StravaFiltersProps {
  types: string[];
  type: string | null;
  onTypeChange: (type: string | null) => void;
  period: Period;
  onPeriodChange: (period: Period) => void;
}

const PILL =
  'flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-[13px] font-semibold whitespace-nowrap transition-colors';

// The Strava page's filter bar: sport pills (icon + name, scoped to the types present)
// that filter the stats and the list, and the period switch (styled like Stats').
export function StravaFilters({
  types,
  type,
  onTypeChange,
  period,
  onPeriodChange,
}: StravaFiltersProps) {
  const t = useStravaTranslation();
  const scrollRef = useHScroll<HTMLDivElement>(type);
  const pillClass = (active: boolean) =>
    cn(
      PILL,
      active
        ? 'bg-foreground text-background border-foreground'
        : 'bg-card border-border-strong text-subtle-foreground hover:bg-muted',
    );

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {types.length > 1 ? (
        <div
          ref={scrollRef}
          className="no-scrollbar -mx-3 flex min-w-0 gap-1.5 overflow-x-auto px-3 sm:mx-0 sm:px-0"
        >
          <button
            type="button"
            aria-pressed={type === null}
            onClick={() => onTypeChange(null)}
            className={pillClass(type === null)}
          >
            {t.all}
          </button>
          {types.map((sport) => {
            const Icon = stravaActivityIcon(sport);
            const active = type === sport;
            return (
              <button
                key={sport}
                type="button"
                aria-pressed={active}
                onClick={() => onTypeChange(active ? null : sport)}
                className={pillClass(active)}
              >
                <Icon className="size-3.5" />
                {activityTypeLabel(t, sport)}
              </button>
            );
          })}
        </div>
      ) : (
        <span />
      )}

      <div className="bg-secondary flex h-9 shrink-0 rounded-md p-[3px] sm:w-60">
        {PERIODS.map((p) => (
          <button
            key={p.key}
            type="button"
            aria-pressed={period === p.key}
            onClick={() => onPeriodChange(p.key)}
            className={cn(
              'h-full flex-1 rounded-sm px-2.5 text-[12.5px] font-semibold transition-colors',
              period === p.key
                ? 'bg-card text-accent-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {t.periods[p.key]}
          </button>
        ))}
      </div>
    </div>
  );
}
