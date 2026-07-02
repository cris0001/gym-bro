import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import type { FoodLogEntry, FoodLogUnit } from '@gym-bro/shared';

import { useFoods } from '../hooks/use-foods';
import { useRecipes } from '../hooks/use-recipes';
import { useUpdateFoodLogEntry } from '../hooks/use-update-food-log-entry';
import { PortionPicker, type PortionChoice } from './portion-picker';

function unitLabel(unit: FoodLogUnit): string {
  if (unit === 'servings') return 'serv';
  if (unit === 'units') return 'u';
  return 'g';
}

// Full edit form for a diary entry: the same portion picker used when adding
// (grams / servings / units with live calories), preselected to the entry's current
// portion. Changing the unit re-snapshots server-side from the source. If the source
// was soft-deleted it can't be recomputed, so only the quantity is editable.
export function EntryEditForm({ entry, onDone }: { entry: FoodLogEntry; onDone: () => void }) {
  const update = useUpdateFoodLogEntry();
  const { data: foods = [] } = useFoods('');
  const { data: recipes = [] } = useRecipes();

  const food = entry.foodId ? foods.find((f) => f.id === entry.foodId) : undefined;
  const recipe = entry.recipeId ? recipes.find((r) => r.id === entry.recipeId) : undefined;
  const source = food ?? recipe;

  const [choice, setChoice] = useState<PortionChoice | null>({
    unit: entry.unit,
    quantity: entry.quantity,
  });
  const [quantity, setQuantity] = useState(String(entry.quantity));

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

  function saveFull() {
    if (!choice) return;
    update.mutate(
      { id: entry.id, input: { quantity: choice.quantity, unit: choice.unit } },
      { onSuccess: onDone },
    );
  }

  function saveQuantityOnly() {
    const amount = Number(quantity);
    if (!Number.isFinite(amount) || amount <= 0) return;
    update.mutate({ id: entry.id, input: { quantity: amount } }, { onSuccess: onDone });
  }

  // Source soft-deleted / not loaded: can't recompute a unit change, so only the
  // quantity is editable, in the entry's original unit.
  if (!source) {
    return (
      <div className="mt-1 flex flex-wrap items-center gap-2">
        <Input
          inputMode="decimal"
          aria-label="Quantity"
          className="h-9 w-20"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
        <span className="text-muted-foreground text-sm">{unitLabel(entry.unit)}</span>
        <Button
          type="button"
          size="sm"
          className="h-9"
          disabled={update.isPending}
          onClick={saveQuantityOnly}
        >
          Save
        </Button>
        <Button type="button" size="sm" variant="ghost" className="h-9" onClick={onDone}>
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-2 flex flex-col gap-2">
      <PortionPicker
        hasServings={hasServings}
        hasUnits={hasUnits}
        gramsPerServing={gramsPerServing}
        gramsPerUnit={gramsPerUnit}
        kcalFor={kcalFor}
        initial={{ unit: entry.unit, quantity: entry.quantity }}
        onChange={setChoice}
      />
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          className="h-9 flex-1"
          disabled={choice === null || update.isPending}
          onClick={saveFull}
        >
          {update.isPending ? 'Saving…' : 'Save'}
        </Button>
        <Button type="button" size="sm" variant="ghost" className="h-9" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
