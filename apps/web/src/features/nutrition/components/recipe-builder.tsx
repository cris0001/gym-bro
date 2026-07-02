import { useNavigate } from '@tanstack/react-router';
import { Plus } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { divideMacros, multiplyMacros, scaleMacros, sumMacros } from '@gym-bro/shared';
import type { CreateRecipeInput, Food, MacroTotals, RecipeDetail } from '@gym-bro/shared';

import { useCreateRecipe } from '../hooks/use-create-recipe';
import { useUpdateRecipe } from '../hooks/use-update-recipe';
import { IngredientRow } from './ingredient-row';
import { MacrosSummary } from './macros-summary';

type IngredientUnit = 'grams' | 'servings' | 'units';

interface IngredientFood {
  id: string;
  name: string;
  per100g: MacroTotals;
  servingGrams: number | null;
  unitGrams: number | null;
}

interface IngredientDraft {
  key: string;
  food: IngredientFood | null;
  amount: string;
  unit: IngredientUnit;
}

function newRow(): IngredientDraft {
  return { key: crypto.randomUUID(), food: null, amount: '', unit: 'grams' };
}

// Grams an ingredient contributes: servings/units resolve via the food's serving/unit
// weight, otherwise the amount is already grams. 0 when the row isn't usable yet.
function rowGrams(row: IngredientDraft): number {
  const n = Number(row.amount);
  if (!row.food || !Number.isFinite(n) || n <= 0) return 0;
  if (row.unit === 'servings' && row.food.servingGrams) return n * row.food.servingGrams;
  if (row.unit === 'units' && row.food.unitGrams) return n * row.food.unitGrams;
  return n;
}

// Seed the builder from a saved recipe. A line's per-100g macros are reconstructed
// from its stored (amount-scaled) macros, so editing recomputes correctly even when
// the source food was soft-deleted and is no longer in the picker. Stored amounts are
// grams, so lines start in grams (re-pick the food to switch to servings).
function fromDetail(recipe: RecipeDetail): IngredientDraft[] {
  return recipe.ingredients.map((ing) => ({
    key: ing.id,
    food: {
      id: ing.foodId,
      name: ing.foodName,
      per100g: multiplyMacros(ing.macros, 100 / ing.amountGrams),
      servingGrams: null,
      unitGrams: null,
    },
    amount: String(ing.amountGrams),
    unit: 'grams',
  }));
}

interface RecipeBuilderProps {
  editing: RecipeDetail | null;
}

// Full-page recipe builder (create + edit) for a dish composed of foods. Ingredients
// live in local draft state (raw strings, per the numeric-input pattern); the macro
// preview is computed live from the shared macro math. (Bought/prepared products are
// modelled as foods with a serving size, not recipes.)
export function RecipeBuilder({ editing }: RecipeBuilderProps) {
  const navigate = useNavigate();
  const [name, setName] = useState(editing?.name ?? '');
  const [servings, setServings] = useState(editing ? String(editing.servings) : '1');
  const [ingredients, setIngredients] = useState<IngredientDraft[]>(
    editing ? fromDetail(editing) : [newRow()],
  );

  const create = useCreateRecipe();
  const update = useUpdateRecipe();
  const isPending = create.isPending || update.isPending;
  const error = create.error ?? update.error;

  function selectFood(key: string, food: Food) {
    const picked: IngredientFood = {
      id: food.id,
      name: food.name,
      per100g: { kcal: food.kcal, proteinG: food.proteinG, carbsG: food.carbsG, fatG: food.fatG },
      servingGrams: food.servingGrams,
      unitGrams: food.unitGrams,
    };
    setIngredients((rows) =>
      rows.map((r) => {
        if (r.key !== key) return r;
        // Keep the current unit only if the newly-picked food supports it; else grams.
        const keepUnit =
          r.unit === 'grams' ||
          (r.unit === 'servings' && food.servingGrams !== null) ||
          (r.unit === 'units' && food.unitGrams !== null);
        return { ...r, food: picked, unit: keepUnit ? r.unit : 'grams' };
      }),
    );
  }

  const validRows = ingredients
    .map((r) => ({ row: r, grams: rowGrams(r) }))
    .filter(
      (x): x is { row: IngredientDraft & { food: IngredientFood }; grams: number } =>
        x.row.food !== null && x.grams > 0,
    );

  const total = sumMacros(validRows.map((x) => scaleMacros(x.row.food.per100g, x.grams)));
  const servingsNum = Number(servings);
  const validServings = Number.isInteger(servingsNum) && servingsNum > 0;
  const perServing = validServings ? divideMacros(total, servingsNum) : total;
  const canSave = name.trim().length > 0 && validServings && validRows.length > 0 && !isPending;

  function save() {
    if (!canSave) return;
    const input: CreateRecipeInput = {
      name: name.trim(),
      servings: servingsNum,
      ingredients: validRows.map((x) => ({ foodId: x.row.food.id, amountGrams: x.grams })),
    };
    const onSuccess = () => void navigate({ to: '/recipes' });
    if (editing) update.mutate({ id: editing.id, input }, { onSuccess });
    else create.mutate(input, { onSuccess });
  }

  return (
    <div className="mx-auto lg:col-span-3 flex w-full max-w-2xl flex-col gap-4 p-4">
      <h1 className="text-2xl font-bold">{editing ? 'Edit recipe' : 'New recipe'}</h1>

      <div className="grid gap-2">
        <Label htmlFor="recipe-name">Name</Label>
        <Input
          id="recipe-name"
          className="h-11"
          placeholder="e.g. Chili"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="recipe-servings">Servings</Label>
        <Input
          id="recipe-servings"
          inputMode="numeric"
          className="h-11 w-24"
          value={servings}
          onChange={(e) => setServings(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Ingredients</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9"
            onClick={() => setIngredients((rows) => [...rows, newRow()])}
          >
            <Plus className="size-4" />
            Add
          </Button>
        </div>
        {ingredients.map((row) => (
          <IngredientRow
            key={row.key}
            selectedId={row.food?.id ?? null}
            selectedName={row.food?.name ?? null}
            amount={row.amount}
            unit={row.unit}
            hasServings={row.food?.servingGrams != null}
            hasUnits={row.food?.unitGrams != null}
            gramsPerServing={row.food?.servingGrams ?? null}
            gramsPerUnit={row.food?.unitGrams ?? null}
            onSelectFood={(food) => selectFood(row.key, food)}
            onAmountChange={(v) =>
              setIngredients((rows) =>
                rows.map((r) => (r.key === row.key ? { ...r, amount: v } : r)),
              )
            }
            onUnitChange={(unit) =>
              setIngredients((rows) => rows.map((r) => (r.key === row.key ? { ...r, unit } : r)))
            }
            onRemove={() => setIngredients((rows) => rows.filter((r) => r.key !== row.key))}
            canRemove={ingredients.length > 1}
          />
        ))}
      </div>

      <Card>
        <CardContent className="flex items-center justify-between gap-4">
          <MacrosSummary macros={total} label="Whole recipe" />
          <MacrosSummary macros={perServing} label="Per serving" />
        </CardContent>
      </Card>

      {error ? (
        <p role="alert" className="text-destructive text-sm">
          {error.message}
        </p>
      ) : null}

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          className="h-11 flex-1"
          onClick={() => void navigate({ to: '/recipes' })}
        >
          Cancel
        </Button>
        <Button type="button" className="h-11 flex-1" disabled={!canSave} onClick={save}>
          {isPending ? 'Saving…' : editing ? 'Save changes' : 'Create recipe'}
        </Button>
      </div>
    </div>
  );
}
