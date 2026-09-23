import type { MacroTotals } from '@gym-bro/shared';

import { useNutritionTranslation } from '../i18n';

interface RecipePerServingCardProps {
  perServing: MacroTotals;
  total: MacroTotals;
}

// The dark summary card: per-serving kcal, a bar splitting that energy between protein /
// carbs / fat (4 / 4 / 9 kcal per gram), the grams of each, and the whole-recipe totals.
export function RecipePerServingCard({ perServing, total }: RecipePerServingCardProps) {
  const t = useNutritionTranslation();
  const short = t.common.macroShort;
  const parts = [
    { key: 'protein', kcal: perServing.proteinG * 4, color: 'bg-[#c98fa0]' },
    { key: 'carbs', kcal: perServing.carbsG * 4, color: 'bg-[#d9a441]' },
    { key: 'fat', kcal: perServing.fatG * 9, color: 'bg-[#8fae85]' },
  ];
  const energy = parts.reduce((sum, p) => sum + p.kcal, 0);

  return (
    <div className="rounded-[20px] bg-[#2b2126] p-5 text-[#f0e7ea]">
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-heading text-[19px] font-semibold">{t.recipes.perServing}</p>
        <p className="font-heading shrink-0 text-[30px] leading-none font-semibold text-[#fdf6f5]">
          {Math.round(perServing.kcal)}
          <span className="ml-1 font-sans text-[12px] font-semibold text-[#94858b]">kcal</span>
        </p>
      </div>

      <div className="mt-4 flex h-2 gap-0.5 overflow-hidden rounded-full bg-[#3a2f34]">
        {energy > 0
          ? parts.map((part) => (
              <span
                key={part.key}
                className={part.color}
                style={{ flexGrow: part.kcal, flexBasis: 0 }}
              />
            ))
          : null}
      </div>

      <div className="mt-2.5 flex justify-between text-[12.5px] font-semibold">
        <span>
          {short.protein} {Math.round(perServing.proteinG)} g
        </span>
        <span>
          {short.carbs} {Math.round(perServing.carbsG)} g
        </span>
        <span>
          {short.fat} {Math.round(perServing.fatG)} g
        </span>
      </div>

      <p className="font-heading mt-3 text-[12px] text-[#94858b] italic">
        {t.recipes.wholeRecipe(
          Math.round(total.kcal).toLocaleString('en-US'),
          Math.round(total.proteinG),
          Math.round(total.carbsG),
          Math.round(total.fatG),
        )}
      </p>
    </div>
  );
}
