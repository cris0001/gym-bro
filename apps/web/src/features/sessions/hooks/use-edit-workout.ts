import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';

import type { WorkoutSessionDetail } from '@gym-bro/shared';

import { useWorkoutDraftStore } from '../stores/workout-draft.store';

// Loads a finished strength workout into the draft editor and routes to the
// active-session view. If another workout is already in progress, it blocks and
// bounces to that session — only one workout at a time.
export function useEditWorkout() {
  const navigate = useNavigate();
  const loadForEdit = useWorkoutDraftStore((s) => s.loadForEdit);
  const hasDraft = useWorkoutDraftStore((s) => s.draft !== null);

  return function editWorkout(detail: WorkoutSessionDetail) {
    if (hasDraft) {
      toast.error('You already have an active workout — finish or discard it first.');
      void navigate({ to: '/session' });
      return;
    }
    loadForEdit(detail);
    void navigate({ to: '/session' });
  };
}
