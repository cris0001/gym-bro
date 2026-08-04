import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { format } from 'date-fns';
import { toast } from 'sonner';

import { templateQueryOptions } from '@/features/training';

import { useWorkoutDraftStore } from '../stores/workout-draft.store';

interface StartFromTemplateInput {
  templateId: string;
  templateName: string;
  plannedSessionId?: string | null;
  // Defaults the performed date (e.g. the planned day from the calendar); falls
  // back to today. Editable in the active view either way.
  scheduledDate?: string;
}

// Starts a workout draft and routes to the active-session view. Both entry points
// (the calendar's "Start session" and the manual template combobox) go through here
// so the active-session block and navigation live in one place.
export function useStartWorkout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const start = useWorkoutDraftStore((s) => s.start);
  const hasDraft = useWorkoutDraftStore((s) => s.draft !== null);

  // Only one workout at a time: if one's already in progress, bounce to it instead
  // of starting another (the user finishes or discards it there first).
  function blockedByActive(): boolean {
    if (!hasDraft) return false;
    toast.error('You already have an active workout — finish or discard it first.');
    void navigate({ to: '/session' });
    return true;
  }

  // Seeds the session with the template's exercises (in order), each with a single
  // empty set; more are added via "Add set" / "Copy last" / copy-from-history.
  async function startFromTemplate({
    templateId,
    templateName,
    plannedSessionId = null,
    scheduledDate,
  }: StartFromTemplateInput) {
    if (blockedByActive()) return;
    const template = await queryClient.fetchQuery(templateQueryOptions(templateId));
    start({
      name: templateName,
      performedDate: scheduledDate ?? format(new Date(), 'yyyy-MM-dd'),
      workoutTemplateId: templateId,
      plannedSessionId,
      exercises: template.exercises.map((templateExercise) => ({
        exerciseId: templateExercise.exercise.id,
        exerciseName: templateExercise.exercise.name,
        category: templateExercise.exercise.category,
        setCount: 1,
      })),
    });
    void navigate({ to: '/session' });
  }

  function startEmpty() {
    if (blockedByActive()) return;
    start({ name: 'Workout', performedDate: format(new Date(), 'yyyy-MM-dd'), exercises: [] });
    void navigate({ to: '/session' });
  }

  return { startFromTemplate, startEmpty };
}
