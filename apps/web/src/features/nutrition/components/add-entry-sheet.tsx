import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

import type { CreateFoodLogInput, FoodLogUnit, RecentDiaryItem } from '@gym-bro/shared';

import { useCreateFoodLogEntry } from '../hooks/use-create-food-log-entry';
import { useFoods } from '../hooks/use-foods';
import { useRecipes } from '../hooks/use-recipes';
import { useDiaryUiStore } from '../stores/diary-ui.store';
import { DiaryItemCombobox, type DiaryItem } from './diary-item-combobox';
import { PortionPicker, type PortionChoice } from './portion-picker';
import { RecentItemsRow } from './recent-items-row';

// Log products or recipes to the meal preset on the store, Fitatu-style: one search
// over both, then a portion (1 serving / 100 g / custom) with live calories per
// option. The sheet stays open after each add so several things can be logged in one
// go; "Done" closes it.
export function AddEntrySheet({ loggedDate }: { loggedDate: string }) {
  const addMeal = useDiaryUiStore((s) => s.addMeal);
  const closeAdd = useDiaryUiStore((s) => s.closeAdd);
  const open = addMeal !== null;

  const [selected, setSelected] = useState<DiaryItem | null>(null);
  const [choice, setChoice] = useState<PortionChoice | null>(null);
  const [addedCount, setAddedCount] = useState(0);

  const create = useCreateFoodLogEntry();
  const { data: foods = [] } = useFoods('');
  const { data: recipes = [] } = useRecipes();

  useEffect(() => {
    if (open) {
      setSelected(null);
      setChoice(null);
      setAddedCount(0);
      create.reset();
    }
  }, [open]);

  const selectedFood =
    selected?.kind === 'food' ? foods.find((f) => f.id === selected.id) : undefined;
  const selectedRecipe =
    selected?.kind === 'recipe' ? recipes.find((r) => r.id === selected.id) : undefined;

  // Recipes always have servings; a product does only when it has a serving size.
  const hasServings =
    selected?.kind === 'recipe' ? true : (selectedFood?.servingGrams ?? null) !== null;
  const gramsPerServing =
    selected?.kind === 'recipe'
      ? selectedRecipe && selectedRecipe.servings > 0
        ? selectedRecipe.totalGrams / selectedRecipe.servings
        : undefined
      : (selectedFood?.servingGrams ?? undefined);

  // Calories for a portion of the selected item. A product scales its per-100g kcal
  // by grams, or by (servings × serving weight); a recipe uses per-serving or
  // per-gram (total ÷ weight).
  function kcalFor(unit: FoodLogUnit, quantity: number): number | null {
    if (selectedFood) {
      if (unit === 'servings') {
        return selectedFood.servingGrams !== null
          ? (selectedFood.kcal * quantity * selectedFood.servingGrams) / 100
          : null;
      }
      return (selectedFood.kcal * quantity) / 100;
    }
    if (selectedRecipe) {
      if (unit === 'servings') return selectedRecipe.perServing.kcal * quantity;
      const totalKcal = selectedRecipe.perServing.kcal * selectedRecipe.servings;
      return selectedRecipe.totalGrams > 0
        ? (totalKcal / selectedRecipe.totalGrams) * quantity
        : null;
    }
    return null;
  }

  const canAdd = selected !== null && choice !== null && !create.isPending;

  function pickRecent(item: RecentDiaryItem) {
    setSelected({ kind: item.type, id: item.id, name: item.name });
  }

  function add() {
    if (!canAdd || addMeal === null || selected === null || choice === null) return;
    const input: CreateFoodLogInput =
      selected.kind === 'food'
        ? {
            type: 'food',
            foodId: selected.id,
            quantity: choice.quantity,
            unit: choice.unit,
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
        setSelected(null);
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

          <DiaryItemCombobox selected={selected} onSelect={setSelected} />

          {selectedRecipe !== undefined && (
            <p className="text-muted-foreground text-xs">
              Makes {selectedRecipe.servings}{' '}
              {selectedRecipe.servings === 1 ? 'serving' : 'servings'} ·{' '}
              {Math.round(selectedRecipe.totalGrams)} g total (1 serving ≈{' '}
              {Math.round(selectedRecipe.totalGrams / selectedRecipe.servings)} g).
            </p>
          )}
          {selectedFood?.servingGrams != null && (
            <p className="text-muted-foreground text-xs">
              1 serving = {Math.round(selectedFood.servingGrams)} g.
            </p>
          )}

          {selected !== null && (
            <PortionPicker
              hasServings={hasServings}
              gramsPerServing={gramsPerServing}
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
