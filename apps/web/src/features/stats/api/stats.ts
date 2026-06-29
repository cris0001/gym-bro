import { apiFetch } from '@/lib/api-client';

import type { ExerciseProgressPoint, RatingTrendPoint, StatExercise } from '@gym-bro/shared';

// Optional inclusive date window; both omitted = all history.
export interface StatsRange {
  from?: string;
  to?: string;
}

function rangeQuery(range: StatsRange | undefined): string {
  const params = new URLSearchParams();
  if (range?.from) params.set('from', range.from);
  if (range?.to) params.set('to', range.to);
  const query = params.toString();
  return query ? `?${query}` : '';
}

// GET /api/stats/exercises — exercises the user has logged at least once, for the
// progress-chart picker (no empty charts).
export function getStatExercises(): Promise<StatExercise[]> {
  return apiFetch<StatExercise[]>('/api/stats/exercises');
}

// GET /api/stats/exercises/:exerciseId/progress — per-session max weight + total
// volume for one exercise, oldest first, over the optional window.
export function getExerciseProgress(
  exerciseId: string,
  range?: StatsRange,
): Promise<ExerciseProgressPoint[]> {
  return apiFetch<ExerciseProgressPoint[]>(
    `/api/stats/exercises/${exerciseId}/progress${rangeQuery(range)}`,
  );
}

// GET /api/stats/rating-trend — rating over time across all rated sessions,
// oldest first, over the optional window.
export function getRatingTrend(range?: StatsRange): Promise<RatingTrendPoint[]> {
  return apiFetch<RatingTrendPoint[]>(`/api/stats/rating-trend${rangeQuery(range)}`);
}
