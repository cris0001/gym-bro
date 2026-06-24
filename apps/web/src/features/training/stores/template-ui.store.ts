import { create } from 'zustand';

import type { WorkoutTemplate } from '@gym-bro/shared';

// Local UI state for the template create/edit Sheet. Create is nested under a
// plan, so the store also tracks the planId; edit derives it from the row.
// Server data stays in TanStack Query.
interface TemplateUiState {
  open: boolean;
  editing: WorkoutTemplate | null;
  planId: string | null;
  openCreate: (planId: string) => void;
  openEdit: (template: WorkoutTemplate) => void;
  close: () => void;
}

export const useTemplateUiStore = create<TemplateUiState>((set) => ({
  open: false,
  editing: null,
  planId: null,
  openCreate: (planId) => set({ open: true, editing: null, planId }),
  openEdit: (template) => set({ open: true, editing: template, planId: template.trainingPlanId }),
  close: () => set({ open: false, editing: null, planId: null }),
}));
