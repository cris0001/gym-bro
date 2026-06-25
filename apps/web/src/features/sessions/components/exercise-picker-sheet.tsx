import { useState } from 'react';

import type { Exercise } from '@gym-bro/shared';

import { useExercises } from '@/features/training';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

import { useWorkoutDraftStore } from '../stores/workout-draft.store';
import type { PickerMode } from './active-session-page';

interface ExercisePickerSheetProps {
  mode: PickerMode | null;
  onClose: () => void;
}

// Bottom sheet listing the exercise library to add a new exercise or swap an
// existing one (same picker, behaviour chosen by `mode`). Inactive (soft-
// deleted) exercises are hidden; a name filter keeps long libraries usable.
export function ExercisePickerSheet({ mode, onClose }: ExercisePickerSheetProps) {
  const { data: exercises = [] } = useExercises();
  const addExercise = useWorkoutDraftStore((s) => s.addExercise);
  const swapExercise = useWorkoutDraftStore((s) => s.swapExercise);
  const [search, setSearch] = useState('');

  const isSwap = mode?.type === 'swap';
  const query = search.trim().toLowerCase();
  const filtered = exercises.filter(
    (exercise) => exercise.isActive && exercise.name.toLowerCase().includes(query),
  );

  function handleClose() {
    setSearch('');
    onClose();
  }

  function handleSelect(exercise: Exercise) {
    const payload = {
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      category: exercise.category,
    };
    if (mode?.type === 'swap') swapExercise(mode.performanceId, payload);
    else if (mode?.type === 'add') addExercise(payload);
    handleClose();
  }

  return (
    <Sheet open={mode !== null} onOpenChange={(next) => !next && handleClose()}>
      <SheetContent side="bottom" className="gap-0">
        <SheetHeader>
          <SheetTitle>{isSwap ? 'Swap exercise' : 'Add exercise'}</SheetTitle>
          <SheetDescription>
            {isSwap ? 'Pick the exercise you did instead.' : 'Pick an exercise to add.'}
          </SheetDescription>
        </SheetHeader>

        <div className="flex max-h-[60vh] flex-col gap-3 p-4">
          <Input
            placeholder="Search exercises"
            className="h-11"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {filtered.length === 0 ? (
            <p className="text-muted-foreground text-sm">No matching exercises.</p>
          ) : (
            <ul className="flex flex-col gap-2 overflow-y-auto">
              {filtered.map((exercise) => (
                <li key={exercise.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(exercise)}
                    className="hover:bg-accent flex min-h-11 w-full flex-col items-start rounded-md border px-3 py-2 text-left transition-colors"
                  >
                    <span className="font-medium">{exercise.name}</span>
                    <span className="text-muted-foreground text-xs">{exercise.category}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
