import type { MacroTotals } from '@gym-bro/shared';

// kcal reads as a whole number; grams to at most one decimal (per-serving values
// come from division, so they can be long).
function fmtKcal(n: number): string {
  return Math.round(n).toString();
}

function fmtGrams(n: number): string {
  const rounded = Math.round(n * 10) / 10;
  return Number.isInteger(rounded) ? rounded.toString() : rounded.toFixed(1);
}

interface MacrosSummaryProps {
  macros: MacroTotals;
  label?: string;
}

// Compact macro readout: kcal emphasized, then protein/carbs/fat in grams.
export function MacrosSummary({ macros, label }: MacrosSummaryProps) {
  return (
    <div>
      {label ? <p className="text-muted-foreground text-xs">{label}</p> : null}
      <p className="font-semibold">{fmtKcal(macros.kcal)} kcal</p>
      <p className="text-muted-foreground text-sm">
        P {fmtGrams(macros.proteinG)}g · C {fmtGrams(macros.carbsG)}g · F {fmtGrams(macros.fatG)}g
      </p>
    </div>
  );
}
