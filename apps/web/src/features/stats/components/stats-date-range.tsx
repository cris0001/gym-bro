import { format, subMonths } from 'date-fns';
import { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';
import { FIELD_CLASS } from '@/lib/form-styles';

import type { StatsRange } from '../api/stats';

type Period = '1m' | '3m' | '6m' | '1y' | 'all' | 'custom';

const PERIODS: { key: Period; label: string; months: number | null }[] = [
  { key: '1m', label: '1M', months: 1 },
  { key: '3m', label: '3M', months: 3 },
  { key: '6m', label: '6M', months: 6 },
  { key: '1y', label: '1Y', months: 12 },
  { key: 'all', label: 'All', months: null },
  { key: 'custom', label: 'Custom', months: null },
];

const DATE_FIELD = cn(FIELD_CLASS, 'min-w-0 flex-1 border px-2.5 outline-none');

// Period switch for the progress chart (default 3M) as a 36px segmented track that
// matches the exercise picker's height. "Custom" reveals a From / To pair. Emits the
// resolved StatsRange (server-side window) to the parent; undefined = all history.
export function StatsDateRange({
  onChange,
  className,
}: {
  onChange: (range: StatsRange | undefined) => void;
  className?: string;
}) {
  const [period, setPeriod] = useState<Period>('3m');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  useEffect(() => {
    if (period === 'custom') {
      const range: StatsRange = {};
      if (from) range.from = from;
      if (to) range.to = to;
      onChange(from || to ? range : undefined);
      return;
    }
    const months = PERIODS.find((p) => p.key === period)?.months;
    onChange(months ? { from: format(subMonths(new Date(), months), 'yyyy-MM-dd') } : undefined);
  }, [period, from, to, onChange]);

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="bg-secondary flex h-9 rounded-md p-[3px]">
        {PERIODS.map((p) => (
          <button
            key={p.key}
            type="button"
            aria-pressed={period === p.key}
            onClick={() => setPeriod(p.key)}
            className={cn(
              'h-full flex-1 rounded-sm px-2.5 text-[12.5px] font-semibold transition-colors',
              period === p.key
                ? 'bg-card text-accent-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {p.label}
          </button>
        ))}
      </div>
      {period === 'custom' && (
        <div className="flex items-center gap-2">
          <input
            type="date"
            aria-label="From date"
            className={DATE_FIELD}
            value={from}
            max={to || undefined}
            onChange={(e) => setFrom(e.target.value)}
          />
          <span className="text-muted-foreground text-sm">–</span>
          <input
            type="date"
            aria-label="To date"
            className={DATE_FIELD}
            value={to}
            min={from || undefined}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>
      )}
    </div>
  );
}
