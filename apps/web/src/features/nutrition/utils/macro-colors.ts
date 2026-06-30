// Per-macro accent colors (Fitatu-style), shared by the day summary, the bottom
// bar, and any macro progress UI so the same nutrient always reads the same hue.
export type MacroKey = 'kcal' | 'protein' | 'carbs' | 'fat';

export const MACRO_BAR: Record<MacroKey, string> = {
  kcal: 'bg-sky-500',
  protein: 'bg-rose-500',
  carbs: 'bg-amber-500',
  fat: 'bg-violet-500',
};

export const MACRO_TRACK: Record<MacroKey, string> = {
  kcal: 'bg-sky-500/15',
  protein: 'bg-rose-500/15',
  carbs: 'bg-amber-500/15',
  fat: 'bg-violet-500/15',
};
