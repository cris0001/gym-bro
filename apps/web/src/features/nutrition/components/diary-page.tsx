import { addDays, format, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { useDailyFoodLog } from '../hooks/use-daily-food-log';
import { useDiaryUiStore } from '../stores/diary-ui.store';
import { AddEntrySheet } from './add-entry-sheet';
import { DaySummary } from './day-summary';
import { DiaryEntryRow } from './diary-entry-row';

const ISO = 'yyyy-MM-dd';

// The daily food diary: a day picker (today by default, no future), the day's
// summary vs target, the logged entries, and the add-entry action.
export function DiaryPage() {
  const today = format(new Date(), ISO);
  const [date, setDate] = useState(today);
  const openAdd = useDiaryUiStore((s) => s.openAdd);
  const { data, isPending } = useDailyFoodLog(date);

  const isToday = date === today;
  const shift = (days: number) => setDate(format(addDays(parseISO(date), days), ISO));

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Diary</h1>
        <Button type="button" className="h-11" onClick={openAdd}>
          <Plus className="size-4" />
          Add
        </Button>
      </div>

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
          disabled={isToday}
          onClick={() => shift(1)}
        >
          <ChevronRight className="size-5" />
        </Button>
      </div>

      <Card>
        <CardContent>
          {data ? (
            <DaySummary totals={data.totals} />
          ) : (
            <p className="text-muted-foreground text-sm">Loading…</p>
          )}
        </CardContent>
      </Card>

      {isPending ? (
        <p className="text-muted-foreground text-sm">Loading…</p>
      ) : !data || data.entries.length === 0 ? (
        <p className="text-muted-foreground text-center text-sm">
          Nothing logged. Tap Add to log a food or recipe.
        </p>
      ) : (
        <ul className="divide-y">
          {data.entries.map((entry) => (
            <DiaryEntryRow key={entry.id} entry={entry} />
          ))}
        </ul>
      )}

      <AddEntrySheet loggedDate={date} />
    </div>
  );
}
