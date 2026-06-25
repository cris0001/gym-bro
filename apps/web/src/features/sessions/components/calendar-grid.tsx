import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import type { PlannedSessionWithTemplate, PlannedStatus } from '@gym-bro/shared';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { usePlannedSessions } from '../hooks/use-planned-sessions';
import { useCalendarUiStore } from '../stores/calendar-ui.store';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Dot color per planned status: planned = accent, completed = green, skipped =
// muted. Markers on the calendar are status-coded so the month reads at a glance.
const STATUS_DOT: Record<PlannedStatus, string> = {
  planned: 'bg-primary',
  completed: 'bg-green-500',
  skipped: 'bg-muted-foreground/50',
};

const ISO = 'yyyy-MM-dd';

// Groups planned sessions by their scheduled day for O(1) per-cell lookup.
function groupByDate(
  sessions: PlannedSessionWithTemplate[],
): Map<string, PlannedSessionWithTemplate[]> {
  const map = new Map<string, PlannedSessionWithTemplate[]>();
  for (const session of sessions) {
    const existing = map.get(session.scheduledDate);
    if (existing) existing.push(session);
    else map.set(session.scheduledDate, [session]);
  }
  return map;
}

export function CalendarGrid() {
  const viewedMonth = useCalendarUiStore((s) => s.viewedMonth);
  const selectedDate = useCalendarUiStore((s) => s.selectedDate);
  const selectDay = useCalendarUiStore((s) => s.selectDay);
  const goToPrevMonth = useCalendarUiStore((s) => s.goToPrevMonth);
  const goToNextMonth = useCalendarUiStore((s) => s.goToNextMonth);
  const goToToday = useCalendarUiStore((s) => s.goToToday);

  // The grid spans whole weeks, so it bleeds into the prev/next month. We query
  // the full visible window so leading/trailing days show their markers too.
  const gridStart = startOfWeek(startOfMonth(viewedMonth), { weekStartsOn: 1 });
  const gridEnd = endOfWeek(endOfMonth(viewedMonth), { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const { data: sessions = [] } = usePlannedSessions(format(gridStart, ISO), format(gridEnd, ISO));
  const byDate = groupByDate(sessions);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{format(viewedMonth, 'MMMM yyyy')}</h2>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={goToToday}>
            Today
          </Button>
          <Button variant="ghost" size="icon" onClick={goToPrevMonth} aria-label="Previous month">
            <ChevronLeft className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={goToNextMonth} aria-label="Next month">
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 text-center text-xs font-medium text-muted-foreground">
        {WEEKDAYS.map((day) => (
          <span key={day} className="py-1">
            {day}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const iso = format(day, ISO);
          const inMonth = isSameMonth(day, viewedMonth);
          const dayMarkers = byDate.get(iso) ?? [];
          return (
            <button
              key={iso}
              type="button"
              onClick={() => selectDay(iso)}
              className={cn(
                'flex aspect-square min-h-11 flex-col items-center justify-start gap-1 rounded-md p-1 text-sm transition-colors',
                'hover:bg-accent focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2',
                !inMonth && 'text-muted-foreground/40',
                selectedDate === iso && 'bg-accent',
              )}
            >
              <span
                className={cn(
                  'flex size-6 items-center justify-center rounded-full',
                  isToday(day) && 'bg-primary text-primary-foreground font-semibold',
                )}
              >
                {format(day, 'd')}
              </span>
              <span className="flex flex-wrap items-center justify-center gap-0.5">
                {dayMarkers.slice(0, 4).map((marker) => (
                  <span
                    key={marker.id}
                    className={cn('size-1.5 rounded-full', STATUS_DOT[marker.status])}
                  />
                ))}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
