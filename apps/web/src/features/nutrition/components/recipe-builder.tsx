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

interface IngredientFood {
  id: string;
  name: string;
  per100g: MacroTotals;
}

interface IngredientDraft {
  key: string;
  food: IngredientFood | null;
  amount: string;
}

function newRow(): IngredientDraft {
  return { key: crypto.randomUUID(), food: null, amount: '' };
}

// Seed the builder from a saved recipe. A line's per-100g macros are reconstructed
// from its stored (amount-scaled) macros, so editing recomputes correctly even
// when the source food was soft-deleted and is no longer in the picker.
function fromDetail(recipe: RecipeDetail): IngredientDraft[] {
  return recipe.ingredients.map((ing) => ({
    key: ing.id,
    food: {
      id: ing.foodId,
      name: ing.foodName,
      per100g: multiplyMacros(ing.macros, 100 / ing.amountGrams),
    },
    amount: String(ing.amountGrams),
  }));
}

interface RecipeBuilderProps {
  editing: RecipeDetail | null;
}

// Full-page recipe builder (create + edit). Ingredients live in local draft state
// (raw strings, per the numeric-input pattern); the macro preview is computed live
// from the shared macro math.
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
    };
    setIngredients((rows) => rows.map((r) => (r.key === key ? { ...r, food: picked } : r)));
  }

  function setAmount(key: string, amount: string) {
    setIngredients((rows) => rows.map((r) => (r.key === key ? { ...r, amount } : r)));
  }

  const validRows = ingredients.filter(
    (r): r is IngredientDraft & { food: IngredientFood } =>
      r.food !== null && Number.isFinite(Number(r.amount)) && Number(r.amount) > 0,
  );

  const total = sumMacros(validRows.map((r) => scaleMacros(r.food.per100g, Number(r.amount))));
  const servingsNum = Number(servings);
  const validServings = Number.isInteger(servingsNum) && servingsNum > 0;
  const perServing = validServings ? divideMacros(total, servingsNum) : total;
  const canSave = name.trim().length > 0 && validServings && validRows.length > 0 && !isPending;

  function save() {
    if (!canSave) return;
    const input: CreateRecipeInput = {
      name: name.trim(),
      servings: servingsNum,
      ingredients: validRows.map((r) => ({ foodId: r.food.id, amountGrams: Number(r.amount) })),
    };
    const onSuccess = () => void navigate({ to: '/recipes' });
    if (editing) {
      update.mutate({ id: editing.id, input }, { onSuccess });
    } else {
      create.mutate(input, { onSuccess });
    }
  }

  return (
    <div className="flex w-full max-w-2xl flex-col gap-4 p-4">
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
            onSelectFood={(food) => selectFood(row.key, food)}
            onAmountChange={(v) => setAmount(row.key, v)}
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
