import { apiFetch } from '@/lib/api-client';

import type {
  CreateRecipeInput,
  RecipeDetail,
  RecipeListItem,
  UpdateRecipeInput,
} from '@gym-bro/shared';

// GET /api/recipes — recipes with per-serving macros (no ingredient lines).
export function listRecipes(): Promise<RecipeListItem[]> {
  return apiFetch<RecipeListItem[]>('/api/recipes');
}

// GET /api/recipes/:id — the full recipe with ingredients + computed totals.
export function getRecipe(id: string): Promise<RecipeDetail> {
  return apiFetch<RecipeDetail>(`/api/recipes/${id}`);
}

// POST /api/recipes — create a recipe with its ingredient list.
export function createRecipe(input: CreateRecipeInput): Promise<RecipeDetail> {
  return apiFetch<RecipeDetail>('/api/recipes', { method: 'POST', body: JSON.stringify(input) });
}

// PUT /api/recipes/:id — edit a recipe (full replace).
export function updateRecipe(id: string, input: UpdateRecipeInput): Promise<RecipeDetail> {
  return apiFetch<RecipeDetail>(`/api/recipes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}

// DELETE /api/recipes/:id — soft-delete a recipe.
export function deleteRecipe(id: string): Promise<{ success: true }> {
  return apiFetch<{ success: true }>(`/api/recipes/${id}`, { method: 'DELETE' });
}
