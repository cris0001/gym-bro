import { useNavigate } from '@tanstack/react-router';

import type { WorkoutDraft } from '../stores/workout-draft.store';

// Leaves the edit view for the page the edit was opened from (calendar, history
// detail, …), falling back to the workout's detail page for drafts persisted before
// returnTo existed. replace: the /session entry is dropped, so Back from the
// returned-to page doesn't land in an empty editor.
export function useLeaveEdit() {
  const navigate = useNavigate();
  return function leaveEdit(draft: Pick<WorkoutDraft, 'editingSessionId' | 'returnTo'>) {
    if (draft.editingSessionId === null) return;
    if (draft.returnTo) {
      void navigate({ href: draft.returnTo, replace: true });
    } else {
      void navigate({
        to: '/history/$sessionId',
        params: { sessionId: draft.editingSessionId },
        replace: true,
      });
    }
  };
}
