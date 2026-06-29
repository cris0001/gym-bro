import { create } from 'zustand';

import type { MealType } from '@gym-bro/shared';

// Local UI state for the diary's "add entry" sheet. addMeal is the meal the sheet
// is adding to (null = closed), preset by the section whose "+" was tapped.
interface DiaryUiState {
  addMeal: MealType | null;
  openAdd: (meal: MealType) => void;
  closeAdd: () => void;
}

export const useDiaryUiStore = create<DiaryUiState>((set) => ({
  addMeal: null,
  openAdd: (meal) => set({ addMeal: meal }),
  closeAdd: () => set({ addMeal: null }),
}));
