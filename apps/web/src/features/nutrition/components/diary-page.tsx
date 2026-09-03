import { addDays, format, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useMediaQuery } from '@/hooks/use-media-query';

import { MEAL_TYPES } from '@gym-bro/shared';
import type { MealType } from '@gym-bro/shared';

import { useDailyFoodLog } from '../hooks/use-daily-food-log';
import { useDiaryUiStore } from '../stores/diary-ui.store';
import { AddEntryDesktop } from './add-entry-desktop';
import { AddEntrySheet } from './add-entry-sheet';
import { DaySummary } from './day-summary';
import { DiaryBottomBar } from './diary-bottom-bar';
import { MealSection } from './diary-meal-section';
import { PhotoEstimateSheet } from './photo-estimate-sheet';

const ISO = 'yyyy-MM-dd';

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Breakfast',
  second_breakfast: 'Second breakfast',
  lunch: 'Lunch',
  snack: 'Snack',
  dinner: 'Dinner',
};

const switchBtn =
  'text-muted-foreground hover:bg-accent flex size-9 items-center justify-center rounded-full transition-colors';

// The daily food diary: a day picker (today by default; you can move to past or
// future days to plan/back-fill), the day's summary vs target, and the five meal
// sections (each with its own add action).
export function DiaryPage() {
  const today = format(new Date(), ISO);
  const [date, setDate] = useState(today);
  const { data } = useDailyFoodLog(date);
  const addMeal = useDiaryUiStore((s) => s.addMeal);
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const isToday = date === today;
  const shift = (days: number) => setDate(format(addDays(parseISO(date), days), ISO));
  const entries = data?.entries ?? [];

  // Desktop takes over the content column with the two-pane add view (sidebar stays);
  // mobile keeps the fullscreen overlay rendered below the diary.
  if (isDesktop && addMeal !== null) {
    return (
      <div className="lg:col-start-2 w-full">
        <AddEntryDesktop loggedDate={date} meal={addMeal} />
      </div>
    );
  }

  return (
    <div className="lg:col-start-2 flex w-full max-w-5xl flex-col gap-4 p-3 pb-36 md:p-4 lg:pb-4">
      <header className="flex items-center justify-between gap-2">
        <h1 className="font-heading text-[28px] leading-none font-medium">Diary</h1>
        <div className="bg-card flex items-center rounded-full border p-1">
          <button
            type="button"
            aria-label="Previous day"
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
            {isToday ? 'Today' : format(parseISO(date), 'EEE, MMM d')}
          </button>
          <button
            type="button"
            aria-label="Next day"
            className={switchBtn}
            onClick={() => shift(1)}
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </header>

      <div className="lg:grid lg:grid-cols-[1fr_24rem] lg:items-start lg:gap-6">
        {/* Desktop sidebar summary; on mobile the inverted bottom bar takes over. */}
        <Card className="hidden rounded-2xl lg:sticky lg:top-4 lg:order-2 lg:block">
          <CardContent>
            {data ? (
              <DaySummary totals={data.totals} date={date} />
            ) : (
              <div className="grid gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="grid gap-1">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-2 w-full" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3 lg:order-1">
          {MEAL_TYPES.map((meal) => (
            <MealSection
              key={meal}
              meal={meal}
              label={MEAL_LABELS[meal]}
              entries={entries.filter((entry) => entry.meal === meal)}
            />
          ))}
        </div>
      </div>

      <AddEntrySheet loggedDate={date} />
      <PhotoEstimateSheet loggedDate={date} />
      {data && <DiaryBottomBar totals={data.totals} date={date} />}
    </div>
  );
}
