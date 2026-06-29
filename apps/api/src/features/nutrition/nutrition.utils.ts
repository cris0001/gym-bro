import type { MacroTotals } from '@gym-bro/shared';

// Pure macro math for the nutrition domain — used to compute recipe totals and
// food-log snapshots. Full precision is kept here; the numeric columns round to
// 2 decimals on write.

const ZERO: MacroTotals = { kcal: 0, proteinG: 0, carbsG: 0, fatG: 0 };

// The macros a food contributes at a given gram amount (food macros are per 100g).
export function scaleMacros(per100g: MacroTotals, grams: number): MacroTotals {
  const factor = grams / 100;
  return {
    kcal: per100g.kcal * factor,
    proteinG: per100g.proteinG * factor,
    carbsG: per100g.carbsG * factor,
    fatG: per100g.fatG * factor,
  };
}

// Sum a list of macro totals (empty list = all zeros).
export function sumMacros(items: MacroTotals[]): MacroTotals {
  return items.reduce(
    (acc, m) => ({
      kcal: acc.kcal + m.kcal,
      proteinG: acc.proteinG + m.proteinG,
      carbsG: acc.carbsG + m.carbsG,
      fatG: acc.fatG + m.fatG,
    }),
    { ...ZERO },
  );
}

// Divide macro totals by a positive count (e.g. whole recipe -> per serving).
export function divideMacros(total: MacroTotals, divisor: number): MacroTotals {
  return {
    kcal: total.kcal / divisor,
    proteinG: total.proteinG / divisor,
    carbsG: total.carbsG / divisor,
    fatG: total.fatG / divisor,
  };
}

// Multiply macro totals by a factor (e.g. per-serving macros x servings logged,
// or rescaling a log snapshot by a quantity ratio).
export function multiplyMacros(macros: MacroTotals, factor: number): MacroTotals {
  return {
    kcal: macros.kcal * factor,
    proteinG: macros.proteinG * factor,
    carbsG: macros.carbsG * factor,
    fatG: macros.fatG * factor,
  };
}
