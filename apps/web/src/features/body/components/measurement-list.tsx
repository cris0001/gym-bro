import { format, parseISO } from 'date-fns';
import { Pencil, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';

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

  return (
    <li className="flex items-center gap-2 py-3">
      <div className="min-w-0 flex-1">
        <p className="font-medium">{format(parseISO(entry.measuredDate), 'EEE, PP')}</p>
        <p className="text-muted-foreground truncate text-sm">{summarize(entry)}</p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-11 shrink-0"
        aria-label={`Edit ${entry.measuredDate}`}
        onClick={() => openEdit(entry)}
      >
        <Pencil className="size-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="text-destructive size-11 shrink-0"
        aria-label={`Delete ${entry.measuredDate}`}
        disabled={remove.isPending}
        onClick={() => remove.mutate(entry.id)}
      >
        <Trash2 className="size-4" />
      </Button>
    </li>
  );
}

// The measurement history, newest first. Each row summarizes that day's values
// with edit (loads the form) and delete actions.
export function MeasurementList({ entries }: { entries: BodyMeasurement[] }) {
  if (entries.length === 0) {
    return <p className="text-muted-foreground py-4 text-sm">No measurements yet.</p>;
  }
  return (
    <ul className="divide-y">
      {entries.map((entry) => (
        <MeasurementRow key={entry.id} entry={entry} />
      ))}
    </ul>
  );
}
