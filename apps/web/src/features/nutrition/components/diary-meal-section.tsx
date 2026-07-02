import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { sumMacros } from '@gym-bro/shared';
import type { CreateFoodLogInput, FoodLogEntry, MealType, RecentDiaryItem } from '@gym-bro/shared';

import { useCreateFoodLogEntry } from '../hooks/use-create-food-log-entry';
import { useDiaryUiStore } from '../stores/diary-ui.store';
import { DiaryEntryRow } from './diary-entry-row';
import { RecentItemsRow } from './recent-items-row';

interface MealSectionProps {
  meal: MealType;
  label: string;
  entries: FoodLogEntry[];
  loggedDate: string;
}

// One meal's section of the diary: a header with the meal's kcal subtotal and an
// add button (presets this meal), a row of recent items that log in one tap with
// their last-used portion, then its entries.
export function MealSection({ meal, label, entries, loggedDate }: MealSectionProps) {
  const openAdd = useDiaryUiStore((s) => s.openAdd);
  const create = useCreateFoodLogEntry();
  const kcal = Math.round(sumMacros(entries).kcal);

  // One-tap re-add: log the recent item with the portion it was last logged at.
  function addRecent(item: RecentDiaryItem) {
    const input: CreateFoodLogInput =
      item.type === 'food'
        ? {
            type: 'food',
            foodId: item.id,
            quantity: item.quantity,
            unit: item.unit,
            meal,
            loggedDate,
          }
        : {
            type: 'recipe',
            recipeId: item.id,
            quantity: item.quantity,
            unit: item.unit,
            meal,
            loggedDate,
          };
    create.mutate(input);
  }

  return (
    <div className="bg-card flex flex-col rounded-xl border p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold">{label}</h2>
          <span className="rounded-full bg-sky-500/10 px-2 py-0.5 text-xs font-medium text-sky-600">
            {kcal} kcal
          </span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-primary hover:bg-primary/10 size-9"
          aria-label={`Add to ${label}`}
          onClick={() => openAdd(meal)}
        >
          <Plus className="size-5" />
        </Button>
      </div>
      <RecentItemsRow meal={meal} onPick={addRecent} disabled={create.isPending} />
      {entries.length === 0 ? (
        <p className="text-muted-foreground py-2 text-sm">Nothing logged.</p>
      ) : (
        <ul className="divide-y">
          {entries.map((entry) => (
            <DiaryEntryRow key={entry.id} entry={entry} />
          ))}
        </ul>
      )}
    </div>
  );
}
