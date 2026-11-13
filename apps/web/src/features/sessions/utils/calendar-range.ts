import { endOfMonth, endOfWeek, format, parseISO, startOfMonth, startOfWeek } from 'date-fns';

import type { CalendarViewMode } from '../stores/calendar-ui.store';

const ISO = 'yyyy-MM-dd';

export interface CalendarRange {
  start: Date;
  end: Date;
  from: string;
  to: string;
}

// The window the calendar grid shows — and fetches — for an anchor date: the whole
// weeks spanning its month (bleeding into the adjacent months), or the single week
// around it. The day detail reads the same window, so both share one cached query.
export function calendarRange(anchor: Date, viewMode: CalendarViewMode): CalendarRange {
  const start =
    viewMode === 'week'
      ? startOfWeek(anchor, { weekStartsOn: 1 })
      : startOfWeek(startOfMonth(anchor), { weekStartsOn: 1 });
  const end =
    viewMode === 'week'
      ? endOfWeek(anchor, { weekStartsOn: 1 })
      : endOfWeek(endOfMonth(anchor), { weekStartsOn: 1 });
  return { start, end, from: format(start, ISO), to: format(end, ISO) };
}

// The cached window a day's detail should read: the grid's own when the day is on
// screen (no request), else the month grid around the day — one request covers every
// other day of that month too, e.g. while stepping past the edge with the arrows.
export function rangeForDay(
  date: string,
  anchor: Date,
  viewMode: CalendarViewMode,
): Pick<CalendarRange, 'from' | 'to'> {
  const grid = calendarRange(anchor, viewMode);
  if (date >= grid.from && date <= grid.to) return grid;
  return calendarRange(parseISO(date), 'month');
}
