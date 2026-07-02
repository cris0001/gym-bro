import { useEffect, useMemo, useState } from 'react';

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

// Build the preset list from what the item supports: grams are always available;
// servings / units appear only when the item has that size. Presets first (1 serving,
// 1 unit, 100 g), then the custom inputs.
function buildOptions(hasServings: boolean, hasUnits: boolean): PortionOption[] {
  const options: PortionOption[] = [];
  if (hasServings) options.push({ id: 's1', label: '1 serving', unit: 'servings', quantity: 1 });
  if (hasUnits) options.push({ id: 'u1', label: '1 unit', unit: 'units', quantity: 1 });
  options.push({ id: 'g100', label: '100 g', unit: 'grams', quantity: 100 });
  if (hasServings)
    options.push({ id: 'sx', label: 'Servings', unit: 'servings', quantity: null, input: true });
  if (hasUnits)
    options.push({ id: 'ux', label: 'Units', unit: 'units', quantity: null, input: true });
  options.push({ id: 'gx', label: 'Grams', unit: 'grams', quantity: null, input: true });
  return options;
}

export interface PortionChoice {
  unit: FoodLogUnit;
  quantity: number;
}

interface PortionPickerProps {
  // Whether the item can be logged by serving / by unit (recipe, or a product with
  // a serving / unit size). Grams are always available.
  hasServings: boolean;
  hasUnits: boolean;
  // Grams in one serving / one unit, for the weight hints. Undefined when unknown.
  gramsPerServing?: number | undefined;
  gramsPerUnit?: number | undefined;
  // kcal for a given portion, or null when it can't be computed (no item / no weight).
  kcalFor: (unit: FoodLogUnit, quantity: number) => number | null;
  onChange: (choice: PortionChoice | null) => void;
}

// Fitatu-style portion selector: pick a preset (1 serving / 1 unit / 100 g) or type a
// custom amount, each row showing its live calories. Emits the chosen {unit, quantity}
// (or null when a custom input is empty/invalid) to the parent for logging.
export function PortionPicker({
  hasServings,
  hasUnits,
  gramsPerServing,
  gramsPerUnit,
  kcalFor,
  onChange,
}: PortionPickerProps) {
  const options = useMemo(() => buildOptions(hasServings, hasUnits), [hasServings, hasUnits]);
  const [selected, setSelected] = useState(options[0]!.id);
  // Custom-input value per unit, keyed by unit.
  const [inputs, setInputs] = useState<Record<FoodLogUnit, string>>({
    grams: '',
    servings: '',
    units: '',
  });

  // Reset to the first preset when the option set changes (different item shape).
  useEffect(() => {
    setSelected(options[0]!.id);
  }, [options]);

  const gramsPerUnitOf = (unit: FoodLogUnit): number | undefined =>
    unit === 'servings' ? gramsPerServing : unit === 'units' ? gramsPerUnit : undefined;

  const quantityOf = (option: PortionOption): number | null => {
    if (option.quantity !== null) return option.quantity;
    const raw = inputs[option.unit];
    const n = Number(raw);
    return raw.trim() !== '' && Number.isFinite(n) && n > 0 ? n : null;
  };

  // Report the current choice up whenever the selection or inputs change.
  useEffect(() => {
    const current = options.find((o) => o.id === selected) ?? options[0]!;
    let quantity: number | null = current.quantity;
    if (quantity === null) {
      const raw = inputs[current.unit];
      const n = Number(raw);
      quantity = raw.trim() !== '' && Number.isFinite(n) && n > 0 ? n : null;
    }
    onChange(quantity !== null ? { unit: current.unit, quantity } : null);
  }, [selected, inputs, options, onChange]);

  return (
    <div className="flex flex-col gap-1.5">
      {options.map((option) => {
        const isSelected = option.id === selected;
        const quantity = quantityOf(option);
        const kcal = quantity !== null ? kcalFor(option.unit, quantity) : null;
        // For serving/unit portions, the gram equivalent (quantity × grams-per-x).
        const gpx = gramsPerUnitOf(option.unit);
        const gramsHint =
          gpx !== undefined && quantity !== null ? `${Math.round(quantity * gpx)} g` : null;
        const inputLabel =
          option.unit === 'grams' ? 'g' : option.unit === 'servings' ? 'servings' : 'units';
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
                  value={inputs[option.unit]}
                  onChange={(e) => {
                    setInputs((prev) => ({ ...prev, [option.unit]: e.target.value }));
                    setSelected(option.id);
                  }}
                  onFocus={() => setSelected(option.id)}
                  inputMode="decimal"
                  placeholder="0"
                  className="h-9 w-20"
                />
                <span className="text-muted-foreground text-sm">{inputLabel}</span>
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
