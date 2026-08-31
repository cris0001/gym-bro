import { useDroppable } from '@dnd-kit/core';

import type { PlannedSessionWithTemplate } from '@gym-bro/shared';

import { stravaActivityIcon } from '@/features/strava';
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
  // The day's imported Strava activity types — each shown as its orange sport icon.
  stravaTypes: string[];
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
  stravaTypes,
  tags,
  onSelect,
}: CalendarDayCellProps) {
  const { setNodeRef, isOver } = useDroppable({ id: iso });

  const finished = strengthCount + activityCount;
  // Today reads as an inverted (dark) cell; selection wins with a terracotta ring +
  // tint. Otherwise the cell is tinted by its content — green (done), orange (Strava),
  // terracotta (planned) — for an at-a-glance read.
  const inverted = isToday && !isSelected;
  const bgClass = isSelected
    ? 'bg-accent ring-primary ring-inset ring-2'
    : inverted
      ? 'bg-[#2b2126] text-[#fdf6f5] dark:bg-[#f0e7ea] dark:text-[#221a20]'
      : finished > 0
        ? 'bg-[#e8efe4] dark:bg-[#2f3a2b]'
        : stravaTypes.length > 0
          ? 'bg-[#fbe3d4] dark:bg-[#45291b]'
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
        'flex min-h-11 cursor-pointer flex-col items-center justify-start gap-1 rounded-lg p-1 text-sm transition-colors',
        tall ? 'min-h-24' : 'aspect-square',
        'focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2',
        !inverted && 'hover:bg-accent',
        !inMonth && 'text-[#c8bcc1] dark:text-[#5a4d55]',
        bgClass,
        isOver && 'ring-primary ring-2',
      )}
    >
      <span className="flex flex-col items-center leading-none">
        <span
          className={cn('flex size-6 items-center justify-center', inverted && 'font-semibold')}
        >
          {dayNumber}
        </span>
        {inverted && (
          <span className="text-[9px] font-semibold tracking-wide uppercase lg:hidden">Today</span>
        )}
      </span>

      {(planned.length > 0 || stravaTypes.length > 0) && (
        <span className="flex flex-wrap items-center justify-center gap-x-1 gap-y-0.5">
          {planned.length > 0 && (
            <span className="flex items-center gap-0.5">
              {/* One marker regardless of how many are planned; a count when >1. The
                  shown marker stays draggable to reschedule; manage the rest in the
                  day detail. */}
              <PlannedMarker session={planned[0]!} />
              {planned.length > 1 && (
                <span className="text-primary text-[10px] font-semibold leading-none">
                  ×{planned.length}
                </span>
              )}
            </span>
          )}
          {stravaTypes.length > 0 && (
            <span className="flex items-center gap-0.5 text-orange-600">
              {stravaTypes.slice(0, 3).map((type, index) => {
                const Icon = stravaActivityIcon(type);
                return <Icon key={index} className="size-3.5" />;
              })}
              {stravaTypes.length > 3 && (
                <span className="text-[10px] font-semibold leading-none">
                  +{stravaTypes.length - 3}
                </span>
              )}
            </span>
          )}
        </span>
      )}

      {finished > 0 && (
        <span
          className={cn(
            'mt-auto flex w-full min-w-0 flex-col items-center gap-0.5 text-[10px] leading-tight font-medium',
            inverted ? 'text-[#bfe0b3] dark:text-[#3f5c37]' : 'text-[#48653f] dark:text-[#8fae85]',
          )}
        >
          {workoutNames.slice(0, 3).map((name, index) => (
            <span key={index} className="max-w-full truncate">
              {name}
            </span>
          ))}
          {workoutNames.length > 3 && (
            <span
              className={
                inverted ? 'text-[#fdf6f5]/60 dark:text-[#221a20]/60' : 'text-muted-foreground'
              }
            >
              +{workoutNames.length - 3}
            </span>
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
