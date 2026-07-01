import { format, parseISO } from 'date-fns';
import { Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import type { BodyMeasurement } from '@gym-bro/shared';

import { useDeleteBodyMeasurement } from '../hooks/use-delete-body-measurement';
import { useBodyUiStore } from '../stores/body-ui.store';

// How each recorded field reads in a row's summary (weight first, then body fat,
// then circumferences). Only non-null fields are shown.
const DISPLAY = [
  { key: 'weightKg', fmt: (v: number) => `${v} kg` },
  { key: 'bodyFatPct', fmt: (v: number) => `${v}% bf` },
  { key: 'bicepsCm', fmt: (v: number) => `biceps ${v}cm` },
  { key: 'chestCm', fmt: (v: number) => `chest ${v}cm` },
  { key: 'waistCm', fmt: (v: number) => `waist ${v}cm` },
  { key: 'hipCm', fmt: (v: number) => `hip ${v}cm` },
  { key: 'thighCm', fmt: (v: number) => `thigh ${v}cm` },
] as const;

function summarize(entry: BodyMeasurement): string {
  return DISPLAY.filter((d) => entry[d.key] !== null)
    .map((d) => d.fmt(entry[d.key]!))
    .join(' · ');
}

function MeasurementRow({ entry }: { entry: BodyMeasurement }) {
  const openEdit = useBodyUiStore((s) => s.openEdit);
  const remove = useDeleteBodyMeasurement();
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <li className="flex items-start gap-2 py-2 text-sm">
      <span className="text-muted-foreground w-20 shrink-0 pt-1.5">
        {format(parseISO(entry.measuredDate), 'd MMM yy')}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5 pt-1.5">
        <span className="truncate">{summarize(entry)}</span>
        {entry.notes ? (
          <span className="text-muted-foreground text-xs break-words whitespace-pre-wrap">
            {entry.notes}
          </span>
        ) : null}
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-9 shrink-0"
        aria-label={`Edit ${entry.measuredDate}`}
        onClick={() => openEdit(entry)}
      >
        <Pencil className="size-4" />
      </Button>
      <Popover open={confirmOpen} onOpenChange={setConfirmOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-destructive size-9 shrink-0"
            aria-label={`Delete ${entry.measuredDate}`}
          >
            <Trash2 className="size-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-60">
          <p className="text-sm font-medium">Delete this entry?</p>
          <p className="text-muted-foreground text-sm">This can’t be undone.</p>
          <div className="mt-3 flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={remove.isPending}
              onClick={() => remove.mutate(entry.id, { onSuccess: () => setConfirmOpen(false) })}
            >
              Delete
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </li>
  );
}

// The measurement history, newest first. Each row summarizes that day's values
// with edit (loads the form) and delete actions.
export function MeasurementList({ entries }: { entries: BodyMeasurement[] }) {
  if (entries.length === 0) {
    return <p className="text-muted-foreground py-4 text-sm">No measurements in this range.</p>;
  }
  return (
    <ul className="divide-y">
      {entries.map((entry) => (
        <MeasurementRow key={entry.id} entry={entry} />
      ))}
    </ul>
  );
}
