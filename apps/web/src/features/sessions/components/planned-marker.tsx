import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Dumbbell } from 'lucide-react';

import type { PlannedSessionWithTemplate } from '@gym-bro/shared';

import { cn } from '@/lib/utils';

interface PlannedMarkerProps {
  session: PlannedSessionWithTemplate;
}

// A draggable training marker for a planned (not-yet-done) session — drag it onto
// another day to reschedule. The accent color marks it as still to do (done
// sessions are green). touch-none lets the touch sensor take over from scrolling.
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
      className={cn('cursor-grab touch-none', isDragging && 'opacity-40')}
    >
      <Dumbbell className="text-primary size-4 rotate-45" />
    </span>
  );
}
