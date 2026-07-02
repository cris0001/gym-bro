import { useDroppable } from '@dnd-kit/core';

import type { PlannedSessionWithTemplate } from '@gym-bro/shared';

import { cn } from '@/lib/utils';

import { PlannedMarker } from './planned-marker';

interface CalendarDayCellProps {
  iso: string;
  dayNumber: string;
  inMonth: boolean;
  // Week view gives each day more vertical room; month view keeps square cells.
  tall?: boolean;
  isToday: boolean;
  isSelected: boolean;
  planned: PlannedSessionWithTemplate[];
  strengthCount: number;
  activityCount: number;
  // Names of the day's finished workouts (template snapshot / activity name).
  workoutNames: string[];
  tags: { id: string; color: string }[];
  onSelect: (iso: string) => void;
}

// One day in the month grid: a drop target (drag a planned marker here to
// reschedule) that opens the day detail on click. Planned to-dos show as draggable
// markers (accent) near the top; finished workouts show their template names anchored
// at the bottom of the cell (green = done). Completed workouts' tags show as colored
// badges below.
export function CalendarDayCell({
  iso,
  dayNumber,
  inMonth,
  tall = false,
  isToday,
  isSelected,
  planned,
  strengthCount,
  activityCount,
  workoutNames,
  tags,
  onSelect,
}: CalendarDayCellProps) {
  const { setNodeRef, isOver } = useDroppable({ id: iso });

  const finished = strengthCount + activityCount;
  // Tint the cell by its content for an at-a-glance read: green when something was
  // done, accent when only planned. Selection wins over the tint.
  const bgClass = isSelected
    ? 'bg-accent'
    : finished > 0
      ? 'bg-green-500/10'
      : planned.length > 0
        ? 'bg-primary/10'
        : '';

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
        'flex min-h-11 cursor-pointer flex-col items-center justify-start gap-1 rounded-md p-1 text-sm transition-colors',
        tall ? 'min-h-24' : 'aspect-square',
        'hover:bg-accent focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2',
        !inMonth && 'text-muted-foreground/40',
        bgClass,
        isToday && !isSelected && 'ring-primary/40 ring-1',
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

      {planned.length > 0 && (
        <span className="flex items-center justify-center gap-0.5">
          {/* One marker regardless of how many are planned; a count when >1. The
              shown marker stays draggable to reschedule; manage the rest in the day
              detail. */}
          <PlannedMarker session={planned[0]!} />
          {planned.length > 1 && (
            <span className="text-primary text-[10px] font-semibold leading-none">
              ×{planned.length}
            </span>
          )}
        </span>
      )}

      {finished > 0 && (
        <span className="mt-auto flex w-full min-w-0 flex-col items-center gap-0.5 text-[10px] leading-tight font-medium text-green-700">
          {workoutNames.slice(0, 3).map((name, index) => (
            <span key={index} className="max-w-full truncate">
              {name}
            </span>
          ))}
          {workoutNames.length > 3 && (
            <span className="text-muted-foreground">+{workoutNames.length - 3}</span>
          )}
        </span>
      )}

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
