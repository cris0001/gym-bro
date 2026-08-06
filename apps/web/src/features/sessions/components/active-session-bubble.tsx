import { Link, useLocation } from '@tanstack/react-router';

import { useWorkoutDraftStore } from '../stores/workout-draft.store';

// Floating pill shown when a workout draft is in progress but you've navigated away
// from /session (minimized). Tapping it returns to the active session. Sits above the
// mobile bottom nav; the whole pill pulses to signal it's live.
export function ActiveSessionBubble() {
  const draft = useWorkoutDraftStore((s) => s.draft);
  const { pathname } = useLocation();
  if (!draft || pathname === '/session') return null;

  return (
    <Link
      to="/session"
      aria-label="Return to your active workout"
      className="bg-primary text-primary-foreground fixed right-4 bottom-16 z-30 flex animate-pulse items-center gap-2 rounded-full py-1.5 pr-4 pl-3 shadow-lg lg:bottom-4"
    >
      <span className="bg-primary-foreground size-2 shrink-0 rounded-full" />
      <span className="flex flex-col leading-tight">
        <span className="text-[10px] opacity-80">Active session</span>
        <span className="max-w-[9rem] truncate text-sm font-medium">{draft.name}</span>
      </span>
    </Link>
  );
}
