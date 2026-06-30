import { Activity, Dumbbell } from 'lucide-react';

import { useMediaQuery } from '@/hooks/use-media-query';

import { CalendarGrid } from './calendar-grid';
import { DayDetailPanel } from './day-detail-panel';
import { DayDetailSheet } from './day-detail-sheet';

// The Calendar screen — the training timeline. On mobile it's the month grid plus
// a bottom-sheet day detail. On large screens it's a master-detail layout: the
// grid card on the left, the selected day's detail inline on the right. The sheet
// and the panel are mutually exclusive (one mounts per breakpoint).
export function CalendarPage() {
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Calendar</h1>
        <div className="text-muted-foreground flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <Dumbbell className="size-3.5 rotate-45 text-green-600" />
            <Activity className="size-3.5 text-green-600" />
            Finished
          </span>
          <span className="flex items-center gap-1.5">
            <span className="bg-primary size-2.5 rounded-full" />
            Planned
          </span>
        </div>
      </div>

      <div className="lg:grid lg:grid-cols-[1fr_22rem] lg:items-start lg:gap-6">
        <div className="bg-card rounded-xl border p-3 sm:p-4">
          <CalendarGrid />
        </div>
        {isDesktop && <DayDetailPanel />}
      </div>

      {!isDesktop && <DayDetailSheet />}
    </div>
  );
}
