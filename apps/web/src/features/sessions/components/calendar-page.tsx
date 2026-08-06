import { Link } from '@tanstack/react-router';
import { Play } from 'lucide-react';

import { Button } from '@/components/ui/button';
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
    <div className="lg:col-start-2 flex w-full max-w-6xl flex-col gap-4 p-3 md:p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <h1 className="font-heading text-[28px] leading-none font-medium">Calendar</h1>
          <Button asChild className="h-9 rounded-full px-4">
            <Link to="/session">
              <Play className="size-4" />
              Start
            </Link>
          </Button>
        </div>
        <div className="text-muted-foreground flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-[#5a7a52]" />
            Finished
          </span>
          <span className="flex items-center gap-1.5">
            <span className="bg-primary size-2.5 rounded-full" />
            Planned
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-[#d15b28]" />
            Strava
          </span>
        </div>
      </div>

      <div className="lg:grid lg:grid-cols-[1fr_26rem] lg:items-start lg:gap-6">
        <div className="bg-card rounded-2xl border p-3 sm:p-4">
          <CalendarGrid />
        </div>
        {isDesktop && <DayDetailPanel />}
      </div>

      {!isDesktop && <DayDetailSheet />}
    </div>
  );
}
