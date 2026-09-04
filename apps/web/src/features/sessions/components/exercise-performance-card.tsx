import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeftRight, ChevronDown, Copy, FileText, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/lib/utils';
import { useConfirm } from '@/stores/confirm.store';

import { exerciseHistoryQueryOptions } from '../hooks/use-exercise-history';
import type { DraftPerformance } from '../stores/workout-draft.store';
import { useWorkoutDraftStore } from '../stores/workout-draft.store';
import { SessionPreviousLine } from './session-previous-line';
import { SetRow } from './set-row';

interface ExercisePerformanceCardProps {
  performance: DraftPerformance;
  onSwap: () => void;
}

// A short "weight × reps" label for the Copy-last button, taken from the last set.
function lastSetLabel(performance: DraftPerformance): string {
  const last = performance.sets.at(-1);
  if (!last) return 'Copy last';
  return `Copy last (${last.weight ?? 'BW'} × ${last.reps ?? '–'})`;
}

// One exercise within the active session. Collapsible so finished exercises can be
// tucked away (the header stays, inputs + history hide). Expanded shows the
// "Previous" strip, column headers, set rows, add-set actions, and a note. The
// header actions copy the previous session's sets, swap the exercise, or remove it.
export function ExercisePerformanceCard({ performance, onSwap }: ExercisePerformanceCardProps) {
  const addEmptySet = useWorkoutDraftStore((s) => s.addEmptySet);
  const copyLastSet = useWorkoutDraftStore((s) => s.copyLastSet);
  const replaceSets = useWorkoutDraftStore((s) => s.replaceSets);
  const removeExercise = useWorkoutDraftStore((s) => s.removeExercise);
  const setExerciseNotes = useWorkoutDraftStore((s) => s.setExerciseNotes);
  const performedDate = useWorkoutDraftStore((s) => s.draft?.performedDate);

  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const [expanded, setExpanded] = useState(false);
  const [showNote, setShowNote] = useState(performance.notes !== null);

  const isSwapped = performance.actualExerciseId !== performance.originalExerciseId;
  const setCount = performance.sets.length;
  // The set you're on: the first without reps yet (−1 when all are logged).
  const currentSetIndex = performance.sets.findIndex((entry) => entry.reps === null);

  // Copies the most recent prior session's sets into this exercise and expands it.
  // Fetched on demand (shares the limit-1 cache with the history panel) so we don't
  // query every collapsed card on start.
  async function handleCopyLast() {
    setExpanded(true);
    const history = await queryClient.fetchQuery(
      exerciseHistoryQueryOptions(performance.actualExerciseId, performedDate, 1),
    );
    const latest = history[0];
    if (latest) {
      // History sets carry weight/reps/rir/isTopSet; derive the client-only
      // bodyweight flag from a null weight.
      replaceSets(
        performance.id,
        latest.sets.map((s) => ({ ...s, isBodyweight: s.weight === null })),
      );
    }
  }

  async function handleRemove() {
    const ok = await confirm({
      title: 'Remove exercise?',
      description: `${performance.exerciseName} and its sets will be removed from this workout.`,
      confirmText: 'Remove',
      destructive: true,
    });
    if (ok) removeExercise(performance.id);
  }

  const iconBtn =
    'text-muted-foreground hover:bg-muted flex size-8 shrink-0 items-center justify-center rounded-[9px] border transition-colors';

  return (
    <div className="bg-card flex flex-col rounded-2xl border">
      <div className="flex items-center gap-2 p-3">
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
          aria-expanded={expanded}
        >
          <ChevronDown
            className={cn(
              'text-muted-foreground size-4 shrink-0 transition-transform',
              !expanded && '-rotate-90',
            )}
          />
          <span className="min-w-0">
            <span className="font-heading block truncate text-[18px] font-semibold">
              {performance.exerciseName}
            </span>
            <span className="text-muted-foreground block text-[11.5px]">
              {performance.category}
              {isSwapped && ' · swapped'}
              {setCount > 0 && ` · ${setCount} ${setCount === 1 ? 'set' : 'sets'}`}
            </span>
          </span>
        </button>

        <button
          type="button"
          className={iconBtn}
          aria-label="Copy sets from last training"
          onClick={() => void handleCopyLast()}
        >
          <Copy className="size-4" />
        </button>
        <button type="button" className={iconBtn} aria-label="Swap exercise" onClick={onSwap}>
          <ArrowLeftRight className="size-4" />
        </button>
        <button
          type="button"
          className={iconBtn}
          aria-label="Remove exercise"
          onClick={() => void handleRemove()}
        >
          <Trash2 className="size-4" />
        </button>
      </div>

      {expanded && (
        <div className="flex flex-col gap-3 border-t border-dashed px-3 pt-3 pb-3">
          <SessionPreviousLine exerciseId={performance.actualExerciseId} before={performedDate} />

          {setCount > 0 && (
            <>
              <div className="text-muted-foreground flex items-center gap-1.5 text-[10.5px] font-semibold tracking-wide uppercase md:gap-2">
                <span className="size-7 shrink-0" aria-hidden />
                <span className="flex-1 text-center md:w-[110px] md:flex-none">Weight</span>
                <span className="flex-1 text-center md:w-[110px] md:flex-none">Reps</span>
                <span className="flex-1 text-center md:w-[90px] md:flex-none">RIR</span>
                <span className="hidden md:block md:flex-1">Set type</span>
                <span className="size-8 shrink-0 md:hidden" aria-hidden />
                <span className="size-8 shrink-0" aria-hidden />
              </div>
              <div className="flex flex-col gap-2">
                {performance.sets.map((set, index) => (
                  <SetRow
                    key={set.id}
                    performanceId={performance.id}
                    set={set}
                    index={index}
                    isCurrent={index === currentSetIndex}
                  />
                ))}
              </div>
            </>
          )}

          <div className="flex flex-col gap-2 border-t border-dashed pt-3 md:flex-row-reverse md:items-center md:justify-between">
            <div className="flex gap-2">
              <button
                type="button"
                className="bg-accent text-accent-foreground hover:bg-accent/70 h-10 flex-1 rounded-full px-4 text-sm font-semibold md:flex-none"
                onClick={() => addEmptySet(performance.id)}
              >
                + Add set
              </button>
              {setCount > 0 && (
                <button
                  type="button"
                  className="text-accent-foreground hover:bg-muted h-10 flex-1 rounded-full border px-4 text-sm font-medium md:flex-none"
                  onClick={() => copyLastSet(performance.id)}
                >
                  {lastSetLabel(performance)}
                </button>
              )}
            </div>
            {!showNote && (
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground inline-flex w-fit items-center gap-1.5 text-[12.5px] transition-colors"
                onClick={() => setShowNote(true)}
              >
                <FileText className="size-4" />
                Add note
              </button>
            )}
          </div>

          {showNote && (
            <textarea
              aria-label="Exercise notes"
              rows={2}
              placeholder="Notes for this exercise…"
              className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 rounded-lg border bg-background px-2.5 py-2 text-base transition-colors outline-none focus-visible:ring-3 md:text-sm"
              value={performance.notes ?? ''}
              onChange={(e) =>
                setExerciseNotes(performance.id, e.target.value.length > 0 ? e.target.value : null)
              }
            />
          )}
        </div>
      )}
    </div>
  );
}
