import { apiFetch } from '@/lib/api-client';

import type {
  CreateActivitySessionInput,
  CreateStrengthSessionInput,
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

// GET /api/workout-sessions?limit&offset — a page of history (newest first).
export function listWorkoutSessions(limit: number, offset: number): Promise<WorkoutHistoryPage> {
  return apiFetch<WorkoutHistoryPage>(`/api/workout-sessions?limit=${limit}&offset=${offset}`);
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

// DELETE /api/workout-sessions/:id — remove a session (cascades server-side).
export function deleteWorkoutSession(id: string): Promise<{ success: true }> {
  return apiFetch<{ success: true }>(`/api/workout-sessions/${id}`, {
    method: 'DELETE',
  });
}
