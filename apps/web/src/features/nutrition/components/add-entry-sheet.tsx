import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

import type { CreateFoodLogInput, Food, FoodLogUnit, RecipeListItem } from '@gym-bro/shared';

import { useCreateFoodLogEntry } from '../hooks/use-create-food-log-entry';
import { useDiaryUiStore } from '../stores/diary-ui.store';
import { FoodCombobox } from './food-combobox';
import { RecipeCombobox } from './recipe-combobox';

type Mode = 'food' | 'recipe';

interface AddEntrySheetProps {
  loggedDate: string;
}

// Log a food (by grams) or a recipe (by grams or servings) to the meal preset on
// the store. The server snapshots the macros; this only sends the reference +
// quantity + unit. State resets each time the sheet opens.
export function AddEntrySheet({ loggedDate }: AddEntrySheetProps) {
  const addMeal = useDiaryUiStore((s) => s.addMeal);
  const closeAdd = useDiaryUiStore((s) => s.closeAdd);
  const open = addMeal !== null;

  const [mode, setMode] = useState<Mode>('food');
  const [food, setFood] = useState<Food | null>(null);
  const [recipe, setRecipe] = useState<RecipeListItem | null>(null);
  const [recipeUnit, setRecipeUnit] = useState<FoodLogUnit>('servings');
  const [quantity, setQuantity] = useState('');

  const create = useCreateFoodLogEntry();

  useEffect(() => {
    if (open) {
      setMode('food');
      setFood(null);
      setRecipe(null);
      setRecipeUnit('servings');
      setQuantity('');
      create.reset();
    }
    // Resets only when the sheet opens/closes; create.reset is stable enough here.
  }, [open]);

  const amount = Number(quantity);
  const selected = mode === 'food' ? food !== null : recipe !== null;
  const canAdd = selected && Number.isFinite(amount) && amount > 0 && !create.isPending;
  // A recipe by grams uses the grams label; otherwise servings/grams as applicable.
  const quantityLabel = mode === 'food' || recipeUnit === 'grams' ? 'Amount (g)' : 'Servings';

  function add() {
    if (!canAdd || addMeal === null) return;
    const input: CreateFoodLogInput =
      mode === 'food'
        ? { type: 'food', foodId: food!.id, quantity: amount, meal: addMeal, loggedDate }
        : {
            type: 'recipe',
            recipeId: recipe!.id,
            quantity: amount,
            unit: recipeUnit,
            meal: addMeal,
            loggedDate,
          };
    create.mutate(input, { onSuccess: closeAdd });
  }

  return (
    <Sheet open={open} onOpenChange={(next) => !next && closeAdd()}>
      <SheetContent side="bottom" className="gap-0">
        <SheetHeader>
          <SheetTitle>Add to diary</SheetTitle>
          <SheetDescription>Log a food by grams or a recipe by grams or servings.</SheetDescription>
        </SheetHeader>

        <div className="grid gap-4 p-4">
          <div className="bg-muted flex gap-1 rounded-md p-1">
            {(['food', 'recipe'] as Mode[]).map((m) => (
              <Button
                key={m}
                type="button"
                size="sm"
                variant={mode === m ? 'default' : 'ghost'}
                className={cn('h-9 flex-1 capitalize', mode !== m && 'text-muted-foreground')}
                onClick={() => setMode(m)}
              >
                {m}
              </Button>
            ))}
          </div>

          {mode === 'food' ? (
            <FoodCombobox
              selectedId={food?.id ?? null}
              selectedName={food?.name ?? null}
              onSelect={setFood}
            />
          ) : (
            <>
              <RecipeCombobox
                selectedId={recipe?.id ?? null}
                selectedName={recipe?.name ?? null}
                onSelect={setRecipe}
              />
              <div className="bg-muted flex gap-1 rounded-md p-1">
                {(['servings', 'grams'] as FoodLogUnit[]).map((u) => (
                  <Button
                    key={u}
                    type="button"
                    size="sm"
                    variant={recipeUnit === u ? 'default' : 'ghost'}
                    className={cn(
                      'h-9 flex-1 capitalize',
                      recipeUnit !== u && 'text-muted-foreground',
                    )}
                    onClick={() => setRecipeUnit(u)}
                  >
                    {u}
                  </Button>
                ))}
              </div>
            </>
          )}

          <div className="grid gap-2">
            <Label htmlFor="entry-quantity">{quantityLabel}</Label>
            <Input
              id="entry-quantity"
              inputMode="decimal"
              placeholder={quantityLabel === 'Servings' ? 'e.g. 1' : 'e.g. 200'}
              className="h-11"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>

          {create.error ? (
            <p role="alert" className="text-destructive text-sm">
              {create.error.message}
            </p>
          ) : null}

          <Button type="button" className="h-11" disabled={!canAdd} onClick={add}>
            {create.isPending ? 'Adding…' : 'Add to diary'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
