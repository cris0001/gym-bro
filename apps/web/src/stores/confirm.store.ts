import { create } from 'zustand';

// A promise-based confirm dialog, shared across features. `confirm(options)` opens a
// single global AlertDialog (rendered by <ConfirmDialog/> at the root) and resolves
// to true/false when the user acts — so any call site (including non-component code
// like the workout-in-progress guards in hooks) can `await confirm(...)` instead of
// window.confirm. Only ephemeral UI state lives here.
export interface ConfirmOptions {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  // Styles the confirm button as destructive (red) — for deletes/discards.
  destructive?: boolean;
}

interface ConfirmState {
  request: (ConfirmOptions & { resolve: (confirmed: boolean) => void }) | null;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  // Called by the dialog to settle the pending promise and close.
  resolve: (confirmed: boolean) => void;
}

export const useConfirmStore = create<ConfirmState>((set, get) => ({
  request: null,
  confirm: (options) =>
    new Promise<boolean>((resolve) => {
      set({ request: { ...options, resolve } });
    }),
  resolve: (confirmed) => {
    get().request?.resolve(confirmed);
    set({ request: null });
  },
}));

// The imperative entry point used at call sites: `await confirm({ title, ... })`.
export function useConfirm() {
  return useConfirmStore((s) => s.confirm);
}
