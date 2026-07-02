import { ChevronRight, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';

import type { Food } from '@gym-bro/shared';

import { useDeleteFood } from '../hooks/use-delete-food';
import { useFoods } from '../hooks/use-foods';
import { useFoodUiStore } from '../stores/food-ui.store';

interface FoodListProps {
  search: string;
}

// The food dictionary list. Fetches the full dictionary once and filters by name
// client-side (a personal list is small; avoids a request per keystroke). Each
// row shows the per-100g macros; tapping it opens the edit sheet, delete confirms.
export function FoodList({ search }: FoodListProps) {
  const { data: foods = [], isPending } = useFoods('');
  const openEdit = useFoodUiStore((s) => s.openEdit);
  const remove = useDeleteFood();

  const query = search.trim().toLowerCase();
  const filtered = query ? foods.filter((f) => f.name.toLowerCase().includes(query)) : foods;

  function onDelete(food: Food) {
    if (window.confirm(`Delete "${food.name}"? It will be removed from your foods.`)) {
      remove.mutate(food.id);
    }
  }

  if (isPending) {
    return <p className="text-muted-foreground p-4 text-sm">Loading…</p>;
  }
  if (filtered.length === 0) {
    return (
      <p className="text-muted-foreground p-4 text-center text-sm">
        {query ? 'No foods match your search.' : 'No foods yet. Add your first food.'}
      </p>
    );
  }

  return (
    <ul className="divide-y">
      {filtered.map((food) => (
        <li
          key={food.id}
          className="hover:bg-muted/50 active:bg-muted flex items-center gap-2 px-4 py-3 transition-colors"
        >
          <button
            type="button"
            className="flex min-w-0 flex-1 items-center gap-2 text-left"
            aria-label={`Edit ${food.name}`}
            onClick={() => openEdit(food)}
          >
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{food.name}</p>
              <p className="text-muted-foreground text-sm">
                {food.kcal} kcal · P {food.proteinG} · C {food.carbsG} · F {food.fatG}
                <span className="text-xs"> / 100g</span>
              </p>
            </div>
            <ChevronRight className="text-muted-foreground size-5 shrink-0" />
          </button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-destructive size-11 shrink-0"
            aria-label={`Delete ${food.name}`}
            disabled={remove.isPending}
            onClick={() => onDelete(food)}
          >
            <Trash2 className="size-4" />
          </Button>
        </li>
      ))}
    </ul>
  );
}
