import { parseISO } from 'date-fns';
import { Star } from 'lucide-react';

import { cn } from '@/lib/utils';

import { useRatingTrend } from '../hooks/use-stats';
import { useStatsTranslation } from '../i18n';
import { summarizeRatings } from '../utils/rating-summary';

import { ChartPlaceholder } from './chart-placeholder';
import { RatingSummarySkeleton } from './rating-summary-skeleton';
import { formatDate } from '@/lib/i18n/date-format';

// The workout-rating history as a short summary: the overall average, the last 30
// days' direction, how the ratings spread across 1–5, and the latest sessions.
export function RatingSummaryCard() {
  const t = useStatsTranslation();
  const { data: points = [], isPending } = useRatingTrend();

  if (isPending) return <RatingSummarySkeleton />;
  if (points.length === 0) return <ChartPlaceholder>{t.ratings.empty}</ChartPlaceholder>;

  const summary = summarizeRatings(points);
  const maxBucket = Math.max(...summary.distribution);

  return (
    <div className="flex flex-col gap-5">
      {/* Just the overall average, with the last 30 days on one line beneath it. */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <span className="font-heading text-[44px] leading-none font-bold tabular-nums">
            {summary.average.toFixed(1)}
          </span>
          <Star className="size-6 fill-primary text-primary" />
        </div>
        {summary.recentAverage !== null ? (
          <p className="text-muted-foreground text-[13px]">
            {t.ratings.last30Days}{' '}
            <span className="text-foreground font-semibold tabular-nums">
              {summary.recentAverage.toFixed(1)}
            </span>
            {summary.recentDelta !== null ? <Delta value={summary.recentDelta} /> : null}
          </p>
        ) : null}
      </div>

      {/* 5 stars at the top, like a review breakdown. */}
      <div className="flex flex-col gap-1.5">
        {[5, 4, 3, 2, 1].map((stars) => {
          const count = summary.distribution[stars - 1] ?? 0;
          return (
            <div key={stars} className="flex items-center gap-2.5 text-[12.5px]">
              <span className="text-muted-foreground w-6 shrink-0 tabular-nums">{stars}★</span>
              <div className="bg-secondary h-2 flex-1 overflow-hidden rounded-full">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: maxBucket > 0 ? `${(count / maxBucket) * 100}%` : 0 }}
                />
              </div>
              <span className="text-muted-foreground w-6 shrink-0 text-right tabular-nums">
                {count}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col">
        <p className="text-muted-foreground mb-1 text-[11px] font-medium tracking-[0.08em] uppercase">
          {t.ratings.latest}
        </p>
        <ul className="divide-border divide-y">
          {summary.latest.map((point) => (
            <li key={point.sessionId} className="flex items-center gap-3 py-2">
              <span className="text-muted-foreground w-12 shrink-0 text-[12px]">
                {formatDate(parseISO(point.date), 'MMM d')}
              </span>
              <span className="min-w-0 flex-1 truncate text-[13.5px] font-medium">
                {point.name}
              </span>
              <Stars rating={point.rating} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Delta({ value }: { value: number }) {
  if (Math.abs(value) < 0.05) return <span> · steady</span>;
  const up = value > 0;
  return (
    <span
      className={cn(
        'font-semibold',
        up ? 'text-[#4a6943] dark:text-[#8fae85]' : 'text-destructive',
      )}
    >
      {' '}
      · {up ? '▲' : '▼'} {Math.abs(value).toFixed(1)}
    </span>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex shrink-0 gap-0.5" aria-label={`${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={cn(
            'size-3.5',
            n <= rating ? 'fill-primary text-primary' : 'text-border-strong',
          )}
        />
      ))}
    </span>
  );
}
