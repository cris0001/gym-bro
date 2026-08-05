import { create } from 'zustand';

import type { MealType } from '@gym-bro/shared';

// Local UI state for the diary's "add" sheets. Each *Meal field is the meal that sheet
// is adding to (null = closed), preset by the section whose button was tapped. The two
// sheets are independent: addMeal drives the food/recipe search sheet, photoMeal the
// AI photo-estimate sheet.
interface DiaryUiState {
  addMeal: MealType | null;
  openAdd: (meal: MealType) => void;
  closeAdd: () => void;
  photoMeal: MealType | null;
  openPhoto: (meal: MealType) => void;
  closePhoto: () => void;
}

export const useDiaryUiStore = create<DiaryUiState>((set) => ({
  addMeal: null,
  openAdd: (meal) => set({ addMeal: meal }),
  closeAdd: () => set({ addMeal: null }),
  photoMeal: null,
  openPhoto: (meal) => set({ photoMeal: meal }),
  closePhoto: () => set({ photoMeal: null }),
}));
