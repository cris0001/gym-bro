import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

import { useExerciseUiStore } from '../stores/exercise-ui.store';
import { ExerciseForm } from './exercise-form';

// Bottom sheet hosting the create/edit form. Open state and the target row come
// from the UI store. The form is keyed by the editing id so it remounts with
// fresh defaults each time the sheet opens for a different exercise.
export function ExerciseSheet() {
  const open = useExerciseUiStore((s) => s.open);
  const editing = useExerciseUiStore((s) => s.editing);
  const close = useExerciseUiStore((s) => s.close);

  return (
    <Sheet open={open} onOpenChange={(next) => !next && close()}>
      <SheetContent side="bottom" className="gap-0">
        <SheetHeader>
          <SheetTitle>{editing ? 'Edit exercise' : 'New exercise'}</SheetTitle>
          <SheetDescription>
            {editing ? 'Update the name or category.' : 'Add an exercise to your library.'}
          </SheetDescription>
        </SheetHeader>

        <ExerciseForm key={editing?.id ?? 'new'} editing={editing} onSuccess={close} />
      </SheetContent>
    </Sheet>
  );
}
