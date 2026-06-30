import { Link } from '@tanstack/react-router';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { RecipeList } from './recipe-list';

// The recipe list page: header + "New" action (to the builder route) and the list.
export function RecipesPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-4">
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
