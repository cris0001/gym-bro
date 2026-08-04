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
  // Called with the created food when a scanned product is saved — lets the diary
  // select it straight away to log. Null outside the scan-from-diary flow.
  onCreated: ((food: Food) => void) | null;
  openCreate: () => void;
  openEdit: (food: Food) => void;
  openScanned: (prefill: ScanPrefill, onCreated?: (food: Food) => void) => void;
  close: () => void;
}

export const useFoodUiStore = create<FoodUiState>((set) => ({
  open: false,
  editing: null,
  prefill: null,
  onCreated: null,
  openCreate: () => set({ open: true, editing: null, prefill: null, onCreated: null }),
  openEdit: (food) => set({ open: true, editing: food, prefill: null, onCreated: null }),
  openScanned: (prefill, onCreated) =>
    set({ open: true, editing: null, prefill, onCreated: onCreated ?? null }),
  close: () => set({ open: false, editing: null, prefill: null, onCreated: null }),
}));
