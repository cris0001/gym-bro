import { Link } from '@tanstack/react-router';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { RecipeList } from './recipe-list';

// The Recipes screen: a single-column list of recipes. Rows navigate to the builder
// route (/recipes/$recipeId) on every breakpoint — no inline desktop detail pane.
export function RecipesPage() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 p-3 md:p-4 lg:col-span-3">
      <div className="flex items-center justify-between gap-2">
        <h1 className="font-heading text-[28px] leading-none font-medium">Recipes</h1>
        <Button asChild className="h-11 rounded-full px-5">
          <Link to="/recipes/new">
            <Plus className="size-4" />
            New
          </Link>
        </Button>
      </div>
      <div className="bg-card overflow-hidden rounded-2xl border">
        <RecipeList />
      </div>

      <Link
        to="/recipes/new"
        className="flex flex-col items-center gap-1 rounded-2xl border border-dashed border-[#d9c9b2] p-4 text-center"
      >
        <span className="font-heading text-muted-foreground text-sm italic">
          Build a recipe from your foods
        </span>
        <span className="text-primary text-sm font-medium">+ New recipe</span>
      </Link>
    </div>
  );
}
