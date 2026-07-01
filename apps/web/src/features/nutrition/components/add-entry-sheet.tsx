import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
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
import { useFoods } from '../hooks/use-foods';
import { useRecipes } from '../hooks/use-recipes';
import { useDiaryUiStore } from '../stores/diary-ui.store';
import { FoodCombobox } from './food-combobox';
import { PortionPicker, type PortionChoice } from './portion-picker';
import { RecentItemsRow } from './recent-items-row';
import { RecipeCombobox } from './recipe-combobox';

type Mode = 'food' | 'recipe';
type Selected = { id: string; name: string } | null;

// Log foods or recipes to the meal preset on the store, Fitatu-style: pick the item,
// then a portion (1 serving / 100 g / custom) with live calories per option. The
// sheet stays open after each add so several things can be logged in one go.
export function AddEntrySheet({ loggedDate }: { loggedDate: string }) {
  const addMeal = useDiaryUiStore((s) => s.addMeal);
  const closeAdd = useDiaryUiStore((s) => s.closeAdd);
  const open = addMeal !== null;

  const [mode, setMode] = useState<Mode>('food');
  const [food, setFood] = useState<Selected>(null);
  const [recipe, setRecipe] = useState<Selected>(null);
  const [choice, setChoice] = useState<PortionChoice | null>(null);
  const [addedCount, setAddedCount] = useState(0);

  const create = useCreateFoodLogEntry();
  const { data: foods = [] } = useFoods('');
  const { data: recipes = [] } = useRecipes();

  useEffect(() => {
    if (open) {
      setMode('food');
      setFood(null);
      setRecipe(null);
      setChoice(null);
      setAddedCount(0);
      create.reset();
    }
  }, [open]);

  const selected = mode === 'food' ? food : recipe;
  const selectedFood = food ? foods.find((f) => f.id === food.id) : undefined;
  const selectedRecipe = recipe ? recipes.find((r) => r.id === recipe.id) : undefined;

  // Calories for a portion of the selected item: a food scales its per-100g kcal by
  // grams; a recipe uses per-serving kcal, or per-gram (total ÷ weight) for grams.
  function kcalFor(unit: FoodLogUnit, quantity: number): number | null {
    if (mode === 'food') {
      return selectedFood ? (selectedFood.kcal * quantity) / 100 : null;
    }
    if (!selectedRecipe) return null;
    if (unit === 'servings') return selectedRecipe.perServing.kcal * quantity;
    const totalKcal = selectedRecipe.perServing.kcal * selectedRecipe.servings;
    return selectedRecipe.totalGrams > 0
      ? (totalKcal / selectedRecipe.totalGrams) * quantity
      : null;
  }

  const canAdd = selected !== null && choice !== null && !create.isPending;

  function pickRecent(item: RecentDiaryItem) {
    setMode(item.type);
    if (item.type === 'food') setFood({ id: item.id, name: item.name });
    else setRecipe({ id: item.id, name: item.name });
  }

  function add() {
    if (!canAdd || addMeal === null || selected === null || choice === null) return;
    const input: CreateFoodLogInput =
      mode === 'food'
        ? {
            type: 'food',
            foodId: selected.id,
            quantity: choice.quantity,
            meal: addMeal,
            loggedDate,
          }
        : {
            type: 'recipe',
            recipeId: selected.id,
            quantity: choice.quantity,
            unit: choice.unit,
            meal: addMeal,
            loggedDate,
          };
    create.mutate(input, {
      onSuccess: () => {
        setFood(null);
        setRecipe(null);
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
              {selectedRecipe !== undefined && (
                <p className="text-muted-foreground text-xs">
                  Makes {selectedRecipe.servings}{' '}
                  {selectedRecipe.servings === 1 ? 'serving' : 'servings'} ·{' '}
                  {Math.round(selectedRecipe.totalGrams)} g total (1 serving ≈{' '}
                  {Math.round(selectedRecipe.totalGrams / selectedRecipe.servings)} g).
                </p>
              )}
            </>
          )}

          {selected !== null && (
            <PortionPicker
              mode={mode}
              gramsPerServing={
                selectedRecipe ? selectedRecipe.totalGrams / selectedRecipe.servings : undefined
              }
              kcalFor={kcalFor}
              onChange={setChoice}
            />
          )}

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
