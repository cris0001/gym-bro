import { Link } from '@tanstack/react-router';
import { ChefHat, Plus } from 'lucide-react';
import { toast } from 'sonner';

import { DeleteIconButton } from '@/components/delete-icon-button';
import { EmptyState } from '@/components/empty-state';
import { SkeletonList } from '@/components/skeletons';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useConfirm } from '@/stores/confirm.store';

import type { RecipeListItem } from '@gym-bro/shared';

import { useDeleteRecipe } from '../hooks/use-delete-recipe';
import { useRecipes } from '../hooks/use-recipes';
import { useNutritionTranslation } from '../i18n';
import { MacroValues } from './macro-values';

const CARD =
  'overflow-hidden rounded-[20px] border border-[#e8e1da] bg-[#fdfbf9] dark:border-[#2f292d] dark:bg-card';

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
  const t = useNutritionTranslation();
  const { data: recipes = [], isPending } = useRecipes();
  const remove = useDeleteRecipe();
  const confirm = useConfirm();

  async function onDelete(recipe: RecipeListItem) {
    const ok = await confirm({
      title: t.recipes.deleteConfirm.title(recipe.name),
      description: t.recipes.deleteConfirm.description,
      confirmText: t.common.delete,
      destructive: true,
    });
    if (ok) remove.mutate(recipe.id, { onSuccess: () => toast.success(t.recipes.recipeDeleted) });
  }

  if (isPending) {
    return (
      <div className={CARD}>
        <SkeletonList avatar avatarClassName="size-16 rounded-[14px]" rows={3} />
      </div>
    );
  }
  if (recipes.length === 0) {
    return (
      <div className={CARD}>
        <EmptyState
          icon={<ChefHat className="size-6" />}
          title={t.recipes.emptyTitle}
          description={t.recipes.emptyDesc}
          action={
            onSelect ? (
              <Button
                type="button"
                className="h-11 rounded-full px-5"
                onClick={() => onSelect('new')}
              >
                <Plus className="size-4" />
                {t.recipes.newRecipe}
              </Button>
            ) : (
              <Button asChild className="h-11 rounded-full px-5">
                <Link to="/recipes/new">
                  <Plus className="size-4" />
                  {t.recipes.newRecipe}
                </Link>
              </Button>
            )
          }
        />
      </div>
    );
  }

  // Each recipe is its own card: photo, name with per-serving kcal, the servings +
  // per-serving macro line, and its ingredients. Delete sits top-right, a sibling of
  // the card's link (not nested inside it).
  return (
    <ul className="flex flex-col gap-2.5">
      {recipes.map((recipe) => {
        const inner = (
          <>
            {recipe.imageUrl ? (
              <img
                src={recipe.imageUrl}
                alt=""
                className="bg-muted size-16 shrink-0 rounded-[14px] object-cover"
              />
            ) : (
              <span className="bg-muted flex size-16 shrink-0 items-center justify-center rounded-[14px] text-[#a8969d]">
                <ChefHat className="size-6" />
              </span>
            )}
            <span className="min-w-0 flex-1">
              <span className="flex items-start justify-between gap-3">
                <span className="font-heading min-w-0 truncate text-[17px] leading-tight font-semibold">
                  {recipe.name}
                </span>
                <span className="shrink-0 text-right leading-none">
                  <span className="font-heading block text-[17px] font-semibold">
                    {Math.round(recipe.perServing.kcal)}
                  </span>
                  <span className="text-muted-foreground text-[10.5px] font-semibold">kcal</span>
                </span>
              </span>
              <span className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[12px]">
                <span>
                  {recipe.servings} {t.recipes.servingsWord(recipe.servings)}
                </span>
                <MacroValues
                  protein={Math.round(recipe.perServing.proteinG)}
                  carbs={Math.round(recipe.perServing.carbsG)}
                  fat={Math.round(recipe.perServing.fatG)}
                />
                <span className="text-[#b3a6ac]">{t.recipes.perServingSuffix}</span>
              </span>
              {recipe.ingredientNames.length > 0 ? (
                <span className="text-muted-foreground mt-1 line-clamp-2 block text-[12.5px] leading-snug">
                  {recipe.ingredientNames.join(', ')}
                </span>
              ) : null}
            </span>
          </>
        );
        return (
          <li
            key={recipe.id}
            className={cn(
              CARD,
              'flex items-start gap-1 p-3 pr-1.5 transition-colors hover:border-[#d6c8bd]',
              recipe.id === selectedId && 'bg-accent',
            )}
          >
            {onSelect ? (
              <button
                type="button"
                onClick={() => onSelect(recipe.id)}
                className="flex min-w-0 flex-1 items-center gap-3 text-left"
              >
                {inner}
              </button>
            ) : (
              <Link
                to="/recipes/$recipeId"
                params={{ recipeId: recipe.id }}
                className="flex min-w-0 flex-1 items-center gap-3"
              >
                {inner}
              </Link>
            )}
            <DeleteIconButton
              aria-label={t.recipes.deleteAria(recipe.name)}
              disabled={remove.isPending}
              onClick={() => void onDelete(recipe)}
            />
          </li>
        );
      })}
    </ul>
  );
}
