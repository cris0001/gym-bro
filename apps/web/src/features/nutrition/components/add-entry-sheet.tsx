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

import type { CreateFoodLogInput, FoodLogUnit, RecentDiaryItem } from '@gym-bro/shared';

import { useCreateFoodLogEntry } from '../hooks/use-create-food-log-entry';
import { useRecipes } from '../hooks/use-recipes';
import { useDiaryUiStore } from '../stores/diary-ui.store';
import { FoodCombobox } from './food-combobox';
import { RecentItemsRow } from './recent-items-row';
import { RecipeCombobox } from './recipe-combobox';

type Mode = 'food' | 'recipe';
type Selected = { id: string; name: string } | null;

// Log foods (by grams) or recipes (by grams or servings) to the meal preset on the
// store. The sheet stays open after each add (reset for the next item) so several
// things can be logged in one go; "Done" closes it. A recent-items row and the
// recipe's planned servings speed up repeat logging.
export function AddEntrySheet({ loggedDate }: { loggedDate: string }) {
  const addMeal = useDiaryUiStore((s) => s.addMeal);
  const closeAdd = useDiaryUiStore((s) => s.closeAdd);
  const open = addMeal !== null;

  const [mode, setMode] = useState<Mode>('food');
  const [food, setFood] = useState<Selected>(null);
  const [recipe, setRecipe] = useState<Selected>(null);
  const [recipeUnit, setRecipeUnit] = useState<FoodLogUnit>('servings');
  const [quantity, setQuantity] = useState('');
  const [addedCount, setAddedCount] = useState(0);

  const create = useCreateFoodLogEntry();
  const { data: recipes = [] } = useRecipes();

  useEffect(() => {
    if (open) {
      setMode('food');
      setFood(null);
      setRecipe(null);
      setRecipeUnit('servings');
      setQuantity('');
      setAddedCount(0);
      create.reset();
    }
  }, [open]);

  const amount = Number(quantity);
  const selected = mode === 'food' ? food : recipe;
  const canAdd = selected !== null && Number.isFinite(amount) && amount > 0 && !create.isPending;
  const selectedRecipe = recipe ? recipes.find((r) => r.id === recipe.id) : undefined;
  const recipeServings = selectedRecipe?.servings;
  const quantityLabel = mode === 'food' || recipeUnit === 'grams' ? 'Amount (g)' : 'Servings';

  function pickRecent(item: RecentDiaryItem) {
    setMode(item.type);
    if (item.type === 'food') {
      setFood({ id: item.id, name: item.name });
    } else {
      setRecipe({ id: item.id, name: item.name });
    }
  }

  function add() {
    if (!canAdd || addMeal === null || selected === null) return;
    const input: CreateFoodLogInput =
      mode === 'food'
        ? { type: 'food', foodId: selected.id, quantity: amount, meal: addMeal, loggedDate }
        : {
            type: 'recipe',
            recipeId: selected.id,
            quantity: amount,
            unit: recipeUnit,
            meal: addMeal,
            loggedDate,
          };
    // Keep the sheet open: clear the selection + amount for the next item.
    create.mutate(input, {
      onSuccess: () => {
        setFood(null);
        setRecipe(null);
        setQuantity('');
        setAddedCount((count) => count + 1);
      },
    });
  }

  return (
    <Sheet open={open} onOpenChange={(next) => !next && closeAdd()}>
      <SheetContent side="bottom" className="gap-0">
        <SheetHeader>
          <SheetTitle className="capitalize">
            Add to {addMeal?.replace('_', ' ') ?? 'diary'}
          </SheetTitle>
          <SheetDescription>
            Add several items; the sheet stays open until you’re done.
          </SheetDescription>
        </SheetHeader>

        <div className="grid gap-4 p-4">
          {addMeal !== null && <RecentItemsRow meal={addMeal} onPick={pickRecent} />}

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
              onSelect={(f) => setFood({ id: f.id, name: f.name })}
            />
          ) : (
            <>
              <RecipeCombobox
                selectedId={recipe?.id ?? null}
                selectedName={recipe?.name ?? null}
                onSelect={(r) => setRecipe({ id: r.id, name: r.name })}
              />
              {recipeServings !== undefined && (
                <p className="text-muted-foreground text-xs">
                  Makes {recipeServings} {recipeServings === 1 ? 'serving' : 'servings'} per recipe.
                </p>
              )}
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

          <div className="flex gap-2">
            <Button type="button" className="h-11 flex-1" disabled={!canAdd} onClick={add}>
              {create.isPending ? 'Adding…' : 'Add'}
            </Button>
            <Button type="button" variant="outline" className="h-11" onClick={closeAdd}>
              Done
            </Button>
          </div>
          {addedCount > 0 && (
            <p className="text-muted-foreground text-center text-xs">
              {addedCount} added to this meal
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
