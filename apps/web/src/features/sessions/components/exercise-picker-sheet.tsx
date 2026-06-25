import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import type { ExerciseCategory } from '@gym-bro/shared';

import { templateQueryOptions, useExercises } from '@/features/training';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

import { useWorkoutDraftStore } from '../stores/workout-draft.store';
import type { PickerMode } from './active-session-page';

interface ExercisePickerSheetProps {
  mode: PickerMode | null;
  onClose: () => void;
}

interface PickableExercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  isActive: boolean;
}

// Bottom sheet listing the exercise library to add a new exercise or swap an
// existing one (same picker, behaviour chosen by `mode`). When the session was
// started from a template, the picker can scope to that template's exercises
// (default for "add") with a toggle back to the full library; "swap" defaults to
// the full library. Inactive (soft-deleted) exercises are always hidden.
export function ExercisePickerSheet({ mode, onClose }: ExercisePickerSheetProps) {
  const { data: exercises = [] } = useExercises();
  const workoutTemplateId = useWorkoutDraftStore((s) => s.draft?.workoutTemplateId ?? null);
  const addExercise = useWorkoutDraftStore((s) => s.addExercise);
  const swapExercise = useWorkoutDraftStore((s) => s.swapExercise);

  const { data: template } = useQuery({
    ...templateQueryOptions(workoutTemplateId ?? ''),
    enabled: workoutTemplateId !== null,
  });

  const hasTemplate = workoutTemplateId !== null;
  const [source, setSource] = useState<'template' | 'all'>('template');
  const [search, setSearch] = useState('');

  // Add scopes to the template by default; swap opens on the full library.
  useEffect(() => {
    setSource(mode?.type === 'swap' ? 'all' : 'template');
  }, [mode]);

  const isSwap = mode?.type === 'swap';
  const effectiveSource = hasTemplate ? source : 'all';
  const candidates: PickableExercise[] =
    effectiveSource === 'template'
      ? (template?.exercises ?? []).map((te) => te.exercise)
      : exercises;

  const query = search.trim().toLowerCase();
  const filtered = candidates.filter(
    (exercise) => exercise.isActive && exercise.name.toLowerCase().includes(query),
  );

  function handleClose() {
    setSearch('');
    onClose();
  }

  function handleSelect(exercise: PickableExercise) {
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
          {hasTemplate && (
            <div className="bg-muted flex gap-1 rounded-md p-1 text-sm">
              {(['template', 'all'] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setSource(option)}
                  className={cn(
                    'h-9 flex-1 rounded',
                    effectiveSource === option && 'bg-background font-medium shadow-sm',
                  )}
                >
                  {option === 'template' ? 'Template' : 'All'}
                </button>
              ))}
            </div>
          )}

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
