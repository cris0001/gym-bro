import { apiFetch } from '@/lib/api-client';

import type { StravaConnectionStatus, StravaSessionItem } from '@gym-bro/shared';

// GET /api/strava/status — whether this user has linked Strava.
export function getStravaStatus(): Promise<StravaConnectionStatus> {
  return apiFetch<StravaConnectionStatus>('/api/strava/status');
}

// GET /api/strava/sessions — imported activities, newest first; optional local-date
// window (the calendar passes a month; the page loads all).
export function listStravaSessions(from?: string, to?: string): Promise<StravaSessionItem[]> {
  const params = new URLSearchParams();
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  const qs = params.toString();
  return apiFetch<StravaSessionItem[]>(`/api/strava/sessions${qs ? `?${qs}` : ''}`);
}

// POST /api/strava/import — pull recent activities and upsert them.
export function importStravaActivities(): Promise<{ imported: number }> {
  return apiFetch<{ imported: number }>('/api/strava/import', { method: 'POST' });
}

// DELETE /api/strava/connect — forget the stored tokens.
export function disconnectStrava(): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>('/api/strava/connect', { method: 'DELETE' });
}

// The OAuth connect endpoint. This is a full-page browser navigation (it 302-redirects
// to Strava), not a fetch — link an <a> to it.
export const STRAVA_CONNECT_URL = '/api/strava/connect';
