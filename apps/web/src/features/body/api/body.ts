import { apiFetch } from '@/lib/api-client';

import type { BodyMeasurement, UpsertBodyMeasurementInput } from '@gym-bro/shared';

// GET /api/body-measurements — the full history, newest first.
export function listBodyMeasurements(): Promise<BodyMeasurement[]> {
  return apiFetch<BodyMeasurement[]>('/api/body-measurements');
}

// PUT /api/body-measurements — create/edit the entry for its date (upsert on the
// date; a same-day re-save merges, so omitted fields are left untouched).
export function upsertBodyMeasurement(input: UpsertBodyMeasurementInput): Promise<BodyMeasurement> {
  return apiFetch<BodyMeasurement>('/api/body-measurements', {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}

// DELETE /api/body-measurements/:id — remove a day's entry.
export function deleteBodyMeasurement(id: string): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>(`/api/body-measurements/${id}`, {
    method: 'DELETE',
  });
}
