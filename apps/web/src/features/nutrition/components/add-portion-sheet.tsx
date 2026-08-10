import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

import type { FoodLogUnit } from '@gym-bro/shared';

import { type AddEntryRow, defaultPortion, type Portion } from '../utils/add-entry-list';
import { PortionPicker, type PortionChoice } from './portion-picker';

// Portion editor opened by tapping a result row: the shared PortionPicker seeded to the
// item's default portion, with an "Add" button that logs the chosen portion. Kept
// separate from the one-tap "+" so a considered portion and a quick add share one list.
export function AddPortionSheet({
  row,
  onAdd,
  onClose,
}: {
  // The item to portion, or null when the sheet is closed.
  row: AddEntryRow | null;
  onAdd: (portion: Portion) => void;
  onClose: () => void;
}) {
  const [choice, setChoice] = useState<PortionChoice | null>(null);

  const food = row?.kind === 'food' ? row.food : undefined;
  const recipe = row?.kind === 'recipe' ? row.recipe : undefined;

  const hasServings = food ? food.servingGrams !== null : recipe !== undefined;
  const hasUnits = food ? food.unitGrams !== null : false;
  const gramsPerServing = food
    ? (food.servingGrams ?? undefined)
    : recipe && recipe.servings > 0
      ? recipe.totalGrams / recipe.servings
      : undefined;
  const gramsPerUnit = food?.unitGrams ?? undefined;

  function kcalFor(unit: FoodLogUnit, qty: number): number | null {
    if (food) {
      if (unit === 'servings')
        return food.servingGrams !== null ? (food.kcal * qty * food.servingGrams) / 100 : null;
      if (unit === 'units')
        return food.unitGrams !== null ? (food.kcal * qty * food.unitGrams) / 100 : null;
      return (food.kcal * qty) / 100;
    }
    if (recipe) {
      if (unit === 'servings') return recipe.perServing.kcal * qty;
      const totalKcal = recipe.perServing.kcal * recipe.servings;
      return recipe.totalGrams > 0 ? (totalKcal / recipe.totalGrams) * qty : null;
    }
    return null;
  }

  return (
    <Sheet open={row !== null} onOpenChange={(next) => !next && onClose()}>
      <SheetContent side="bottom" className="gap-0">
        <SheetHeader>
          <SheetTitle className="truncate">{row?.name ?? 'Portion'}</SheetTitle>
        </SheetHeader>
        {row !== null ? (
          <div className="flex flex-col gap-3 p-4">
            <PortionPicker
              key={row.id}
              hasServings={hasServings}
              hasUnits={hasUnits}
              gramsPerServing={gramsPerServing}
              gramsPerUnit={gramsPerUnit}
              kcalFor={kcalFor}
              initial={defaultPortion(row)}
              onChange={setChoice}
            />
            <Button
              type="button"
              className="h-11 w-full rounded-full bg-[#c25a3a] text-white hover:bg-[#c25a3a]/90"
              disabled={choice === null}
              onClick={() => choice && onAdd(choice)}
            >
              Add
            </Button>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
