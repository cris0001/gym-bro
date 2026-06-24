import { Pencil, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { Exercise } from '@gym-bro/shared';

import { useDeleteExercise } from '../hooks/use-delete-exercise';
import { useExercises } from '../hooks/use-exercises';
import { useExerciseUiStore } from '../stores/exercise-ui.store';

// The exercise library list: read state via TanStack Query, edit through the UI
// store's Sheet, delete with a confirm. Add is owned by the page header.
export function ExerciseList() {
  const { data: exercises, isPending, isError, error } = useExercises();
  const openEdit = useExerciseUiStore((s) => s.openEdit);
  const remove = useDeleteExercise();

  if (isPending) {
    return <p className="text-muted-foreground p-4 text-sm">Loading exercises…</p>;
  }

  if (isError) {
    return (
      <p role="alert" className="text-destructive p-4 text-sm">
        {error.message}
      </p>
    );
  }

  if (exercises.length === 0) {
    return (
      <p className="text-muted-foreground p-4 text-sm">
        No exercises yet. Add your first one to start building workouts.
      </p>
    );
  }

  function onDelete(exercise: Exercise) {
    if (window.confirm(`Delete "${exercise.name}"? It will be removed from your library.`)) {
      remove.mutate(exercise.id);
    }
  }

  return (
    <ul className="divide-y">
      {exercises.map((exercise) => (
        <li key={exercise.id} className="flex items-center gap-3 px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{exercise.name}</p>
            <p className="text-muted-foreground text-sm">{exercise.category}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-11 shrink-0"
            aria-label={`Edit ${exercise.name}`}
            onClick={() => openEdit(exercise)}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-destructive size-11 shrink-0"
            aria-label={`Delete ${exercise.name}`}
            disabled={remove.isPending}
            onClick={() => onDelete(exercise)}
          >
            <Trash2 className="size-4" />
          </Button>
        </li>
      ))}
    </ul>
  );
}
