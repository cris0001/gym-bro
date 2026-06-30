import { format, parseISO } from 'date-fns';

import { useCalendarUiStore } from '../stores/calendar-ui.store';
import { DayDetail } from './day-detail';

// Desktop presentation of the selected calendar day: an inline side panel (no
// modal) hosting the shared DayDetail body. Shows an empty prompt until a day is
// tapped. On mobile the same body appears in a bottom sheet (see DayDetailSheet).
export function DayDetailPanel() {
  const selectedDate = useCalendarUiStore((s) => s.selectedDate);

  return (
    <aside className="bg-card h-fit overflow-hidden rounded-xl border lg:sticky lg:top-4">
      {selectedDate ? (
        <>
          <header className="border-b p-4">
            <h2 className="font-semibold">{format(parseISO(selectedDate), 'EEEE, MMM d')}</h2>
          </header>
          <DayDetail date={selectedDate} />
        </>
      ) : (
        <p className="text-muted-foreground p-8 text-center text-sm">
          Select a day to see its sessions.
        </p>
      )}
    </aside>
  );
}
