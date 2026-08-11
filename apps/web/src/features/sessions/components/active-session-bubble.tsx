import { Link, useLocation } from '@tanstack/react-router';

import { cn } from '@/lib/utils';

import { useWorkoutDraftStore } from '../stores/workout-draft.store';

// Floating pill shown when a workout draft is in progress but you've navigated away
// from /session (minimized). Tapping it returns you to /session. A live workout pulses
// and reads "Active session"; editing a finished session is not a live workout (it PUTs
// back on save), so it stays calm and reads "Editing" — no false "active session" cue.
export function ActiveSessionBubble() {
  const draft = useWorkoutDraftStore((s) => s.draft);
  const { pathname } = useLocation();
  if (!draft || pathname === '/session') return null;

  const isEditing = draft.editingSessionId !== null;

  return (
    <Link
      to="/session"
      aria-label={
        isEditing ? 'Return to the session you are editing' : 'Return to your active workout'
      }
      className={cn(
        'bg-primary text-primary-foreground fixed right-4 bottom-16 z-30 flex items-center gap-2 rounded-full py-1.5 pr-4 pl-3 shadow-lg lg:bottom-4',
        !isEditing && 'animate-pulse',
      )}
    >
      <span className="bg-primary-foreground size-2 shrink-0 rounded-full" />
      <span className="flex flex-col leading-tight">
        <span className="text-[10px] opacity-80">{isEditing ? 'Editing' : 'Active session'}</span>
        <span className="max-w-[9rem] truncate text-sm font-medium">{draft.name}</span>
      </span>
    </Link>
  );
}
