import { useDroppable } from '@dnd-kit/core';
import { Activity, Dumbbell } from 'lucide-react';

import type { PlannedSessionWithTemplate } from '@gym-bro/shared';

import { cn } from '@/lib/utils';

import { PlannedMarker } from './planned-marker';

interface CalendarDayCellProps {
  iso: string;
  dayNumber: string;
  inMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  planned: PlannedSessionWithTemplate[];
  strengthCount: number;
  activityCount: number;
  tags: { id: string; color: string }[];
  onSelect: (iso: string) => void;
}

const MAX_MARKERS = 4;

// One day in the month grid: a drop target (drag a planned marker here to
// reschedule) that opens the day detail on click. Markers encode type by icon
// (Dumbbell = training, Activity = logged activity) and status by color (accent =
// planned/to-do, green = finished); completed workouts' tags show as colored
// badges. Planned to-dos come first, then the day's finished workouts.
export function CalendarDayCell({
  iso,
  dayNumber,
  inMonth,
  isToday,
  isSelected,
  planned,
  strengthCount,
  activityCount,
  tags,
  onSelect,
}: CalendarDayCellProps) {
  const { setNodeRef, isOver } = useDroppable({ id: iso });

  const finished = strengthCount + activityCount;
  const total = planned.length + finished;
  // Planned markers are draggable, so keep them all; fill the rest with finished
  // markers up to the cap, leaving room for a "+N" overflow chip.
  const shownStrength = Math.max(0, Math.min(strengthCount, MAX_MARKERS - planned.length));
  const shownActivity = Math.max(
    0,
    Math.min(activityCount, MAX_MARKERS - planned.length - shownStrength),
  );
  const overflow = total - planned.length - shownStrength - shownActivity;

  return (
    <div
      ref={setNodeRef}
      role="button"
      tabIndex={0}
      onClick={() => onSelect(iso)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(iso);
        }
      }}
      className={cn(
        'flex aspect-square min-h-11 cursor-pointer flex-col items-center justify-start gap-1 rounded-md p-1 text-sm transition-colors',
        'hover:bg-accent focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2',
        !inMonth && 'text-muted-foreground/40',
        isSelected && 'bg-accent',
        isOver && 'ring-primary ring-2',
      )}
    >
      <span
        className={cn(
          'flex size-6 items-center justify-center rounded-full',
          isToday && 'bg-primary text-primary-foreground font-semibold',
        )}
      >
        {dayNumber}
      </span>

      <span className="flex flex-wrap items-center justify-center gap-0.5">
        {planned.map((session) => (
          <PlannedMarker key={session.id} session={session} />
        ))}
        {Array.from({ length: shownStrength }).map((_, index) => (
          <Dumbbell key={`strength-${index}`} className="size-4 rotate-45 text-green-600" />
        ))}
        {Array.from({ length: shownActivity }).map((_, index) => (
          <Activity key={`activity-${index}`} className="size-4 text-green-600" />
        ))}
        {overflow > 0 && <span className="text-muted-foreground text-[10px]">+{overflow}</span>}
      </span>

      {tags.length > 0 && (
        <span className="flex flex-wrap items-center justify-center gap-1">
          {tags.slice(0, 4).map((tag) => (
            <span
              key={tag.id}
              className="size-2 rounded-[3px]"
              style={{ backgroundColor: tag.color }}
            />
          ))}
        </span>
      )}
    </div>
  );
}
