import { apiFetch } from '@/lib/api-client';

import type {
  CreatePlanInput,
  PlanListItem,
  PlanWithTemplates,
  TrainingPlan,
  UpdatePlanInput,
} from '@gym-bro/shared';

// GET /api/plans — the user's plans, each with a count of its templates.
export function listPlans(): Promise<PlanListItem[]> {
  return apiFetch<PlanListItem[]>('/api/plans');
}

// GET /api/plans/:id — a plan with its ordered templates embedded.
export function getPlan(id: string): Promise<PlanWithTemplates> {
  return apiFetch<PlanWithTemplates>(`/api/plans/${id}`);
}

// POST /api/plans — create a plan (name + optional description).
export function createPlan(input: CreatePlanInput): Promise<TrainingPlan> {
  return apiFetch<TrainingPlan>('/api/plans', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

// PATCH /api/plans/:id — rename or re-describe a plan.
export function updatePlan(id: string, input: UpdatePlanInput): Promise<TrainingPlan> {
  return apiFetch<TrainingPlan>(`/api/plans/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

// DELETE /api/plans/:id — hard delete; cascades to the plan's templates.
export function deletePlan(id: string): Promise<{ success: true }> {
  return apiFetch<{ success: true }>(`/api/plans/${id}`, {
    method: 'DELETE',
  });
}
