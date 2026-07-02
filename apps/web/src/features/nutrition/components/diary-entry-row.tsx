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

// One diary entry: the item name over a single very-compact line combining the
// portion with the macros ("1 serv · 930-10/22/33"). Tapping the item edits it — by
// default via the inline full portion editor; when `onEdit` is given (e.g. in the add
// sheet, which already has a form) the tap is delegated there instead. Delete is
// low-stakes and easily re-added, so no confirm.
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
        <p className="truncate font-medium">{entry.itemName}</p>
        <EntryEditForm entry={entry} onDone={() => setEditing(false)} />
      </li>
    );
  }

  const label = unitLabel(entry.unit);
  const macros = `${Math.round(entry.kcal)}-${Math.round(entry.proteinG)}/${Math.round(
    entry.carbsG,
  )}/${Math.round(entry.fatG)}`;

  return (
    <li
      className={cn(
        'flex items-center gap-2 py-2',
        highlighted && 'bg-primary/10 -mx-2 rounded-md px-2',
      )}
    >
      <button
        type="button"
        className="min-w-0 flex-1 text-left"
        aria-label={`Edit ${entry.itemName}`}
        onClick={() => (onEdit ? onEdit(entry) : setEditing(true))}
      >
        <p className="truncate font-medium">{entry.itemName}</p>
        <p className="text-muted-foreground text-[11px] leading-tight">
          {entry.quantity} {label} · {macros}
        </p>
      </button>
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
