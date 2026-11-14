import { useMediaQuery } from '@/hooks/use-media-query';
import { PageTitle } from '@/components/page-title';

import { useSessionsTranslation } from '../i18n';
import { CalendarGrid } from './calendar-grid';
import { CalendarStartButton } from './calendar-start-button';
import { DayDetailPanel } from './day-detail-panel';
import { DayDetailSheet } from './day-detail-sheet';

// The Calendar screen — the training timeline. On mobile it's the month grid plus
// a bottom-sheet day detail. On large screens it's a master-detail layout: the
// grid card on the left, the selected day's detail inline on the right. The sheet
// and the panel are mutually exclusive (one mounts per breakpoint).
export function CalendarPage() {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const t = useSessionsTranslation();

  return (
    <div className="lg:col-start-2 flex w-full max-w-6xl flex-col gap-4 p-3 md:p-4">
      <div className="flex items-center justify-between gap-2">
        <PageTitle className="font-heading text-[28px] leading-none font-bold tracking-tight">
          {t.calendar.title}
        </PageTitle>
        <CalendarStartButton />
      </div>

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:gap-2 xl:grid-cols-[minmax(0,1fr)_27.5rem]">
        <div className="bg-card flex flex-col gap-3 rounded-xl border p-3 sm:p-4">
          <CalendarGrid />
          <div className="text-muted-foreground flex flex-wrap items-center justify-center gap-4 border-t pt-3 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-[#5a7a52] dark:bg-[#8fae85]" />
              {t.calendar.finished}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="bg-primary size-2.5 rounded-full" />
              {t.calendar.planned}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-[#d15b28] dark:bg-[#ff7a3d]" />
              {t.calendar.strava}
            </span>
          </div>
        </div>
        {isDesktop && <DayDetailPanel />}
      </div>

      {!isDesktop && <DayDetailSheet />}
    </div>
  );
}
