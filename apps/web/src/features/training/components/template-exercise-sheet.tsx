import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

import { useTemplateExerciseUiStore } from '../stores/template-exercise-ui.store';
import { TemplateExerciseForm } from './template-exercise-form';

// Bottom sheet hosting the add/edit-targets form. Open state, the target row,
// and the parent template come from the UI store. The form is keyed by the
// editing id so it remounts with fresh defaults each time the sheet opens.
export function TemplateExerciseSheet() {
  const open = useTemplateExerciseUiStore((s) => s.open);
  const editing = useTemplateExerciseUiStore((s) => s.editing);
  const templateId = useTemplateExerciseUiStore((s) => s.templateId);
  const close = useTemplateExerciseUiStore((s) => s.close);

  return (
    <Sheet open={open} onOpenChange={(next) => !next && close()}>
      <SheetContent side="bottom" className="gap-0">
        <SheetHeader>
          <SheetTitle>{editing ? 'Edit exercise' : 'Add exercise'}</SheetTitle>
          <SheetDescription>
            {editing
              ? 'Update the target sets, reps, or notes.'
              : 'Pick an exercise and set optional targets.'}
          </SheetDescription>
        </SheetHeader>

        <TemplateExerciseForm
          key={editing?.id ?? 'new'}
          editing={editing}
          templateId={templateId}
          onSuccess={close}
        />
      </SheetContent>
    </Sheet>
  );
}
