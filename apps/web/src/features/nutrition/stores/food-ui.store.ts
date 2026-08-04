import { create } from 'zustand';

import type { Food } from '@gym-bro/shared';

// Seed values for the food form when adding a scanned product: the barcode plus
// whatever we know (from our catalog or OpenFoodFacts). Nulls = the user fills it in.
export interface ScanPrefill {
  ean: string;
  name: string;
  brand: string | null;
  kcal: number | null;
  proteinG: number | null;
  carbsG: number | null;
  fatG: number | null;
  servingGrams: number | null;
  unitGrams: number | null;
  imageUrl: string | null;
}

// Local UI state for the food create/edit Sheet — open flag, the row being edited
// (null = create), and an optional scan prefill. Server data stays in TanStack Query;
// this store holds only ephemeral modal state, per the Zustand-for-UI-only rule.
interface FoodUiState {
  open: boolean;
  editing: Food | null;
  prefill: ScanPrefill | null;
  openCreate: () => void;
  openEdit: (food: Food) => void;
  openScanned: (prefill: ScanPrefill) => void;
  close: () => void;
}

export const useFoodUiStore = create<FoodUiState>((set) => ({
  open: false,
  editing: null,
  prefill: null,
  openCreate: () => set({ open: true, editing: null, prefill: null }),
  openEdit: (food) => set({ open: true, editing: food, prefill: null }),
  openScanned: (prefill) => set({ open: true, editing: null, prefill }),
  close: () => set({ open: false, editing: null, prefill: null }),
}));
