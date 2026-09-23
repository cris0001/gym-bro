import { cn } from '@/lib/utils';

import { UNIT_SHORT, type IngredientFood, type IngredientUnit } from '../utils/recipe-draft';

interface RecipeUnitToggleProps {
  food: IngredientFood | null;
  unit: IngredientUnit;
  onChange: (unit: IngredientUnit) => void;
}

// Grams / servings / units segment for an ingredient's amount — only the units the
// food supports (grams always). A lone "g" when grams is the only option.
export function RecipeUnitToggle({ food, unit, onChange }: RecipeUnitToggleProps) {
  const options: IngredientUnit[] = ['grams'];
  if (food?.servingGrams != null) options.push('servings');
  if (food?.unitGrams != null) options.push('units');
  if (options.length === 1) {
    return <span className="text-muted-foreground px-1 text-[14px] font-semibold">g</span>;
  }
  return (
    <div className="flex h-10 shrink-0 overflow-hidden rounded-[10px] border border-[#e8e1da] bg-[#fdfbf9] dark:border-[#2f292d] dark:bg-[#171316]">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={cn(
            'min-w-11 px-3 text-[13.5px] font-semibold transition-colors',
            unit === option ? 'bg-primary text-primary-foreground' : 'text-muted-foreground',
          )}
        >
          {UNIT_SHORT[option]}
        </button>
      ))}
    </div>
  );
}
