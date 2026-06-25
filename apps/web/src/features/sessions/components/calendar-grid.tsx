import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

import type { PlannedSessionWithTemplate, WorkoutSessionListItem } from '@gym-bro/shared';

import { Button } from '@/components/ui/button';

import { usePlannedSessions } from '../hooks/use-planned-sessions';
import { useUpdatePlannedSession } from '../hooks/use-update-planned-session';
import { useWorkoutsInRange } from '../hooks/use-workouts-in-range';
import { useCalendarUiStore } from '../stores/calendar-ui.store';
import { CalendarDayCell } from './calendar-day-cell';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const ISO = 'yyyy-MM-dd';

// Groups planned sessions by their scheduled day for O(1) per-cell lookup.
function groupByDate(
  sessions: PlannedSessionWithTemplate[],
): Map<string, PlannedSessionWithTemplate[]> {
  const map = new Map<string, PlannedSessionWithTemplate[]>();
  for (const session of sessions) {
    const existing = map.get(session.scheduledDate);
    if (existing) existing.push(session);
    else map.set(session.scheduledDate, [session]);
  }
  return map;
}

// Distinct tag colors per day from completed workouts — tags live on workouts,
// not planned sessions, so they're keyed by performedDate for the calendar marks.
function tagsByDate(
  workouts: WorkoutSessionListItem[],
): Map<string, { id: string; color: string }[]> {
  const map = new Map<string, { id: string; color: string }[]>();
  for (const workout of workouts) {
    if (workout.tags.length === 0) continue;
    const existing = map.get(workout.performedDate) ?? [];
    for (const tag of workout.tags) {
      if (!existing.some((entry) => entry.id === tag.id)) {
        existing.push({ id: tag.id, color: tag.color });
      }
    }
    map.set(workout.performedDate, existing);
  }
  return map;
}

export function CalendarGrid() {
  const viewedMonth = useCalendarUiStore((s) => s.viewedMonth);
  const selectedDate = useCalendarUiStore((s) => s.selectedDate);
  const selectDay = useCalendarUiStore((s) => s.selectDay);
  const goToPrevMonth = useCalendarUiStore((s) => s.goToPrevMonth);
  const goToNextMonth = useCalendarUiStore((s) => s.goToNextMonth);
  const goToToday = useCalendarUiStore((s) => s.goToToday);

  // The grid spans whole weeks, so it bleeds into the prev/next month. We query
  // the full visible window so leading/trailing days show their markers too.
  const gridStart = startOfWeek(startOfMonth(viewedMonth), { weekStartsOn: 1 });
  const gridEnd = endOfWeek(endOfMonth(viewedMonth), { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const fromIso = format(gridStart, ISO);
  const toIso = format(gridEnd, ISO);
  const { data: sessions = [] } = usePlannedSessions(fromIso, toIso);
  const byDate = groupByDate(sessions);
  const { data: workoutsPage } = useWorkoutsInRange(fromIso, toIso);
  const tagMarkers = tagsByDate(workoutsPage?.items ?? []);

  const updateMutation = useUpdatePlannedSession();
  const [dragging, setDragging] = useState<PlannedSessionWithTemplate | null>(null);

  // A small move starts a drag (so a tap still opens the day); touch needs a brief
  // hold so vertical scrolling isn't hijacked.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } }),
  );

  function handleDragStart(event: DragStartEvent) {
    setDragging(
      (event.active.data.current?.session as PlannedSessionWithTemplate | undefined) ?? null,
    );
  }

  function handleDragEnd(event: DragEndEvent) {
    setDragging(null);
    const { active, over } = event;
    if (!over) return;
    const session = active.data.current?.session as PlannedSessionWithTemplate | undefined;
    const targetIso = String(over.id);
    if (!session || targetIso === session.scheduledDate) return;
    updateMutation.mutate({ id: session.id, input: { scheduledDate: targetIso } });
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setDragging(null)}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{format(viewedMonth, 'MMMM yyyy')}</h2>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={goToToday}>
              Today
            </Button>
            <Button variant="ghost" size="icon" onClick={goToPrevMonth} aria-label="Previous month">
              <ChevronLeft className="size-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={goToNextMonth} aria-label="Next month">
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 text-center text-xs font-medium text-muted-foreground">
          {WEEKDAYS.map((day) => (
            <span key={day} className="py-1">
              {day}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const iso = format(day, ISO);
            return (
              <CalendarDayCell
                key={iso}
                iso={iso}
                dayNumber={format(day, 'd')}
                inMonth={isSameMonth(day, viewedMonth)}
                isToday={isToday(day)}
                isSelected={selectedDate === iso}
                planned={byDate.get(iso) ?? []}
                tags={tagMarkers.get(iso) ?? []}
                onSelect={selectDay}
              />
            );
          })}
        </div>
      </div>

      <DragOverlay>
        {dragging ? (
          <div className="bg-primary text-primary-foreground rounded px-2 py-1 text-xs shadow">
            {dragging.template.name}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
