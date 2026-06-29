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

import type { CreateFoodLogInput, Food, RecipeListItem } from '@gym-bro/shared';

import { useCreateFoodLogEntry } from '../hooks/use-create-food-log-entry';
import { useDiaryUiStore } from '../stores/diary-ui.store';
import { FoodCombobox } from './food-combobox';
import { RecipeCombobox } from './recipe-combobox';

type Mode = 'food' | 'recipe';

interface AddEntrySheetProps {
  loggedDate: string;
}

// Log a food (by grams) or a recipe (by servings) to the given day. The server
// snapshots the macros; this only sends the reference + quantity. State resets
// each time the sheet opens.
export function AddEntrySheet({ loggedDate }: AddEntrySheetProps) {
  const addOpen = useDiaryUiStore((s) => s.addOpen);
  const closeAdd = useDiaryUiStore((s) => s.closeAdd);

  const [mode, setMode] = useState<Mode>('food');
  const [food, setFood] = useState<Food | null>(null);
  const [recipe, setRecipe] = useState<RecipeListItem | null>(null);
  const [quantity, setQuantity] = useState('');

  const create = useCreateFoodLogEntry();

  useEffect(() => {
    if (addOpen) {
      setMode('food');
      setFood(null);
      setRecipe(null);
      setQuantity('');
      create.reset();
    }
    // Resets only when the sheet opens/closes; create.reset is stable enough here.
  }, [addOpen]);

  const amount = Number(quantity);
  const selected = mode === 'food' ? food !== null : recipe !== null;
  const canAdd = selected && Number.isFinite(amount) && amount > 0 && !create.isPending;

  function add() {
    if (!canAdd) return;
    const input: CreateFoodLogInput =
      mode === 'food'
        ? { type: 'food', foodId: food!.id, quantity: amount, loggedDate }
        : { type: 'recipe', recipeId: recipe!.id, quantity: amount, loggedDate };
    create.mutate(input, { onSuccess: closeAdd });
  }

  return (
    <Sheet open={addOpen} onOpenChange={(next) => !next && closeAdd()}>
      <SheetContent side="bottom" className="gap-0">
        <SheetHeader>
          <SheetTitle>Add to diary</SheetTitle>
          <SheetDescription>Log a food by grams or a recipe by servings.</SheetDescription>
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
            <RecipeCombobox
              selectedId={recipe?.id ?? null}
              selectedName={recipe?.name ?? null}
              onSelect={setRecipe}
            />
          )}

          <div className="grid gap-2">
            <Label htmlFor="entry-quantity">{mode === 'food' ? 'Amount (g)' : 'Servings'}</Label>
            <Input
              id="entry-quantity"
              inputMode="decimal"
              placeholder={mode === 'food' ? 'e.g. 200' : 'e.g. 1'}
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
