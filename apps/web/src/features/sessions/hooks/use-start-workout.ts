import { useNavigate } from '@tanstack/react-router';
import { format } from 'date-fns';

import { useWorkoutDraftStore } from '../stores/workout-draft.store';

interface StartFromTemplateInput {
  templateId: string;
  templateName: string;
  plannedSessionId?: string | null;
}

// Starts a workout draft and routes to the active-session view. Both entry points
// (the calendar's "Start session" and the manual template combobox) go through
// here so the discard-confirm and navigation live in one place. Sessions start
// with no exercises; they're added from the (template-filtered) picker.
export function useStartWorkout() {
  const navigate = useNavigate();
  const start = useWorkoutDraftStore((s) => s.start);
  const hasDraft = useWorkoutDraftStore((s) => s.draft !== null);

  function confirmOverwrite(): boolean {
    return (
      !hasDraft ||
      window.confirm('A workout is already in progress. Discard it and start a new one?')
    );
  }

  function startFromTemplate({
    templateId,
    templateName,
    plannedSessionId = null,
  }: StartFromTemplateInput) {
    if (!confirmOverwrite()) return;
    start({
      name: templateName,
      performedDate: format(new Date(), 'yyyy-MM-dd'),
      workoutTemplateId: templateId,
      plannedSessionId,
      exercises: [],
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
