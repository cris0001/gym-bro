import { format, subMonths } from 'date-fns';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import type { StatsRange } from '../api/stats';

type Period = '1m' | '3m' | '6m' | '1y' | 'all';

const PERIODS: { key: Period; label: string; months: number | null }[] = [
  { key: '1m', label: '1M', months: 1 },
  { key: '3m', label: '3M', months: 3 },
  { key: '6m', label: '6M', months: 6 },
  { key: '1y', label: '1Y', months: 12 },
  { key: 'all', label: 'All', months: null },
];

// Date-range control mirroring the body section: quick period buttons (default 3M)
// plus an explicit from/to window that takes over when set. Emits the resolved
// StatsRange (server-side window) to the parent; undefined = all history.
export function StatsDateRange({
  onChange,
}: {
  onChange: (range: StatsRange | undefined) => void;
}) {
  const [period, setPeriod] = useState<Period>('3m');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const customRange = from !== '' || to !== '';

  useEffect(() => {
    let range: StatsRange | undefined;
    if (customRange) {
      range = {};
      if (from) range.from = from;
      if (to) range.to = to;
    } else {
      const months = PERIODS.find((p) => p.key === period)?.months;
      range = months ? { from: format(subMonths(new Date(), months), 'yyyy-MM-dd') } : undefined;
    }
    onChange(range);
  }, [period, from, to, customRange, onChange]);

  const selectPeriod = (next: Period) => {
    setPeriod(next);
    setFrom('');
    setTo('');
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="bg-muted flex w-fit gap-0.5 rounded-md p-0.5">
        {PERIODS.map((p) => (
          <Button
            key={p.key}
            type="button"
            size="sm"
            variant={!customRange && period === p.key ? 'default' : 'ghost'}
            className={cn('h-7 px-2', (customRange || period !== p.key) && 'text-muted-foreground')}
            onClick={() => selectPeriod(p.key)}
          >
            {p.label}
          </Button>
        ))}
      </div>
      <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-sm">
        <input
          type="date"
          aria-label="From date"
          className="border-input text-foreground h-9 rounded-md border bg-background px-2 text-sm"
          value={from}
          max={to || undefined}
          onChange={(e) => setFrom(e.target.value)}
        />
        <span>–</span>
        <input
          type="date"
          aria-label="To date"
          className="border-input text-foreground h-9 rounded-md border bg-background px-2 text-sm"
          value={to}
          min={from || undefined}
          onChange={(e) => setTo(e.target.value)}
        />
        {customRange ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-9"
            onClick={() => selectPeriod(period)}
          >
            Clear
          </Button>
        ) : null}
      </div>
    </div>
  );
}
