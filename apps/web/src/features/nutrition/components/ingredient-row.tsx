import { Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import type { Food } from '@gym-bro/shared';

import { FoodCombobox } from './food-combobox';

interface IngredientRowProps {
  selectedId: string | null;
  selectedName: string | null;
  amount: string;
  onSelectFood: (food: Food) => void;
  onAmountChange: (value: string) => void;
  onRemove: () => void;
  canRemove: boolean;
}

// One recipe ingredient: a food picker, a gram amount, and a remove action. The
// amount is a raw string (local builder state) so a half-typed value is kept.
export function IngredientRow({
  selectedId,
  selectedName,
  amount,
  onSelectFood,
  onAmountChange,
  onRemove,
  canRemove,
}: IngredientRowProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="min-w-0 flex-1">
        <FoodCombobox selectedId={selectedId} selectedName={selectedName} onSelect={onSelectFood} />
      </div>
      <Input
        inputMode="decimal"
        placeholder="grams"
        aria-label="Amount in grams"
        className="h-11 w-24 text-center"
        value={amount}
        onChange={(e) => onAmountChange(e.target.value)}
      />
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
  );
}
