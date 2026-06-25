import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

import type { PlannedSessionWithTemplate } from '@gym-bro/shared';

import { cn } from '@/lib/utils';

interface PlannedMarkerProps {
  session: PlannedSessionWithTemplate;
}

// A draggable dot for a planned (not-yet-done) session — drag it onto another day
// to reschedule. Only 'planned' entries are draggable; completed/skipped are
// fixed history. touch-none lets the touch sensor take over from page scrolling.
export function PlannedMarker({ session }: PlannedMarkerProps) {
  const { listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: session.id,
    data: { session },
  });

  return (
    <span
      ref={setNodeRef}
      {...listeners}
      style={{ transform: CSS.Translate.toString(transform) }}
      aria-label={`Reschedule ${session.template.name}`}
      className={cn(
        'bg-primary size-2.5 cursor-grab touch-none rounded-full',
        isDragging && 'opacity-40',
      )}
    />
  );
}
