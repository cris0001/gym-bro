import { Repeat2, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';

import type { DraftPerformance } from '../stores/workout-draft.store';
import { useWorkoutDraftStore } from '../stores/workout-draft.store';
import { SetRow } from './set-row';

interface ExercisePerformanceCardProps {
  performance: DraftPerformance;
  onSwap: () => void;
}

// One exercise within the active session: header (name, swap, remove), the
// weight/reps/RIR column labels, the set rows, and the two add-set actions.
// "Copy last set" is hidden until there's a set to copy (domain rule). Swap is
// delegated to the parent via onSwap since it needs an exercise picker.
export function ExercisePerformanceCard({ performance, onSwap }: ExercisePerformanceCardProps) {
  const addEmptySet = useWorkoutDraftStore((s) => s.addEmptySet);
  const copyLastSet = useWorkoutDraftStore((s) => s.copyLastSet);
  const removeExercise = useWorkoutDraftStore((s) => s.removeExercise);

  const isSwapped = performance.actualExerciseId !== performance.originalExerciseId;
  const hasSets = performance.sets.length > 0;

  return (
    <div className="flex flex-col gap-3 rounded-lg border p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-col">
          <span className="truncate font-semibold">{performance.exerciseName}</span>
          <span className="text-muted-foreground text-xs">
            {performance.category}
            {isSwapped && ' · swapped'}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-1">
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
      </div>

      {hasSets && (
        <>
          <div className="grid grid-cols-[1.5rem_1fr_1fr_1fr_2.25rem] items-center gap-2 text-center text-xs font-medium text-muted-foreground">
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
        {hasSets && (
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
    </div>
  );
}
