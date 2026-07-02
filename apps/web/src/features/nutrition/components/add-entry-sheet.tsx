import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

import type {
  CreateFoodLogInput,
  FoodLogEntry,
  FoodLogUnit,
  RecentDiaryItem,
} from '@gym-bro/shared';

import { useCreateFoodLogEntry } from '../hooks/use-create-food-log-entry';
import { useDailyFoodLog } from '../hooks/use-daily-food-log';
import { useFoods } from '../hooks/use-foods';
import { useRecipes } from '../hooks/use-recipes';
import { useUpdateFoodLogEntry } from '../hooks/use-update-food-log-entry';
import { useDiaryUiStore } from '../stores/diary-ui.store';
import { DiaryEntryRow } from './diary-entry-row';
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
  // The id of the entry being edited (via the shared form), or null when adding new.
  const [editingId, setEditingId] = useState<string | null>(null);

  const create = useCreateFoodLogEntry();
  const update = useUpdateFoodLogEntry();
  const { data: foods = [] } = useFoods('');
  const { data: recipes = [] } = useRecipes();
  // The meal's current entries, shown as an editable list at the bottom of the sheet.
  const { data: dayLog } = useDailyFoodLog(loggedDate);
  const mealEntries = dayLog?.entries.filter((entry) => entry.meal === addMeal) ?? [];

  useEffect(() => {
    if (open) {
      setSelected(null);
      setChoice(null);
      setEditingId(null);
      create.reset();
      update.reset();
    }
  }, [open]);

  // If the entry loaded into the form is deleted (from the list), close the edit.
  useEffect(() => {
    if (editingId !== null && dayLog && !dayLog.entries.some((entry) => entry.id === editingId)) {
      setEditingId(null);
      setSelected(null);
      setChoice(null);
    }
  }, [editingId, dayLog]);

  const selectedFood =
    selected?.kind === 'food' ? foods.find((f) => f.id === selected.id) : undefined;
  const selectedRecipe =
    selected?.kind === 'recipe' ? recipes.find((r) => r.id === selected.id) : undefined;

  // Recipes always have servings; a product does only when it has a serving size.
  const hasServings =
    selected?.kind === 'recipe' ? true : (selectedFood?.servingGrams ?? null) !== null;
  // Only products can have a unit size; recipes are never logged by unit.
  const hasUnits = selected?.kind === 'food' && (selectedFood?.unitGrams ?? null) !== null;
  const gramsPerServing =
    selected?.kind === 'recipe'
      ? selectedRecipe && selectedRecipe.servings > 0
        ? selectedRecipe.totalGrams / selectedRecipe.servings
        : undefined
      : (selectedFood?.servingGrams ?? undefined);
  const gramsPerUnit = selectedFood?.unitGrams ?? undefined;

  // Calories for a portion of the selected item. A product scales its per-100g kcal
  // by grams, or by (servings × serving weight) / (units × unit weight); a recipe
  // uses per-serving or per-gram (total ÷ weight).
  function kcalFor(unit: FoodLogUnit, quantity: number): number | null {
    if (selectedFood) {
      if (unit === 'servings') {
        return selectedFood.servingGrams !== null
          ? (selectedFood.kcal * quantity * selectedFood.servingGrams) / 100
          : null;
      }
      if (unit === 'units') {
        return selectedFood.unitGrams !== null
          ? (selectedFood.kcal * quantity * selectedFood.unitGrams) / 100
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

  const isEditing = editingId !== null;
  const editingEntry = isEditing ? mealEntries.find((entry) => entry.id === editingId) : undefined;
  const editInitial: PortionChoice | undefined = editingEntry
    ? { unit: editingEntry.unit, quantity: editingEntry.quantity }
    : undefined;
  const busy = create.isPending || update.isPending;
  const canSubmit = selected !== null && choice !== null && !busy;
  const error = create.error ?? update.error;

  // Load an existing entry into this same form: preselect its product and seed its
  // portion, switching the primary action to "Save".
  function startEditEntry(entry: FoodLogEntry) {
    const sourceId = entry.foodId ?? entry.recipeId;
    if (sourceId === null) return;
    setSelected({ kind: entry.foodId ? 'food' : 'recipe', id: sourceId, name: entry.itemName });
    setEditingId(entry.id);
  }

  function cancelEdit() {
    setEditingId(null);
    setSelected(null);
  }

  function saveEdit() {
    if (editingId === null || choice === null) return;
    update.mutate(
      { id: editingId, input: { quantity: choice.quantity, unit: choice.unit } },
      {
        onSuccess: () => {
          setEditingId(null);
          setSelected(null);
        },
      },
    );
  }

  // One-tap re-add of a recent item with the portion it was last logged at.
  function addRecent(item: RecentDiaryItem) {
    if (addMeal === null) return;
    const input: CreateFoodLogInput =
      item.type === 'food'
        ? {
            type: 'food',
            foodId: item.id,
            quantity: item.quantity,
            unit: item.unit,
            meal: addMeal,
            loggedDate,
          }
        : {
            type: 'recipe',
            recipeId: item.id,
            quantity: item.quantity,
            unit: item.unit,
            meal: addMeal,
            loggedDate,
          };
    create.mutate(input);
  }

  function add() {
    if (!canSubmit || addMeal === null || selected === null || choice === null) return;
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
          {addMeal !== null && (
            <RecentItemsRow meal={addMeal} onPick={addRecent} disabled={create.isPending} />
          )}

          <DiaryItemCombobox
            selected={selected}
            onSelect={(item) => {
              // A manual pick is always a new add, never a continuation of an edit.
              setSelected(item);
              setEditingId(null);
            }}
          />

          {selectedRecipe !== undefined && (
            <p className="text-muted-foreground text-xs">
              Makes {selectedRecipe.servings}{' '}
              {selectedRecipe.servings === 1 ? 'serving' : 'servings'} ·{' '}
              {Math.round(selectedRecipe.totalGrams)} g total (1 serving ≈{' '}
              {Math.round(selectedRecipe.totalGrams / selectedRecipe.servings)} g).
            </p>
          )}
          {(selectedFood?.servingGrams != null || selectedFood?.unitGrams != null) && (
            <p className="text-muted-foreground text-xs">
              {selectedFood.servingGrams != null &&
                `1 serving = ${Math.round(selectedFood.servingGrams)} g.`}
              {selectedFood.servingGrams != null && selectedFood.unitGrams != null && ' '}
              {selectedFood.unitGrams != null &&
                `1 unit = ${Math.round(selectedFood.unitGrams)} g.`}
            </p>
          )}

          {selected !== null && (
            <PortionPicker
              key={editingId ?? selected.id}
              hasServings={hasServings}
              hasUnits={hasUnits}
              gramsPerServing={gramsPerServing}
              gramsPerUnit={gramsPerUnit}
              kcalFor={kcalFor}
              initial={editInitial}
              onChange={setChoice}
            />
          )}

          {error ? (
            <p role="alert" className="text-destructive text-sm">
              {error.message}
            </p>
          ) : null}

          <div className="flex gap-2">
            <Button
              type="button"
              className="h-11 flex-1"
              disabled={!canSubmit}
              onClick={isEditing ? saveEdit : add}
            >
              {busy ? 'Saving…' : isEditing ? 'Save' : 'Add'}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-11"
              onClick={isEditing ? cancelEdit : closeAdd}
            >
              {isEditing ? 'Cancel' : 'Done'}
            </Button>
          </div>

          {mealEntries.length > 0 && (
            <div className="border-t pt-2">
              <p className="text-muted-foreground mb-1 text-xs">In this meal</p>
              <ul className="divide-y">
                {mealEntries.map((entry) => (
                  <DiaryEntryRow
                    key={entry.id}
                    entry={entry}
                    onEdit={startEditEntry}
                    highlighted={entry.id === editingId}
                  />
                ))}
              </ul>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
