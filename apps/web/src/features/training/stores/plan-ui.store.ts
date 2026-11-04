import { create } from 'zustand';

import type { TrainingPlan } from '@gym-bro/shared';

// Local UI state for the plan create/edit Sheet — open flag plus the row being
// edited (null = create mode). Create is triggered from the list, edit from the
// detail page; both share this store. Server data stays in TanStack Query.
interface PlanUiState {
  open: boolean;
  editing: TrainingPlan | null;
  openCreate: () => void;
  openEdit: (plan: TrainingPlan) => void;
  close: () => void;
}

export const usePlanUiStore = create<PlanUiState>((set) => ({
  open: false,
  editing: null,
  openCreate: () => set({ open: true, editing: null }),
  openEdit: (plan) => set({ open: true, editing: plan }),
  // Only hides the sheet: the edited row stays until the next open (openCreate/openEdit
  // replace it), so the close animation keeps showing the edit form instead of flashing
  // the blank "add" variant for a frame.
  close: () => set({ open: false }),
}));
