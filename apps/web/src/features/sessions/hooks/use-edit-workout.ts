import { useNavigate } from '@tanstack/react-router';

import type { WorkoutSessionDetail } from '@gym-bro/shared';

import { useWorkoutDraftStore } from '../stores/workout-draft.store';

// Loads a finished strength workout into the draft editor and routes to the
// active-session view. Confirms first if another workout is already in progress,
// since loading replaces it.
export function useEditWorkout() {
  const navigate = useNavigate();
  const loadForEdit = useWorkoutDraftStore((s) => s.loadForEdit);
  const hasDraft = useWorkoutDraftStore((s) => s.draft !== null);

  return function editWorkout(detail: WorkoutSessionDetail) {
    if (
      hasDraft &&
      !window.confirm('A workout is already in progress. Discard it and edit this one?')
    ) {
      return;
    }
    loadForEdit(detail);
    void navigate({ to: '/session' });
  };
}
