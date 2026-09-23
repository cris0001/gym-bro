import { FormSheet } from '@/components/form-sheet';

import { useTemplateExerciseUiStore } from '../stores/template-exercise-ui.store';
import { TemplateExerciseForm } from './template-exercise-form';

// Sheet hosting the add/edit-targets form. Open state, the target row, and the parent
// template come from the UI store. The form is keyed by the editing id so it
// remounts with fresh defaults each time the sheet opens.
export function TemplateExerciseSheet() {
  const open = useTemplateExerciseUiStore((s) => s.open);
  const editing = useTemplateExerciseUiStore((s) => s.editing);
  const templateId = useTemplateExerciseUiStore((s) => s.templateId);
  const close = useTemplateExerciseUiStore((s) => s.close);

  return (
    <FormSheet
      open={open}
      onClose={close}
      title={editing ? 'Edit targets' : 'Add exercise'}
      description={
        editing ? 'Sets, rep range and notes.' : 'Pick from your library and set targets.'
      }
    >
      <TemplateExerciseForm
        key={editing?.id ?? 'new'}
        editing={editing}
        templateId={templateId}
        onSuccess={close}
        onCancel={close}
      />
    </FormSheet>
  );
}
