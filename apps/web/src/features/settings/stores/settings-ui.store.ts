import { create } from 'zustand';

// Whether the Settings sheet is open — local UI state only (the gear in the app chrome
// opens it; the sheet is mounted once in the app shell).
interface SettingsUiState {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const useSettingsUiStore = create<SettingsUiState>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
}));
