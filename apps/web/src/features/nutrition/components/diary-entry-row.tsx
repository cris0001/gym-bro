import { Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import type { FoodLogEntry } from '@gym-bro/shared';

import { useDeleteFoodLogEntry } from '../hooks/use-delete-food-log-entry';
import { EntryEditForm } from './entry-edit-form';

// Short unit label for the compact portion prefix.
function unitLabel(unit: FoodLogEntry['unit']): string {
  if (unit === 'servings') return 'serv';
  if (unit === 'units') return 'u';
  return 'g';
}

// One diary entry: name over its portion on the left, serif kcal on the right. Tapping
// the item edits it — by default via the inline portion editor; when `onEdit` is given
// (e.g. in the add sheet) the tap is delegated there. Delete is low-stakes, no confirm.
export function DiaryEntryRow({
  entry,
  onEdit,
  highlighted = false,
}: {
  entry: FoodLogEntry;
  onEdit?: (entry: FoodLogEntry) => void;
  // Tints the row when it's the one currently loaded into an external edit form.
  highlighted?: boolean;
}) {
  const remove = useDeleteFoodLogEntry();
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <li className="py-2">
        <p className="truncate font-semibold">{entry.itemName}</p>
        <EntryEditForm entry={entry} onDone={() => setEditing(false)} />
      </li>
    );
  }

  return (
    <li
      className={cn(
        'flex items-center gap-3 py-2.5',
        highlighted && 'bg-accent -mx-2 rounded-lg px-2',
      )}
    >
      {entry.imageUrl ? (
        <img
          src={entry.imageUrl}
          alt=""
          className="bg-muted size-9 shrink-0 rounded-lg border object-cover"
        />
      ) : null}
      <button
        type="button"
        className="min-w-0 flex-1 text-left"
        aria-label={`Edit ${entry.itemName}`}
        onClick={() => (onEdit ? onEdit(entry) : setEditing(true))}
      >
        <p className="flex items-center gap-1.5 truncate font-semibold">
          <span className="truncate">{entry.itemName}</span>
          {entry.source === 'ai' ? (
            <span className="bg-primary/10 text-primary shrink-0 rounded px-1 py-0.5 text-[10px] font-semibold tracking-wide uppercase">
              AI
            </span>
          ) : null}
        </p>
        <p className="text-muted-foreground text-[11px] leading-tight">
          {entry.quantity} {unitLabel(entry.unit)}
        </p>
      </button>
      <span className="font-heading shrink-0 text-base font-semibold">
        {Math.round(entry.kcal)}
        <span className="text-muted-foreground ml-0.5 text-[11px] font-normal">kcal</span>
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="text-destructive size-9 shrink-0"
        aria-label={`Remove ${entry.itemName}`}
        disabled={remove.isPending}
        onClick={() => remove.mutate(entry.id)}
      >
        <Trash2 className="size-4" />
      </Button>
    </li>
  );
}
