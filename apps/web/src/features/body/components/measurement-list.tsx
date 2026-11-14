import type { BodyMeasurement } from '@gym-bro/shared';

import { cn } from '@/lib/utils';

import { useBodyTranslation } from '../i18n';
import { historyGroups } from '../utils/measurement-history';
import { HISTORY_COLUMNS, MeasurementRow } from './measurement-row';

const MICRO_LABEL = 'text-muted-foreground text-[11px] font-medium tracking-[0.08em] uppercase';

// The measurement history, newest first, as one card per month: a compact list on
// mobile and a columned table (with a header row) from md up.
export function MeasurementList({ entries }: { entries: BodyMeasurement[] }) {
  const t = useBodyTranslation();

  if (entries.length === 0) {
    return (
      <p className="bg-card text-muted-foreground rounded-xl border px-4 py-4 text-sm">
        {t.history.empty}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {historyGroups(entries).map((group) => (
        <section key={group.key} className="flex flex-col gap-2">
          <p className={cn(MICRO_LABEL, 'px-0.5')}>{group.label}</p>
          <div className="bg-card overflow-hidden rounded-xl border">
            <div className={cn('hidden border-b px-5 py-2.5', MICRO_LABEL, HISTORY_COLUMNS)}>
              <span>{t.history.columns.date}</span>
              <span>{t.history.columns.weight}</span>
              <span>{t.history.columns.bodyFat}</span>
              <span>{t.history.columns.circumferences}</span>
              <span />
            </div>
            <ul>
              {group.rows.map((row) => (
                <MeasurementRow key={row.entry.id} row={row} />
              ))}
            </ul>
          </div>
        </section>
      ))}
    </div>
  );
}
