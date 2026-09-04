import { Check, ChevronDown, Star, X } from 'lucide-react';
import { type ReactNode, useEffect, useRef, useState } from 'react';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

import type { DraftSet } from '../stores/workout-draft.store';
import { useWorkoutDraftStore } from '../stores/workout-draft.store';

interface SetRowProps {
  performanceId: string;
  set: DraftSet;
  index: number;
  // The first not-yet-logged set of its exercise — highlighted as the one you're on.
  isCurrent?: boolean;
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

// The round status marker at the start of the row. Done + top set = a plum-tinted
// star; a normal done set = a green check; otherwise the set number, filled plum for
// the current/top set and outlined for the rest.
function StatusBadge({
  done,
  isTopSet,
  isCurrent,
  index,
}: {
  done: boolean;
  isTopSet: boolean;
  isCurrent: boolean;
  index: number;
}) {
  const base =
    'flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold';
  if (done && isTopSet) {
    return (
      <span className={cn(base, 'bg-accent text-primary')}>
        <Star className="size-3.5 fill-current" />
      </span>
    );
  }
  if (done) {
    return (
      <span
        className={cn(base, 'bg-[#e8efe4] text-[#5a7a52] dark:bg-[#2f3a2b] dark:text-[#8fae85]')}
      >
        <Check className="size-3.5" />
      </span>
    );
  }
  return (
    <span
      className={cn(
        base,
        isCurrent || isTopSet
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground border bg-background',
      )}
    >
      {index + 1}
    </span>
  );
}

// One set-type chip (Top set / BW / Clear). Selected = filled plum; unselected =
// the warm secondary pill. Clear reuses the unselected look.
function TypeChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors',
        active
          ? 'bg-primary text-primary-foreground'
          : 'bg-secondary text-muted-foreground hover:bg-secondary/70',
      )}
    >
      {children}
    </button>
  );
}

// One logged set: weight × reps × optional RIR. Set type is chosen inline (desktop:
// Top set / BW chips after the fields) or under the row via a chevron (mobile: Top
// set / BW / Clear). The status badge shows a green check for a done set and a plum
// star for a done top set; a bodyweight set replaces the weight input with "BW".
// Weight uses a decimal keyboard (e.g. 10.2). Inputs keep their own strings so a
// partial "2." survives while typing; header labels live in the parent card.
export function SetRow({ performanceId, set, index, isCurrent = false }: SetRowProps) {
  // A set counts as logged once it has reps.
  const done = set.reps !== null;
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

  // Clears the set type back to a plain set (mobile "Clear").
  function clearType() {
    if (set.isTopSet) toggleTopSet(performanceId, set.id);
    if (set.isBodyweight) toggleBodyweight(performanceId, set.id);
  }

  const field = cn(
    'h-10 rounded-[10px] text-center font-heading text-base font-semibold',
    isCurrent && 'border-primary border-[1.5px]',
  );
  const iconBtn =
    'text-muted-foreground hover:text-foreground flex size-8 shrink-0 items-center justify-center transition-colors';

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5 md:gap-2">
        <StatusBadge done={done} isTopSet={set.isTopSet} isCurrent={isCurrent} index={index} />

        {set.isBodyweight ? (
          <div
            className="border-input text-muted-foreground flex h-10 flex-1 items-center justify-center rounded-[10px] border bg-background text-sm font-medium md:w-[110px] md:flex-none"
            aria-label={`Set ${index + 1} bodyweight`}
          >
            BW
          </div>
        ) : (
          <Input
            inputMode="decimal"
            aria-label={`Set ${index + 1} weight`}
            placeholder="—"
            className={cn('flex-1 md:w-[110px] md:flex-none', field)}
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
          className={cn('flex-1 md:w-[110px] md:flex-none', field)}
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
          className={cn('flex-1 md:w-[90px] md:flex-none', field)}
          value={rir}
          onChange={(e) => {
            setRir(e.target.value);
            updateSet(performanceId, set.id, { rir: parseField(e.target.value) });
          }}
        />

        {/* Desktop: set-type chips inline after the fields (fill the row so X sits at the end). */}
        <div className="hidden items-center gap-1.5 md:flex md:flex-1">
          <TypeChip active={set.isTopSet} onClick={() => toggleTopSet(performanceId, set.id)}>
            Top set
          </TypeChip>
          <TypeChip
            active={set.isBodyweight}
            onClick={() => toggleBodyweight(performanceId, set.id)}
          >
            BW
          </TypeChip>
        </div>

        {/* Mobile: a chevron reveals the set-type chips under the row. */}
        <button
          type="button"
          className={cn(iconBtn, 'md:hidden')}
          aria-label={`Set ${index + 1} type`}
          aria-expanded={expanded}
          onClick={() => setExpanded((value) => !value)}
        >
          <ChevronDown className={cn('size-4 transition-transform', !expanded && '-rotate-90')} />
        </button>
        <button
          type="button"
          className={iconBtn}
          aria-label={`Remove set ${index + 1}`}
          onClick={() => removeSet(performanceId, set.id)}
        >
          <X className="size-4" />
        </button>
      </div>

      {expanded && (
        <div className="flex items-center gap-2 pl-9 md:hidden">
          <span className="text-muted-foreground text-xs">Set type:</span>
          <TypeChip active={set.isTopSet} onClick={() => toggleTopSet(performanceId, set.id)}>
            Top set
          </TypeChip>
          <TypeChip
            active={set.isBodyweight}
            onClick={() => toggleBodyweight(performanceId, set.id)}
          >
            BW
          </TypeChip>
          <TypeChip active={false} onClick={clearType}>
            Clear
          </TypeChip>
        </div>
      )}
    </div>
  );
}
