import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Dumbbell } from 'lucide-react';

import type { PlannedSessionWithTemplate } from '@gym-bro/shared';

import { cn } from '@/lib/utils';

import { useSessionsTranslation } from '../i18n';

interface PlannedMarkerProps {
  session: PlannedSessionWithTemplate;
  // On the inverted "today" cell the plum marker is invisible; a lighter plum
  // (#c98fa0) keeps it legible against the dark background.
  onDark?: boolean;
}

// A draggable training marker for a planned (not-yet-done) session — drag it onto
// another day to reschedule. The accent color marks it as still to do (done
// sessions are green). touch-none lets the touch sensor take over from scrolling.
export function PlannedMarker({ session, onDark = false }: PlannedMarkerProps) {
  const { listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: session.id,
    data: { session },
  });
  const t = useSessionsTranslation();

  return (
    <span
      ref={setNodeRef}
      {...listeners}
      style={{ transform: CSS.Translate.toString(transform) }}
      aria-label={t.calendar.reschedule(session.template.name)}
      className={cn('cursor-grab touch-none', isDragging && 'opacity-40')}
    >
      <Dumbbell className={cn('size-4 rotate-45', onDark ? 'text-[#c98fa0]' : 'text-primary')} />
    </span>
  );
}
