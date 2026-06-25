import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { format } from 'date-fns';

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
// (the calendar's "Start session" and the manual template combobox) go through
// here so the discard-confirm and navigation live in one place.
export function useStartWorkout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const start = useWorkoutDraftStore((s) => s.start);
  const hasDraft = useWorkoutDraftStore((s) => s.draft !== null);

  function confirmOverwrite(): boolean {
    return (
      !hasDraft ||
      window.confirm('A workout is already in progress. Discard it and start a new one?')
    );
  }

  // Seeds the session with the template's exercises (in order), each with as many
  // empty sets as the template's target. The user logs/adjusts from there.
  async function startFromTemplate({
    templateId,
    templateName,
    plannedSessionId = null,
    scheduledDate,
  }: StartFromTemplateInput) {
    if (!confirmOverwrite()) return;
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
        setCount: templateExercise.targetSets ?? 0,
      })),
    });
    void navigate({ to: '/session' });
  }

  function startEmpty() {
    if (!confirmOverwrite()) return;
    start({ name: 'Workout', performedDate: format(new Date(), 'yyyy-MM-dd'), exercises: [] });
    void navigate({ to: '/session' });
  }

  return { startFromTemplate, startEmpty };
}
