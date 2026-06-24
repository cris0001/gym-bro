import { apiFetch } from '@/lib/api-client';

import type {
  CreatePlannedSessionInput,
  PlannedSession,
  PlannedSessionWithTemplate,
  UpdatePlannedSessionInput,
} from '@gym-bro/shared';

// GET /api/planned-sessions?from&to — calendar entries in a date window, each
// with its template name. Dates are 'YYYY-MM-DD'.
export function listPlannedSessions(
  from: string,
  to: string,
): Promise<PlannedSessionWithTemplate[]> {
  const query = `?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
  return apiFetch<PlannedSessionWithTemplate[]>(`/api/planned-sessions${query}`);
}

// POST /api/planned-sessions — assign a template to a date.
export function createPlannedSession(input: CreatePlannedSessionInput): Promise<PlannedSession> {
  return apiFetch<PlannedSession>('/api/planned-sessions', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

// PATCH /api/planned-sessions/:id — skip/unskip and/or reschedule.
export function updatePlannedSession(
  id: string,
  input: UpdatePlannedSessionInput,
): Promise<PlannedSession> {
  return apiFetch<PlannedSession>(`/api/planned-sessions/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

// DELETE /api/planned-sessions/:id — remove a calendar entry.
export function deletePlannedSession(id: string): Promise<{ success: true }> {
  return apiFetch<{ success: true }>(`/api/planned-sessions/${id}`, {
    method: 'DELETE',
  });
}
