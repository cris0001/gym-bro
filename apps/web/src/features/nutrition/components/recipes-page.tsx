import { Link } from '@tanstack/react-router';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { PageTitle } from '@/components/page-title';

import { useNutritionTranslation } from '../i18n';
import { RecipeList } from './recipe-list';

// The Recipes screen: a single-column list of recipes. Rows navigate to the builder
// route (/recipes/$recipeId) on every breakpoint — no inline desktop detail pane.
export function RecipesPage() {
  const t = useNutritionTranslation();
  return (
    <div className="flex w-full flex-col gap-4 p-3 md:p-4 max-w-6xl lg:col-start-2">
      <div className="flex items-center justify-between gap-2">
        <PageTitle className="font-heading text-[28px] leading-none font-bold tracking-tight">
          {t.recipes.title}
        </PageTitle>
        <Button asChild className="h-9.5 rounded-full px-5 text-[14px] font-semibold">
          <Link to="/recipes/new">
            <Plus className="size-4" />
            {t.recipes.new}
          </Link>
        </Button>
      </div>
      <RecipeList />

      <Link
        to="/recipes/new"
        className="border-border bg-card hover:bg-muted flex flex-col items-center gap-0.5 rounded-xl border p-4 text-center transition-colors"
      >
        <span className="text-muted-foreground text-[14px]">{t.recipes.buildPrompt}</span>
        <span className="text-primary text-[14px] font-bold">{t.recipes.newRecipeCta}</span>
      </Link>
    </div>
  );
}
