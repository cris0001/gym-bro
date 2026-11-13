import { addDays, format, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

import { Card, CardContent } from '@/components/ui/card';
import { useMediaQuery } from '@/hooks/use-media-query';

import { MEAL_TYPES } from '@gym-bro/shared';

import { useDailyFoodLog } from '../hooks/use-daily-food-log';
import { useNutritionTranslation } from '../i18n';
import { useDiaryUiStore } from '../stores/diary-ui.store';
import { AddEntryDesktop } from './add-entry-desktop';
import { AddEntrySheet } from './add-entry-sheet';
import { DaySummary } from './day-summary';
import { DaySummarySkeleton } from './day-summary-skeleton';
import { DiaryBottomBar } from './diary-bottom-bar';
import { MealSection } from './diary-meal-section';
import { MealSectionsSkeleton } from './meal-sections-skeleton';
import { PhotoEstimateSheet } from './photo-estimate-sheet';

const ISO = 'yyyy-MM-dd';
const NO_TOTALS = { kcal: 0, proteinG: 0, carbsG: 0, fatG: 0 };

const switchBtn =
  'text-muted-foreground hover:bg-accent flex size-9 items-center justify-center rounded-full transition-colors';

// The daily food diary: a day picker (today by default; you can move to past or
// future days to plan/back-fill), the day's summary vs target, and the five meal
// sections (each with its own add action).
export function DiaryPage() {
  const t = useNutritionTranslation();
  const today = format(new Date(), ISO);
  const [date, setDate] = useState(today);
  const { data, isLoading } = useDailyFoodLog(date);
  // Skeleton only while the day is actually being fetched with nothing to show. Offline
  // the request pauses (not loading), so the meals render empty and stay usable —
  // entries can still be queued — instead of a skeleton that never resolves.
  const showSkeleton = isLoading && !data;
  const addMeal = useDiaryUiStore((s) => s.addMeal);
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const isToday = date === today;
  const shift = (days: number) => setDate(format(addDays(parseISO(date), days), ISO));
  const entries = data?.entries ?? [];

  // Desktop takes over the content column with the two-pane add view (sidebar stays);
  // mobile keeps the fullscreen overlay rendered below the diary.
  if (isDesktop && addMeal !== null) {
    return (
      // min-w-0: as a grid item of the app shell this may not grow past its column
      // to fit long names — the panes inside shrink and truncate instead.
      <div className="lg:col-start-2 w-full min-w-0">
        <AddEntryDesktop loggedDate={date} meal={addMeal} />
      </div>
    );
  }

  return (
    <div className="lg:col-start-2 flex w-full min-w-0 max-w-5xl flex-col gap-4 p-3 pb-36 md:p-4 lg:pb-4">
      <header className="flex items-center justify-between gap-2">
        <h1 className="font-heading text-[28px] leading-none font-medium">{t.diary.title}</h1>
        <div className="bg-card flex items-center rounded-full border p-1">
          <button
            type="button"
            aria-label={t.diary.prevDay}
            className={switchBtn}
            onClick={() => shift(-1)}
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            className="min-w-[6rem] px-2 text-center text-sm font-medium"
            onClick={() => setDate(today)}
          >
            {isToday ? t.common.today : format(parseISO(date), 'EEE, MMM d')}
          </button>
          <button
            type="button"
            aria-label={t.diary.nextDay}
            className={switchBtn}
            onClick={() => shift(1)}
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </header>

      {/* minmax(0,1fr): the meals column may shrink below its content (long names
          truncate) instead of pushing the summary off the page. The summary is
          narrower until xl, where there's room for the full 24rem. */}
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start lg:gap-5 xl:grid-cols-[minmax(0,1fr)_24rem] xl:gap-6">
        {/* Desktop sidebar summary; on mobile the inverted bottom bar takes over. */}
        <Card className="hidden rounded-2xl lg:sticky lg:top-4 lg:order-2 lg:block">
          <CardContent>
            {showSkeleton ? (
              <DaySummarySkeleton />
            ) : (
              <DaySummary totals={data?.totals ?? NO_TOTALS} date={date} />
            )}
          </CardContent>
        </Card>

        <div className="flex min-w-0 flex-col gap-3 lg:order-1">
          {showSkeleton ? (
            <MealSectionsSkeleton />
          ) : (
            MEAL_TYPES.map((meal) => (
              <MealSection
                key={meal}
                meal={meal}
                label={t.meals[meal]}
                loggedDate={date}
                entries={entries.filter((entry) => entry.meal === meal)}
              />
            ))
          )}
        </div>
      </div>

      <AddEntrySheet loggedDate={date} />
      <PhotoEstimateSheet loggedDate={date} />
      {data && <DiaryBottomBar totals={data.totals} date={date} />}
    </div>
  );
}
