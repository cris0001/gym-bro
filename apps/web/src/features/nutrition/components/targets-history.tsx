import { format, parseISO } from 'date-fns';
import { Pencil } from 'lucide-react';

import { Button } from '@/components/ui/button';

import type { NutritionTarget } from '@gym-bro/shared';

import { useTargets } from '../hooks/use-targets';
import { MacrosSummary } from './macros-summary';

// Past targets, newest first (the API returns them oldest-first for charting).
// Editing a row loads it into the form (parent-owned via onEdit).
export function TargetsHistory({ onEdit }: { onEdit: (target: NutritionTarget) => void }) {
  const { data: targets = [], isPending } = useTargets();

  if (isPending) {
    return <p className="text-muted-foreground text-sm">Loading…</p>;
  }
  if (targets.length === 0) {
    return <p className="text-muted-foreground text-sm">No target history yet.</p>;
  }

  const ordered = [...targets].reverse();

  return (
    <ul className="divide-y">
      {ordered.map((target) => (
        <li key={target.id} className="flex items-center justify-between gap-3 py-3">
          <p className="text-sm font-medium">{format(parseISO(target.effectiveDate), 'PP')}</p>
          <div className="flex items-center gap-2">
            <MacrosSummary macros={target} />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-9 shrink-0"
              aria-label={`Edit target for ${target.effectiveDate}`}
              onClick={() => onEdit(target)}
            >
              <Pencil className="size-4" />
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
