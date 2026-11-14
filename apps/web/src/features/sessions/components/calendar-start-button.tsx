import { Link } from '@tanstack/react-router';
import { Play } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { useSessionsTranslation } from '../i18n';

// The calendar header's "Start workout": opens /session — the start screen (with
// today's planned session on top) or the workout already in progress. It never
// starts a session by itself.
export function CalendarStartButton() {
  const t = useSessionsTranslation();

  return (
    <Button asChild className="h-9.5 rounded-full px-5">
      <Link to="/session">
        <Play className="size-4" />
        <span className="sm:hidden">{t.common.start}</span>
        <span className="hidden sm:inline">{t.common.startWorkout}</span>
      </Link>
    </Button>
  );
}
