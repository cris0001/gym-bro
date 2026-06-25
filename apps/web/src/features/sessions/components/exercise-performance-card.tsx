import { useQuery } from '@tanstack/react-query';
import { ChevronDown, ClipboardCopy, Repeat2, StickyNote, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { exerciseHistoryQueryOptions } from '../hooks/use-exercise-history';
import type { DraftPerformance } from '../stores/workout-draft.store';
import { useWorkoutDraftStore } from '../stores/workout-draft.store';
import { ExerciseHistoryPanel } from './exercise-history-panel';
import { SetRow } from './set-row';

interface ExercisePerformanceCardProps {
  performance: DraftPerformance;
  onSwap: () => void;
}

// One exercise within the active session. Collapsible so finished exercises can
// be tucked away (the header stays, inputs + history hide). Expanded shows the
// "Previous" panel, set rows, add-set actions, and a note. "Copy last" (header)
// prefills the sets from the most recent prior session for this exercise.
export function ExercisePerformanceCard({ performance, onSwap }: ExercisePerformanceCardProps) {
  const addEmptySet = useWorkoutDraftStore((s) => s.addEmptySet);
  const copyLastSet = useWorkoutDraftStore((s) => s.copyLastSet);
  const replaceSets = useWorkoutDraftStore((s) => s.replaceSets);
  const removeExercise = useWorkoutDraftStore((s) => s.removeExercise);
  const setExerciseNotes = useWorkoutDraftStore((s) => s.setExerciseNotes);
  const performedDate = useWorkoutDraftStore((s) => s.draft?.performedDate);

  const [expanded, setExpanded] = useState(true);
  const [showNote, setShowNote] = useState(performance.notes !== null);

  const isSwapped = performance.actualExerciseId !== performance.originalExerciseId;
  const setCount = performance.sets.length;

  // The most recent prior session for this exercise, for "Copy last". Fetched only
  // while expanded (shares the limit-1 cache with the history panel).
  const { data: history = [] } = useQuery({
    ...exerciseHistoryQueryOptions(performance.actualExerciseId, performedDate, 1),
    enabled: expanded,
  });
  const latest = history[0];

  return (
    <div className="flex flex-col rounded-lg border">
      <div className="flex items-center gap-1 p-3">
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
          aria-expanded={expanded}
        >
          <ChevronDown
            className={cn('size-4 shrink-0 transition-transform', !expanded && '-rotate-90')}
          />
          <span className="min-w-0">
            <span className="block truncate font-semibold">{performance.exerciseName}</span>
            <span className="text-muted-foreground text-xs">
              {performance.category}
              {isSwapped && ' · swapped'}
              {!expanded && ` · ${setCount} ${setCount === 1 ? 'set' : 'sets'}`}
            </span>
          </span>
        </button>

        <Button
          variant="ghost"
          size="icon"
          aria-label="Copy sets from last training"
          onClick={() => latest && replaceSets(performance.id, latest.sets)}
          disabled={!latest}
        >
          <ClipboardCopy className="size-4" />
        </Button>
        <Button variant="ghost" size="icon" aria-label="Swap exercise" onClick={onSwap}>
          <Repeat2 className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Remove exercise"
          onClick={() => removeExercise(performance.id)}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      {expanded && (
        <div className="flex flex-col gap-3 px-3 pb-3">
          <ExerciseHistoryPanel exerciseId={performance.actualExerciseId} before={performedDate} />

          {setCount > 0 && (
            <>
              <div className="text-muted-foreground grid grid-cols-[1.5rem_1fr_1fr_1fr_2.25rem] items-center gap-2 text-center text-xs font-medium">
                <span>#</span>
                <span>Weight</span>
                <span>Reps</span>
                <span>RIR</span>
                <span />
              </div>
              <div className="flex flex-col gap-2">
                {performance.sets.map((set, index) => (
                  <SetRow key={set.id} performanceId={performance.id} set={set} index={index} />
                ))}
              </div>
            </>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-10 flex-1"
              onClick={() => addEmptySet(performance.id)}
            >
              Add set
            </Button>
            {setCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="h-10 flex-1"
                onClick={() => copyLastSet(performance.id)}
              >
                Copy last
              </Button>
            )}
          </div>

          {showNote ? (
            <textarea
              aria-label="Exercise notes"
              rows={2}
              placeholder="Notes for this exercise…"
              className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 rounded-lg border bg-transparent px-2.5 py-2 text-base transition-colors outline-none focus-visible:ring-3 md:text-sm"
              value={performance.notes ?? ''}
              onChange={(e) =>
                setExerciseNotes(performance.id, e.target.value.length > 0 ? e.target.value : null)
              }
            />
          ) : (
            <Button variant="ghost" size="sm" className="w-fit" onClick={() => setShowNote(true)}>
              <StickyNote className="size-4" />
              Add note
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
