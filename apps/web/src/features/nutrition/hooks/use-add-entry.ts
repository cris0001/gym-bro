import { useEffect, useMemo, useState } from 'react';

import { useMediaQuery } from '@/hooks/use-media-query';

import { sumMacros } from '@gym-bro/shared';
import type {
  CreateFoodLogInput,
  FoodLogEntry,
  MacroTotals,
  MealType,
  NutritionTarget,
  RecentDiaryItem,
} from '@gym-bro/shared';

import { useFoodUiStore } from '../stores/food-ui.store';
import { useDiaryUiStore } from '../stores/diary-ui.store';
import { type AddEntryRow, buildAddEntryList, type Portion } from '../utils/add-entry-list';
import { useCreateFoodLogEntry } from './use-create-food-log-entry';
import { useDailyFoodLog } from './use-daily-food-log';
import { useFoods } from './use-foods';
import { useRecentDiaryItems } from './use-recent-diary-items';
import { useRecipes } from './use-recipes';
import { useScanFlow } from './use-scan-flow';
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
  handleEan: (ean: string) => Promise<void>;
}

export function useAddEntry(loggedDate: string): UseAddEntry {
  const addMeal = useDiaryUiStore((s) => s.addMeal);
  const openScanned = useFoodUiStore((s) => s.openScanned);

  const [query, setQuery] = useState('');
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

  // Freeze the recency ORDER for the lifetime of this meal's add view. Two bugs this
  // fixes: (1) logging an item invalidates the recent query, which re-sorted it to the
  // top and shifted the list under your finger — a second quick tap then re-added the
  // same item; (2) reopening a meal briefly showed a stale cached order before the
  // refetch settled. We snapshot only FRESH (non-stale) recent data, once per meal open,
  // and render from that snapshot, so adds and background refetches no longer reorder.
  const [frozenRecent, setFrozenRecent] = useState<{
    meal: MealType;
    items: RecentDiaryItem[];
  } | null>(null);

  useEffect(() => {
    if (addMeal === null) {
      if (frozenRecent !== null) setFrozenRecent(null);
      return;
    }
    if (frozenRecent?.meal === addMeal) return;
    if (recentQuery.data !== undefined && !recentQuery.isStale) {
      setFrozenRecent({ meal: addMeal, items: recentQuery.data });
    }
  }, [addMeal, frozenRecent, recentQuery.data, recentQuery.isStale]);

  const recent = frozenRecent?.meal === addMeal ? frozenRecent.items : [];

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
