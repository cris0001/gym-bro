import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { format } from 'date-fns';

import { templateQueryOptions } from '@/features/training';
import { useConfirm } from '@/stores/confirm.store';

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
// (the calendar's "Start session" and the manual template combobox) go through
// here so the discard-confirm and navigation live in one place.
export function useStartWorkout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const start = useWorkoutDraftStore((s) => s.start);
  const hasDraft = useWorkoutDraftStore((s) => s.draft !== null);
  const confirm = useConfirm();

  async function confirmOverwrite(): Promise<boolean> {
    if (!hasDraft) return true;
    return confirm({
      title: 'A workout is already in progress',
      description: 'Discard it and start a new one?',
      confirmText: 'Discard & start',
      destructive: true,
    });
  }

  // Seeds the session with the template's exercises (in order), each with a single
  // empty set; more are added via "Add set" / "Copy last" / copy-from-history.
  async function startFromTemplate({
    templateId,
    templateName,
    plannedSessionId = null,
    scheduledDate,
  }: StartFromTemplateInput) {
    if (!(await confirmOverwrite())) return;
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

  async function startEmpty() {
    if (!(await confirmOverwrite())) return;
    start({ name: 'Workout', performedDate: format(new Date(), 'yyyy-MM-dd'), exercises: [] });
    void navigate({ to: '/session' });
  }

  return { startFromTemplate, startEmpty };
}
