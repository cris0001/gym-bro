import { Link, useLocation } from '@tanstack/react-router';
import { BicepsFlexed } from 'lucide-react';

import { useWorkoutDraftStore } from '../stores/workout-draft.store';

// Floating pill shown when a workout draft is in progress but you've navigated away
// from /session (minimized). Tapping it returns to the active session. Sits above the
// mobile bottom nav; a pulsing dot signals it's live.
export function ActiveSessionBubble() {
  const draft = useWorkoutDraftStore((s) => s.draft);
  const { pathname } = useLocation();
  if (!draft || pathname === '/session') return null;

  return (
    <Link
      to="/session"
      aria-label="Return to your active workout"
      className="bg-primary text-primary-foreground fixed right-4 bottom-16 z-30 flex items-center gap-2 rounded-full py-2.5 pr-4 pl-3 shadow-lg transition-transform hover:scale-105 lg:bottom-4"
    >
      <span className="relative flex size-2.5">
        <span className="bg-primary-foreground/70 absolute inline-flex size-full animate-ping rounded-full" />
        <span className="bg-primary-foreground relative inline-flex size-2.5 rounded-full" />
      </span>
      <BicepsFlexed className="size-4 shrink-0" />
      <span className="flex flex-col leading-tight">
        <span className="text-[10px] opacity-80">Active session</span>
        <span className="max-w-[9rem] truncate text-sm font-medium">{draft.name}</span>
      </span>
    </Link>
  );
}
