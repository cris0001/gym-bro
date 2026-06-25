import { useMediaQuery } from '@/hooks/use-media-query';

import { CalendarGrid } from './calendar-grid';
import { DayDetailPanel } from './day-detail-panel';
import { DayDetailSheet } from './day-detail-sheet';

// The Calendar screen. On mobile it's the month grid plus a bottom-sheet day
// detail. On large screens it becomes a master-detail layout: the grid on the
// left and the selected day's detail inline on the right. The sheet and the
// panel are mutually exclusive (one mounts per breakpoint) so a tapped day
// never opens both.
export function CalendarPage() {
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col p-4">
      <h1 className="mb-4 text-2xl font-bold">Calendar</h1>

      <div className="lg:grid lg:grid-cols-[1fr_22rem] lg:gap-6">
        <CalendarGrid />
        {isDesktop && <DayDetailPanel />}
      </div>

      {!isDesktop && <DayDetailSheet />}
    </div>
  );
}
