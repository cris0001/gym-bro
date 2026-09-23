import { cn } from '@/lib/utils';

import { MACRO_BAR } from '../utils/macro-colors';

interface MacroValuesProps {
  protein: number;
  carbs: number;
  fat: number;
  className?: string;
}

// Protein / carbs / fat as three colour-dotted numbers — the compact macro line used
// in food and recipe rows. The dot colour is the macro key, so no letters are needed.
export function MacroValues({ protein, carbs, fat, className }: MacroValuesProps) {
  const items = [
    { key: 'protein', value: protein },
    { key: 'carbs', value: carbs },
    { key: 'fat', value: fat },
  ] as const;

  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      {items.map(({ key, value }) => (
        <span key={key} className="inline-flex items-center gap-1">
          <span className={cn('size-[5px] shrink-0 rounded-full', MACRO_BAR[key])} aria-hidden />
          {value}
        </span>
      ))}
    </span>
  );
}
