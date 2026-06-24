import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { useExerciseUiStore } from '../stores/exercise-ui.store';
import { ExerciseList } from './exercise-list';
import { ExerciseSheet } from './exercise-sheet';

// The Exercise Library screen: a header with the Add action, the list, and the
// create/edit Sheet (which reads its own open state from the UI store).
export function ExercisesPage() {
  const openCreate = useExerciseUiStore((s) => s.openCreate);

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between px-4 py-4">
        <h1 className="text-2xl font-bold">Exercises</h1>
        <Button type="button" className="h-11" onClick={openCreate}>
          <Plus className="size-4" />
          Add
        </Button>
      </div>

      <ExerciseList />
      <ExerciseSheet />
    </div>
  );
}
