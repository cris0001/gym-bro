import { format, parseISO } from 'date-fns';

import { useCalendarUiStore } from '../stores/calendar-ui.store';
import { DayDetail } from './day-detail';

const ISO = 'yyyy-MM-dd';

// Desktop presentation of a calendar day: an inline side panel hosting the shared
// DayDetail body. Defaults to today when nothing is selected (so it's never an
// empty prompt), with a styled date header. On mobile the same body appears in a
// bottom sheet (see DayDetailSheet).
export function DayDetailPanel() {
  const selectedDate = useCalendarUiStore((s) => s.selectedDate);
  const todayIso = format(new Date(), ISO);
  const date = selectedDate ?? todayIso;
  const isToday = date === todayIso;

  return (
    <aside className="bg-card h-fit overflow-hidden rounded-xl border lg:sticky lg:top-4">
      <header className="bg-muted/40 flex items-center justify-between gap-2 border-b p-4">
        <div className="flex flex-col">
          <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            {format(parseISO(date), 'EEEE')}
          </span>
          <h2 className="text-lg font-semibold">{format(parseISO(date), 'MMM d, yyyy')}</h2>
        </div>
        {isToday && (
          <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium">
            Today
          </span>
        )}
      </header>
      <DayDetail date={date} />
    </aside>
  );
}
