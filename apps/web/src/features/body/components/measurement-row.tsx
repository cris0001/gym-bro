import { parseISO } from 'date-fns';

import { EditIconButton } from '@/components/edit-icon-button';
import { cn } from '@/lib/utils';

import { seriesLabel, useBodyTranslation } from '../i18n';
import { useBodyUiStore } from '../stores/body-ui.store';
import { CIRCUMFERENCES, type HistoryRow } from '../utils/measurement-history';
import { MeasurementDeleteButton } from './measurement-delete-button';
import { formatDate } from '@/lib/i18n/date-format';

// Shared with MeasurementList's desktop header so the columns line up.
export const HISTORY_COLUMNS =
  'md:grid md:grid-cols-[9rem_9rem_6rem_minmax(0,1fr)_4.5rem] md:gap-3';

function Delta({ value }: { value: number | null }) {
  if (value === null || value === 0) return null;
  return (
    <span
      className={cn(
        'ml-1.5 text-xs font-semibold tabular-nums',
        value < 0 ? 'text-[#5a7a52] dark:text-[#8fae85]' : 'text-destructive',
      )}
    >
      {value > 0 ? '+' : '−'}
      {Math.abs(value)}
    </span>
  );
}

// One history entry. Mobile: weight + delta over "date · body fat", actions right.
// Desktop: a table row — date, weight, body fat, circumferences (+ notes), actions.
export function MeasurementRow({ row }: { row: HistoryRow }) {
  const t = useBodyTranslation();
  const openEdit = useBodyUiStore((s) => s.openEdit);
  const { entry, delta } = row;

  const date = formatDate(parseISO(entry.measuredDate), 'EEE, MMM d');
  const weight = entry.weightKg !== null ? `${entry.weightKg} kg` : '—';
  const bodyFat = entry.bodyFatPct !== null ? `${entry.bodyFatPct} %` : null;
  const circumferences = CIRCUMFERENCES.filter((key) => entry[key] !== null)
    .map((key) => `${seriesLabel(t, key) ?? key} ${entry[key]}`)
    .join(' · ');

  const actions = (
    <div className="flex shrink-0 items-center justify-end gap-1">
      <EditIconButton
        aria-label={t.history.editAria(entry.measuredDate)}
        onClick={() => openEdit(entry)}
      />
      <MeasurementDeleteButton entry={entry} />
    </div>
  );

  return (
    <li className="border-t px-4 py-2.5 first:border-t-0 md:px-5">
      <div className="flex items-center gap-3 md:hidden">
        <div className="min-w-0 flex-1">
          <p className="font-heading text-[15px] font-bold tabular-nums">
            {weight}
            <Delta value={delta} />
          </p>
          <p className="text-muted-foreground truncate text-xs">
            {date}
            {bodyFat && ` · ${bodyFat} ${t.history.bodyFatShort}`}
            {circumferences && ` · ${circumferences}`}
          </p>
        </div>
        {actions}
      </div>

      <div className={cn('hidden items-center text-sm', HISTORY_COLUMNS)}>
        <span className="text-muted-foreground">{date}</span>
        <span className="tabular-nums">
          <span className="font-semibold">{weight}</span>
          <Delta value={delta} />
        </span>
        <span className="tabular-nums">{bodyFat ?? '—'}</span>
        <span className="text-muted-foreground min-w-0 text-[13px]">
          <span className="block truncate">{circumferences || '—'}</span>
          {entry.notes && <span className="block truncate text-xs italic">{entry.notes}</span>}
        </span>
        {actions}
      </div>
    </li>
  );
}
