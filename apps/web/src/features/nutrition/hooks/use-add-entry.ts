import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import { useMediaQuery } from '@/hooks/use-media-query';

import { MEAL_TYPES, sumMacros } from '@gym-bro/shared';
import type {
  CreateFoodLogInput,
  FoodLogEntry,
  MacroTotals,
  MealType,
  NutritionTarget,
  RecentDiaryItem,
} from '@gym-bro/shared';

import { getRecentDiaryItems } from '../api/food-log';
import { useFoodUiStore } from '../stores/food-ui.store';
import { useDiaryUiStore } from '../stores/diary-ui.store';
import { type AddEntryRow, buildAddEntryList, type Portion } from '../utils/add-entry-list';
import { useCreateFoodLogEntry } from './use-create-food-log-entry';
import { foodLogKeys, useDailyFoodLog } from './use-daily-food-log';
import { useFoods } from './use-foods';
import { useRecentDiaryItems } from './use-recent-diary-items';
import { useRecipes } from './use-recipes';
import { useScanFlow, type ScanOutcome } from './use-scan-flow';
import { useTargetForDate } from './use-target-for-date';

// Shared state + behaviour behind the diary "Add to meal" view, consumed by both the
// mobile fullscreen layout and the desktop two-pane layout. Keeps every mutation/scan
// hook and the recency-freeze fix; adds whole-day totals + current target so the
// desktop's "Day after adding" panel can render live progress vs the goal.
export interface UseAddEntry {
  addMeal: MealType | null;
  query: string;
  setQuery: (value: string) => void;
  rows: AddEntryRow[];
  isAdding: boolean;
  canScan: boolean;
  scanning: boolean;
  setScanning: (value: boolean) => void;
  portionRow: AddEntryRow | null;
  setPortionRow: (row: AddEntryRow | null) => void;
  mealEntries: FoodLogEntry[];
  mealTotal: number;
  dayTotals: MacroTotals;
  target: NutritionTarget | null;
  logPortion: (row: AddEntryRow, portion: Portion) => void;
  createNewFood: () => void;
  handleEan: (ean: string) => Promise<ScanOutcome>;
}

export function useAddEntry(loggedDate: string): UseAddEntry {
  const addMeal = useDiaryUiStore((s) => s.addMeal);
  const openScanned = useFoodUiStore((s) => s.openScanned);

  const [query, setQuery] = useState('');
  // This hook outlives the add view (its host stays mounted while closed), so reset the
  // search whenever the view closes or switches meal — reopening starts with an empty
  // box. Adjusted during render rather than in an effect to avoid a stale-query flash.
  const [queryMeal, setQueryMeal] = useState(addMeal);
  if (queryMeal !== addMeal) {
    setQueryMeal(addMeal);
    setQuery('');
  }
  const [portionRow, setPortionRow] = useState<AddEntryRow | null>(null);
  const [scanning, setScanning] = useState(false);
  // Scanning needs a camera — a touch device. Hide it on desktop (fine pointer).
  const canScan = useMediaQuery('(pointer: coarse)');

  const create = useCreateFoodLogEntry();
  const { data: foods = [] } = useFoods('');
  const { data: recipes = [] } = useRecipes();
  const recentQuery = useRecentDiaryItems(addMeal);
  const { data: dayLog } = useDailyFoodLog(loggedDate);
  const target = useTargetForDate(loggedDate);

  // Freeze the recency ORDER for the lifetime of this meal's add view, so logging an
  // item (which invalidates the recent query and re-sorts it to the top) or a background
  // refetch never shifts the list under your finger — a second quick tap would then
  // re-add the wrong item. The snapshot is taken from whatever is cached, even if it's
  // stale: waiting for a fresh refetch meant the list first rendered without the recent
  // rows and then jumped when they arrived. Instead the cache is kept warm off-screen —
  // every meal is prefetched when the diary mounts, and the closed meal is refetched in
  // the background on Done — so the cached order is already current when you reopen.
  const queryClient = useQueryClient();
  const [frozenRecent, setFrozenRecent] = useState<{
    meal: MealType;
    items: RecentDiaryItem[];
  } | null>(null);

  useEffect(() => {
    for (const meal of MEAL_TYPES) {
      void queryClient.prefetchQuery({
        queryKey: foodLogKeys.recent(meal),
        queryFn: () => getRecentDiaryItems(meal),
      });
    }
  }, [queryClient]);

  useEffect(() => {
    if (addMeal === null) {
      if (frozenRecent !== null) {
        setFrozenRecent(null);
        void queryClient.refetchQueries({
          queryKey: foodLogKeys.recent(frozenRecent.meal),
          type: 'all',
        });
      }
      return;
    }
    if (frozenRecent?.meal === addMeal) return;
    // Never hold the list hostage to the recents request: if it failed, or is paused
    // because the phone is offline, show the plain dictionary without recent rows
    // rather than an empty list you can't add from.
    const unavailable = recentQuery.isError || recentQuery.fetchStatus === 'paused';
    if (recentQuery.data !== undefined || unavailable) {
      setFrozenRecent({ meal: addMeal, items: recentQuery.data ?? [] });
    }
  }, [
    addMeal,
    frozenRecent,
    recentQuery.data,
    recentQuery.isError,
    recentQuery.fetchStatus,
    queryClient,
  ]);

  // Until this meal's snapshot exists (first-ever open, nothing cached yet) the browse
  // list stays empty rather than rendering without the recent rows and reshuffling.
  const recentReady = frozenRecent?.meal === addMeal;
  const recent = recentReady ? frozenRecent.items : [];

  // Newest first: the day read is oldest→newest, so reverse the meal's entries so a
  // just-logged item shows at the top. Order doesn't affect the total.
  const mealEntries = (dayLog?.entries.filter((entry) => entry.meal === addMeal) ?? [])
    .slice()
    .reverse();
  const mealTotal = Math.round(sumMacros(mealEntries).kcal);

  // Whole-day totals across every meal. Each "+" saves immediately and refetches the
  // day, so this sum already reflects what was just added — no optimistic math needed.
  const dayTotals = sumMacros(dayLog?.entries ?? []);

  const rows = useMemo(
    () => (recentReady || query.trim() ? buildAddEntryList(foods, recipes, recent, query) : []),
    [foods, recipes, recent, query, recentReady],
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

  return {
    addMeal,
    query,
    setQuery,
    rows,
    isAdding: create.isPending,
    canScan,
    scanning,
    setScanning,
    portionRow,
    setPortionRow,
    mealEntries,
    mealTotal,
    dayTotals,
    target,
    logPortion,
    createNewFood,
    handleEan,
  };
}
