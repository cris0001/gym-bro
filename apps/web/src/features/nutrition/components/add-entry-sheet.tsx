import { format, parseISO } from 'date-fns';
import { Barcode, ChevronLeft, Plus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';

import { useMediaQuery } from '@/hooks/use-media-query';

import { sumMacros } from '@gym-bro/shared';
import type { CreateFoodLogInput } from '@gym-bro/shared';

import { useCreateFoodLogEntry } from '../hooks/use-create-food-log-entry';
import { useDailyFoodLog } from '../hooks/use-daily-food-log';
import { useFoods } from '../hooks/use-foods';
import { useRecentDiaryItems } from '../hooks/use-recent-diary-items';
import { useRecipes } from '../hooks/use-recipes';
import { useScanFlow } from '../hooks/use-scan-flow';
import { useDiaryUiStore } from '../stores/diary-ui.store';
import { useFoodUiStore } from '../stores/food-ui.store';
import {
  type AddEntryRow,
  buildAddEntryList,
  defaultPortion,
  type Portion,
} from '../utils/add-entry-list';
import { AddEntryResultRow } from './add-entry-result-row';
import { AddPortionSheet } from './add-portion-sheet';
import { BarcodeScanner } from './barcode-scanner';
import { DiaryEntryRow } from './diary-entry-row';
import { FoodSheet } from './food-sheet';

// Fullscreen "Add to {meal}" view: one inline list of your foods + recipes under a
// search box (recently-used first, badged), each logged with one tap on "+" or a chosen
// portion by tapping the row. Added items and the running meal total show below; "Done"
// returns to the diary. Replaces the old combobox sheet; keeps every mutation/scan hook.
export function AddEntrySheet({ loggedDate }: { loggedDate: string }) {
  const addMeal = useDiaryUiStore((s) => s.addMeal);
  const closeAdd = useDiaryUiStore((s) => s.closeAdd);
  const openScanned = useFoodUiStore((s) => s.openScanned);

  const [query, setQuery] = useState('');
  const [portionRow, setPortionRow] = useState<AddEntryRow | null>(null);
  const [scanning, setScanning] = useState(false);
  // Scanning needs a camera — a touch device. Hide it on desktop (fine pointer).
  const canScan = useMediaQuery('(pointer: coarse)');

  const create = useCreateFoodLogEntry();
  const { data: foods = [] } = useFoods('');
  const { data: recipes = [] } = useRecipes();
  const { data: recent = [] } = useRecentDiaryItems(addMeal);
  const { data: dayLog } = useDailyFoodLog(loggedDate);
  // Newest first: the day read is oldest→newest, so reverse for the "Added" list so a
  // just-logged item shows at the top. Order doesn't affect the total.
  const mealEntries = (dayLog?.entries.filter((entry) => entry.meal === addMeal) ?? [])
    .slice()
    .reverse();
  const mealTotal = Math.round(sumMacros(mealEntries).kcal);

  const rows = useMemo(
    () => buildAddEntryList(foods, recipes, recent, query),
    [foods, recipes, recent, query],
  );

  // Log a source at a portion (one-tap default, or the portion editor's choice).
  function logPortion(row: AddEntryRow, portion: Portion) {
    if (addMeal === null) return;
    const base = { quantity: portion.quantity, unit: portion.unit, meal: addMeal, loggedDate };
    const input: CreateFoodLogInput =
      row.kind === 'food'
        ? { type: 'food', foodId: row.id, ...base }
        : { type: 'recipe', recipeId: row.id, ...base };
    create.mutate(input);
  }

  // Scanning logs the product straight to this meal (added to your foods first if new).
  const { handleEan } = useScanFlow((food) => {
    if (addMeal === null) return;
    const hasServing = food.servingGrams !== null;
    create.mutate({
      type: 'food',
      foodId: food.id,
      quantity: hasServing ? 1 : 100,
      unit: hasServing ? 'servings' : 'grams',
      meal: addMeal,
      loggedDate,
    });
  });

  // "Create a new food": open the food form seeded with the typed name; on save, log the
  // new product to this meal at its default portion.
  function createNewFood() {
    openScanned(
      {
        ean: '',
        name: query.trim(),
        brand: null,
        kcal: null,
        proteinG: null,
        carbsG: null,
        fatG: null,
        servingGrams: null,
        unitGrams: null,
        imageUrl: null,
      },
      (food) => {
        if (addMeal === null) return;
        const hasServing = food.servingGrams !== null;
        create.mutate({
          type: 'food',
          foodId: food.id,
          quantity: hasServing ? 1 : 100,
          unit: hasServing ? 'servings' : 'grams',
          meal: addMeal,
          loggedDate,
        });
      },
    );
  }

  if (addMeal === null) return null;
  const mealLabel = addMeal.replace('_', ' ');

  return (
    <>
      <div className="fixed inset-0 z-50 flex flex-col bg-[#faf5ee]">
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto flex w-full max-w-md flex-col gap-4 p-4">
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={closeAdd}
                className="-ml-1 flex items-center text-[13px] font-semibold text-[#8d8072]"
              >
                <ChevronLeft className="size-4" />
                Diary
              </button>
              <span className="font-heading text-sm text-[#8d8072] italic">
                {format(parseISO(loggedDate), 'EEEE, MMMM d')}
              </span>
            </div>

            <h1 className="font-heading text-[26px] font-semibold">
              Add to <span className="capitalize">{mealLabel}</span>
            </h1>

            <div className="flex gap-2">
              <div className="relative min-w-0 flex-1">
                <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[#8d8072]" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search a product or recipe…"
                  className="h-[46px] w-full rounded-xl border border-[#eadfd0] bg-[#fffcf7] pr-3 pl-10 text-sm placeholder:text-[#8d8072] focus:outline-none"
                />
              </div>
              {canScan ? (
                <button
                  type="button"
                  aria-label="Scan a barcode"
                  onClick={() => setScanning(true)}
                  className="flex size-[46px] shrink-0 items-center justify-center rounded-xl border border-[#eadfd0] bg-[#fffcf7] text-[#c25a3a]"
                >
                  <Barcode className="size-5" />
                </button>
              ) : null}
            </div>

            <div className="overflow-hidden rounded-[18px] border border-[#eadfd0] bg-[#fffcf7]">
              {/* Capped height with its own scroll so the "Added" list and the total bar
                  stay in view without scrolling past the whole dictionary. */}
              <div className="max-h-[42vh] overflow-y-auto">
                {rows.map((row, i) => (
                  <div
                    key={`${row.kind}-${row.id}`}
                    className={i > 0 ? 'border-t border-dashed border-[#e5d9c6]' : ''}
                  >
                    <AddEntryResultRow
                      row={row}
                      disabled={create.isPending}
                      onAdd={() => logPortion(row, defaultPortion(row))}
                      onEditPortion={() => setPortionRow(row)}
                    />
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={createNewFood}
                className="flex w-full items-center justify-center gap-1.5 border-t border-dashed border-[#e5d9c6] py-3.5 text-[12.5px] font-bold text-[#c25a3a]"
              >
                <Plus className="size-4" />
                Create a new food
              </button>
            </div>

            {mealEntries.length > 0 ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-[11px] font-semibold tracking-wide text-[#8d8072] uppercase">
                    Added to {mealLabel}
                  </span>
                  <span className="font-heading text-lg font-semibold">
                    {mealTotal.toLocaleString('en-US')}
                    <span className="ml-0.5 text-[11px] font-normal text-[#8d8072]">kcal</span>
                  </span>
                </div>
                <ul className="flex flex-col divide-y divide-dashed divide-[#e5d9c6] rounded-[18px] border border-[#eadfd0] bg-[#fffcf7] px-4">
                  {mealEntries.map((entry) => (
                    <DiaryEntryRow key={entry.id} entry={entry} showImage mutedDelete />
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>

        <div className="sticky bottom-0 flex items-center gap-3 border-t border-[#eadfd0] bg-[rgba(250,245,238,0.95)] px-4 py-3 backdrop-blur">
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold tracking-wide text-[#8d8072] uppercase">
              {mealLabel} total
            </span>
            <span className="font-heading text-[17px] font-semibold">
              {mealTotal.toLocaleString('en-US')}
              <span className="ml-0.5 text-[11px] font-normal text-[#8d8072]">kcal</span>
            </span>
          </div>
          <button
            type="button"
            onClick={closeAdd}
            className="h-[46px] flex-1 rounded-full bg-[#c25a3a] text-sm font-semibold text-white"
          >
            Done
          </button>
        </div>
      </div>

      <AddPortionSheet
        row={portionRow}
        onClose={() => setPortionRow(null)}
        onAdd={(portion) => {
          if (portionRow) logPortion(portionRow, portion);
          setPortionRow(null);
        }}
      />

      {canScan ? (
        <BarcodeScanner
          open={scanning}
          onClose={() => setScanning(false)}
          onDetected={(ean) => {
            setScanning(false);
            void handleEan(ean);
          }}
        />
      ) : null}
      <FoodSheet />
    </>
  );
}
