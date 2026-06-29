import { create } from 'zustand';

// Local UI state for the diary's "add entry" sheet — open flag only. Server data
// (the day's entries) stays in TanStack Query.
interface DiaryUiState {
  addOpen: boolean;
  openAdd: () => void;
  closeAdd: () => void;
}

export const useDiaryUiStore = create<DiaryUiState>((set) => ({
  addOpen: false,
  openAdd: () => set({ addOpen: true }),
  closeAdd: () => set({ addOpen: false }),
}));
