import { format, parseISO } from 'date-fns';
import { Barcode, ChevronLeft, Plus, Search } from 'lucide-react';

import type { MealType } from '@gym-bro/shared';

import type { UseAddEntry } from '../hooks/use-add-entry';
import { useDiaryUiStore } from '../stores/diary-ui.store';
import { defaultPortion } from '../utils/add-entry-list';
import { AddEntryResultRow } from './add-entry-result-row';
import { DiaryEntryRow } from './diary-entry-row';

// Mobile "Add to {meal}" view: a fullscreen takeover with an inline results list under a
// search box, added items + running meal total below, and a sticky "Done" bar. One tap
// on "+" logs the default portion; tapping a row opens the portion editor. Unchanged
// from the original single-file version — only its state now comes from useAddEntry.
export function AddEntryMobile({
  loggedDate,
  meal,
  state,
}: {
  loggedDate: string;
  meal: MealType;
  state: UseAddEntry;
}) {
  const closeAdd = useDiaryUiStore((s) => s.closeAdd);
  const {
    query,
    setQuery,
    rows,
    isAdding,
    canScan,
    setScanning,
    setPortionRow,
    mealEntries,
    mealTotal,
    logPortion,
    createNewFood,
  } = state;

  const mealLabel = meal.replace('_', ' ');

  return (
    <div className="bg-background fixed inset-0 z-50 flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-md flex-col gap-4 p-4">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={closeAdd}
              className="text-muted-foreground -ml-1 flex items-center text-[13px] font-semibold"
            >
              <ChevronLeft className="size-4" />
              Diary
            </button>
            <span className="font-heading text-muted-foreground text-sm italic">
              {format(parseISO(loggedDate), 'EEEE, MMMM d')}
            </span>
          </div>

          <h1 className="font-heading text-[26px] font-semibold">
            Add to <span className="capitalize">{mealLabel}</span>
          </h1>

          <div className="flex gap-2">
            <div className="relative min-w-0 flex-1">
              <Search className="text-muted-foreground absolute top-1/2 left-3.5 size-4 -translate-y-1/2" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search a product or recipe…"
                className="border-border bg-card placeholder:text-muted-foreground h-[46px] w-full rounded-xl border pr-3 pl-10 text-sm focus:outline-none"
              />
            </div>
            {canScan ? (
              <button
                type="button"
                aria-label="Scan a barcode"
                onClick={() => setScanning(true)}
                className="border-border bg-card text-primary flex size-[46px] shrink-0 items-center justify-center rounded-xl border"
              >
                <Barcode className="size-5" />
              </button>
            ) : null}
          </div>

          <div className="border-border bg-card overflow-hidden rounded-[18px] border">
            {/* Capped height with its own scroll so the "Added" list and the total bar
                stay in view without scrolling past the whole dictionary. */}
            <div className="max-h-[42vh] overflow-y-auto">
              {rows.map((row, i) => (
                <div
                  key={`${row.kind}-${row.id}`}
                  className={
                    i > 0 ? 'border-t border-dashed border-[#d6c8bd] dark:border-[#40353c]' : ''
                  }
                >
                  <AddEntryResultRow
                    row={row}
                    disabled={isAdding}
                    onAdd={() => logPortion(row, defaultPortion(row))}
                    onEditPortion={() => setPortionRow(row)}
                  />
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={createNewFood}
              className="text-primary flex w-full items-center justify-center gap-1.5 border-t border-dashed border-[#d6c8bd] py-3.5 text-[12.5px] font-bold dark:border-[#40353c]"
            >
              <Plus className="size-4" />
              Create a new food
            </button>
          </div>

          {mealEntries.length > 0 ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-baseline justify-between">
                <span className="text-muted-foreground text-[11px] font-semibold tracking-wide uppercase">
                  Added to {mealLabel}
                </span>
                <span className="font-heading text-lg font-semibold">
                  {mealTotal.toLocaleString('en-US')}
                  <span className="text-muted-foreground ml-0.5 text-[11px] font-normal">kcal</span>
                </span>
              </div>
              <ul className="border-border bg-card flex flex-col divide-y divide-dashed divide-[#d6c8bd] rounded-[18px] border px-4 dark:divide-[#40353c]">
                {mealEntries.map((entry) => (
                  <DiaryEntryRow key={entry.id} entry={entry} showImage mutedDelete />
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>

      <div className="bg-background/95 border-border sticky bottom-0 flex items-center gap-3 border-t px-4 py-3 backdrop-blur">
        <div className="flex flex-col">
          <span className="text-muted-foreground text-[11px] font-semibold tracking-wide uppercase">
            {mealLabel} total
          </span>
          <span className="font-heading text-[17px] font-semibold">
            {mealTotal.toLocaleString('en-US')}
            <span className="text-muted-foreground ml-0.5 text-[11px] font-normal">kcal</span>
          </span>
        </div>
        <button
          type="button"
          onClick={closeAdd}
          className="bg-primary text-primary-foreground h-[46px] flex-1 rounded-full text-sm font-semibold"
        >
          Done
        </button>
      </div>
    </div>
  );
}
