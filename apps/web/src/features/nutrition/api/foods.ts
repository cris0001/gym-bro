import { apiFetch } from '@/lib/api-client';

import type { CreateFoodInput, Food, UpdateFoodInput } from '@gym-bro/shared';

// GET /api/foods — active foods, alphabetical; optional name substring search.
export function listFoods(search?: string): Promise<Food[]> {
  const query = search ? `?search=${encodeURIComponent(search)}` : '';
  return apiFetch<Food[]>(`/api/foods${query}`);
}

// POST /api/foods — create a food (per-100g macros).
export function createFood(input: CreateFoodInput): Promise<Food> {
  return apiFetch<Food>('/api/foods', { method: 'POST', body: JSON.stringify(input) });
}

// PUT /api/foods/:id — edit a food (full replace).
export function updateFood(id: string, input: UpdateFoodInput): Promise<Food> {
  return apiFetch<Food>(`/api/foods/${id}`, { method: 'PUT', body: JSON.stringify(input) });
}

// DELETE /api/foods/:id — soft-delete a food.
export function deleteFood(id: string): Promise<{ success: true }> {
  return apiFetch<{ success: true }>(`/api/foods/${id}`, { method: 'DELETE' });
}
