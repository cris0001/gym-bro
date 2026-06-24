import { create } from 'zustand';

import type { Exercise } from '@gym-bro/shared';

// Local UI state for the exercise create/edit Sheet — open flag plus the row
// being edited (null = create mode). Server data stays in TanStack Query; this
// store holds only ephemeral modal state, per the Zustand-for-UI-only rule.
interface ExerciseUiState {
  open: boolean;
  editing: Exercise | null;
  openCreate: () => void;
  openEdit: (exercise: Exercise) => void;
  close: () => void;
}

export const useExerciseUiStore = create<ExerciseUiState>((set) => ({
  open: false,
  editing: null,
  openCreate: () => set({ open: true, editing: null }),
  openEdit: (exercise) => set({ open: true, editing: exercise }),
  close: () => set({ open: false, editing: null }),
}));
