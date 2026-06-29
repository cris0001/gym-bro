import type { z } from 'zod';

import type { statsRangeQuerySchema } from '../schemas/stats.schema';
import type { WorkoutSession } from './sessions.types';
import type { Exercise } from './training.types';

// --- Inferred request input ---

export type StatsRangeQueryInput = z.infer<typeof statsRangeQuerySchema>;

// --- Response shapes (as returned by the API: date columns are 'YYYY-MM-DD'
// strings; aggregated weight/volume are coerced to numbers by the service) ---

// GET /api/stats/exercises — an exercise the user has logged at least once, for
// the progress-chart picker. Only exercises with history appear (no empty
// charts). Identity-only; ordered by name.
export type StatExercise = Pick<Exercise, 'id' | 'name' | 'category'>;

// GET /api/stats/exercises/:exerciseId/progress — one point per session that
// included this exercise (matched on actualExerciseId, so it follows swaps),
// oldest first. maxWeight = the heaviest set's weight; totalVolume = sum of
// weight x reps across the session's sets. Both null when no set had both a
// weight and reps (e.g. a pure-bodyweight session) — null-weight/null-rep sets
// are skipped, so a bodyweight exercise simply yields no line.
export interface ExerciseProgressPoint {
  sessionId: string;
  date: string;
  maxWeight: number | null;
  totalVolume: number | null;
  setCount: number;
}

// GET /api/stats/rating-trend — one point per rated session (strength or
// activity), oldest first. Unrated sessions are excluded.
export interface RatingTrendPoint {
  sessionId: string;
  date: string;
  rating: number;
  name: string;
  sessionType: WorkoutSession['sessionType'];
}
