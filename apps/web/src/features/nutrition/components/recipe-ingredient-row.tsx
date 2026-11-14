import { Apple } from 'lucide-react';
import { useRef } from 'react';

import { DeleteIconButton } from '@/components/delete-icon-button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

import { scaleMacros } from '@gym-bro/shared';

import { useNutritionTranslation } from '../i18n';
import {
  rowGrams,
  UNIT_SHORT,
  type IngredientDraft,
  type IngredientUnit,
} from '../utils/recipe-draft';
import { RecipeUnitToggle } from './recipe-unit-toggle';

interface RecipeIngredientRowProps {
  row: IngredientDraft;
  editing: boolean;
  onToggleEdit: () => void;
  onChange: (patch: Partial<IngredientDraft>) => void;
  onRemove: () => void;
}

// One ingredient line, the same at every width: photo + name with the coloured macro
// grams under it, kcal and the amount stacked on the right. Tapping the row opens the
// inline editor underneath: amount, unit, then Close and remove.
export function RecipeIngredientRow({
  row,
  editing,
  onToggleEdit,
  onChange,
  onRemove,
}: RecipeIngredientRowProps) {
  const t = useNutritionTranslation();
  const grams = rowGrams(row);
  const macros = row.food && grams > 0 ? scaleMacros(row.food.per100g, grams) : null;
  const name = row.food?.name ?? t.recipes.ingredientFallback;
  const amountLabel = `${row.amount || '—'} ${UNIT_SHORT[row.unit]}`;
  const p = macros ? Math.round(macros.proteinG) : 0;
  const c = macros ? Math.round(macros.carbsG) : 0;
  const f = macros ? Math.round(macros.fatG) : 0;
  const short = t.common.macroShort;

  // The amount last typed in each unit, so flipping 300 g → serv → g gives back 300
  // rather than a reset.
  const remembered = useRef<Partial<Record<IngredientUnit, string>>>({});

  // Switch unit: restore that unit's remembered amount; the first time, convert the
  // current grams into it (300 g at a 150 g serving → 2 serv) instead of resetting.
  function switchUnit(next: IngredientUnit) {
    if (next === row.unit) return;
    remembered.current[row.unit] = row.amount;
    let amount = remembered.current[next];
    if (amount === undefined) {
      const current = rowGrams(row);
      const weight =
        next === 'servings' ? row.food?.servingGrams : next === 'units' ? row.food?.unitGrams : 1;
      amount =
        current > 0 && weight
          ? String(Number((current / weight).toFixed(2)))
          : next === 'grams'
            ? '100'
            : '1';
    }
    onChange({ unit: next, amount });
  }

  return (
    <li className={cn('border-t border-border', editing && 'bg-field-muted')}>
      <div className="flex items-center gap-3 px-4 py-3.5">
        <button
          type="button"
          aria-label={t.recipes.editIngredientAria(name)}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
          onClick={onToggleEdit}
        >
          {row.food?.imageUrl ? (
            <img
              src={row.food.imageUrl}
              alt=""
              className="bg-muted size-10 shrink-0 rounded-lg object-cover"
            />
          ) : (
            <span className="bg-muted flex size-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground">
              <Apple className="size-4" />
            </span>
          )}
          <span className="min-w-0">
            <span className="block truncate text-[14px] font-semibold">{name}</span>
            {/* Grams of each macro in its colour (the app's protein/carbs/fat tints). */}
            <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[12px]">
              <span className="text-macro-protein-text">
                {short.protein} <b className="font-semibold">{p}g</b>
              </span>
              <span className="text-macro-carbs-text">
                {short.carbs} <b className="font-semibold">{c}g</b>
              </span>
              <span className="text-macro-fat-text">
                {short.fat} <b className="font-semibold">{f}g</b>
              </span>
            </span>
          </span>
        </button>
        <span className="flex shrink-0 flex-col items-end leading-tight">
          <span className="font-heading text-base font-semibold tabular-nums">
            {macros ? Math.round(macros.kcal) : 0}{' '}
            <span className="text-muted-foreground font-sans text-[11px] font-medium">kcal</span>
          </span>
          <span className="text-muted-foreground mt-0.5 text-[12px]">{amountLabel}</span>
        </span>
      </div>

      {editing ? (
        // Indented past the thumbnail so the editor lines up under the name.
        <div className="flex items-center gap-2 pr-4 pb-4 pl-[68px]">
          <Input
            inputMode="decimal"
            aria-label={t.recipes.amountAria}
            className="font-heading border-primary h-9 w-[76px] rounded-md border-[1.5px] bg-field text-center text-base font-semibold tabular-nums shadow-none"
            value={row.amount}
            onChange={(e) => onChange({ amount: e.target.value })}
          />
          <RecipeUnitToggle food={row.food} unit={row.unit} onChange={switchUnit} />
          <button
            type="button"
            className="text-subtle-foreground hover:bg-muted ml-auto h-9 rounded-full px-3.5 text-[13px] font-semibold transition-colors"
            onClick={onToggleEdit}
          >
            {t.recipes.closeEdit}
          </button>
          <DeleteIconButton aria-label={t.recipes.removeIngredient} onClick={onRemove} />
        </div>
      ) : null}
    </li>
  );
}
