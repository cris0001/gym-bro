import { Link } from '@tanstack/react-router';
import { Plus } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { useMediaQuery } from '@/hooks/use-media-query';

import { useRecipes } from '../hooks/use-recipes';
import { RecipeEditPage } from './recipe-edit-page';
import { RecipeBuilder } from './recipe-builder';
import { RecipeList } from './recipe-list';

// The Recipes screen. Mobile: a list whose rows open the builder route, plus a "New"
// link. Desktop (lg+): a master-detail layout — the recipe list on the left, the
// selected recipe's builder inline on the right (defaults to the first recipe, or a
// blank "New recipe" when there are none). 'new' is the sentinel for the blank builder.
export function RecipesPage() {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const { data: recipes } = useRecipes();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (!isDesktop) {
    return (
      <div className="mx-auto lg:col-span-3 flex w-full max-w-4xl flex-col gap-4 p-4">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-2xl font-bold">Recipes</h1>
          <Button asChild className="h-11">
            <Link to="/recipes/new">
              <Plus className="size-4" />
              New
            </Link>
          </Button>
        </div>
        <div className="bg-card overflow-hidden rounded-xl border">
          <RecipeList />
        </div>
      </div>
    );
  }

  // Desktop: default the right pane to the first recipe, else the blank builder.
  const effectiveId = selectedId ?? recipes?.[0]?.id ?? 'new';
  // After save/cancel, fall back to the default selection (the list has refetched).
  const handleDone = () => setSelectedId(null);

  return (
    <div className="lg:col-start-2 flex w-full max-w-6xl flex-col gap-4 p-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Recipes</h1>
        <Button type="button" className="h-11" onClick={() => setSelectedId('new')}>
          <Plus className="size-4" />
          New
        </Button>
      </div>

      <div className="lg:grid lg:grid-cols-[30rem_1fr] lg:items-start lg:gap-6">
        <div className="bg-card overflow-hidden rounded-xl border">
          <RecipeList selectedId={effectiveId} onSelect={setSelectedId} />
        </div>
        <div className="bg-card overflow-hidden rounded-xl border">
          {/* Keyed so switching recipes (or to "new") remounts the builder with fresh state. */}
          {effectiveId === 'new' ? (
            <RecipeBuilder key="new" editing={null} inline onDone={handleDone} />
          ) : (
            <RecipeEditPage key={effectiveId} recipeId={effectiveId} inline onDone={handleDone} />
          )}
        </div>
      </div>
    </div>
  );
}
