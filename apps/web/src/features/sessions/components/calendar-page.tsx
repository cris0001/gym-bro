import { CalendarGrid } from './calendar-grid';
import { DayDetailSheet } from './day-detail-sheet';

// The Calendar screen: the month grid of planned sessions plus the day-detail
// Sheet (which reads its open state from the calendar UI store). Tapping a day
// in the grid opens the Sheet for that date.
export function CalendarPage() {
  return (
    <div className="flex flex-col p-4">
      <h1 className="mb-4 text-2xl font-bold">Calendar</h1>
      <CalendarGrid />
      <DayDetailSheet />
    </div>
  );
}
