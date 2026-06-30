import { apiFetch } from '@/lib/api-client';

import type {
  CreateFoodLogInput,
  DailyFoodLog,
  FoodLogEntry,
  MealType,
  RecentDiaryItem,
  UpdateFoodLogInput,
} from '@gym-bro/shared';

// GET /api/food-log?date=YYYY-MM-DD — a day's entries + summed totals.
export function getDailyFoodLog(date: string): Promise<DailyFoodLog> {
  return apiFetch<DailyFoodLog>(`/api/food-log?date=${encodeURIComponent(date)}`);
}

// GET /api/food-log/recent?meal=… — recently-used items for a meal (quick re-add).
export function getRecentDiaryItems(meal: MealType): Promise<RecentDiaryItem[]> {
  return apiFetch<RecentDiaryItem[]>(`/api/food-log/recent?meal=${meal}`);
}

// POST /api/food-log — log a food or recipe (server snapshots the macros).
export function createFoodLogEntry(input: CreateFoodLogInput): Promise<FoodLogEntry> {
  return apiFetch<FoodLogEntry>('/api/food-log', { method: 'POST', body: JSON.stringify(input) });
}

// PATCH /api/food-log/:id — change an entry's quantity and/or day.
export function updateFoodLogEntry(id: string, input: UpdateFoodLogInput): Promise<FoodLogEntry> {
  return apiFetch<FoodLogEntry>(`/api/food-log/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

// DELETE /api/food-log/:id — remove an entry.
export function deleteFoodLogEntry(id: string): Promise<{ success: true }> {
  return apiFetch<{ success: true }>(`/api/food-log/${id}`, { method: 'DELETE' });
}
