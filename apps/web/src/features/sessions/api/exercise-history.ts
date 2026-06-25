import { apiFetch } from '@/lib/api-client';

import type { ExerciseHistoryEntry } from '@gym-bro/shared';

// GET /api/exercises/:exerciseId/history — previous performances of an exercise,
// newest first. `before` (exclusive) limits to sessions earlier than a date;
// `limit` caps the window (grown for "show more").
export function getExerciseHistory(
  exerciseId: string,
  params: { before?: string; limit: number },
): Promise<ExerciseHistoryEntry[]> {
  const query = new URLSearchParams({ limit: String(params.limit) });
  if (params.before) query.set('before', params.before);
  return apiFetch<ExerciseHistoryEntry[]>(
    `/api/exercises/${exerciseId}/history?${query.toString()}`,
  );
}
