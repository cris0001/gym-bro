import { Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

import type { Food } from '@gym-bro/shared';

import { FoodCombobox } from './food-combobox';

type IngredientUnit = 'grams' | 'servings' | 'units';

const UNIT_SHORT: Record<IngredientUnit, string> = { grams: 'g', servings: 'serv', units: 'u' };

interface IngredientRowProps {
  selectedId: string | null;
  selectedName: string | null;
  amount: string;
  unit: IngredientUnit;
  // Which units the picked food supports (grams is always available).
  hasServings: boolean;
  hasUnits: boolean;
  // Grams in one serving / one unit, for the amount→grams hint. Null when unknown.
  gramsPerServing: number | null;
  gramsPerUnit: number | null;
  onSelectFood: (food: Food) => void;
  onAmountChange: (value: string) => void;
  onUnitChange: (unit: IngredientUnit) => void;
  onRemove: () => void;
  canRemove: boolean;
}

// One recipe ingredient, stacked for mobile: the food picker full-width on top, then
// the amount + a grams/servings/units picker (only the units the food supports) + the
// remove action. The amount is a raw string (local builder state); the builder
// converts servings/units to grams for storage.
export function IngredientRow({
  selectedId,
  selectedName,
  amount,
  unit,
  hasServings,
  hasUnits,
  gramsPerServing,
  gramsPerUnit,
  onSelectFood,
  onAmountChange,
  onUnitChange,
  onRemove,
  canRemove,
}: IngredientRowProps) {
  const unitOptions: IngredientUnit[] = ['grams'];
  if (hasServings) unitOptions.push('servings');
  if (hasUnits) unitOptions.push('units');

  const amountNum = Number(amount);
  const gramsPer = unit === 'servings' ? gramsPerServing : unit === 'units' ? gramsPerUnit : null;
  const gramsHint =
    gramsPer !== null && Number.isFinite(amountNum) && amountNum > 0
      ? `≈ ${Math.round(amountNum * gramsPer)} g`
      : null;

  return (
    <div className="flex flex-col gap-2 rounded-lg border p-3">
      <FoodCombobox selectedId={selectedId} selectedName={selectedName} onSelect={onSelectFood} />
      <div className="flex items-center gap-2">
        <Input
          inputMode="decimal"
          placeholder={unit === 'grams' ? 'grams' : UNIT_SHORT[unit]}
          aria-label={`Amount in ${unit}`}
          className="h-11 w-20 text-center"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
        />
        {unitOptions.length > 1 ? (
          <div className="flex h-11 shrink-0 overflow-hidden rounded-md border text-sm">
            {unitOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => onUnitChange(option)}
                className={cn(
                  'px-2.5 font-medium transition-colors',
                  unit === option ? 'bg-primary text-primary-foreground' : 'text-muted-foreground',
                )}
              >
                {UNIT_SHORT[option]}
              </button>
            ))}
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">g</span>
        )}
        {gramsHint ? <span className="text-muted-foreground text-xs">{gramsHint}</span> : null}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-destructive ml-auto size-11 shrink-0"
          aria-label="Remove ingredient"
          disabled={!canRemove}
          onClick={onRemove}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </div>
  );
}
