import { format, subMonths } from 'date-fns';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FIELD_CLASS, LABEL_CLASS } from '@/lib/form-styles';
import { cn } from '@/lib/utils';
import { PageTitle } from '@/components/page-title';

import type { BodyMeasurement } from '@gym-bro/shared';

import { useBodyMeasurements } from '../hooks/use-body-measurements';
import { useTargetHistory } from '../hooks/use-target-history';
import { useBodyTranslation } from '../i18n';
import { useBodyUiStore } from '../stores/body-ui.store';
import { BodyMeasurementForm } from './body-measurement-form';
import { BodyStatsPanel } from './body-stats-panel';
import { BodyTrendChart } from './body-trend-chart';
import { BodyTrendsSkeleton } from './body-trends-skeleton';
import { MeasurementList } from './measurement-list';
import { MeasurementListSkeleton } from './measurement-list-skeleton';

type Period = '1m' | '3m' | '6m' | '1y' | 'all';

const PERIODS: { key: Period; months: number | null }[] = [
  { key: '1m', months: 1 },
  { key: '3m', months: 3 },
  { key: '6m', months: 6 },
  { key: '1y', months: 12 },
  { key: 'all', months: null },
];

// Inline date fields in the trends header: the app's field look at a compact height.
const DATE_FIELD = cn(FIELD_CLASS, 'h-9 w-full min-w-0 px-2.5 text-[13px] md:text-[13px]');

const CARD = 'bg-card flex flex-col gap-4 rounded-xl border p-4 sm:p-5';
const MICRO_LABEL = 'text-muted-foreground text-[11px] font-medium tracking-[0.08em] uppercase';

// Entries within the period (newest-first order preserved). The cutoff compares
// 'YYYY-MM-DD' strings lexically, which matches chronological order.
function filterByPeriod(entries: BodyMeasurement[], period: Period): BodyMeasurement[] {
  const months = PERIODS.find((p) => p.key === period)?.months;
  if (!months) return entries;
  const cutoff = format(subMonths(new Date(), months), 'yyyy-MM-dd');
  return entries.filter((entry) => entry.measuredDate >= cutoff);
}

// Entries within an explicit from/to window (either bound optional).
function filterByRange(entries: BodyMeasurement[], from: string, to: string): BodyMeasurement[] {
  return entries.filter(
    (entry) =>
      (from === '' || entry.measuredDate >= from) && (to === '' || entry.measuredDate <= to),
  );
}

// The body-measurements page: a prominent quick-add/edit form, a trends card with
// a period selector that scopes both the chart and the history below it, and the
// (period-filtered) measurement history. Mobile-first single column.
export function BodyPage() {
  const t = useBodyTranslation();
  const { data, isPending } = useBodyMeasurements();
  // Full target history (unfiltered): the chart step-holds each date's applicable
  // target, so a target set before the visible window still applies within it.
  const { data: targets } = useTargetHistory();
  const editing = useBodyUiStore((s) => s.editing);
  const [period, setPeriod] = useState<Period>('3m');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const entries = data ?? [];
  // An explicit from/to window takes over from the quick period buttons.
  const customRange = from !== '' || to !== '';
  const filtered = customRange ? filterByRange(entries, from, to) : filterByPeriod(entries, period);

  function selectPeriod(next: Period) {
    setPeriod(next);
    setFrom('');
    setTo('');
  }

  return (
    <div className="lg:col-start-2 flex w-full max-w-6xl flex-col gap-4 p-3 md:p-4">
      <PageTitle className="font-heading text-[28px] leading-none font-bold tracking-tight">
        {t.title}
      </PageTitle>

      <div className="grid gap-4 lg:grid-cols-[22rem_1fr] lg:items-start">
        <section className={CARD}>
          <h2 className={MICRO_LABEL}>{editing ? t.form.editTitle : t.form.addTitle}</h2>
          <BodyMeasurementForm />
        </section>

        <section className={cn(CARD, 'min-w-0')}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className={MICRO_LABEL}>{t.trends.title}</h2>
            <div className="bg-secondary flex h-9 rounded-md p-[3px]">
              {PERIODS.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => selectPeriod(p.key)}
                  className={cn(
                    'h-full rounded-sm px-2.5 text-[12.5px] font-semibold transition-colors',
                    !customRange && period === p.key
                      ? 'bg-card text-accent-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {p.key === 'all'
                    ? t.trends.all
                    : p.key === '1y'
                      ? t.trends.oneYear
                      : p.key.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-end gap-2 text-sm">
            <label className="flex min-w-0 flex-1 flex-col gap-1">
              <span className={LABEL_CLASS}>{t.trends.from}</span>
              <Input
                type="date"
                aria-label={t.trends.fromAria}
                className={DATE_FIELD}
                value={from}
                max={to || undefined}
                onChange={(e) => setFrom(e.target.value)}
              />
            </label>
            <label className="flex min-w-0 flex-1 flex-col gap-1">
              <span className={LABEL_CLASS}>{t.trends.to}</span>
              <Input
                type="date"
                aria-label={t.trends.toAria}
                className={DATE_FIELD}
                value={to}
                min={from || undefined}
                onChange={(e) => setTo(e.target.value)}
              />
            </label>
            {customRange && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-9 shrink-0"
                onClick={() => selectPeriod(period)}
              >
                {t.trends.clear}
              </Button>
            )}
          </div>
          {/* While the history loads the stats/chart would read as "no data" —
                show their shape instead. */}
          {isPending ? (
            <BodyTrendsSkeleton />
          ) : (
            <>
              <BodyStatsPanel entries={filtered} />
              {/* Near-edge on mobile (like Stats) so the plot gets the width. */}
              <div className="-mx-2.5 sm:mx-0">
                <BodyTrendChart entries={filtered} targets={targets ?? []} />
              </div>
            </>
          )}
        </section>
      </div>

      <section className="flex flex-col gap-2">
        <h2 className="font-heading text-lg font-semibold">{t.history.title}</h2>
        {isPending ? <MeasurementListSkeleton /> : <MeasurementList entries={filtered} />}
      </section>
    </div>
  );
}
