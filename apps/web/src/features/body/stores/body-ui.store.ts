import { create } from 'zustand';

import type { BodyMeasurement } from '@gym-bro/shared';

// Local UI state for the body page's single quick-add/edit form. The form lives
// at the top of the page and is in CREATE mode by default (editing === null);
// picking "edit" on a history row loads that day's entry into the same form. Only
// ephemeral UI state lives here — the measurements themselves stay in TanStack
// Query, per the Zustand-for-UI-only rule.
interface BodyUiState {
  editing: BodyMeasurement | null;
  openEdit: (measurement: BodyMeasurement) => void;
  clearEditing: () => void;
}

export const useBodyUiStore = create<BodyUiState>((set) => ({
  editing: null,
  openEdit: (measurement) => set({ editing: measurement }),
  clearEditing: () => set({ editing: null }),
}));
