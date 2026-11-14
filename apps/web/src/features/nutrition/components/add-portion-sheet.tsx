import { Apple, Loader2, Pencil } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

import type { FoodLogUnit } from '@gym-bro/shared';

import { useNutritionTranslation } from '../i18n';
import { type AddEntryRow, defaultPortion, type Portion } from '../utils/add-entry-list';
import { PortionPicker, type PortionChoice } from './portion-picker';

// Portion editor opened by tapping a result row: the item's photo and name, the shared
// PortionPicker seeded to its default portion, and an "Add" button that logs the chosen
// portion. Kept separate from the one-tap "+" so a considered portion and a quick add
// share one list. Foods (and catalog products) also get "Edit product", which opens the
// food form on your own copy.
export function AddPortionSheet({
  row,
  onAdd,
  onClose,
  onEdit,
  isPreparingEdit = false,
}: {
  // The item to portion, or null when the sheet is closed.
  row: AddEntryRow | null;
  onAdd: (portion: Portion) => void;
  onClose: () => void;
  onEdit?: (row: AddEntryRow) => void;
  // A catalog product is being copied into your foods before its form opens.
  isPreparingEdit?: boolean;
}) {
  const t = useNutritionTranslation();
  const [choice, setChoice] = useState<PortionChoice | null>(null);

  // A catalog product portions exactly like a food (per-100g macros + serving/unit).
  const food = row?.kind === 'food' ? row.food : row?.kind === 'catalog' ? row.product : undefined;
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
        <SheetHeader className="flex-row items-center gap-3 pr-14">
          {row?.imageUrl ? (
            <img
              src={row.imageUrl}
              alt=""
              className="border-border size-12 shrink-0 rounded-lg border object-cover"
            />
          ) : (
            <span className="bg-muted text-muted-foreground flex size-12 shrink-0 items-center justify-center rounded-lg">
              <Apple className="size-5" />
            </span>
          )}
          <SheetTitle className="min-w-0 flex-1 truncate">
            {row?.name ?? t.portion.portion}
          </SheetTitle>
          {row && row.kind !== 'recipe' && onEdit ? (
            <button
              type="button"
              disabled={isPreparingEdit}
              onClick={() => onEdit(row)}
              className="border-border bg-card text-primary hover:bg-muted inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3.5 text-[13px] font-semibold transition-colors disabled:opacity-60"
            >
              {isPreparingEdit ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Pencil className="size-3.5" />
              )}
              {t.addEntry.editProduct}
            </button>
          ) : null}
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
              className="bg-primary text-primary-foreground hover:bg-primary-hover h-10 w-full rounded-full"
              disabled={choice === null}
              onClick={() => choice && onAdd(choice)}
            >
              {t.common.add}
            </Button>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
