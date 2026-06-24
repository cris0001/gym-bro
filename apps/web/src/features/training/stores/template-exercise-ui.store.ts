import { create } from 'zustand';

import type { TemplateExerciseWithExercise } from '@gym-bro/shared';

// Local UI state for the template-exercise create/edit Sheet. Create is nested
// under a template, so the store tracks templateId; edit derives it from the
// row. Server data stays in TanStack Query.
interface TemplateExerciseUiState {
  open: boolean;
  editing: TemplateExerciseWithExercise | null;
  templateId: string | null;
  openCreate: (templateId: string) => void;
  openEdit: (templateExercise: TemplateExerciseWithExercise) => void;
  close: () => void;
}

export const useTemplateExerciseUiStore = create<TemplateExerciseUiState>((set) => ({
  open: false,
  editing: null,
  templateId: null,
  openCreate: (templateId) => set({ open: true, editing: null, templateId }),
  openEdit: (templateExercise) =>
    set({ open: true, editing: templateExercise, templateId: templateExercise.workoutTemplateId }),
  close: () => set({ open: false, editing: null, templateId: null }),
}));
