import { apiFetch } from '@/lib/api-client';

import type { CreateTagInput, UpdateTagInput, WorkoutTag } from '@gym-bro/shared';

// GET /api/tags — the user's active workout tags.
export function listTags(): Promise<WorkoutTag[]> {
  return apiFetch<WorkoutTag[]>('/api/tags');
}

// POST /api/tags — create a tag (name + hex color).
export function createTag(input: CreateTagInput): Promise<WorkoutTag> {
  return apiFetch<WorkoutTag>('/api/tags', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

// PATCH /api/tags/:id — rename or recolor a tag.
export function updateTag(id: string, input: UpdateTagInput): Promise<WorkoutTag> {
  return apiFetch<WorkoutTag>(`/api/tags/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

// DELETE /api/tags/:id — soft-delete (the row stays for sessions that
// reference it; the list endpoint hides it).
export function deleteTag(id: string): Promise<{ success: true }> {
  return apiFetch<{ success: true }>(`/api/tags/${id}`, {
    method: 'DELETE',
  });
}
