import { Minus, Plus } from 'lucide-react';

import { useNutritionTranslation } from '../i18n';

interface RecipeServingsCardProps {
  servings: string;
  onChange: (next: string) => void;
}

// How many portions the recipe makes, with a −/+ stepper (never below 1).
export function RecipeServingsCard({ servings, onChange }: RecipeServingsCardProps) {
  const t = useNutritionTranslation();
  return (
    <div className="flex items-center justify-between gap-4 rounded-[20px] border border-border bg-card p-4">
      <div className="min-w-0">
        <p className="text-muted-foreground text-[11px] font-bold tracking-[0.08em] uppercase">
          {t.recipes.servings}
        </p>
        <p className="text-muted-foreground text-[12.5px] leading-snug">{t.recipes.servingsHint}</p>
      </div>
      <div className="flex h-11 shrink-0 items-center rounded-full border border-border bg-field-muted">
        <button
          type="button"
          aria-label={t.recipes.fewerServings}
          className="text-muted-foreground flex size-11 items-center justify-center"
          onClick={() => onChange(String(Math.max(1, (Number(servings) || 1) - 1)))}
        >
          <Minus className="size-4" />
        </button>
        <span className="font-heading w-8 text-center text-[19px] font-semibold">{servings}</span>
        <button
          type="button"
          aria-label={t.recipes.moreServings}
          className="text-primary flex size-11 items-center justify-center"
          onClick={() => onChange(String((Number(servings) || 0) + 1))}
        >
          <Plus className="size-4" />
        </button>
      </div>
    </div>
  );
}
