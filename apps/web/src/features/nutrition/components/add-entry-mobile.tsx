import { parseISO } from 'date-fns';
import { Barcode, Plus, Search } from 'lucide-react';

import type { MealType } from '@gym-bro/shared';

import { Skeleton } from '@/components/ui/skeleton';
import { useSheetBackClose } from '@/hooks/use-sheet-back-close';
import { FIELD_CLASS } from '@/lib/form-styles';
import { cn } from '@/lib/utils';

import type { UseAddEntry } from '../hooks/use-add-entry';
import { usePendingFoodLogEntries } from '../hooks/use-pending-food-log-entries';
import { useNutritionTranslation } from '../i18n';
import { useDiaryUiStore } from '../stores/diary-ui.store';
import { defaultPortion } from '../utils/add-entry-list';
import { AddEntryListSkeleton } from './add-entry-list-skeleton';
import { AddEntryResultRow } from './add-entry-result-row';
import { DiaryEntryRow } from './diary-entry-row';
import { PendingFoodLogRow } from './pending-food-log-row';
import { formatDate } from '@/lib/i18n/date-format';

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
  const t = useNutritionTranslation();
  const closeAdd = useDiaryUiStore((s) => s.closeAdd);
  // Adds still queued offline / retrying, listed with the synced ones until they land.
  const pending = usePendingFoodLogEntries(loggedDate, meal);
  // Not a Sheet (a fullscreen takeover), so wire the phone Back button up by hand —
  // Back closes this view instead of navigating away from the diary.
  useSheetBackClose(true, (open) => !open && closeAdd());
  const {
    query,
    setQuery,
    rows,
    isAdding,
    isListLoading,
    isDayLoading,
    isCatalogLoading,
    canScan,
    setScanning,
    setPortionRow,
    mealEntries,
    mealTotal,
    logPortion,
    createNewFood,
  } = state;

  const mealLabel = t.meals[meal];

  return (
    <div className="bg-background fixed inset-0 z-50 flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-md flex-col gap-4 p-3 min-[400px]:p-4">
          <div className="flex flex-col gap-1">
            <p className="text-muted-foreground text-sm">
              {formatDate(parseISO(loggedDate), 'EEEE, MMMM d')}
            </p>
            <h1 className="font-heading text-[26px] font-bold tracking-tight">
              {t.addEntry.addTo(mealLabel)}
            </h1>
          </div>

          <div className="flex gap-2">
            <div className="relative min-w-0 flex-1">
              <Search className="text-muted-foreground absolute top-1/2 left-3.5 size-4 -translate-y-1/2" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.addEntry.searchPlaceholder}
                className={cn(
                  FIELD_CLASS,
                  'w-full border pr-3 pl-10 placeholder:text-muted-foreground',
                )}
              />
            </div>
            {canScan ? (
              <button
                type="button"
                aria-label={t.barcode.scanAria}
                onClick={() => setScanning(true)}
                className="border-border bg-field text-primary hover:bg-muted flex size-9 shrink-0 items-center justify-center rounded-md border transition-colors"
              >
                <Barcode className="size-5" />
              </button>
            ) : null}
          </div>

          <div className="border-border bg-card overflow-hidden rounded-xl border">
            {/* Own scroll with a capped height: while the meal is empty the list fills the
                screen down to the total bar (18rem ≈ title + search + create button +
                bar); once something is added it shrinks to 42vh so the "Added" list
                below stays in view. */}
            <div
              className={cn(
                'overflow-y-auto',
                mealEntries.length > 0 || pending.length > 0
                  ? 'max-h-[42vh]'
                  : 'max-h-[calc(100dvh-18rem)]',
              )}
            >
              {isListLoading ? (
                <AddEntryListSkeleton dividerClassName={'border-t border-border'} />
              ) : (
                <>
                  {rows.map((row, i) => (
                    <div
                      key={`${row.kind}-${row.id}`}
                      className={i > 0 ? 'border-t border-border' : ''}
                    >
                      <AddEntryResultRow
                        row={row}
                        disabled={isAdding}
                        onAdd={() => logPortion(row, defaultPortion(row))}
                        onEditPortion={() => setPortionRow(row)}
                      />
                    </div>
                  ))}
                  {isCatalogLoading ? (
                    <AddEntryListSkeleton
                      rows={2}
                      dividedFromAbove={rows.length > 0}
                      dividerClassName={'border-t border-border'}
                    />
                  ) : null}
                </>
              )}
            </div>
            <button
              type="button"
              onClick={createNewFood}
              className="text-primary flex w-full items-center justify-center gap-1.5 border-t border-border py-3.5 text-[12.5px] font-bold"
            >
              <Plus className="size-4" />
              {t.addEntry.createFood}
            </button>
          </div>

          {mealEntries.length > 0 || pending.length > 0 ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-baseline justify-between">
                <span className="text-muted-foreground text-[11px] font-semibold tracking-wide uppercase">
                  {t.addEntry.addedTo(mealLabel)}
                </span>
                <span className="font-heading text-lg font-bold tabular-nums">
                  {mealTotal.toLocaleString('en-US')}
                  <span className="text-muted-foreground ml-0.5 text-[11px] font-normal">kcal</span>
                </span>
              </div>
              <ul className="border-border bg-card flex flex-col divide-y divide-border rounded-xl border px-4">
                {mealEntries.map((entry) => (
                  <DiaryEntryRow key={entry.id} entry={entry} />
                ))}
                {pending.map((variables) => (
                  <PendingFoodLogRow key={variables.id} variables={variables} />
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>

      <div className="bg-background/95 border-border sticky bottom-0 flex items-center gap-3 border-t px-4 py-2.5 backdrop-blur">
        <div className="flex flex-col">
          <span className="text-muted-foreground text-[11px] font-semibold tracking-wide uppercase">
            {t.addEntry.mealTotalLabel(mealLabel)}
          </span>
          {isDayLoading ? (
            <div className="flex h-[25.5px] items-center">
              <Skeleton className="h-4 w-16" />
            </div>
          ) : (
            <span className="font-heading text-[17px] font-bold tabular-nums">
              {mealTotal.toLocaleString('en-US')}
              <span className="text-muted-foreground ml-0.5 text-[11px] font-normal">kcal</span>
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={closeAdd}
          className="bg-primary text-primary-foreground h-10 flex-1 rounded-full text-sm font-semibold"
        >
          {t.common.done}
        </button>
      </div>
    </div>
  );
}
