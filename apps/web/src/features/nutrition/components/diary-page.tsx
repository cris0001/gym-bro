import { addDays, format, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { MEAL_TYPES } from '@gym-bro/shared';
import type { MealType } from '@gym-bro/shared';

import { useDailyFoodLog } from '../hooks/use-daily-food-log';
import { AddEntrySheet } from './add-entry-sheet';
import { DaySummary } from './day-summary';
import { DiaryBottomBar } from './diary-bottom-bar';
import { MealSection } from './diary-meal-section';

const ISO = 'yyyy-MM-dd';

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Breakfast',
  second_breakfast: 'Second breakfast',
  lunch: 'Lunch',
  snack: 'Snack',
  dinner: 'Dinner',
};

// The daily food diary: a day picker (today by default; you can move to past or
// future days to plan/back-fill), the day's summary vs target, and the five meal
// sections (each with its own add action).
export function DiaryPage() {
  const today = format(new Date(), ISO);
  const [date, setDate] = useState(today);
  const { data } = useDailyFoodLog(date);

  const isToday = date === today;
  const shift = (days: number) => setDate(format(addDays(parseISO(date), days), ISO));
  const entries = data?.entries ?? [];

  return (
    <div className="lg:col-start-2 flex w-full max-w-5xl flex-col gap-4 p-4 pb-36 lg:pb-4">
      <h1 className="text-2xl font-bold">Diary</h1>

      <div className="lg:grid lg:grid-cols-[1fr_24rem] lg:items-start lg:gap-6">
        {/* Desktop sidebar summary; on mobile the slim bottom bar takes over. The
            top margin drops it past the day switcher so it lines up with the first
            meal. */}
        <Card className="hidden lg:order-2 lg:mt-[3.75rem] lg:sticky lg:top-4 lg:block">
          <CardContent>
            {data ? (
              <DaySummary totals={data.totals} />
            ) : (
              <p className="text-muted-foreground text-sm">Loading…</p>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4 lg:order-1">
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-11"
              aria-label="Previous day"
              onClick={() => shift(-1)}
            >
              <ChevronLeft className="size-5" />
            </Button>
            <button type="button" className="text-sm font-medium" onClick={() => setDate(today)}>
              {isToday ? 'Today' : format(parseISO(date), 'EEE, PP')}
            </button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-11"
              aria-label="Next day"
              onClick={() => shift(1)}
            >
              <ChevronRight className="size-5" />
            </Button>
          </div>

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
      {data && <DiaryBottomBar totals={data.totals} />}
    </div>
  );
}
