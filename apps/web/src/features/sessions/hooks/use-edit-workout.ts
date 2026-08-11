import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';

import type { WorkoutSessionDetail } from '@gym-bro/shared';

import { useWorkoutDraftStore } from '../stores/workout-draft.store';

// Loads a finished strength workout into the draft editor and routes to the
// active-session view. Only a *live* workout in progress blocks — an existing
// edit draft is disposable (it's re-derived from the server) so it's just
// replaced. This keeps Edit working even if a stale edit draft is left in
// localStorage; otherwise the guard would silently swallow the tap on mobile.
export function useEditWorkout() {
  const navigate = useNavigate();
  const loadForEdit = useWorkoutDraftStore((s) => s.loadForEdit);
  const liveWorkout = useWorkoutDraftStore(
    (s) => s.draft !== null && s.draft.editingSessionId === null,
  );

  return function editWorkout(detail: WorkoutSessionDetail) {
    if (liveWorkout) {
      toast.error('You have a workout in progress — finish or discard it first.');
      void navigate({ to: '/session' });
      return;
    }
    loadForEdit(detail);
    void navigate({ to: '/session' });
  };
}
