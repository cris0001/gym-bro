import { ChevronDown, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

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

// One logged set: weight × reps × optional RIR, plus a chevron that reveals the
// per-set Top-set / Bodyweight toggles (kept tucked away so the line stays tight),
// and remove. The collapsed line still shows status — a top set fills the index
// badge, a bodyweight set shows "BW" instead of a weight input. Weight uses a
// decimal keyboard (e.g. 10.2). Inputs keep their own strings so a partial "2."
// survives while typing; header labels live in the parent card.
export function SetRow({ performanceId, set, index }: SetRowProps) {
  const updateSet = useWorkoutDraftStore((s) => s.updateSet);
  const removeSet = useWorkoutDraftStore((s) => s.removeSet);
  const toggleTopSet = useWorkoutDraftStore((s) => s.toggleTopSet);
  const toggleBodyweight = useWorkoutDraftStore((s) => s.toggleBodyweight);

  const [weight, setWeight] = useState(() => toValue(set.weight));
  const [reps, setReps] = useState(() => toValue(set.reps));
  const [rir, setRir] = useState(() => toValue(set.rir));
  const [expanded, setExpanded] = useState(false);

  // Only when bodyweight is turned OFF, clear the local weight string (it was
  // nulled in the store) so the re-shown input starts empty rather than stale. A
  // ref tracks the previous flag so this fires on the transition, not on each
  // keystroke (which would clobber a half-typed decimal like "2.").
  const wasBodyweight = useRef(set.isBodyweight);
  useEffect(() => {
    if (wasBodyweight.current && !set.isBodyweight) setWeight('');
    wasBodyweight.current = set.isBodyweight;
  }, [set.isBodyweight]);

  return (
    <div className="flex flex-col gap-1">
      <div className="grid grid-cols-[1.5rem_1fr_1fr_1fr_2rem_2rem] items-center gap-2">
        <span
          className={cn(
            'mx-auto flex size-6 items-center justify-center rounded-full text-xs font-semibold',
            set.isTopSet ? 'bg-primary text-primary-foreground' : 'text-muted-foreground',
          )}
        >
          {index + 1}
        </span>

        {set.isBodyweight ? (
          <div
            className="border-input text-muted-foreground flex h-11 items-center justify-center rounded-md border text-sm font-medium"
            aria-label={`Set ${index + 1} bodyweight`}
          >
            BW
          </div>
        ) : (
          <Input
            inputMode="decimal"
            aria-label={`Set ${index + 1} weight`}
            placeholder="—"
            className="h-11 text-center"
            value={weight}
            onChange={(e) => {
              setWeight(e.target.value);
              updateSet(performanceId, set.id, { weight: parseField(e.target.value) });
            }}
          />
        )}
        <Input
          inputMode="numeric"
          aria-label={`Set ${index + 1} reps`}
          placeholder="—"
          className="h-11 text-center"
          value={reps}
          onChange={(e) => {
            setReps(e.target.value);
            updateSet(performanceId, set.id, { reps: parseField(e.target.value) });
          }}
        />
        <Input
          inputMode="numeric"
          aria-label={`Set ${index + 1} RIR`}
          placeholder="—"
          className="h-11 text-center"
          value={rir}
          onChange={(e) => {
            setRir(e.target.value);
            updateSet(performanceId, set.id, { rir: parseField(e.target.value) });
          }}
        />

        <Button
          variant="ghost"
          size="icon"
          className="size-9"
          aria-label={`Set ${index + 1} options`}
          aria-expanded={expanded}
          onClick={() => setExpanded((value) => !value)}
        >
          <ChevronDown className={cn('size-4 transition-transform', !expanded && '-rotate-90')} />
        </Button>
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

      {expanded && (
        <div className="flex gap-2 pl-8">
          <Button
            type="button"
            variant={set.isTopSet ? 'default' : 'outline'}
            size="sm"
            className="h-8"
            onClick={() => toggleTopSet(performanceId, set.id)}
          >
            Top set
          </Button>
          <Button
            type="button"
            variant={set.isBodyweight ? 'default' : 'outline'}
            size="sm"
            className="h-8"
            onClick={() => toggleBodyweight(performanceId, set.id)}
          >
            Bodyweight
          </Button>
        </div>
      )}
    </div>
  );
}
