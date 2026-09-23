import { cn } from '@/lib/utils';

import { useNutritionTranslation } from '../i18n';
import { MACRO_BAR } from '../utils/macro-colors';

// Key for the dotted macro values below it: a coloured dot plus the macro's letter.
export function MacroLegend({ className }: { className?: string }) {
  const t = useNutritionTranslation();
  const items = [
    { key: 'protein', label: t.common.macroShort.protein },
    { key: 'carbs', label: t.common.macroShort.carbs },
    { key: 'fat', label: t.common.macroShort.fat },
  ] as const;

  return (
    <span
      className={cn(
        'text-muted-foreground inline-flex items-center gap-3 text-[11px] font-semibold',
        className,
      )}
    >
      {items.map(({ key, label }) => (
        <span key={key} className="inline-flex items-center gap-1">
          <span className={cn('size-1.5 rounded-full', MACRO_BAR[key])} aria-hidden />
          {label}
        </span>
      ))}
    </span>
  );
}
