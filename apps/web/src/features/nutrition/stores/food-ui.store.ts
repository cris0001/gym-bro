import { create } from 'zustand';

import type { Food } from '@gym-bro/shared';

// Local UI state for the food create/edit Sheet — open flag plus the row being
// edited (null = create mode). Server data stays in TanStack Query; this store
// holds only ephemeral modal state, per the Zustand-for-UI-only rule.
interface FoodUiState {
  open: boolean;
  editing: Food | null;
  openCreate: () => void;
  openEdit: (food: Food) => void;
  close: () => void;
}

export const useFoodUiStore = create<FoodUiState>((set) => ({
  open: false,
  editing: null,
  openCreate: () => set({ open: true, editing: null }),
  openEdit: (food) => set({ open: true, editing: food }),
  close: () => set({ open: false, editing: null }),
}));
