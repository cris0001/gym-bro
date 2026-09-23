import { useQuery } from '@tanstack/react-query';
import { addDays, format, parseISO, subDays } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { useStravaSessions } from '@/features/strava';

import { useSessionsTranslation } from '../i18n';
import { plannedSessionsQueryOptions } from '../hooks/use-planned-sessions';
import { workoutsInRangeQueryOptions } from '../hooks/use-workouts-in-range';
import { useCalendarUiStore } from '../stores/calendar-ui.store';
import { DayDetail } from './day-detail';

const ISO = 'yyyy-MM-dd';

// The day's dominant status for the header dot: today wins, then a finished workout,
// then a Strava import, then a still-planned session. Null when the day is empty.
function useDayStatus(date: string, isToday: boolean): { label: string; color: string } | null {
  const t = useSessionsTranslation();
  const { data: planned = [] } = useQuery({
    ...plannedSessionsQueryOptions(date, date),
    enabled: date !== '',
  });
  const { data: workoutsPage } = useQuery({
    ...workoutsInRangeQueryOptions(date, date),
    enabled: date !== '',
  });
  const { data: stravaSessions = [] } = useStravaSessions(date || undefined, date || undefined);

  if (isToday) return { label: t.common.today, color: 'var(--primary)' };
  if ((workoutsPage?.items.length ?? 0) > 0)
    return { label: t.dayWorkout.finished, color: '#5a7a52' };
  if (stravaSessions.length > 0) return { label: t.calendar.strava, color: '#d15b28' };
  if (planned.some((s) => s.status !== 'completed'))
    return { label: t.calendar.planned, color: 'var(--primary)' };
  return null;
}

// Desktop presentation of a calendar day: an inline side panel hosting the shared
// DayDetail body. Defaults to today when nothing is selected (so it's never an empty
// prompt). The header shows the date, a status dot, and prev/next day arrows. On
// mobile the same body appears in a bottom sheet (see DayDetailSheet).
export function DayDetailPanel() {
  const selectedDate = useCalendarUiStore((s) => s.selectedDate);
  const selectDay = useCalendarUiStore((s) => s.selectDay);
  const t = useSessionsTranslation();
  const todayIso = format(new Date(), ISO);
  const date = selectedDate ?? todayIso;
  const isToday = date === todayIso;
  const status = useDayStatus(date, isToday);

  return (
    // The panel itself is transparent (sits on the muted canvas); the date is a bare
    // caption and only the inner session cards carry the light card background.
    <aside className="h-fit lg:sticky lg:top-4">
      <header className="flex items-center justify-between gap-2 px-4 pt-1 pb-2">
        <div className="flex min-w-0 flex-col">
          <span className="font-heading text-muted-foreground text-sm italic">
            {format(parseISO(date), 'EEEE')}
          </span>
          <h2 className="font-heading text-2xl leading-tight font-semibold">
            {format(parseISO(date), 'MMM d, yyyy')}
          </h2>
          {status && (
            <span className="text-muted-foreground mt-1 flex items-center gap-1.5 text-[11px] font-bold tracking-[0.06em] uppercase">
              <span className="size-2 rounded-full" style={{ backgroundColor: status.color }} />
              {status.label}
            </span>
          )}
        </div>
        <div className="flex shrink-0 gap-1.5">
          <button
            type="button"
            className="flex size-9 items-center justify-center rounded-xl border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label={t.calendar.prev}
            onClick={() => selectDay(format(subDays(parseISO(date), 1), ISO))}
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            className="flex size-9 items-center justify-center rounded-xl border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label={t.calendar.next}
            onClick={() => selectDay(format(addDays(parseISO(date), 1), ISO))}
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </header>
      <DayDetail date={date} />
    </aside>
  );
}
