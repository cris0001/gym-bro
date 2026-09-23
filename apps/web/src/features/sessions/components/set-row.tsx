import { ChevronDown, X } from 'lucide-react';
import { type ReactNode, useEffect, useRef, useState } from 'react';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

import { useSessionsTranslation } from '../i18n';
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

// One logged set: weight × reps × optional RIR, set type, and a remove ✕ — no status
// marker (the row is the fields themselves). Set type is chosen inline (desktop: Top
// set / BW chips after the fields) or under the row via a chevron (mobile: Top set /
// BW / Clear). A bodyweight set replaces the weight input with "BW". Weight uses a
// decimal keyboard (e.g. 10.2). Inputs keep their own strings so a partial "2."
// survives while typing; header labels live in the parent card.
export function SetRow({ performanceId, set, index, isCurrent = false }: SetRowProps) {
  const updateSet = useWorkoutDraftStore((s) => s.updateSet);
  const removeSet = useWorkoutDraftStore((s) => s.removeSet);
  const toggleTopSet = useWorkoutDraftStore((s) => s.toggleTopSet);
  const toggleBodyweight = useWorkoutDraftStore((s) => s.toggleBodyweight);
  const t = useSessionsTranslation();

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
    'h-10 rounded-[10px] border-border bg-secondary text-center font-heading text-base font-semibold',
    isCurrent && 'border-primary border-[1.5px] dark:border-primary',
  );
  const iconBtn =
    'text-muted-foreground hover:text-foreground flex size-8 shrink-0 items-center justify-center transition-colors';

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5 md:gap-2">
        {/* Set number. A top set carries a plum-tinted badge; the rest are a quiet
            serif numeral. */}
        <span
          className={cn(
            'font-heading flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
            set.isTopSet ? 'bg-accent text-accent-foreground' : 'text-[#c9bcb2]',
          )}
        >
          {index + 1}
        </span>

        {set.isBodyweight ? (
          <div
            className="text-muted-foreground flex h-10 flex-1 items-center justify-center rounded-[10px] border border-border bg-secondary text-sm font-medium md:w-[110px] md:flex-none"
            aria-label={t.setRow.bodyweightAria(index + 1)}
          >
            BW
          </div>
        ) : (
          <Input
            inputMode="decimal"
            aria-label={t.setRow.weightAria(index + 1)}
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
          aria-label={t.setRow.repsAria(index + 1)}
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
          aria-label={t.setRow.rirAria(index + 1)}
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
            {t.setRow.topSet}
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
          aria-label={t.setRow.typeAria(index + 1)}
          aria-expanded={expanded}
          onClick={() => setExpanded((value) => !value)}
        >
          <ChevronDown className={cn('size-4 transition-transform', !expanded && '-rotate-90')} />
        </button>
        <button
          type="button"
          className={iconBtn}
          aria-label={t.setRow.removeAria(index + 1)}
          onClick={() => removeSet(performanceId, set.id)}
        >
          <X className="size-4" />
        </button>
      </div>

      {expanded && (
        <div className="flex items-center gap-2 pl-9 md:hidden">
          <span className="text-muted-foreground text-xs">{t.setRow.setTypeLabel}</span>
          <TypeChip active={set.isTopSet} onClick={() => toggleTopSet(performanceId, set.id)}>
            {t.setRow.topSet}
          </TypeChip>
          <TypeChip
            active={set.isBodyweight}
            onClick={() => toggleBodyweight(performanceId, set.id)}
          >
            BW
          </TypeChip>
          <TypeChip active={false} onClick={clearType}>
            {t.setRow.clear}
          </TypeChip>
        </div>
      )}
    </div>
  );
}
