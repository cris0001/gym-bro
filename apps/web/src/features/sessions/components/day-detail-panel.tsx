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
    // The panel itself is transparent (sits on the muted canvas); the date is a bare
    // caption and only the inner session cards carry the light card background.
    <aside className="h-fit lg:sticky lg:top-4">
      <header className="flex items-end justify-between gap-2 px-4 pt-1 pb-1">
        <div className="flex flex-col">
          <span className="font-heading text-muted-foreground text-sm italic">
            {format(parseISO(date), 'EEEE')}
          </span>
          <h2 className="font-heading text-xl font-semibold">
            {format(parseISO(date), 'MMM d, yyyy')}
          </h2>
        </div>
        {isToday && (
          <span className="bg-accent text-primary rounded-full px-2.5 py-0.5 text-xs font-medium">
            Today
          </span>
        )}
      </header>
      <DayDetail date={date} />
    </aside>
  );
}
