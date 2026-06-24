import { apiFetch } from '@/lib/api-client';

import type {
  CreateTemplateExerciseInput,
  UpdateTemplateExerciseInput,
  WorkoutTemplateExercise,
} from '@gym-bro/shared';

// POST /api/templates/:templateId/template-exercises — add an exercise (with
// optional targets) to the end of the template.
export function createTemplateExercise(
  templateId: string,
  input: CreateTemplateExerciseInput,
): Promise<WorkoutTemplateExercise> {
  return apiFetch<WorkoutTemplateExercise>(`/api/templates/${templateId}/template-exercises`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

// PATCH /api/template-exercises/:id — edit targets (sets/reps/notes). The
// exercise itself is fixed once added.
export function updateTemplateExercise(
  id: string,
  input: UpdateTemplateExerciseInput,
): Promise<WorkoutTemplateExercise> {
  return apiFetch<WorkoutTemplateExercise>(`/api/template-exercises/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

// DELETE /api/template-exercises/:id — remove an exercise from the template.
export function deleteTemplateExercise(id: string): Promise<{ success: true }> {
  return apiFetch<{ success: true }>(`/api/template-exercises/${id}`, {
    method: 'DELETE',
  });
}

// PATCH /api/templates/:templateId/template-exercises/order — reorder; orderedIds
// must list every template-exercise in the template exactly once.
export function reorderTemplateExercises(
  templateId: string,
  orderedIds: string[],
): Promise<WorkoutTemplateExercise[]> {
  return apiFetch<WorkoutTemplateExercise[]>(
    `/api/templates/${templateId}/template-exercises/order`,
    {
      method: 'PATCH',
      body: JSON.stringify({ orderedIds }),
    },
  );
}
