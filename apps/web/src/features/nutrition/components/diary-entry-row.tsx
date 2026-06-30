import { Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import type { FoodLogEntry } from '@gym-bro/shared';

import { useDeleteFoodLogEntry } from '../hooks/use-delete-food-log-entry';
import { useUpdateFoodLogEntry } from '../hooks/use-update-food-log-entry';
import { MacrosSummary } from './macros-summary';

// One diary entry: the snapshotted item with its quantity and macros. Tapping edit
// reveals an inline quantity field (the server rescales the macros); delete is
// low-stakes and easily re-added, so no confirm.
export function DiaryEntryRow({ entry }: { entry: FoodLogEntry }) {
  const remove = useDeleteFoodLogEntry();
  const update = useUpdateFoodLogEntry();
  const [editing, setEditing] = useState(false);
  const [quantity, setQuantity] = useState(String(entry.quantity));

  const unit = entry.unit === 'servings' ? (entry.quantity === 1 ? 'serving' : 'servings') : 'g';

  function save() {
    const amount = Number(quantity);
    if (!Number.isFinite(amount) || amount <= 0) return;
    update.mutate(
      { id: entry.id, input: { quantity: amount } },
      { onSuccess: () => setEditing(false) },
    );
  }

  function cancel() {
    setQuantity(String(entry.quantity));
    setEditing(false);
  }

  return (
    <li className="flex items-center gap-3 py-3">
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{entry.itemName}</p>
        {editing ? (
          <div className="mt-1 flex items-center gap-2">
            <Input
              inputMode="decimal"
              aria-label="Quantity"
              className="h-9 w-20"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
            <span className="text-muted-foreground text-sm">{unit}</span>
            <Button
              type="button"
              size="sm"
              className="h-9"
              disabled={update.isPending}
              onClick={save}
            >
              Save
            </Button>
            <Button type="button" size="sm" variant="ghost" className="h-9" onClick={cancel}>
              Cancel
            </Button>
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            {entry.quantity} {unit}
          </p>
        )}
      </div>

      {!editing && (
        <>
          <MacrosSummary macros={entry} />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-11 shrink-0"
            aria-label={`Edit ${entry.itemName}`}
            onClick={() => setEditing(true)}
          >
            <Pencil className="size-4" />
          </Button>
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
        </>
      )}
    </li>
  );
}
