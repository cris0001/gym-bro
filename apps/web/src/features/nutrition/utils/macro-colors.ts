// Per-macro accent colors (Fitatu-style), shared by the day summary, the bottom
// bar, and any macro progress UI so the same nutrient always reads the same hue.
export type MacroKey = 'kcal' | 'protein' | 'carbs' | 'fat';

// Plum & Parchment palette: kcal + protein plum, carbs gold, fat green.
export const MACRO_BAR: Record<MacroKey, string> = {
  kcal: 'bg-[#8d4a5e]',
  protein: 'bg-[#8d4a5e]',
  carbs: 'bg-[#d9a441]',
  fat: 'bg-[#5a7a52]',
};

export const MACRO_TRACK: Record<MacroKey, string> = {
  kcal: 'bg-[#8d4a5e]/15',
  protein: 'bg-[#8d4a5e]/15',
  carbs: 'bg-[#d9a441]/15',
  fat: 'bg-[#5a7a52]/15',
};
