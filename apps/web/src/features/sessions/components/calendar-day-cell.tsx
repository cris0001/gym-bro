import { useDroppable } from '@dnd-kit/core';
import { Activity, Dumbbell } from 'lucide-react';

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
// markers (accent); finished workouts show one green icon (Dumbbell = training,
// Activity = logged activity) plus their template names. Completed workouts' tags
// show as colored badges below.
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

      <span className="flex w-full flex-col items-center gap-0.5">
        {planned.length > 0 && (
          <span className="flex flex-wrap items-center justify-center gap-0.5">
            {planned.map((session) => (
              <PlannedMarker key={session.id} session={session} />
            ))}
          </span>
        )}
        {finished > 0 && (
          <span className="flex w-full items-start justify-center gap-1 text-green-700">
            {strengthCount > 0 ? (
              <Dumbbell className="mt-px size-3.5 shrink-0 rotate-45 text-green-600" />
            ) : (
              <Activity className="mt-px size-3.5 shrink-0 text-green-600" />
            )}
            <span className="flex min-w-0 flex-col items-center gap-0.5 text-[10px] leading-tight font-medium">
              {workoutNames.slice(0, 3).map((name, index) => (
                <span key={index} className="max-w-full truncate">
                  {name}
                </span>
              ))}
              {workoutNames.length > 3 && (
                <span className="text-muted-foreground">+{workoutNames.length - 3}</span>
              )}
            </span>
          </span>
        )}
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
