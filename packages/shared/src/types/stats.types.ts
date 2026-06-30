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
// oldest first. Each session contributes its representative TOP set (the marked
// top set: heavier, lower reps) and NORMAL set (the first non-top set — back-offs
// are uniform, so the first one represents them). weight is null for a bodyweight
// set; a field is null when that kind of set wasn't logged that session. The
// frontend switches between top and normal and derives volume = weight × reps.
export interface ExerciseProgressPoint {
  sessionId: string;
  date: string;
  topWeight: number | null;
  topReps: number | null;
  normalWeight: number | null;
  normalReps: number | null;
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
