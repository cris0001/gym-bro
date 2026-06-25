import { useDroppable } from '@dnd-kit/core';

import type { PlannedSessionWithTemplate, PlannedStatus } from '@gym-bro/shared';

import { cn } from '@/lib/utils';

import { PlannedMarker } from './planned-marker';

// Dot color per planned status: planned = accent, completed = green, skipped =
// muted. Planned dots are draggable (see PlannedMarker); the rest are static.
const STATUS_DOT: Record<PlannedStatus, string> = {
  planned: 'bg-primary',
  completed: 'bg-green-500',
  skipped: 'bg-muted-foreground/50',
};

interface CalendarDayCellProps {
  iso: string;
  dayNumber: string;
  inMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  planned: PlannedSessionWithTemplate[];
  tags: { id: string; color: string }[];
  onSelect: (iso: string) => void;
}

// One day in the month grid: a drop target (drag a planned marker here to
// reschedule) that opens the day detail on click. Shows status dots for planned
// sessions and colored squares for completed workouts' tags.
export function CalendarDayCell({
  iso,
  dayNumber,
  inMonth,
  isToday,
  isSelected,
  planned,
  tags,
  onSelect,
}: CalendarDayCellProps) {
  const { setNodeRef, isOver } = useDroppable({ id: iso });

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
        {planned
          .slice(0, 4)
          .map((session) =>
            session.status === 'planned' ? (
              <PlannedMarker key={session.id} session={session} />
            ) : (
              <span
                key={session.id}
                className={cn('size-1.5 rounded-full', STATUS_DOT[session.status])}
              />
            ),
          )}
      </span>

      {tags.length > 0 && (
        <span className="flex flex-wrap items-center justify-center gap-0.5">
          {tags.slice(0, 4).map((tag) => (
            <span
              key={tag.id}
              className="size-1.5 rounded-[2px]"
              style={{ backgroundColor: tag.color }}
            />
          ))}
        </span>
      )}
    </div>
  );
}
