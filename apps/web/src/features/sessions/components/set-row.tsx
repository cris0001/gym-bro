import { X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import type { DraftSet } from '../stores/workout-draft.store';
import { useWorkoutDraftStore } from '../stores/workout-draft.store';

interface SetRowProps {
  performanceId: string;
  set: DraftSet;
  index: number;
}

// Parses a numeric input back to a number or null (empty = not recorded). Range
// validation is deferred to the finish step; here we only keep it numeric.
function parseField(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === '') return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

const toValue = (n: number | null): string => (n === null ? '' : String(n));

// One logged set: weight × reps × optional RIR, plus remove. Inputs use numeric
// keyboards (decimal for weight) and write straight to the draft store. The
// header labels live in the parent card, so this is just the value row.
export function SetRow({ performanceId, set, index }: SetRowProps) {
  const updateSet = useWorkoutDraftStore((s) => s.updateSet);
  const removeSet = useWorkoutDraftStore((s) => s.removeSet);

  return (
    <div className="grid grid-cols-[1.5rem_1fr_1fr_1fr_2.25rem] items-center gap-2">
      <span className="text-muted-foreground text-center text-sm font-medium">{index + 1}</span>

      <Input
        inputMode="decimal"
        aria-label={`Set ${index + 1} weight`}
        placeholder="—"
        className="h-11 text-center"
        value={toValue(set.weight)}
        onChange={(e) => updateSet(performanceId, set.id, { weight: parseField(e.target.value) })}
      />
      <Input
        inputMode="numeric"
        aria-label={`Set ${index + 1} reps`}
        placeholder="—"
        className="h-11 text-center"
        value={toValue(set.reps)}
        onChange={(e) => updateSet(performanceId, set.id, { reps: parseField(e.target.value) })}
      />
      <Input
        inputMode="numeric"
        aria-label={`Set ${index + 1} RIR`}
        placeholder="—"
        className="h-11 text-center"
        value={toValue(set.rir)}
        onChange={(e) => updateSet(performanceId, set.id, { rir: parseField(e.target.value) })}
      />

      <Button
        variant="ghost"
        size="icon"
        className="size-9"
        aria-label={`Remove set ${index + 1}`}
        onClick={() => removeSet(performanceId, set.id)}
      >
        <X className="size-4" />
      </Button>
    </div>
  );
}
