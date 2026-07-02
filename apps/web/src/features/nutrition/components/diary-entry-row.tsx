import { Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import type { FoodLogEntry } from '@gym-bro/shared';

import { useDeleteFoodLogEntry } from '../hooks/use-delete-food-log-entry';
import { useUpdateFoodLogEntry } from '../hooks/use-update-food-log-entry';

// Short unit label for the compact portion prefix.
function unitLabel(unit: FoodLogEntry['unit']): string {
  if (unit === 'servings') return 'serv';
  if (unit === 'units') return 'u';
  return 'g';
}

// One diary entry: the item name over a single very-compact line combining the
// portion with the macros ("1 serv · 930-10/22/33"). Tapping the item opens an
// inline quantity edit (the server rescales the macros); delete is low-stakes and
// easily re-added, so no confirm.
export function DiaryEntryRow({ entry }: { entry: FoodLogEntry }) {
  const remove = useDeleteFoodLogEntry();
  const update = useUpdateFoodLogEntry();
  const [editing, setEditing] = useState(false);
  const [quantity, setQuantity] = useState(String(entry.quantity));

  const label = unitLabel(entry.unit);
  const macros = `${Math.round(entry.kcal)}-${Math.round(entry.proteinG)}/${Math.round(
    entry.carbsG,
  )}/${Math.round(entry.fatG)}`;

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

  if (editing) {
    return (
      <li className="flex items-center gap-2 py-2">
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{entry.itemName}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <Input
              inputMode="decimal"
              aria-label="Quantity"
              className="h-9 w-20"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
            <span className="text-muted-foreground text-sm">{label}</span>
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
        </div>
      </li>
    );
  }

  return (
    <li className="flex items-center gap-2 py-2">
      <button
        type="button"
        className="min-w-0 flex-1 text-left"
        aria-label={`Edit ${entry.itemName}`}
        onClick={() => setEditing(true)}
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
