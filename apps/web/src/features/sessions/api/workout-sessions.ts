import { apiFetch } from '@/lib/api-client';

import type {
  CreateActivitySessionInput,
  CreateStrengthSessionInput,
  UpdateStrengthSessionInput,
  UpdateWorkoutSessionInput,
  WorkoutHistoryPage,
  WorkoutSession,
  WorkoutSessionDetail,
} from '@gym-bro/shared';

// POST /api/workout-sessions/strength — finish a strength workout (the whole
// graph: performances + sets + tags, written atomically server-side).
export function createStrengthSession(input: CreateStrengthSessionInput): Promise<WorkoutSession> {
  return apiFetch<WorkoutSession>('/api/workout-sessions/strength', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

// POST /api/workout-sessions/activity — log an ad-hoc activity.
export function createActivitySession(input: CreateActivitySessionInput): Promise<WorkoutSession> {
  return apiFetch<WorkoutSession>('/api/workout-sessions/activity', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

// GET /api/workout-sessions?limit&offset&from&to — a page of history (newest
// first). Optional from/to (inclusive 'YYYY-MM-DD') scope it to a date window.
export function listWorkoutSessions(
  limit: number,
  offset: number,
  from?: string,
  to?: string,
): Promise<WorkoutHistoryPage> {
  const query = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  if (from) query.set('from', from);
  if (to) query.set('to', to);
  return apiFetch<WorkoutHistoryPage>(`/api/workout-sessions?${query.toString()}`);
}

// GET /api/workout-sessions/:id — the full session graph.
export function getWorkoutSession(id: string): Promise<WorkoutSessionDetail> {
  return apiFetch<WorkoutSessionDetail>(`/api/workout-sessions/${id}`);
}

// PATCH /api/workout-sessions/:id — edit metadata/tags; returns refreshed detail.
export function updateWorkoutSession(
  id: string,
  input: UpdateWorkoutSessionInput,
): Promise<WorkoutSessionDetail> {
  return apiFetch<WorkoutSessionDetail>(`/api/workout-sessions/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

// PUT /api/workout-sessions/:id — full edit of a strength workout: replace its
// metadata + exercises + sets + tags. Returns the refreshed detail.
export function updateStrengthSession(
  id: string,
  input: UpdateStrengthSessionInput,
): Promise<WorkoutSessionDetail> {
  return apiFetch<WorkoutSessionDetail>(`/api/workout-sessions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}

// DELETE /api/workout-sessions/:id — remove a session (cascades server-side).
export function deleteWorkoutSession(id: string): Promise<{ success: true }> {
  return apiFetch<{ success: true }>(`/api/workout-sessions/${id}`, {
    method: 'DELETE',
  });
}
