import { Skeleton } from '@/components/ui/skeleton';
import { LABEL_CLASS } from '@/lib/form-styles';
import { cn } from '@/lib/utils';

import { useNutritionTranslation } from '../i18n';

// Loading state for the daily-target form, in TargetsForm's shape: the effective-date
// field (+ its hint), the large calories field, the three macro fields in a row, the
// calorie-split bar + caption, and the save button. Labels and the hint are real text
// (they don't depend on data); only the fields pulse.
const label = cn('flex items-center leading-none', LABEL_CLASS);

export function TargetsFormSkeleton() {
  const t = useNutritionTranslation();
  const macros = [
    { name: 'proteinG', color: 'text-[#8d4a5e] dark:text-[#f0bccb]' },
    { name: 'carbsG', color: 'text-[#b8862a] dark:text-[#d9a441]' },
    { name: 'fatG', color: 'text-[#5a7a52] dark:text-[#8fae85]' },
  ] as const;

  return (
    <div aria-hidden className="grid gap-3">
      <div className="grid gap-2">
        <span className={label}>{t.targets.effectiveDate}</span>
        <Skeleton className="h-10 w-full max-w-[220px] rounded-xl" />
        <p className="text-muted-foreground text-[12px]">{t.targets.effectiveDateHint}</p>
      </div>

      <div className="grid gap-2">
        <span className={label}>{t.common.macroFields.kcal}</span>
        <Skeleton className="h-11 w-full rounded-xl" />
      </div>

      <div className="grid grid-cols-3 items-end gap-3">
        {macros.map(({ name, color }) => (
          <div key={name} className="grid gap-2">
            <span className={cn(label, color)}>{t.common.macroFields[name]}</span>
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        ))}
      </div>

      <div className="grid gap-2">
        <Skeleton className="h-2 w-full rounded-full" />
        <div className="flex h-[19px] items-center">
          <Skeleton className="h-3 w-3/5" />
        </div>
      </div>

      <Skeleton className="h-10 w-full rounded-full" />
    </div>
  );
}
