// Per-macro accent colors (Fitatu-style), shared by the day summary, the bottom
// bar, and any macro progress UI so the same nutrient always reads the same hue.
export type MacroKey = 'kcal' | 'protein' | 'carbs' | 'fat';

// Colors come from the --macro-* tokens in globals.css: kcal + protein follow the
// palette accent, carbs amber, fat teal.
export const MACRO_BAR: Record<MacroKey, string> = {
  kcal: 'bg-macro-protein',
  protein: 'bg-macro-protein',
  carbs: 'bg-macro-carbs',
  fat: 'bg-macro-fat',
};

export const MACRO_TRACK: Record<MacroKey, string> = {
  kcal: 'bg-macro-protein/15',
  protein: 'bg-macro-protein/15',
  carbs: 'bg-macro-carbs/15',
  fat: 'bg-macro-fat/15',
};
