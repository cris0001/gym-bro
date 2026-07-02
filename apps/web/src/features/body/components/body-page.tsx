import { format, subMonths } from 'date-fns';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

import type { BodyMeasurement } from '@gym-bro/shared';

import { useBodyMeasurements } from '../hooks/use-body-measurements';
import { useTargetHistory } from '../hooks/use-target-history';
import { useBodyUiStore } from '../stores/body-ui.store';
import { BodyMeasurementForm } from './body-measurement-form';
import { BodyStatsPanel } from './body-stats-panel';
import { BodyTrendChart } from './body-trend-chart';
import { MeasurementList } from './measurement-list';

type Period = '1m' | '3m' | '6m' | '1y' | 'all';

const PERIODS: { key: Period; label: string; months: number | null }[] = [
  { key: '1m', label: '1M', months: 1 },
  { key: '3m', label: '3M', months: 3 },
  { key: '6m', label: '6M', months: 6 },
  { key: '1y', label: '1Y', months: 12 },
  { key: 'all', label: 'All', months: null },
];

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
  const { data } = useBodyMeasurements();
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
    <div className="lg:col-start-2 flex w-full max-w-6xl flex-col gap-4 p-4">
      <h1 className="text-2xl font-bold">Body</h1>

      <div className="grid gap-4 lg:grid-cols-[22rem_1fr] lg:items-start">
        <Card>
          <CardHeader>
            <CardTitle>{editing ? 'Edit measurement' : 'Add measurement'}</CardTitle>
          </CardHeader>
          <CardContent>
            <BodyMeasurementForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
            <CardTitle>Trends</CardTitle>
            <div className="bg-muted flex gap-0.5 rounded-md p-0.5">
              {PERIODS.map((p) => (
                <Button
                  key={p.key}
                  type="button"
                  size="sm"
                  variant={!customRange && period === p.key ? 'default' : 'ghost'}
                  className={cn(
                    'h-7 px-2',
                    (customRange || period !== p.key) && 'text-muted-foreground',
                  )}
                  onClick={() => selectPeriod(p.key)}
                >
                  {p.label}
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-end gap-2 text-sm">
              <label className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="text-muted-foreground text-xs">From</span>
                <input
                  type="date"
                  aria-label="From date"
                  className="border-input text-foreground h-9 w-full min-w-0 rounded-md border bg-background px-2 text-sm"
                  value={from}
                  max={to || undefined}
                  onChange={(e) => setFrom(e.target.value)}
                />
              </label>
              <label className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="text-muted-foreground text-xs">To</span>
                <input
                  type="date"
                  aria-label="To date"
                  className="border-input text-foreground h-9 w-full min-w-0 rounded-md border bg-background px-2 text-sm"
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
                  Clear
                </Button>
              )}
            </div>
            <BodyStatsPanel entries={filtered} />
            <BodyTrendChart entries={filtered} targets={targets ?? []} />
          </CardContent>
        </Card>
      </div>

      <section className="flex flex-col gap-2">
        <h2 className="font-semibold">History</h2>
        <div className="bg-card rounded-xl border px-4">
          <MeasurementList entries={filtered} targets={targets ?? []} />
        </div>
      </section>
    </div>
  );
}
