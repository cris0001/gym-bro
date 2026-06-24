import { apiFetch } from '@/lib/api-client';

import type { CreateTemplateInput, UpdateTemplateInput, WorkoutTemplate } from '@gym-bro/shared';

// POST /api/plans/:planId/templates — create a template at the end of the plan.
export function createTemplate(
  planId: string,
  input: CreateTemplateInput,
): Promise<WorkoutTemplate> {
  return apiFetch<WorkoutTemplate>(`/api/plans/${planId}/templates`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

// PATCH /api/templates/:id — rename or re-describe a template.
export function updateTemplate(id: string, input: UpdateTemplateInput): Promise<WorkoutTemplate> {
  return apiFetch<WorkoutTemplate>(`/api/templates/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

// DELETE /api/templates/:id — hard delete; cascades to its template-exercises.
export function deleteTemplate(id: string): Promise<{ success: true }> {
  return apiFetch<{ success: true }>(`/api/templates/${id}`, {
    method: 'DELETE',
  });
}

// PATCH /api/plans/:planId/templates/order — reorder; orderedIds must list every
// template in the plan exactly once. Returns the templates in their new order.
export function reorderTemplates(planId: string, orderedIds: string[]): Promise<WorkoutTemplate[]> {
  return apiFetch<WorkoutTemplate[]>(`/api/plans/${planId}/templates/order`, {
    method: 'PATCH',
    body: JSON.stringify({ orderedIds }),
  });
}
