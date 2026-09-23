import { format, parseISO } from 'date-fns';

import { EditIconButton } from '@/components/edit-icon-button';
import { SkeletonList } from '@/components/skeletons';
import { cn } from '@/lib/utils';

import type { NutritionTarget } from '@gym-bro/shared';

import { useTargets } from '../hooks/use-targets';
import { useNutritionTranslation } from '../i18n';

const fmt = (n: number): string => Math.round(n).toLocaleString('en-US');

// Past targets, newest first (the API returns them oldest-first for charting). Each
// row carries a slim bar on the left — plum for the target in force, muted for the
// rest. Editing a row loads it into the form (parent-owned via onEdit).
export function TargetsHistory({ onEdit }: { onEdit: (target: NutritionTarget) => void }) {
  const t = useNutritionTranslation();
  const { data: targets = [], isPending } = useTargets();

  if (isPending) {
    return <SkeletonList rows={3} avatar={false} />;
  }
  if (targets.length === 0) {
    return <p className="text-muted-foreground text-sm">{t.targets.noHistory}</p>;
  }

  const ordered = [...targets].reverse();
  const short = t.common.macroShort;

  return (
    <ul className="divide-y divide-dashed divide-[#e4dad2] dark:divide-[#2f292d]">
      {ordered.map((target, index) => {
        const current = index === 0;
        return (
          <li key={target.id} className="flex items-center gap-3 py-3.5">
            <span
              aria-hidden
              className={cn(
                'w-1 shrink-0 self-stretch rounded-full',
                current ? 'bg-[#8d4a5e]' : 'bg-[#e8e1da] dark:bg-[#2f292d]',
              )}
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-heading text-[19px] leading-tight font-semibold">
                  {fmt(target.kcal)} kcal
                </p>
                {current ? (
                  <span className="bg-accent text-accent-foreground rounded-full px-2 py-0.5 text-[10px] font-bold tracking-[0.08em] uppercase">
                    {t.targets.current}
                  </span>
                ) : null}
              </div>
              <p className="text-muted-foreground mt-0.5 text-[12px]">
                {t.targets.since(format(parseISO(target.effectiveDate), 'PP'))} · {short.protein}{' '}
                {Math.round(target.proteinG)} · {short.carbs} {Math.round(target.carbsG)} ·{' '}
                {short.fat} {Math.round(target.fatG)}
              </p>
            </div>
            <EditIconButton
              aria-label={t.targets.editAria(target.effectiveDate)}
              onClick={() => onEdit(target)}
            />
          </li>
        );
      })}
    </ul>
  );
}
