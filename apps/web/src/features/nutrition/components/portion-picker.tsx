import { useEffect, useState } from 'react';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

import type { FoodLogUnit } from '@gym-bro/shared';

interface PortionOption {
  id: string;
  label: string;
  unit: FoodLogUnit;
  // Fixed amount, or null for a custom input-driven option.
  quantity: number | null;
  input?: boolean;
}

// Foods are grams-only; recipes offer serving + gram presets plus custom inputs.
const FOOD_OPTIONS: PortionOption[] = [
  { id: 'g100', label: '100 g', unit: 'grams', quantity: 100 },
  { id: 'gx', label: 'Grams', unit: 'grams', quantity: null, input: true },
];
const RECIPE_OPTIONS: PortionOption[] = [
  { id: 's1', label: '1 serving', unit: 'servings', quantity: 1 },
  { id: 'g100', label: '100 g', unit: 'grams', quantity: 100 },
  { id: 'sx', label: 'Servings', unit: 'servings', quantity: null, input: true },
  { id: 'gx', label: 'Grams', unit: 'grams', quantity: null, input: true },
];

export interface PortionChoice {
  unit: FoodLogUnit;
  quantity: number;
}

interface PortionPickerProps {
  mode: 'food' | 'recipe';
  // Grams in one serving (recipe total weight ÷ servings), for the serving-row weight
  // hint. Undefined for foods (no servings).
  gramsPerServing?: number | undefined;
  // kcal for a given portion, or null when it can't be computed (no item / no weight).
  kcalFor: (unit: FoodLogUnit, quantity: number) => number | null;
  onChange: (choice: PortionChoice | null) => void;
}

// Fitatu-style portion selector: pick a preset (1 serving / 100 g) or type a custom
// amount, each row showing its live calories. Emits the chosen {unit, quantity} (or
// null when a custom input is empty/invalid) to the parent for logging.
export function PortionPicker({ mode, gramsPerServing, kcalFor, onChange }: PortionPickerProps) {
  const options = mode === 'food' ? FOOD_OPTIONS : RECIPE_OPTIONS;
  const [selected, setSelected] = useState(options[0]!.id);
  const [gramsInput, setGramsInput] = useState('');
  const [servingsInput, setServingsInput] = useState('');

  // Reset to the first preset when switching food/recipe.
  useEffect(() => {
    setSelected((mode === 'food' ? FOOD_OPTIONS : RECIPE_OPTIONS)[0]!.id);
  }, [mode]);

  const quantityOf = (option: PortionOption): number | null => {
    if (option.quantity !== null) return option.quantity;
    const raw = option.unit === 'grams' ? gramsInput : servingsInput;
    const n = Number(raw);
    return raw.trim() !== '' && Number.isFinite(n) && n > 0 ? n : null;
  };

  // Report the current choice up whenever the selection or inputs change.
  useEffect(() => {
    const opts = mode === 'food' ? FOOD_OPTIONS : RECIPE_OPTIONS;
    const current = opts.find((o) => o.id === selected) ?? opts[0]!;
    let quantity: number | null = current.quantity;
    if (quantity === null) {
      const raw = current.unit === 'grams' ? gramsInput : servingsInput;
      const n = Number(raw);
      quantity = raw.trim() !== '' && Number.isFinite(n) && n > 0 ? n : null;
    }
    onChange(quantity !== null ? { unit: current.unit, quantity } : null);
  }, [selected, gramsInput, servingsInput, mode, onChange]);

  return (
    <div className="flex flex-col gap-1.5">
      {options.map((option) => {
        const isSelected = option.id === selected;
        const quantity = quantityOf(option);
        const kcal = quantity !== null ? kcalFor(option.unit, quantity) : null;
        // For serving portions, the gram equivalent (quantity × grams-per-serving).
        const gramsHint =
          option.unit === 'servings' && gramsPerServing !== undefined && quantity !== null
            ? `${Math.round(quantity * gramsPerServing)} g`
            : null;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => setSelected(option.id)}
            className={cn(
              'flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors',
              isSelected ? 'border-primary bg-primary/5' : 'hover:bg-muted',
            )}
          >
            <span
              className={cn(
                'flex size-4 shrink-0 items-center justify-center rounded-full border',
                isSelected ? 'border-primary' : 'border-muted-foreground/40',
              )}
            >
              {isSelected ? <span className="bg-primary size-2 rounded-full" /> : null}
            </span>
            {option.input ? (
              <div className="flex items-center gap-2">
                <Input
                  value={option.unit === 'grams' ? gramsInput : servingsInput}
                  onChange={(e) => {
                    if (option.unit === 'grams') setGramsInput(e.target.value);
                    else setServingsInput(e.target.value);
                    setSelected(option.id);
                  }}
                  onFocus={() => setSelected(option.id)}
                  inputMode="decimal"
                  placeholder="0"
                  className="h-9 w-20"
                />
                <span className="text-muted-foreground text-sm">
                  {option.unit === 'grams' ? 'g' : 'servings'}
                </span>
                {gramsHint ? (
                  <span className="text-muted-foreground text-xs">≈ {gramsHint}</span>
                ) : null}
              </div>
            ) : (
              <span className="font-medium">
                {option.label}
                {gramsHint ? (
                  <span className="text-muted-foreground ml-1.5 text-xs font-normal">
                    ({gramsHint})
                  </span>
                ) : null}
              </span>
            )}
            <span className="text-muted-foreground ml-auto text-sm font-medium">
              {kcal !== null ? `${Math.round(kcal)} kcal` : '—'}
            </span>
          </button>
        );
      })}
    </div>
  );
}
