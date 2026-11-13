import { useQuery } from '@tanstack/react-query';

import { stravaSessionsQueryOptions } from '@/features/strava';

import type {
  PlannedSessionWithTemplate,
  StravaSessionItem,
  WorkoutSessionListItem,
} from '@gym-bro/shared';

import { useCalendarUiStore } from '../stores/calendar-ui.store';
import { rangeForDay } from '../utils/calendar-range';
import { plannedSessionsQueryOptions } from './use-planned-sessions';
import { workoutsInRangeQueryOptions } from './use-workouts-in-range';

export interface CalendarDay {
  planned: PlannedSessionWithTemplate[];
  // Assumes the window's workouts fit one page (the range limit is 100 — over two a
  // day for six weeks), as the grid itself does.
  workouts: WorkoutSessionListItem[];
  strava: StravaSessionItem[];
  // The day's window is still being fetched (first load, or stepping into an
  // uncached month). Offline the requests pause rather than load, so this goes false
  // and the day shows what it has instead of a skeleton forever.
  isLoading: boolean;
}

// One day of the calendar, cut out of the window the grid already fetched — the same
// three queries under the same keys, so opening a day costs no request. Writes
// invalidate those windows, which refreshes the day along with the grid.
export function useCalendarDay(date: string): CalendarDay {
  const anchor = useCalendarUiStore((s) => s.anchor);
  const viewMode = useCalendarUiStore((s) => s.viewMode);
  const { from, to } = rangeForDay(date, anchor, viewMode);
  const enabled = date !== '';

  const plannedQuery = useQuery({
    ...plannedSessionsQueryOptions(from, to),
    enabled,
    select: (sessions) => sessions.filter((s) => s.scheduledDate === date),
  });
  const workoutsQuery = useQuery({
    ...workoutsInRangeQueryOptions(from, to),
    enabled,
    select: (page) => page.items.filter((w) => w.performedDate === date),
  });
  const stravaQuery = useQuery({
    ...stravaSessionsQueryOptions(from, to),
    enabled,
    select: (sessions) => sessions.filter((s) => s.localDate === date),
  });

  return {
    planned: plannedQuery.data ?? [],
    workouts: workoutsQuery.data ?? [],
    strava: stravaQuery.data ?? [],
    isLoading:
      plannedQuery.isLoading ||
      stravaQuery.isLoading ||
      // Workouts keep the previous window as placeholder data, which filtered to this
      // day is just empty — that's still loading, not "nothing logged".
      workoutsQuery.isLoading ||
      (workoutsQuery.isPlaceholderData && workoutsQuery.isFetching),
  };
}
