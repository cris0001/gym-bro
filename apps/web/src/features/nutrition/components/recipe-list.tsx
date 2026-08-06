import { Link } from '@tanstack/react-router';
import { ChefHat, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { EmptyState } from '@/components/empty-state';
import { ListSkeleton } from '@/components/list-skeleton';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useConfirm } from '@/stores/confirm.store';

import type { RecipeListItem } from '@gym-bro/shared';

import { useDeleteRecipe } from '../hooks/use-delete-recipe';
import { useRecipes } from '../hooks/use-recipes';

interface RecipeListProps {
  // Desktop master-detail: rows select the recipe locally (highlighting selectedId) and
  // "New recipe" passes the 'new' sentinel to onSelect. Absent on mobile, where rows
  // link to the builder route.
  selectedId?: string | null;
  onSelect?: (recipeId: string) => void;
}

// Recipe list (name over per-serving macros). Mobile: each row links to the builder
// route. Desktop: rows call onSelect to load the recipe in the right pane. The delete
// button is a sibling of the row action (not nested) and confirms first.
export function RecipeList({ selectedId = null, onSelect }: RecipeListProps) {
  const { data: recipes = [], isPending } = useRecipes();
  const remove = useDeleteRecipe();
  const confirm = useConfirm();

  async function onDelete(recipe: RecipeListItem) {
    const ok = await confirm({
      title: `Delete "${recipe.name}"?`,
      description: 'It will be removed from your recipes.',
      confirmText: 'Delete',
      destructive: true,
    });
    if (ok) remove.mutate(recipe.id, { onSuccess: () => toast.success('Recipe deleted') });
  }

  if (isPending) {
    return <ListSkeleton />;
  }
  if (recipes.length === 0) {
    return (
      <EmptyState
        icon={<ChefHat className="size-6" />}
        title="No recipes yet"
        description="Combine foods into a recipe to log it in one tap."
        action={
          onSelect ? (
            <Button type="button" className="h-11" onClick={() => onSelect('new')}>
              <Plus className="size-4" />
              New recipe
            </Button>
          ) : (
            <Button asChild className="h-11">
              <Link to="/recipes/new">
                <Plus className="size-4" />
                New recipe
              </Link>
            </Button>
          )
        }
      />
    );
  }

  return (
    <ul className="divide-y">
      {recipes.map((recipe) => {
        const inner = (
          <>
            {recipe.imageUrl ? (
              <img
                src={recipe.imageUrl}
                alt=""
                className="bg-muted size-14 shrink-0 rounded-lg border object-cover"
              />
            ) : (
              <div className="bg-muted text-muted-foreground flex size-14 shrink-0 items-center justify-center rounded-lg border">
                <ChefHat className="size-5" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{recipe.name}</p>
              <p className="text-muted-foreground text-xs">
                {recipe.servings} {recipe.servings === 1 ? 'serving' : 'servings'} ·{' '}
                {Math.round(recipe.perServing.kcal)} kcal · P{' '}
                {Math.round(recipe.perServing.proteinG)} · C {Math.round(recipe.perServing.carbsG)}{' '}
                · F {Math.round(recipe.perServing.fatG)} / serving
              </p>
              {recipe.ingredientNames.length > 0 ? (
                <p className="text-muted-foreground mt-0.5 line-clamp-2 text-sm">
                  {recipe.ingredientNames.join(', ')}
                </p>
              ) : null}
            </div>
            <ChevronRight className="text-muted-foreground size-5 shrink-0 self-center" />
          </>
        );
        return (
          <li
            key={recipe.id}
            className={cn(
              'hover:bg-muted/50 active:bg-muted flex items-center gap-2 px-4 py-3 transition-colors',
              recipe.id === selectedId && 'bg-muted',
            )}
          >
            {onSelect ? (
              <button
                type="button"
                onClick={() => onSelect(recipe.id)}
                className="flex min-w-0 flex-1 items-center gap-2 text-left"
              >
                {inner}
              </button>
            ) : (
              <Link
                to="/recipes/$recipeId"
                params={{ recipeId: recipe.id }}
                className="flex min-w-0 flex-1 items-center gap-2"
              >
                {inner}
              </Link>
            )}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-destructive size-11 shrink-0"
              aria-label={`Delete ${recipe.name}`}
              disabled={remove.isPending}
              onClick={() => void onDelete(recipe)}
            >
              <Trash2 className="size-4" />
            </Button>
          </li>
        );
      })}
    </ul>
  );
}
