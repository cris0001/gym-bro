import { apiFetch } from '@/lib/api-client';

import type {
  CreateExerciseInput,
  Exercise,
  ExerciseCategory,
  UpdateExerciseInput,
} from '@gym-bro/shared';

// GET /api/exercises — the user's active exercises, optionally filtered by
// category. Omitting the category sends no query param ("no filter").
export function listExercises(category?: ExerciseCategory): Promise<Exercise[]> {
  const query = category ? `?category=${encodeURIComponent(category)}` : '';
  return apiFetch<Exercise[]>(`/api/exercises${query}`);
}

// POST /api/exercises — create an exercise in the user's dictionary.
export function createExercise(input: CreateExerciseInput): Promise<Exercise> {
  return apiFetch<Exercise>('/api/exercises', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

// PATCH /api/exercises/:id — rename or recategorize an exercise.
export function updateExercise(id: string, input: UpdateExerciseInput): Promise<Exercise> {
  return apiFetch<Exercise>(`/api/exercises/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

// DELETE /api/exercises/:id — soft-delete (the row stays for referential
// integrity with templates/sessions; the list endpoint hides it).
export function deleteExercise(id: string): Promise<{ success: true }> {
  return apiFetch<{ success: true }>(`/api/exercises/${id}`, {
    method: 'DELETE',
  });
}
