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

// Desktop table track: ingredient | amount | P | C | F | kcal. Shared with the card's
// column header so both line up.
export const RECIPE_TABLE_COLUMNS = 'xl:grid-cols-[minmax(0,1fr)_76px_52px_52px_52px_64px]';

interface RecipeIngredientRowProps {
  row: IngredientDraft;
  editing: boolean;
  onToggleEdit: () => void;
  onChange: (patch: Partial<IngredientDraft>) => void;
  onRemove: () => void;
}

// One ingredient line. Phones: name over a compact amount/macro line, kcal on the
// right. 1280px+: the same values as table columns. Tapping the row opens the inline
// editor underneath: amount, unit, remove.
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
    <li
      className={cn(
        'border-t border-dashed border-[#e4dad2] dark:border-[#2f292d]',
        editing && 'bg-[#faf6f3] dark:bg-[#1a1618]',
      )}
    >
      <div
        className={cn(
          'flex items-center gap-3 px-4 py-4 xl:grid xl:py-3.5 xl:gap-0',
          RECIPE_TABLE_COLUMNS,
        )}
      >
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
              className="bg-muted size-10 shrink-0 rounded-[10px] object-cover"
            />
          ) : (
            <span className="bg-muted flex size-10 shrink-0 items-center justify-center rounded-[10px] text-[#a8969d]">
              <Apple className="size-4" />
            </span>
          )}
          <span className="min-w-0">
            <span className="block truncate text-[14px] font-semibold">{name}</span>
            <span className="text-muted-foreground mt-0.5 block text-[11.5px] xl:hidden">
              {amountLabel} · {short.protein} {p} · {short.carbs} {c} · {short.fat} {f}
            </span>
          </span>
        </button>
        <span className="text-muted-foreground hidden text-right text-[13px] xl:block">
          {amountLabel}
        </span>
        {[p, c, f].map((value, i) => (
          <span key={i} className="hidden text-right text-[13px] xl:block">
            {value}
          </span>
        ))}
        <span className="font-heading shrink-0 text-right text-base font-semibold">
          {macros ? Math.round(macros.kcal) : 0}
        </span>
      </div>

      {editing ? (
        // Indented past the thumbnail so the editor lines up under the name.
        <div className="flex items-center gap-2 pr-4 pb-4 pl-[68px]">
          <Input
            inputMode="decimal"
            aria-label={t.recipes.amountAria}
            className="font-heading border-primary h-10 w-[76px] rounded-[10px] border-[1.5px] bg-[#fdfbf9] text-center text-base font-semibold shadow-none dark:bg-[#171316]"
            value={row.amount}
            onChange={(e) => onChange({ amount: e.target.value })}
          />
          <RecipeUnitToggle food={row.food} unit={row.unit} onChange={switchUnit} />
          <DeleteIconButton
            className="ml-auto"
            aria-label={t.recipes.removeIngredient}
            onClick={onRemove}
          />
        </div>
      ) : null}
    </li>
  );
}
