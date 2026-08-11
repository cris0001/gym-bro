import { format, parseISO } from 'date-fns';
import { Pencil } from 'lucide-react';

import { SkeletonList } from '@/components/skeletons';
import { Button } from '@/components/ui/button';

import type { NutritionTarget } from '@gym-bro/shared';

import { useTargets } from '../hooks/use-targets';

const fmt = (n: number): string => Math.round(n).toLocaleString('en-US');

// Past targets, newest first (the API returns them oldest-first for charting).
// Editing a row loads it into the form (parent-owned via onEdit).
export function TargetsHistory({ onEdit }: { onEdit: (target: NutritionTarget) => void }) {
  const { data: targets = [], isPending } = useTargets();

  if (isPending) {
    return <SkeletonList rows={3} />;
  }
  if (targets.length === 0) {
    return <p className="text-muted-foreground text-sm">No target history yet.</p>;
  }

  const ordered = [...targets].reverse();

  return (
    <ul className="divide-y divide-dashed divide-[#d9c9b2] dark:divide-[#41362a]">
      {ordered.map((target, index) => (
        <li key={target.id} className="flex items-start justify-between gap-3 py-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-heading text-lg font-semibold">{fmt(target.kcal)} kcal</p>
              {index === 0 ? (
                <span className="bg-accent text-accent-foreground rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-[0.08em] uppercase">
                  Current
                </span>
              ) : null}
            </div>
            <p className="text-muted-foreground text-xs">
              since {format(parseISO(target.effectiveDate), 'PP')} · P {Math.round(target.proteinG)}{' '}
              · C {Math.round(target.carbsG)} · F {Math.round(target.fatG)}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-muted-foreground size-9 shrink-0"
            aria-label={`Edit target for ${target.effectiveDate}`}
            onClick={() => onEdit(target)}
          >
            <Pencil className="size-4" />
          </Button>
        </li>
      ))}
    </ul>
  );
}
