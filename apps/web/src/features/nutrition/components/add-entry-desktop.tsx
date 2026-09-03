import { format, parseISO } from 'date-fns';
import { Barcode, ChevronLeft, Plus, Search } from 'lucide-react';
import { useEffect, useRef } from 'react';

import { cn } from '@/lib/utils';

import type { MealType } from '@gym-bro/shared';

import { useAddEntry } from '../hooks/use-add-entry';
import { useDiaryUiStore } from '../stores/diary-ui.store';
import { defaultPortion } from '../utils/add-entry-list';
import { MACRO_BAR, type MacroKey } from '../utils/macro-colors';
import { AddEntryOverlays } from './add-entry-overlays';
import { AddEntryResultRow } from './add-entry-result-row';
import { DiaryEntryRow } from './diary-entry-row';

const fmt = (n: number): string => Math.round(n).toLocaleString('en-US');

const microLabel = 'text-muted-foreground text-[11px] font-semibold tracking-[0.08em] uppercase';
const dashed = 'border-dashed border-[#e4dad2] dark:border-[#40353c]';

// Desktop "Add to {meal}" view: a two-pane page inside the app layout (sidebar stays).
// Left: search (+ ⌘K, + barcode) over the results list. Right (sticky): the items added
// to this meal, and the whole day's totals vs target after those adds. Same hooks/
// mutations as mobile — only the layout differs.
export function AddEntryDesktop({ loggedDate, meal }: { loggedDate: string; meal: MealType }) {
  const closeAdd = useDiaryUiStore((s) => s.closeAdd);
  const state = useAddEntry(loggedDate);
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
    dayTotals,
    target,
    logPortion,
    createNewFood,
  } = state;

  const searchRef = useRef<HTMLInputElement>(null);

  // ⌘K / Ctrl+K focuses the search box (the badge inside the input advertises it).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const mealLabel = meal.replace('_', ' ');
  const left = target ? Math.round(target.kcal - dayTotals.kcal) : 0;

  return (
    <>
      <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-[18px] px-6 py-6 md:px-8">
        <header className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={closeAdd}
              className="text-muted-foreground -ml-0.5 flex w-fit items-center gap-1 text-[12.5px] font-medium"
            >
              <ChevronLeft className="size-3.5" />
              Diary · {format(parseISO(loggedDate), 'EEEE, MMMM d')}
            </button>
            <h1 className="font-heading text-[30px] leading-tight font-semibold">
              Add to <span className="capitalize">{mealLabel}</span>
            </h1>
          </div>
          <button
            type="button"
            onClick={closeAdd}
            className="bg-primary text-primary-foreground h-[42px] shrink-0 rounded-full px-6 text-[13.5px] font-semibold"
          >
            Done
          </button>
        </header>

        <div className="grid items-start gap-5 md:grid-cols-[1fr_340px]">
          {/* LEFT — search + results */}
          <div className="flex flex-col gap-[18px]">
            <div className="flex gap-2">
              <div className="relative min-w-0 flex-1">
                <Search className="text-muted-foreground absolute top-1/2 left-3.5 size-4 -translate-y-1/2" />
                <input
                  ref={searchRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search a product or recipe…"
                  className="border-border bg-card placeholder:text-muted-foreground h-[46px] w-full rounded-xl border pr-14 pl-10 text-sm focus:outline-none"
                />
                <kbd className="border-border text-muted-foreground pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 rounded-md border px-1.5 py-0.5 text-[11px] font-medium">
                  ⌘K
                </kbd>
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

            <div className="border-border bg-card overflow-hidden rounded-2xl border">
              <div className={cn('flex items-center justify-between border-b px-4 py-3', dashed)}>
                <span className={microLabel}>All foods &amp; recipes</span>
                <span className="text-muted-foreground text-[11px]">recent first</span>
              </div>
              {rows.map((row, i) => (
                <div key={`${row.kind}-${row.id}`} className={i > 0 ? cn('border-t', dashed) : ''}>
                  <AddEntryResultRow
                    row={row}
                    disabled={isAdding}
                    badgeTint
                    onAdd={() => logPortion(row, defaultPortion(row))}
                    onEditPortion={() => setPortionRow(row)}
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={createNewFood}
                className={cn(
                  'text-primary flex w-full items-center justify-center gap-1.5 border-t py-3.5 text-[12.5px] font-bold',
                  dashed,
                )}
              >
                <Plus className="size-4" />
                Create a new food
              </button>
            </div>
          </div>

          {/* RIGHT — added items + day projection (sticky) */}
          <div className="sticky top-5 flex flex-col gap-[18px]">
            <div className="border-border bg-card rounded-2xl border p-4">
              <div className="flex items-baseline justify-between">
                <span className={microLabel}>Added to {mealLabel}</span>
                <span className="font-heading text-[17px] font-semibold">
                  {fmt(mealTotal)}
                  <span className="text-muted-foreground ml-0.5 text-[11px] font-normal">kcal</span>
                </span>
              </div>
              {mealEntries.length > 0 ? (
                <>
                  <ul className={cn('mt-2 flex flex-col divide-y divide-dashed', dashed)}>
                    {mealEntries.map((entry) => (
                      <DiaryEntryRow key={entry.id} entry={entry} showImage mutedDelete />
                    ))}
                  </ul>
                  <p className="font-heading text-muted-foreground mt-3 text-[12px] italic">
                    tap a row to edit the portion
                  </p>
                </>
              ) : (
                <p className="text-muted-foreground mt-3 text-[12.5px]">Nothing added yet.</p>
              )}
            </div>

            <div className="border-border bg-card rounded-2xl border p-4">
              <span className={microLabel}>Day after adding</span>
              {target ? (
                <>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="font-heading text-[20px] font-semibold">
                      {fmt(dayTotals.kcal)}
                      <span className="text-muted-foreground text-[13px] font-normal">
                        {' '}
                        / {fmt(target.kcal)} kcal
                      </span>
                    </span>
                    <span className="bg-accent text-accent-foreground shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold">
                      {left >= 0 ? `${fmt(left)} left` : `${fmt(-left)} over`}
                    </span>
                  </div>
                  <div className="mt-4 flex flex-col gap-3">
                    <DayMacroBar
                      label="Protein"
                      macro="protein"
                      current={dayTotals.proteinG}
                      target={target.proteinG}
                    />
                    <DayMacroBar
                      label="Carbs"
                      macro="carbs"
                      current={dayTotals.carbsG}
                      target={target.carbsG}
                    />
                    <DayMacroBar
                      label="Fat"
                      macro="fat"
                      current={dayTotals.fatG}
                      target={target.fatG}
                    />
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground mt-2 text-[12.5px]">
                  {fmt(dayTotals.kcal)} kcal today · set a daily target to see progress.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <AddEntryOverlays state={state} />
    </>
  );
}

// One compact macro bar for the "Day after adding" panel: label + eaten/target, and a
// thin track filled in the macro's hue (red once over target).
function DayMacroBar({
  label,
  macro,
  current,
  target,
}: {
  label: string;
  macro: MacroKey;
  current: number;
  target: number;
}) {
  const pct = target > 0 ? Math.min(100, (current / target) * 100) : 0;
  const over = current > target;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between">
        <span className="text-muted-foreground text-[10px] font-bold tracking-wide uppercase">
          {label}
        </span>
        <span className="font-heading text-[13px] font-semibold">
          {Math.round(current)}
          <span className="text-muted-foreground text-[11px] font-normal">
            /{Math.round(target)} g
          </span>
        </span>
      </div>
      <div className="h-[5px] overflow-hidden rounded-[3px] bg-[#efe8e2] dark:bg-[#3a2f36]">
        <div
          className={cn('h-full rounded-[3px]', over ? 'bg-destructive' : MACRO_BAR[macro])}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
