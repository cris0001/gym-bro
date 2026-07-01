import { format, parseISO } from 'date-fns';
import { ChevronDown, ChevronRight, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import type { BodyMeasurement, NutritionTarget } from '@gym-bro/shared';

import { useDeleteBodyMeasurement } from '../hooks/use-delete-body-measurement';
import { useBodyUiStore } from '../stores/body-ui.store';
import { targetKcalForDate } from '../utils/trend-series';

// Shown only when a row is expanded (weight + calories are the always-visible
// summary). Body fat first, then circumferences.
type MeasureKey = 'bodyFatPct' | 'bicepsCm' | 'chestCm' | 'waistCm' | 'hipCm' | 'thighCm';

const SECONDARY: { key: MeasureKey; fmt: (v: number) => string }[] = [
  { key: 'bodyFatPct', fmt: (v) => `${v}% bf` },
  { key: 'bicepsCm', fmt: (v) => `biceps ${v}cm` },
  { key: 'chestCm', fmt: (v) => `chest ${v}cm` },
  { key: 'waistCm', fmt: (v) => `waist ${v}cm` },
  { key: 'hipCm', fmt: (v) => `hip ${v}cm` },
  { key: 'thighCm', fmt: (v) => `thigh ${v}cm` },
];

function secondarySummary(entry: BodyMeasurement): string {
  return SECONDARY.filter((d) => entry[d.key] !== null)
    .map((d) => d.fmt(entry[d.key]!))
    .join(' · ');
}

const hasMore = (entry: BodyMeasurement): boolean =>
  entry.notes !== null || SECONDARY.some((d) => entry[d.key] !== null);

// Split into month buckets, preserving the newest-first order of both the months
// and the rows within them.
function monthGroups(entries: BodyMeasurement[]) {
  const groups = new Map<string, BodyMeasurement[]>();
  for (const entry of entries) {
    const key = entry.measuredDate.slice(0, 7);
    const list = groups.get(key);
    if (list) list.push(entry);
    else groups.set(key, [entry]);
  }
  return [...groups.entries()].map(([key, items]) => ({
    key,
    label: format(parseISO(`${key}-01`), 'MMMM yyyy'),
    items,
  }));
}

function MeasurementRow({
  entry,
  targets,
}: {
  entry: BodyMeasurement;
  targets: NutritionTarget[];
}) {
  const openEdit = useBodyUiStore((s) => s.openEdit);
  const remove = useDeleteBodyMeasurement();
  const [expanded, setExpanded] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const kcal = targetKcalForDate(targets, entry.measuredDate);
  const more = hasMore(entry);

  return (
    <li className="py-2 text-sm">
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={!more}
          onClick={() => setExpanded((v) => !v)}
          className="flex min-w-0 flex-1 items-center gap-2 text-left disabled:cursor-default"
        >
          <span className="text-muted-foreground flex size-4 shrink-0 items-center justify-center">
            {more ? (
              expanded ? (
                <ChevronDown className="size-4" />
              ) : (
                <ChevronRight className="size-4" />
              )
            ) : null}
          </span>
          <span className="text-muted-foreground w-20 shrink-0">
            {format(parseISO(entry.measuredDate), 'd MMM yy')}
          </span>
          <span className="truncate">
            {entry.weightKg !== null ? `${entry.weightKg} kg` : '—'}
            {kcal !== null ? (
              <span className="text-muted-foreground"> · {Math.round(kcal)} kcal</span>
            ) : null}
          </span>
        </button>
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
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setConfirmOpen(false)}
              >
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
      </div>

      {expanded && more ? (
        <div className="text-muted-foreground mt-1 flex flex-col gap-1 pl-6 text-xs">
          {secondarySummary(entry) ? <span>{secondarySummary(entry)}</span> : null}
          {entry.notes ? (
            <span className="break-words whitespace-pre-wrap">{entry.notes}</span>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}

// The measurement history, grouped into collapsible months (newest first). Each
// row shows weight + the day's applicable target calories; body fat, circumferences
// and notes reveal on expand.
export function MeasurementList({
  entries,
  targets,
}: {
  entries: BodyMeasurement[];
  targets: NutritionTarget[];
}) {
  // Only the newest month is open by default; the rest collapse. `overrides` holds
  // groups the user has explicitly toggled, so their choice sticks per month.
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});

  if (entries.length === 0) {
    return <p className="text-muted-foreground py-4 text-sm">No measurements in this range.</p>;
  }

  return (
    <div className="flex flex-col divide-y">
      {monthGroups(entries).map((group, index) => {
        const open = overrides[group.key] ?? index === 0;
        return (
          <section key={group.key}>
            <button
              type="button"
              onClick={() => setOverrides((prev) => ({ ...prev, [group.key]: !open }))}
              className="flex w-full items-center gap-2 py-2.5 text-left"
            >
              {open ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
              <span className="font-medium">{group.label}</span>
              <span className="text-muted-foreground ml-auto text-xs">{group.items.length}</span>
            </button>
            {open ? (
              <ul className="divide-y border-t">
                {group.items.map((entry) => (
                  <MeasurementRow key={entry.id} entry={entry} targets={targets} />
                ))}
              </ul>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
