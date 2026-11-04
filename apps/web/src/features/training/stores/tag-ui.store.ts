import { create } from 'zustand';

import type { WorkoutTag } from '@gym-bro/shared';

// Local UI state for the tag create/edit Sheet — open flag plus the row being
// edited (null = create mode). Server data stays in TanStack Query; this store
// holds only ephemeral modal state, per the Zustand-for-UI-only rule.
interface TagUiState {
  open: boolean;
  editing: WorkoutTag | null;
  openCreate: () => void;
  openEdit: (tag: WorkoutTag) => void;
  close: () => void;
}

export const useTagUiStore = create<TagUiState>((set) => ({
  open: false,
  editing: null,
  openCreate: () => set({ open: true, editing: null }),
  openEdit: (tag) => set({ open: true, editing: tag }),
  // Only hides the sheet: the edited row stays until the next open (openCreate/openEdit
  // replace it), so the close animation keeps showing the edit form instead of flashing
  // the blank "add" variant for a frame.
  close: () => set({ open: false }),
}));
