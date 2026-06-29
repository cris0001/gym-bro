import { Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';

import type { FoodLogEntry } from '@gym-bro/shared';

import { useDeleteFoodLogEntry } from '../hooks/use-delete-food-log-entry';
import { MacrosSummary } from './macros-summary';

// One diary entry: the snapshotted item with its quantity and macros, plus a
// quick delete (low-stakes and easily re-added, so no confirm).
export function DiaryEntryRow({ entry }: { entry: FoodLogEntry }) {
  const remove = useDeleteFoodLogEntry();
  const unit = entry.unit === 'servings' ? (entry.quantity === 1 ? 'serving' : 'servings') : 'g';

  return (
    <li className="flex items-center gap-3 py-3">
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{entry.itemName}</p>
        <p className="text-muted-foreground text-sm">
          {entry.quantity} {unit}
        </p>
      </div>
      <MacrosSummary macros={entry} />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="text-destructive size-11 shrink-0"
        aria-label={`Remove ${entry.itemName}`}
        disabled={remove.isPending}
        onClick={() => remove.mutate(entry.id)}
      >
        <Trash2 className="size-4" />
      </Button>
    </li>
  );
}
