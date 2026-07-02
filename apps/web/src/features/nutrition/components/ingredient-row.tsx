import { Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

import type { Food } from '@gym-bro/shared';

import { FoodCombobox } from './food-combobox';

type IngredientUnit = 'grams' | 'servings';

interface IngredientRowProps {
  selectedId: string | null;
  selectedName: string | null;
  amount: string;
  unit: IngredientUnit;
  // Whether the picked food can be measured by serving (has a serving weight).
  hasServings: boolean;
  // Grams in one serving, for the servings→grams hint. Null when unknown.
  gramsPerServing: number | null;
  onSelectFood: (food: Food) => void;
  onAmountChange: (value: string) => void;
  onUnitChange: (unit: IngredientUnit) => void;
  onRemove: () => void;
  canRemove: boolean;
}

// One recipe ingredient: a food picker, an amount, a grams/servings unit (servings
// only when the food has a serving size), and a remove action. The amount is a raw
// string (local builder state) so a half-typed value is kept; the builder converts
// servings to grams for storage.
export function IngredientRow({
  selectedId,
  selectedName,
  amount,
  unit,
  hasServings,
  gramsPerServing,
  onSelectFood,
  onAmountChange,
  onUnitChange,
  onRemove,
  canRemove,
}: IngredientRowProps) {
  const amountNum = Number(amount);
  const gramsHint =
    unit === 'servings' && gramsPerServing !== null && Number.isFinite(amountNum) && amountNum > 0
      ? `≈ ${Math.round(amountNum * gramsPerServing)} g`
      : null;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <FoodCombobox
            selectedId={selectedId}
            selectedName={selectedName}
            onSelect={onSelectFood}
          />
        </div>
        <Input
          inputMode="decimal"
          placeholder={unit === 'servings' ? 'serv' : 'grams'}
          aria-label={unit === 'servings' ? 'Amount in servings' : 'Amount in grams'}
          className="h-11 w-20 text-center"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
        />
        {hasServings ? (
          <div className="flex h-11 shrink-0 overflow-hidden rounded-md border text-sm">
            {(['grams', 'servings'] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => onUnitChange(option)}
                className={cn(
                  'px-2 font-medium transition-colors',
                  unit === option ? 'bg-primary text-primary-foreground' : 'text-muted-foreground',
                )}
              >
                {option === 'grams' ? 'g' : 'srv'}
              </button>
            ))}
          </div>
        ) : (
          <span className="text-muted-foreground w-8 shrink-0 text-center text-sm">g</span>
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-destructive size-11 shrink-0"
          aria-label="Remove ingredient"
          disabled={!canRemove}
          onClick={onRemove}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
      {gramsHint ? <span className="text-muted-foreground pl-1 text-xs">{gramsHint}</span> : null}
    </div>
  );
}
